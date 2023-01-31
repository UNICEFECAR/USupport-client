import * as yup from "yup";

export const getMoodTrackForTodaySchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  country: yup.string().required(),
});

export const addMoodTrackForTodaySchema = getMoodTrackForTodaySchema.shape({
  mood: yup.string().required(),
  comment: yup.string().notRequired(),
});

export const getMoodTrackForWeekSchema = getMoodTrackForTodaySchema.shape({
  startDate: yup.string().required(),
});
