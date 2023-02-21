import express from "express";

import {
  getMoodTrackForTodaySchema,
  addMoodTrackForTodaySchema,
  getMoodTrackForWeekSchema,
} from "#schemas/moodTrackerSchemas";

import {
  getMoodTrackForToday,
  addMoodTrackForToday,
  getMoodTrackForWeek,
} from "#controllers/moodTracker";

import { populateClient, populateUser } from "#middlewares/populateMiddleware";

const router = express.Router();

router.post("/", populateUser, async (req, res, next) => {
  /**
   * #route   POST /client/v1/mood-tracker
   * #desc    Add client mood for today
   */
  const country = req.header("x-country-alpha-2");
  const client_id = req.user.client_detail_id;
  const payload = req.body;

  return await addMoodTrackForTodaySchema
    .noUnknown(true)
    .strict(true)
    .validate({ ...payload, country, client_id })
    .then(addMoodTrackForToday)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/today", populateClient, async (req, res, next) => {
  /**
   * #route   GET /client/v1/mood-tracker/today
   * #desc    Get client mood for today
   */
  const country = req.header("x-country-alpha-2");
  const client_id = req.client.client_detail_id;

  return await getMoodTrackForTodaySchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, client_id })
    .then(getMoodTrackForToday)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/week", populateClient, async (req, res, next) => {
  /**
   * #route   GET /client/v1/mood-tracker/week
   * #desc    Get client mood for today
   */
  const country = req.header("x-country-alpha-2");
  const client_id = req.client.client_detail_id;
  const startDate = req.query.startDate;

  return await getMoodTrackForWeekSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, client_id, startDate })
    .then(getMoodTrackForWeek)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
