import * as yup from "yup";

export const synthesizeSpeechSchema = yup.object().shape({
  /** Raw plain text, or HTML when contentFormat is "html" (e.g. article body from rich text). */
  text: yup.string().required().trim().min(1).max(250000),
  contentFormat: yup.string().oneOf(["plain", "html"]).optional().default("plain"),
  voice: yup.string().required().trim().max(120),
  xmlLang: yup
    .string()
    .max(20)
    .matches(/^[a-z]{2}-[A-Z]{2}$/i)
    .optional(),
  outputFormat: yup
    .string()
    .max(120)
    .matches(/^[a-zA-Z0-9\-]+$/)
    .optional(),
  articleId: yup.string().max(128).optional(),
  locale: yup.string().max(20).optional(),
  storeInS3: yup.boolean().optional(),
});
