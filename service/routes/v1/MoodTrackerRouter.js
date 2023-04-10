import { populateClient, populateUser } from "#middlewares/populateMiddleware";
import express from "express";

import {
  getMoodTrackForTodaySchema,
  addMoodTrackForTodaySchema,
  getMoodTrackForWeekSchema,
} from "#schemas/moodTrackerSchemas";

import {
  getMoodTrackForToday,
  addMoodTrackForToday,
  getMoodTrackEntries,
} from "#controllers/moodTracker";

const router = express.Router();

router.route("/today").get(populateClient, async (req, res, next) => {
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

router.route("/entries").get(populateClient, async (req, res, next) => {
  /**
   * #route   GET /client/v1/mood-tracker/entires
   * #desc    Get client mood for today
   */
  const country = req.header("x-country-alpha-2");
  const client_id = req.client.client_detail_id;

  const limit = Number(req.query.limit);
  const pageNum = Number(req.query.pageNum);

  return await getMoodTrackForWeekSchema
    .noUnknown(true)
    .strict(true)
    .validate({ limit, pageNum, country, client_id })
    .then(getMoodTrackEntries)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.route("/").post(populateUser, async (req, res, next) => {
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
    .validate({ country, client_id, ...payload })
    .then(addMoodTrackForToday)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
