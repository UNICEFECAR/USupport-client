import express from "express";

import { populateClient } from "#middlewares/populateMiddleware";

import {
  getAllAnsweredQuestions,
  createQuestion,
  getClientQuestions,
  getAllQuestions,
  addAnswerVote,
} from "#controllers/myQA";

import {
  countrySchema,
  getAllQuestionsSchema,
  createQuestionSchema,
  getClientQuestionsSchema,
  addAnswerVoteSchema,
} from "#schemas/myQASchemas";

const router = express.Router();

router.get("/answered/all", async (req, res, next) => {
  /**
   * #route   GET /client/v1/my-qa/answered/all
   * #desc    Get all answered questions
   */
  const country = req.header("x-country-alpha-2");

  return await countrySchema
    .noUnknown(true)
    .strict(true)
    .validate({ country })
    .then(getAllAnsweredQuestions)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post("/create-question", populateClient, async (req, res, next) => {
  /**
   * #route   POST /client/v1/my-qa/create-question
   * #desc    Create a question
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const client_detail_id = req.client.client_detail_id;

  const payload = req.body;

  return await createQuestionSchema
    .noUnknown(true)
    .strict(true)
    .validate({
      ...payload,
      country,
      language,
      client_detail_id,
    })
    .then(createQuestion)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/questions", async (req, res, next) => {
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const { orderBy, languageId } = req.query;

  return await getAllQuestionsSchema
    .noUnknown(true)
    .strict(true)
    .validate({
      country,
      language,
      orderBy,
      authHeader: req.headers.authorization || null,
      languageId,
    })
    .then(getAllQuestions)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/client-questions", populateClient, async (req, res, next) => {
  const country = req.header("x-country-alpha-2");
  const client_detail_id = req.client.client_detail_id;

  return await getClientQuestionsSchema
    .noUnknown(true)
    .strict(true)
    .validate({
      country,
      client_detail_id,
    })
    .then(getClientQuestions)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post("/answer-vote", populateClient, async (req, res, next) => {
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const client_detail_id = req.client.client_detail_id;

  const payload = req.body;

  return await addAnswerVoteSchema
    .noUnknown(true)
    .strict(true)
    .validate({
      ...payload,
      country,
      language,
      client_detail_id,
    })
    .then(addAnswerVote)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
