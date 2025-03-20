import * as yup from "yup";

export const countrySchema = yup.object().shape({
  country: yup.string().required(),
});

export const getAllQuestionsSchema = countrySchema.shape({
  language: yup.string().required(),
  country: yup.string().required(),
  orderBy: yup.string().oneOf(["all", "newest", "most_popular"]).required(),
  authHeader: yup.string().nullable(),
  languageId: yup.string().required(),
});

export const getClientQuestionsSchema = countrySchema.shape({
  client_detail_id: yup.string().uuid().required(),
  languageId: yup.string().required(),
});

export const createQuestionSchema = countrySchema.shape({
  client_detail_id: yup.string().uuid().required(),
  language: yup.string().required(),
  question: yup.string().required(),
});

export const addAnswerVoteSchema = countrySchema.shape({
  client_detail_id: yup.string().uuid().required(),
  language: yup.string().required(),
  answerId: yup.string().uuid().required(),
  vote: yup
    .string()
    .oneOf(["like", "dislike", "remove-like", "remove-dislike"])
    .required(),
});
