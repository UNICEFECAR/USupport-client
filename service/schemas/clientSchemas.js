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

export const deleteClientDataSchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  user_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
  image: yup.string().required(),
  userPassword: yup.string().required(),
  password: yup.string().required(),
});

export const updateClientImageSchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
  image: yup.string().required(),
});

export const deleteClientImageSchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
});

export const updateClientDataProcessingSchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
  dataProcessing: yup.boolean().required(),
});
