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

export const addSecurityCheckAnswersSchema = yup.object().shape({
  country: yup.string().required(),
  consultationId: yup.string().uuid().required(),
  contactsDisclosure: yup.boolean().required(),
  suggestOutsideMeeting: yup.boolean().required(),
  identityCoercion: yup.boolean().required(),
  unsafeFeeling: yup.boolean().required(),
  moreDetails: yup.string().notRequired(),
});

export const updateSecurityCheckAnswersSchema = yup.object().shape({
  country: yup.string().required(),
  consultationId: yup.string().uuid().required(),
  contactsDisclosure: yup.boolean().required(),
  suggestOutsideMeeting: yup.boolean().required(),
  identityCoercion: yup.boolean().required(),
  unsafeFeeling: yup.boolean().required(),
  moreDetails: yup.string().notRequired(),
});
