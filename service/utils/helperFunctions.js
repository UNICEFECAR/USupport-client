import {
  getBaselineAssessmentThresholdsQuery,
  getCliendDetailByUserIdQuery,
} from "#queries/clients";
import fetch from "node-fetch";

const USER_LOCAL_HOST = "http://localhost:3010";

const USER_URL = process.env.USER_URL;

export const getClientDetailIdByUserId = async (
  authHeader,
  country,
  language
) => {
  // Get current user
  const result = await fetch(`${USER_URL}/user/v1/user`, {
    headers: {
      "x-country-alpha-2": country,
      "x-language-alpha-2": language,
      ...(authHeader && { Authorization: authHeader }),
      host: USER_LOCAL_HOST,
    },
  })
    .then((raw) => raw.json())
    .catch(console.log);

  if (result.user_id) {
    return await getCliendDetailByUserIdQuery({
      poolCountry: country,
      user_id: result.user_id,
    })
      .then((res) => {
        if (res.rowCount === 0) {
          return [];
        } else {
          return res.rows[0].client_detail_id;
        }
      })
      .catch((err) => {
        throw err;
      });
  }
};

/**
 *
 * @param {Object} scores {psychological: number, biological: number, social: number}
 * @param {string} country
 * @returns {Object} {psychologicalProfile: string, biologicalProfile: string, socialProfile: string}
 */
export const calculateBaselineAssessmentScore = async (scores, country) => {
  const {
    psychological: psychologicalScore,
    biological: biologicalScore,
    social: socialScore,
  } = scores;

  const baselineAssessmentThresholds =
    await getBaselineAssessmentThresholdsQuery(country)
      .then((res) => {
        return res.rows.reduce(
          (acc, threshold) => {
            acc[threshold.factor] = {
              below: threshold.below,
              above: threshold.above,
            };
            return acc;
          },
          { psychological: {}, biological: {}, social: {} }
        );
      })
      .catch((err) => {
        throw err;
      });

  const getScoreProfile = (score, factor) => {
    const thresholds = baselineAssessmentThresholds[factor];
    if (
      !thresholds ||
      thresholds.below === undefined ||
      thresholds.above === undefined
    ) {
      console.log(
        `Missing thresholds for factor "${factor}". Thresholds:`,
        thresholds
      );
      return null;
    }
    if (score < thresholds.below) {
      return "low";
    } else if (score >= thresholds.below && score <= thresholds.above) {
      return "moderate";
    } else {
      return "high";
    }
  };

  const psychological = getScoreProfile(psychologicalScore, "psychological");
  const biological = getScoreProfile(biologicalScore, "biological");
  const social = getScoreProfile(socialScore, "social");

  return { psychological, biological, social };
};
