import { getDBPool } from "#utils/dbConfig";

export const getBaselineAssessmentMatchingQuery = async ({
  poolCountry,
  socialFactor,
  biologicalFactor,
  psychologicalFactor,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
            SELECT * FROM baseline_assessment_matching
            WHERE (
                (factor = 'social' AND level = $1) OR
                (factor = 'biological' AND level = $2) OR
                (factor = 'psychological' AND level = $3)
            )
        `,
    [socialFactor, biologicalFactor, psychologicalFactor]
  );
};
