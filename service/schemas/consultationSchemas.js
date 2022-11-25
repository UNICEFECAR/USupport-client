import * as yup from "yup";

export const getAllConsultationsSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  client_id: yup.string().uuid().required(),
});
