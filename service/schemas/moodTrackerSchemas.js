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
