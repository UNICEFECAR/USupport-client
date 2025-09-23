import {
  getOrganizationsQuery,
  getOrganizationByIdQuery,
} from "#queries/organizations";

import { getLatestBaselineAssessmentQuery } from "#queries/clients";
import { getBaselineAssessmentMatchingQuery } from "#queries/baselineAssessment";
import { calculateBaselineAssessmentScore } from "#utils/helperFunctions";
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

export const getPersonalizedOrganizations = async ({
  country,
  clientDetailId,
}) => {
  const latestBaselineAssessment = await getLatestBaselineAssessmentQuery({
    poolCountry: country,
    clientDetailId,
  }).then((res) => {
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  });

  if (!latestBaselineAssessment) {
    return {
      error: "No data for personalization",
    };
  }

  if (latestBaselineAssessment.status === "completed") {
    const score = await calculateBaselineAssessmentScore(
      {
        psychological: latestBaselineAssessment.psychological_score,
        biological: latestBaselineAssessment.biological_score,
        social: latestBaselineAssessment.social_score,
      },
      country
    );

    const matching = await getBaselineAssessmentMatchingQuery({
      poolCountry: country,
      socialFactor: score.social,
      biologicalFactor: score.biological,
      psychologicalFactor: score.psychological,
    }).then((res) => {
      return res.rows || [];
    });

    return matching;
  }

  return { matching: [] };
};
