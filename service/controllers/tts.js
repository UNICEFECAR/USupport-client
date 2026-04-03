import fetch from "node-fetch";
import crypto from "crypto";
import AWS from "aws-sdk";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

import {
  htmlToPlainSegments,
  plainTextToSegments,
  sanitizeSegmentsForTts,
  buildSpeakSsml,
  chunkSegmentsForSsmlLimit,
  MAX_PLAIN_TEXT_LENGTH,
} from "#utils/htmlToTtsSsml";
import {
  escapeXml,
  defaultXmlLangFromVoice,
  resolveFfmpegBinary,
  ffmpegConcatEscapePath,
  isTransientNetworkError,
} from "#utils/helperFunctions";
import {
  speechSynthesisNotConfigured,
  ttsUpstreamError,
  ttsTimeoutError,
  ttsFfmpegNotFoundError,
  ttsFfmpegExecNotFoundError,
  ttsFfmpegNotExecutableError,
  ttsFfmpegMergeFailedError,
  ttsNoSpeakableTextError,
  ttsPlainTextTooLongError,
  ttsValidationError,
  ttsS3BucketNotConfiguredError,
} from "#utils/errors";

const execFileAsync = promisify(execFile);

const SPEECH_KEY = process.env.AZURE_SPEECH_KEY || "";
const SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "eastus";
const AWS_REGION = process.env.AWS_REGION || "eu-central-1";
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

const DEFAULT_OUTPUT_FORMAT = "audio-16khz-32kbitrate-mono-mp3";
const WAV_OUTPUT_FORMAT = "riff-16khz-16bit-mono-pcm";

/** Azure SSML body must stay within limit; chunk at paragraph boundaries above this size. */
const MAX_SSML_BYTES = 60 * 1024;

const DEFAULT_S3_PREFIX = "tts";
const s3 = new AWS.S3({ region: AWS_REGION });

const AZURE_TTS_TIMEOUT_MS = 90_000;

/** Azure long audio responses sometimes drop the connection mid-body (ERR_STREAM_PREMATURE_CLOSE). */
const AZURE_TTS_RETRIES = 4;
const AZURE_TTS_RETRY_BASE_MS = 750;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Single Azure TTS POST via node-fetch; `arrayBuffer()` for the audio body.
 * @param {string} ssml
 * @param {string} outputFormat
 * @returns {Promise<Buffer>}
 */
