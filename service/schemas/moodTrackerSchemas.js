import * as yup from "yup";

export const getMoodTrackForTodaySchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  country: yup.string().required(),
});

export const addMoodTrackForTodaySchema = yup.object().shape({
  country: yup.string().required(),
  client_id: yup.string().uuid().required(),
  mood: yup.string().required(),
  comment: yup.string().notRequired(),
  emergency: yup.boolean().notRequired(),
});

export const getMoodTrackForWeekSchema = yup.object().shape({
  country: yup.string().required(),
  client_id: yup.string().uuid().required(),
  limit: yup.number().required(),
  pageNum: yup.number().required(),
});

export const deleteMoodTrackerHistorySchema = yup.object().shape({
  client_detail_id: yup.string().uuid().required(),
  country: yup.string().required(),
  // language: yup.string().required(),
});

export const generateReportForPeriodSchema = yup.object().shape({
  country: yup.string().required(),
  client_detail_id: yup.string().uuid().required(),
  startDate: yup.string().required(),
  endDate: yup.string().required(),
  language: yup.string().required(),
});

export const getHasCompletedMoodTrackerEverSchema = yup.object().shape({
  country: yup.string().required(),
  client_detail_id: yup.string().uuid().required(),
});
