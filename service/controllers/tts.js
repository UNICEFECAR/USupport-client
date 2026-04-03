import fetch from "node-fetch";
import crypto from "crypto";
import AWS from "aws-sdk";

import {
  htmlToPlainSegments,
  plainTextToSegments,
  sanitizeSegmentsForTts,
  segmentsToVoiceInnerSsml,
  MAX_PLAIN_TEXT_LENGTH,
} from "#utils/htmlToTtsSsml";
import { escapeXml, defaultXmlLangFromVoice } from "#utils/helperFunctions";

const SPEECH_KEY = process.env.AZURE_SPEECH_KEY || "";
const SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "eastus";
const AWS_REGION = process.env.AWS_REGION || "eu-central-1";
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

const DEFAULT_OUTPUT_FORMAT = "audio-16khz-32kbitrate-mono-mp3";
const DEFAULT_S3_PREFIX = "tts";
const s3 = new AWS.S3({ region: AWS_REGION });

/**
 * @param {{ text: string; voice: string; contentFormat?: "plain" | "html"; xmlLang?: string; outputFormat?: string; articleId?: string; locale?: string; storeInS3?: boolean }} payload
 */
export const synthesizeSpeech = async (payload) => {
  const start = performance.now();
  if (!SPEECH_KEY) {
    const err = new Error("Speech synthesis service is not configured");
    err.status = 503;
    err.name = "SERVICE UNAVAILABLE";
    throw err;
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
    const err = new Error("No speakable text after processing");
    err.status = 400;
    err.name = "VALIDATION ERROR";
    throw err;
  }

  const plainCharCount = segments.reduce(
    (sum, segment) => sum + segment.length,
    0
  );
  if (plainCharCount > MAX_PLAIN_TEXT_LENGTH) {
    const err = new Error(
      `Speakable text exceeds maximum length (${MAX_PLAIN_TEXT_LENGTH} characters). Split the article or use shorter excerpts.`
    );
    err.status = 400;
    err.name = "VALIDATION ERROR";
    throw err;
  }

  const voiceInnerSsml = segmentsToVoiceInnerSsml(segments, escapeXml);
  const normalizedText = segments.join("\n");

  const ssml = `<speak version="1.0" xml:lang="${escapeXml(xmlLang)}">
                  <voice name="${escapeXml(voice)}">${voiceInnerSsml}</voice>
                </speak>`;

  const url = `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": SPEECH_KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": outputFormat,
      "User-Agent": "usupport-client-service",
    },
    body: ssml,
  });

  if (!response.ok) {
    const detail = await response.text();
    const err = new Error(
      detail || `Azure speech request failed with status ${response.status}`
    );
    err.status = 502;
    err.name = "TTS UPSTREAM ERROR";
    throw err;
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const end = performance.now();

  const hashInput = JSON.stringify({
    articleId,
    locale,
    voice,
    xmlLang,
    outputFormat,
    contentFormat,
    text: normalizedText,
  });
  const ttsHash = crypto.createHash("sha256").update(hashInput).digest("hex");
  const ttsKey = `${DEFAULT_S3_PREFIX}/articles/${locale}/${articleId}/${ttsHash}.mp3`;

  let s3Key = null;
  let s3Url = null;
  if (shouldStoreInS3) {
    if (!AWS_BUCKET_NAME) {
      const err = new Error("AWS_BUCKET_NAME is required for TTS S3 storage");
      err.status = 500;
      err.name = "S3 CONFIGURATION ERROR";
      throw err;
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