async function requestAzureTtsAudioOnce(ssml, outputFormat) {
  const url = `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AZURE_TTS_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": outputFormat,
        "User-Agent": "usupport-client-service",
      },
      body: ssml,
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw ttsUpstreamError(detail, response.status);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (e) {
    if (e.name === "AbortError") {
      throw ttsTimeoutError(AZURE_TTS_TIMEOUT_MS);
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * @param {string} ssml
 * @param {string} outputFormat Azure X-Microsoft-OutputFormat value
 * @returns {Promise<Buffer>}
 */
async function synthesizeWithAzure(ssml, outputFormat) {
  let lastErr;

  for (let attempt = 0; attempt < AZURE_TTS_RETRIES; attempt++) {
    try {
      const audioBuf = await requestAzureTtsAudioOnce(ssml, outputFormat);
      console.log(
        { audioBytes: audioBuf.length, outputFormat, attempt },
        "azureTts response"
      );
      return audioBuf;
    } catch (e) {
      lastErr = e;
      const httpRetry =
        e.httpStatus != null &&
        [429, 502, 503].includes(e.httpStatus) &&
        attempt < AZURE_TTS_RETRIES - 1;
      const netRetry =
        isTransientNetworkError(e) && attempt < AZURE_TTS_RETRIES - 1;
      if (httpRetry || netRetry) {
        await sleep(AZURE_TTS_RETRY_BASE_MS * 2 ** attempt);
        continue;
      }
      throw e;
    }
  }

  throw lastErr;
}

/**
 * Concatenate WAV buffers and encode to mono MP3 (matches default Azure MP3 bitrate tier).
 * @param {Buffer[]} wavBuffers
 * @returns {Promise<Buffer>}
 */
async function mergeWavBuffersToMp3(wavBuffers) {
  const dir = await mkdtemp(join(tmpdir(), "tts-merge-"));
  try {
    const absFiles = [];
    for (let i = 0; i < wavBuffers.length; i++) {
      const p = join(dir, `c${i}.wav`);
      await writeFile(p, wavBuffers[i]);
      absFiles.push(p);
    }

    const listPath = join(dir, "list.txt");
    const listBody = absFiles
      .map((p) => `file '${ffmpegConcatEscapePath(p)}'`)
      .join("\n");
    await writeFile(listPath, listBody, "utf8");

    const outPath = join(dir, "out.mp3");
    const ffmpegBin = resolveFfmpegBinary();
    if (!ffmpegBin) {
      throw ttsFfmpegNotFoundError();
    }

    await execFileAsync(
      ffmpegBin,
      [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        listPath,
        "-c:a",
        "libmp3lame",
        "-b:a",
        "32k",
        "-ac",
        "1",
        outPath,
      ],
      { maxBuffer: 10 * 1024 * 1024 }
    );

    return await readFile(outPath);
  } catch (e) {
    if (e.code === "ENOENT") {
      throw ttsFfmpegExecNotFoundError();
    }
    const spawnFail =
      e.errno === -8 ||
      e.errno === -63 ||
      String(e.message || "").includes("Unknown system error -8");
    if (spawnFail) {
      throw ttsFfmpegNotExecutableError();
    }
    if (e.stderr) {
      throw ttsFfmpegMergeFailedError(e.stderr.toString());
    }
    throw e;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * @param {{ text: string; voice: string; contentFormat?: "plain" | "html"; xmlLang?: string; outputFormat?: string; articleId?: string; locale?: string; storeInS3?: boolean }} payload
 */
export const synthesizeSpeech = async (payload) => {
  const start = performance.now();
  if (!SPEECH_KEY) {
    throw speechSynthesisNotConfigured();
  }

  const { text, voice } = payload;
  const contentFormat = payload.contentFormat || "plain";
  const xmlLang = payload.xmlLang || defaultXmlLangFromVoice(voice);
  const outputFormat = payload.outputFormat || DEFAULT_OUTPUT_FORMAT;
  const articleId = payload.articleId || "unknown-article";
  const locale = payload.locale || xmlLang;
  const shouldStoreInS3 = Boolean(payload.storeInS3);

  const segments = sanitizeSegmentsForTts(
    contentFormat === "html"
      ? htmlToPlainSegments(text)
      : plainTextToSegments(text)
  );

  if (segments.length === 0) {
    throw ttsNoSpeakableTextError();
  }

  const plainCharCount = segments.reduce(
    (sum, segment) => sum + segment.length,
    0
  );
  if (plainCharCount > MAX_PLAIN_TEXT_LENGTH) {
    throw ttsPlainTextTooLongError(MAX_PLAIN_TEXT_LENGTH);
  }

  const normalizedText = segments.join("\n");
  const fullSsml = buildSpeakSsml(segments, xmlLang, voice, escapeXml);
  const fullSsmlBytes = Buffer.byteLength(fullSsml, "utf8");

  let buffer;
  let hashOutputFormat = outputFormat;

  if (fullSsmlBytes <= MAX_SSML_BYTES) {
    buffer = await synthesizeWithAzure(fullSsml, outputFormat);
  } else {
    let segmentChunks;
    try {
      segmentChunks = chunkSegmentsForSsmlLimit(
        segments,
        xmlLang,
        voice,
        escapeXml,
        MAX_SSML_BYTES
      );
    } catch (e) {
      throw ttsValidationError(e.message);
    }

    const wavBuffers = await Promise.all(
      segmentChunks.map((chunk) =>
        synthesizeWithAzure(
          buildSpeakSsml(chunk, xmlLang, voice, escapeXml),
          WAV_OUTPUT_FORMAT
        )
      )
    );

    buffer = await mergeWavBuffersToMp3(wavBuffers);

    hashOutputFormat = `${DEFAULT_OUTPUT_FORMAT}+chunked-${WAV_OUTPUT_FORMAT}`;
  }

  const end = performance.now();

  const hashInput = JSON.stringify({
    articleId,
    locale,
    voice,
    xmlLang,
    outputFormat: hashOutputFormat,
    contentFormat,
    text: normalizedText,
  });
  const ttsHash = crypto.createHash("sha256").update(hashInput).digest("hex");
  const ttsKey = `${DEFAULT_S3_PREFIX}/articles/${locale}/${articleId}/${ttsHash}.mp3`;

  let s3Key = null;
  let s3Url = null;
  if (shouldStoreInS3) {
    if (!AWS_BUCKET_NAME) {
      throw ttsS3BucketNotConfiguredError();
    }

    await s3
      .putObject({
        Bucket: AWS_BUCKET_NAME,
        Key: ttsKey,
        Body: buffer,
        ContentType: "audio/mpeg",
        CacheControl: "public, max-age=31536000",
      })
      .promise();

    s3Key = ttsKey;
    s3Url = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${ttsKey}`;
  }
  console.log(s3Url);
  console.log(`TTS synthesis took ${(end - start) / 1000} seconds`);
  return {
    ttsHash,
    ttsKey,
    s3Key,
    s3Url,
  };
};
