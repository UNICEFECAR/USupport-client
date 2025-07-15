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
          .email({ tlds: { allow: false } })
          .required(t("email_required_error", language)),
      }),
      currentEmail: yup
        .string()
        .when("userAccessToken", {
          is: undefined,
          then: yup
            .string()
            .email({ tlds: { allow: false } })
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
        .mixed()
        .when("userAccessToken", {
          is: undefined,
          then: yup
            .mixed()
            .test(
              "is-valid-year-or-parent",
              "Must be a positive number or 'parent'",
              (value) => {
                // Allow "parent" string or a positive number
                return (
                  value === "parent" ||
                  (!isNaN(Number(value)) && Number(value) > 0)
                );
              }
            )
            .required(),
        })
        .test("min-value", "Min value is 1", (value) => {
          // Only enforce minimum for numbers, not "parent"
          return value === null || value === "parent" || value >= 1;
        })
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
  time: yup.string().required(),
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

export const addPlatformSuggestionSchema =
  addInformationPortalSuggestionSchema.shape({
    type: yup
      .string()
      .oneOf([
        "information-portal",
        "my-qa",
        "consultations",
        "organizations",
        "mood-tracker",
      ])
      .required(),
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

export const addClientCategoryInteractionSchema = yup.object().shape({
  clientDetailId: yup.string().uuid().required(),
  categoryId: yup.number().required(),
  articleId: yup.number().notRequired(),
  videoId: yup.number().notRequired(),
  podcastId: yup.number().notRequired(),
  tagIds: yup.array().of(yup.number()).required(),
  country: yup.string().required(),
  language: yup.string().required(),
});

export const getCategoryInteractionsSchema = yup.object().shape({
  clientDetailId: yup.string().uuid().required(),
  country: yup.string().required(),
});

export const addScreeningAnswerSchema = yup.object().shape({
  client_detail_id: yup.string().uuid().required(),
  country: yup.string().required(),
  language: yup.string().required(),
  questionId: yup.string().uuid().required(),
  answerValue: yup.number().integer().min(1).max(5).required(),
  screeningSessionId: yup.string().uuid().notRequired(),
});
