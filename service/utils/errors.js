import { t } from "#translations/index";

export const incorrectPassword = (language) => {
  const error = new Error();
  error.message = t("incorrect_password_error", language);
  error.name = "INCORRECT PASSWORD";
  error.status = 404;
  return error;
};

export const emailUsed = (language) => {
  const error = new Error();
  error.message = t("email_already_used_error", language);
  error.name = "EMAIL ALREADY USED";
  error.status = 409;
  return error;
};

export const clientNotFound = (language) => {
  const error = new Error();
  error.message = t("client_not_found_error", language);
  error.name = "CLIENT NOT FOUND";
  error.status = 404;
  return error;
};

export const providerNotFound = (language) => {
  const error = new Error();
  error.message = t("provider_not_found_error", language);
  error.name = "PROVIDER NOT FOUND";
  error.status = 404;
  return error;
};

export const couponNotFound = (language) => {
  const error = new Error();
  error.message = t("coupon_not_found_error", language);
  error.name = "COUPON NOT FOUND";
  error.status = 404;
  return error;
};

export const clientLimitReached = (language) => {
  const error = new Error();
  error.message = t("client_limit_reached_error", language);
  error.name = "CLIENT LIMIT REACHED";
  error.status = 403;
  return error;
};

export const couponsLimitReached = (language) => {
  const error = new Error();
  error.message = t("coupons_limit_reached_error", language);
  error.name = "COUPONS LIMIT REACHED";
  error.status = 403;
  return error;
};

export const consultationNotFound = (language) => {
  const error = new Error();
  error.message = t("consultation_not_found_error", language);
  error.name = "CONSULTATION NOT FOUND";
  error.status = 404;
  return error;
};

export const errorOccured = (language) => {
  const error = new Error();
  error.message = t("error_occured", language);
  error.name = "ERROR OCCURED";
  error.status = 404;
  return error;
};

export const organizationNotFound = (language) => {
  const error = new Error();
  error.message = t("organization_not_found_error", language);
  error.name = "ORGANIZATION NOT FOUND";
  error.status = 404;
  return error;
};

export const countryNotSupported = (language) => {
  const error = new Error();
  error.message = t("country_not_supported_error", language);
  error.name = "COUNTRY NOT SUPPORTED";
  error.status = 400;
  return error;
};

/** --- TTS (Azure + ffmpeg) — English messages, consumed by API error handler */

export const speechSynthesisNotConfigured = () => {
  const error = new Error("Speech synthesis service is not configured");
  error.name = "SERVICE UNAVAILABLE";
  error.status = 503;
  return error;
};

/**
 * @param {string} detail
 * @param {number} httpStatus Azure HTTP status
 */
export const ttsUpstreamError = (detail, httpStatus) => {
  const error = new Error(
    detail || `Azure speech request failed with status ${httpStatus}`
  );
  error.name = "TTS UPSTREAM ERROR";
  error.status = 502;
  error.httpStatus = httpStatus;
  return error;
};

/** @param {number} timeoutMs */
export const ttsTimeoutError = (timeoutMs) => {
  const error = new Error(
    `Azure TTS request timed out after ${timeoutMs}ms (increase AZURE_TTS_TIMEOUT_MS if needed)`
  );
  error.name = "TTS TIMEOUT";
  error.status = 504;
  return error;
};

export const ttsFfmpegNotFoundError = () => {
  const error = new Error(
    "ffmpeg not found: set FFMPEG_PATH or ensure ffmpeg-static installed (npm ci) and use a glibc-based image (e.g. Debian slim), not Alpine, unless you install system ffmpeg there."
  );
  error.name = "SERVICE UNAVAILABLE";
  error.status = 503;
  return error;
};

export const ttsFfmpegExecNotFoundError = () => {
  const error = new Error(
    "ffmpeg could not be executed (ENOENT). Install ffmpeg on the image/host or set FFMPEG_PATH."
  );
  error.name = "SERVICE UNAVAILABLE";
  error.status = 503;
  return error;
};

export const ttsFfmpegNotExecutableError = () => {
  const error = new Error(
    "ffmpeg cannot run on this OS (common on Alpine/musl: npm’s ffmpeg-static targets glibc). Use a Debian/glibc image (see client Dockerfile), or `apk add ffmpeg` on Alpine and set FFMPEG_PATH=/usr/bin/ffmpeg, or point FFMPEG_PATH at a working binary."
  );
  error.name = "SERVICE UNAVAILABLE";
  error.status = 503;
  return error;
};

/** @param {string} stderr */
export const ttsFfmpegMergeFailedError = (stderr) => {
  const error = new Error(`ffmpeg failed: ${stderr.trim()}`);
  error.name = "TTS MERGE ERROR";
  error.status = 500;
  return error;
};

export const ttsNoSpeakableTextError = () => {
  const error = new Error("No speakable text after processing");
  error.name = "VALIDATION ERROR";
  error.status = 400;
  return error;
};

/** @param {number} maxLength */
export const ttsPlainTextTooLongError = (maxLength) => {
  const error = new Error(
    `Speakable text exceeds maximum length (${maxLength} characters). Split the article or use shorter excerpts.`
  );
  error.name = "VALIDATION ERROR";
  error.status = 400;
  return error;
};

/** SSML chunk / CMS paragraph limits, etc. */
export const ttsValidationError = (message) => {
  const error = new Error(message);
  error.name = "VALIDATION ERROR";
  error.status = 400;
  return error;
};

export const ttsS3BucketNotConfiguredError = () => {
  const error = new Error("AWS_BUCKET_NAME is required for TTS S3 storage");
  error.name = "S3 CONFIGURATION ERROR";
  error.status = 500;
  return error;
};
