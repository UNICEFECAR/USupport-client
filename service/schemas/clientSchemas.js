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
      currentEmail: yup
        .string()
        .when("userAccessToken", {
          is: undefined,
          then: yup
            .string()
            .email()
            .required(t("email_required_error", language)),
        })
        .nullable(),
      userAccessToken: yup.string().when("email", {
        is: undefined,
        then: yup.string().required(t("access_token_required_error", language)),
      }),
      sex: sexTypeSchema
        .when("userAccessToken", {
          is: undefined,
          then: sexTypeSchema.required(),
        })
        .notRequired()
        .nullable()
        .transform((value) => value || null),
      yearOfBirth: yup
        .number()
        .when("userAccessToken", {
          is: undefined,
          then: yup.number().positive().required(),
        })
        .min(1, "Min value is 1")
        .transform((value, originalValue) =>
          originalValue.trim() === "" ? null : value
        )
        .nullable()
        .notRequired(),
      urbanRural: urbanRuralTypeSchema
        .when("userAccessToken", {
          is: undefined,
          then: urbanRuralTypeSchema.required(),
        })
        .notRequired()
        .nullable()
        .transform((value) => value || null),
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
  user_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
  image: yup.string().required(),
});

export const deleteClientImageSchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  user_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
});

export const updateClientDataProcessingSchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  user_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
  dataProcessing: yup.boolean().required(),
});

export const getClientByIdSchema = yup.object().shape({
  clientId: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
});

export const addInformationPortalSuggestionSchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  country: yup.string().required(),
  suggestion: yup.string().required(),
});

export const addClientRatingSchema = yup.object().shape({
  language: yup.string().required(),
  country: yup.string().required(),
  client_id: yup.string().uuid().required(),
  rating: yup.number().min(1).max(5).required(),
  comment: yup.string().notRequired(),
});

export const addClientPushNotificationTokenSchema = yup.object().shape({
  client_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
  pushNotificationToken: yup.string().required(),
});

export const checkIsCouponAvailableSchema = yup.object().shape({
  client_detail_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
  couponCode: yup.string().required(),
});

export const deleteChatHistorySchema = yup.object().shape({
  client_detail_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
  time: yup.string().required(),
});
