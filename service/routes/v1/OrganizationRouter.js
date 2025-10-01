import express from "express";

import {
  getOrganizationSchema,
  organizationIdSchema,
  getPersonalizedOrganizationsSchema,
  getOrganizationSpecializationsSchema,
} from "#schemas/organizationSchemas";
import {
  getOrganizations,
  getOrganizationById,
  getPersonalizedOrganizations,
  getOrganizationSpecializations,
} from "#controllers/organizations";
import { populateClient } from "#middlewares/populateMiddleware";

const router = express.Router();

router.get("/", async (req, res, next) => {
  /**
   * #route   GET /organization/v1/organization
   * #desc    Get organization data
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const {
    search,
    district,
    paymentMethod,
    userInteraction,
    specialisations,
    propertyType,
    userLocationLat,
    userLocationLng,
  } = req.query;

  return await getOrganizationSchema
    .noUnknown(true)
    .strict()
    .validate({
      country,
      language,
      search: search || null,
      district: district || null,
      paymentMethod: paymentMethod || null,
      userInteraction: userInteraction || null,
      propertyType: propertyType || null,
      specialisations: specialisations
        ? specialisations.split(",").filter((s) => s.trim())
        : null,
      userLocation: {
        lat: Number(userLocationLat) || null,
        lng: Number(userLocationLng) || null,
      },
    })
    .then(getOrganizations)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/personalized", populateClient, async (req, res, next) => {
  const country = req.header("x-country-alpha-2");
  const clientDetailId = req.client.client_detail_id;

  return await getPersonalizedOrganizationsSchema
    .noUnknown(true)
    .strict()
    .validate({ country, clientDetailId })
    .then(getPersonalizedOrganizations)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/specializations", async (req, res, next) => {
  /**
   * #route   GET /client/v1/organization/specializations
   * #desc    Get organization specializations
   */
  const country = req.header("x-country-alpha-2");

  return await getOrganizationSpecializationsSchema
    .noUnknown(true)
    .strict()
    .validate({ country })
    .then(getOrganizationSpecializations)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/:organizationId", async (req, res, next) => {
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const { organizationId } = req.params;

  return await organizationIdSchema
    .noUnknown(true)
    .strict()
    .validate({ country, organizationId, language })
    .then(getOrganizationById)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
