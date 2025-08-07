import * as yup from "yup";

export const getOrganizationSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  search: yup.string().notRequired().nullable(),
  district: yup.string().notRequired().nullable(),
  paymentMethod: yup.string().notRequired().nullable(),
  userInteraction: yup.string().notRequired().nullable(),
  specialisation: yup.string().notRequired().nullable(),
  propertyType: yup.string().notRequired().nullable(),
  userLocation: yup
    .object()
    .shape({
      lat: yup.number().notRequired().nullable(),
      lng: yup.number().notRequired().nullable(),
    })
    .nullable(),
});

export const organizationCountrySchema = yup.object().shape({
  country: yup.string().required(),
});

export const organizationIdSchema = yup
  .object()
  .shape({
    organizationId: yup.string().required(),
    language: yup.string().required(),
  })
  .concat(organizationCountrySchema);
