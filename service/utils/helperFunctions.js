import ffmpegStaticPath from "ffmpeg-static";
import fetch from "node-fetch";
import fs from "fs";

import {
  getBaselineAssessmentThresholdsQuery,
  getCliendDetailByUserIdQuery,
} from "#queries/clients";

const USER_LOCAL_HOST = "http://localhost:3010";

const USER_URL = process.env.USER_URL;

export const getClientDetailIdByUserId = async (
  authHeader,
  country,
  language
) => {
  // Get current user
  const result = await fetch(`${USER_URL}/user/v1/user`, {
    headers: {
      "x-country-alpha-2": country,
      "x-language-alpha-2": language,
      ...(authHeader && { Authorization: authHeader }),
      host: USER_LOCAL_HOST,
    },
  })
    .then((raw) => raw.json())
    .catch(console.log);

  if (result.user_id) {
    return await getCliendDetailByUserIdQuery({
      poolCountry: country,
      user_id: result.user_id,
    })
      .then((res) => {
        if (res.rowCount === 0) {
          return [];
        } else {
          return res.rows[0].client_detail_id;
        }
      })
      .catch((err) => {
        throw err;
      });
  }
};

/**
 *
 * @param {Object} scores {psychological: number, biological: number, social: number}
 * @param {string} country
 * @returns {Object} {psychologicalProfile: string, biologicalProfile: string, socialProfile: string}
 */
export const calculateBaselineAssessmentScore = async (scores, country) => {
  const {
    psychological: psychologicalScore,
    biological: biologicalScore,
    social: socialScore,
  } = scores;

  const baselineAssessmentThresholds =
    await getBaselineAssessmentThresholdsQuery(country)
      .then((res) => {
        return res.rows.reduce(
          (acc, threshold) => {
            acc[threshold.factor] = {
              below: threshold.below,
              above: threshold.above,
            };
            return acc;
          },
          { psychological: {}, biological: {}, social: {} }
        );
      })
      .catch((err) => {
        throw err;
      });

  const getScoreProfile = (score, factor) => {
    const thresholds = baselineAssessmentThresholds[factor];
    if (
      !thresholds ||
      thresholds.below === undefined ||
      thresholds.above === undefined
    ) {
      console.log(
        `Missing thresholds for factor "${factor}". Thresholds:`,
        thresholds
      );
      return null;
    }
    if (score < thresholds.below) {
      return "low";
    } else if (score >= thresholds.below && score <= thresholds.above) {
      return "moderate";
    } else {
      return "high";
    }
  };

  const psychological = getScoreProfile(psychologicalScore, "psychological");
  const biological = getScoreProfile(biologicalScore, "biological");
  const social = getScoreProfile(socialScore, "social");

  return { psychological, biological, social };
};

export function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function defaultXmlLangFromVoice(voice) {
  const parts = voice.split("-");
  if (parts.length >= 2) {
    return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
  }
  return "en-US";
}

/**
 * Resolve ffmpeg: `ffmpeg-static` only drops a file under `node_modules` — it is not the OS package.
 * Its Linux build targets glibc; on Alpine (musl) spawn often fails with errno -8 (ENOEXEC).
 * Order: override → common system paths → bundled binary from npm.
 * @returns {string | null}
 */
export function resolveFfmpegBinary() {
  const candidates = [
    process.env.FFMPEG_PATH,
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    ffmpegStaticPath,
  ].filter(Boolean);

  for (const p of candidates) {
    if (typeof p !== "string") continue;
    try {
      fs.accessSync(p, fs.constants.F_OK | fs.constants.X_OK);
      return p;
    } catch {
      /* try next */
    }
  }
  return null;
}

/**
 * Escape absolute path for ffmpeg concat demuxer `file '...'` lines.
 * @param {string} p
 */
export function ffmpegConcatEscapePath(p) {
  return p.replace(/'/g, "'\\''");
}

export function isTransientNetworkError(err) {
  if (!err) return false;
  if (err.name === "AbortError") return false;
  const c = err.code;
  if (
    c === "ERR_STREAM_PREMATURE_CLOSE" ||
    c === "ECONNRESET" ||
    c === "ETIMEDOUT" ||
    c === "EPIPE"
  ) {
    return true;
  }
  return /premature close/i.test(String(err.message || ""));
}
