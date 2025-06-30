import {
  getOrganizationsQuery,
  getOrganizationByIdQuery,
} from "#queries/organizations";

import { organizationNotFound } from "#utils/errors";

export const getOrganizations = async (data) => {
  return await getOrganizationsQuery(data)
    .then((res) => {
      return res.rows || [];
    })
    .catch((err) => {
      throw err;
    });
};

export const getOrganizationById = async (data) => {
  return await getOrganizationByIdQuery(data)
    .then((res) => {
      if (res.rows.length === 0) {
        throw organizationNotFound(data.language);
      }

      return res.rows[0];
    })
    .catch((err) => {
      throw err;
    });
};
