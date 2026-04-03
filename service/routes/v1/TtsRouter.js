import express from "express";

import { synthesizeSpeech } from "#controllers/tts";
import { synthesizeSpeechSchema } from "#schemas/ttsSchemas";

const router = express.Router();

router.post("/synthesize", async (req, res, next) => {
  /**
   * #route   POST /client/v1/tts/synthesize
   * #desc    Synthesize speech via Azure (key server-side). body.text may be plain or HTML (set contentFormat: "html").
   */
  const payload = {
    ...req.body,
    // This endpoint is now synthesize + upload only.
    storeInS3: true,
  };
  return await synthesizeSpeechSchema
    .noUnknown(true)
    .strict(true)
    .validate(payload)
    .then(synthesizeSpeech)
    .then(({ ttsHash, ttsKey, s3Key, s3Url }) => {
      return res.status(200).json({
        success: true,
        data: {
          ttsHash,
          ttsKey,
          s3Key,
          s3Url,
        },
      });
    })
    .catch(next);
});

export { router };
