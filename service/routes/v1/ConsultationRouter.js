import express from "express";

import { populateUser } from "#middlewares/populateMiddleware";

import {
  getAllConsultationsSchema,
  getSecurityCheckAnswersByConsultationIdSchema,
  addSecurityCheckAnswersSchema,
  updateSecurityCheckAnswersSchema,
} from "#schemas/consultationSchemas";

import {
  getAllConsultations,
  getSecurityCheckAnswersByConsultationId,
  addSecurityCheckAnswers,
  updateSecurityCheckAnswers,
} from "#controllers/consultation";

const router = express.Router();

router.route("/all").get(populateUser, async (req, res, next) => {
  /**
   * #route   GET /client/v1/consultation/all
   * #desc    Get all consultations for a client
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const client_id = req.user.client_detail_id;

  return await getAllConsultationsSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, language, client_id })
    .then(getAllConsultations)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.route("/security-check").get(async (req, res, next) => {
  /**
   * #route   GET /client/v1/consultation/security-check
   * #desc    Get security check answers for a consultation
   */
  const country = req.header("x-country-alpha-2");

  const consultation_id = req.query.consultationId;

  return await getSecurityCheckAnswersByConsultationIdSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, consultation_id })
    .then(getSecurityCheckAnswersByConsultationId)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.route("/security-check").post(async (req, res, next) => {
  /**
   * #route   POST /client/v1/consultation/security-check
   * #desc    Create security check answers for a consultation
   */
  const country = req.header("x-country-alpha-2");

  const payload = req.body;

  return await addSecurityCheckAnswersSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, ...payload })
    .then(addSecurityCheckAnswers)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.route("/security-check").put(async (req, res, next) => {
  /**
   * #route   PUT /client/v1/consultation/security-check
   * #desc    Update security check answers for a consultation
   */
  const country = req.header("x-country-alpha-2");

  const payload = req.body;

  return await updateSecurityCheckAnswersSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, ...payload })
    .then(updateSecurityCheckAnswers)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
