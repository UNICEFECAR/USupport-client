import * as yup from "yup";

export const getAllConsultationsSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  client_id: yup.string().uuid().required(),
});

export const getSecurityCheckAnswersByConsultationIdSchema = yup
  .object()
  .shape({
    country: yup.string().required(),
    consultation_id: yup.string().uuid().required(),
  });

export const securityCheckAnswersSchema = yup.object().shape({
  country: yup.string().required(),
  consultationId: yup.string().uuid().required(),
  providerAttend: yup.boolean().required(),
  contactsDisclosure: yup.boolean().required(),
  suggestOutsideMeeting: yup.boolean().required(),
  identityCoercion: yup.boolean().required(),
  unsafeFeeling: yup.boolean().required(),
  moreDetails: yup.string().notRequired(),
  feeling: yup
    .string()
    .required()
    .oneOf([
      "very_satisfied",
      "satisfied",
      "neutral",
      "dissatisfied",
      "very_dissatisfied",
    ]),
  addressedNeeds: yup.number().required(),
  improveWellbeing: yup.number().required(),
  feelingsNow: yup.number().required(),
  additionalComment: yup.string().notRequired(),
});

export const unblockSlotSchema = getAllConsultationsSchema.shape({
  consultationId: yup.string().uuid().required(),
});
