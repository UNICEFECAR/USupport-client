import { convert } from "html-to-text";

/** Max characters of plain text sent to Azure after HTML conversion */
export const MAX_PLAIN_TEXT_LENGTH = 50000;

/**
 * Strip markdown / formatting noise so TTS does not read symbols aloud (e.g. "*", "**").
 * @param {string} text
 * @returns {string}
 */
export function sanitizeForTtsSegment(text) {
  if (!text) return "";

  let s = text.normalize("NFKC");

  s = s.replace(/```[\s\S]*?```/g, " ");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  while (s.includes("**")) {
    s = s.replace(/\*\*([^*]*)\*\*/g, "$1");
  }
  while (s.includes("__")) {
    s = s.replace(/__([^_]*)__/g, "$1");
  }

  s = s.replace(/\*([^*\n]+)\*/g, "$1");
  s = s.replace(/_([^\s_][^_]*[^\s_])_/g, "$1");

  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/^[\s]*(?:[-*•⁎＊]|[*＊]{1,2})\s+/gm, "");
  s = s.replace(/^[-*•⁎＊\s]{3,}$/gm, "");

  s = s.replace(/[*＊⁎]/g, "");
  s = s.replace(/[•·▪►▸]/g, " ");

  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/**
 * @param {string[]} segments
 * @returns {string[]}
 */
export function sanitizeSegmentsForTts(segments) {
  return segments
    .map((segment) => sanitizeForTtsSegment(segment))
    .filter(Boolean);
}

/**
 * @param {string} html
 * @returns {string[]}
 */
export function htmlToPlainSegments(html) {
  const raw = convert(html, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
      { selector: "script", format: "skip" },
      { selector: "style", format: "skip" },
    ],
  });

  return raw
    .split(/\n\s*\n+/)
    .map((segment) => segment.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/**
 * @param {string} plain
 * @returns {string[]}
 */
export function plainTextToSegments(plain) {
  return plain
    .split(/\n\s*\n+/)
    .map((segment) => segment.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/**
 * @param {string[]} segments
 * @param {(s: string) => string} escapeXml
 * @returns {string}
 */
export function segmentsToVoiceInnerSsml(segments, escapeXml) {
  if (segments.length === 0) return "";
  const escaped = segments.map(escapeXml);
  return escaped.join('<break time="600ms"/>');
}
