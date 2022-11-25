import express from "express";

import { populateUser } from "#middlewares/populateMiddleware";

import { getAllConsultationsSchema } from "#schemas/consultationSchemas";

import { getAllConsultations } from "#controllers/consultation";

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

export { router };
