import express from "express";

import {
  getOrganizationSchema,
  organizationIdSchema,
} from "#schemas/organizationSchemas";
import {
  getOrganizations,
  getOrganizationById,
} from "#controllers/organizations";

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
    workWith,
    district,
    paymentMethod,
    userInteraction,
    specialisation,
  } = req.query;

  return await getOrganizationSchema
    .noUnknown(true)
    .strict()
    .validate({
      country,
      language,
      search: search || null,
      workWith: workWith || null,
      district: district || null,
      paymentMethod: paymentMethod || null,
      userInteraction: userInteraction || null,
      specialisation: specialisation || null,
    })
    .then(getOrganizations)
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
