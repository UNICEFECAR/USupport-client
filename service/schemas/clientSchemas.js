import * as yup from "yup";

import { t } from "#translations/index";

const sexTypeSchema = yup
  .string()
  .oneOf(["male", "female", "unspecified", "notMentioned"]);

const urbanRuralTypeSchema = yup.string().oneOf(["urban", "rural"]);

export const updateClientDataSchema = (language) =>
  yup.object().shape(
    {
      client_id: yup.string().uuid().required(),
      user_id: yup.string().uuid().required(),
      country: yup.string().required(),
      language: yup.string().required(),
      name: yup.string().notRequired(),
      surname: yup.string().notRequired(),
      nickname: yup.string().required(t("nickname_required_error", language)),
      email: yup.string().when("userAccessToken", {
        is: undefined,
        then: yup
          .string()
          .email()
          .required(t("email_required_error", language)),
      }),
      currentEmail: yup.string().when("userAccessToken", {
        is: undefined,
        then: yup
          .string()
          .email()
          .required(t("email_required_error", language)),
      }),
      userAccessToken: yup.string().when("email", {
        is: undefined,
        then: yup.string().required(t("access_token_required_error", language)),
      }),
      sex: sexTypeSchema.notRequired(),
      yearOfBirth: yup.number().positive().notRequired(),
      urbanRural: urbanRuralTypeSchema.notRequired(),
    },
    ["userAccessToken", "email"]
  );

export const getClientByIdSchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
});

export const deleteClientDataSchema = getClientByIdSchema.shape({
  user_id: yup.string().uuid().required(),
  image: yup.string().required(),
  userPassword: yup.string().required(),
  password: yup.string().required(),
});

export const updateClientImageSchema = getClientByIdSchema.shape({
  user_id: yup.string().uuid().required(),
  image: yup.string().required(),
});

export const deleteClientImageSchema = getClientByIdSchema.shape({
  user_id: yup.string().uuid().required(),
});

export const updateClientDataProcessingSchema = getClientByIdSchema.shape({
  user_id: yup.string().uuid().required(),
  dataProcessing: yup.boolean().required(),
});

export const addInformationPortalSuggestionSchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  country: yup.string().required(),
  suggestion: yup.string().required(),
});

export const addClientRatingSchema = getClientByIdSchema.shape({
  rating: yup.number().min(1).max(5).required(),
  comment: yup.string().notRequired(),
});
