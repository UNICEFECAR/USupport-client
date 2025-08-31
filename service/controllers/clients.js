/* eslint-disable no-useless-catch */
import AWS from "aws-sdk";
import bcrypt from "bcryptjs";

import {
  getClientByIdQuery,
  updateClientDataQuery,
  checkIfEmailIsUsedQuery,
  deleteClientDataQuery,
  updateClientImageQuery,
  deleteClientImageQuery,
  updateClientDataProcessingQuery,
  addClientRatingQuery,
  addInformationPortalSuggestionQuery,
  addClientPushNotificationTokenQuery,
  checkIsCouponAvailableQuery,
  getClientCampaignConsultationsQuery,
  getTotalCampaignConsultationsQuery,
  deleteChatHistoryQuery,
  deleteMoodTrackDataQuery,
  addClientCategoryInteractionQuery,
  getCategoryInteractionsQuery,
  addPlatformSuggestionQuery,
  getOrCreateBaselineAssessmentQuery,
  addBaselineAssessmentAnswerQuery,
  updateBaselineAssessmentPositionQuery,
  getAllBaselineAssessmentQuestionsQuery,
  getClientBaselineAssessmentsQuery,
  getClientAnswersForBaselineAssessmentByIdQuery,
  createBaselineAssessmentQuery,
  updateBaselineAssessmentStatusQuery,
  updateClientHasCheckedBaselineAssessmentQuery,
  addSOSCenterClickQuery,
  getLatestBaselineAssessmentQuery,
  anonimizeClientBaselineAssessmentsQuery,
} from "#queries/clients";

import {
  clientNotFound,
  incorrectPassword,
  // emailUsed,
  couponNotFound,
  clientLimitReached,
  couponsLimitReached,
  errorOccured,
  countryNotSupported,
} from "#utils/errors";
import { deleteCacheItem, getCacheItem, setCacheItem } from "#utils/cache";
import { calculateBaselineAssessmentScore } from "#utils/helperFunctions";

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const QUESTIONS_COUNT = 27;

export const getClientById = async ({ country, language, clientId }) => {
  return await getClientByIdQuery({
    poolCountry: country,
    clientId,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        throw clientNotFound(language);
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const updateClientData = async ({
  country,
  language,
  client_id,
  user_id,
  name,
  surname,
  nickname,
  email,
  currentEmail,
  sex,
  yearOfBirth,
  urbanRural,
  pushNotificationTokens,
}) => {
  // Check if email is changed
  if (email !== currentEmail) {
    // Check if email is already taken
    await checkIfEmailIsUsedQuery({
      country,
      email,
    })
      .then((res) => {
        if (res.rowCount > 0) {
          throw errorOccured(language);
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  return await updateClientDataQuery({
    poolCountry: country,
    client_id,
    name,
    surname,
    nickname,
    email,
    sex,
    yearOfBirth,
    urbanRural,
    pushNotificationTokens,
  })
    .then(async (res) => {
      if (res.rowCount === 0) {
        throw clientNotFound(language);
      } else {
        const cacheKey = `client_${country}_${user_id}`;
        await deleteCacheItem(cacheKey);

        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const deleteClientData = async ({
  country,
  language,
  client_id,
  user_id,
  image,
  password,
  userPassword,
  time,
}) => {
  const validatePassword = await bcrypt.compare(password, userPassword);

  if (!validatePassword) {
    throw incorrectPassword(language);
  }

  return await deleteClientDataQuery({
    poolCountry: country,
    client_id,
    user_id,
  })
    .then(async (res) => {
      if (res.rowCount === 0) {
        throw clientNotFound(language);
      } else {
        await deleteChatHistoryQuery({
          poolCountry: country,
          client_detail_id: client_id,
          time,
        });
        await deleteMoodTrackDataQuery({
          poolCountry: country,
          client_detail_id: client_id,
        });
        if (image !== "default") {
          try {
            const s3 = new AWS.S3({
              accessKeyId: AWS_ACCESS_KEY_ID,
              secretAccessKey: AWS_SECRET_ACCESS_KEY,
              region: AWS_REGION,
            });

            const params = {
              Bucket: AWS_BUCKET_NAME,
              Prefix: image,
            };

            const objectVersions = await s3
              .listObjectVersions(params)
              .promise();

            const versions = objectVersions.Versions.map((version) => {
              const deleteParams = {
                Bucket: AWS_BUCKET_NAME,
                Key: version.Key,
                VersionId: version.VersionId,
              };
              return s3.deleteObject(deleteParams).promise();
            });

            await Promise.all(versions);
          } catch (err) {
            throw err;
          }
        }

        const cacheKey = `client_${country}_${user_id}`;
        await deleteCacheItem(cacheKey);

        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const updateClientImage = async ({
  country,
  language,
  client_id,
  user_id,
  image,
}) => {
  return await updateClientImageQuery({
    poolCountry: country,
    client_id,
    image,
  })
    .then(async (res) => {
      if (res.rowCount === 0) {
        throw clientNotFound(language);
      } else {
        const cacheKey = `client_${country}_${user_id}`;
        await deleteCacheItem(cacheKey);

        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const deleteClientImage = async ({
  country,
  language,
  client_id,
  user_id,
}) => {
  return await deleteClientImageQuery({
    poolCountry: country,
    client_id,
  })
    .then(async (res) => {
      if (res.rowCount === 0) {
        throw clientNotFound(language);
      } else {
        const cacheKey = `client_${country}_${user_id}`;
        await deleteCacheItem(cacheKey);

        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const updateClientDataProcessing = async ({
  country,
  language,
  client_id,
  user_id,
  dataProcessing,
}) => {
  return await updateClientDataProcessingQuery({
    poolCountry: country,
    client_id,
    dataProcessing,
  })
    .then(async (res) => {
      if (res.rowCount === 0) {
        throw clientNotFound(language);
      } else {
        const cacheKey = `client_${country}_${user_id}`;
        await deleteCacheItem(cacheKey);

        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const addInformationPortalSuggestion = async ({
  country,
  client_id,
  suggestion,
}) => {
  return await addInformationPortalSuggestionQuery({
    poolCountry: country,
    client_id,
    suggestion,
  })
    .then(() => {
      return { success: true };
    })
    .catch((err) => {
      throw err;
    });
};

export const addClientRating = async ({
  country,
  client_id,
  rating,
  comment,
}) => {
  return await addClientRatingQuery({
    poolCountry: country,
    client_id,
    rating,
    comment,
  })
    .then(() => {
      return { success: true };
    })
    .catch((err) => {
      throw err;
    });
};

export const addClientPushNotificationToken = async ({
  country,
  client_id,
  pushNotificationToken,
}) => {
  return await addClientPushNotificationTokenQuery({
    poolCountry: country,
    client_id,
    pushNotificationToken,
  })
    .then(() => {
      return { success: true };
    })
    .catch((err) => {
      throw err;
    });
};

export const checkIsCouponAvailable = async ({
  country,
  language,
  couponCode,
  client_detail_id,
}) => {
  const campaignData = await checkIsCouponAvailableQuery({
    poolCountry: country,
    couponCode,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        throw couponNotFound(language);
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });

  const clientCampaignConsultations = await getClientCampaignConsultationsQuery(
    {
      poolCountry: country,
      client_detail_id,
      campaign_id: campaignData.campaign_id,
    }
  ).then((res) => {
    if (res.rowCount === 0) {
      return 0;
    } else {
      return res.rows[0].count;
    }
  });

  const totalCampaignConsultations = await getTotalCampaignConsultationsQuery({
    poolCountry: country,
    campaign_id: campaignData.campaign_id,
  }).then((res) => {
    if (res.rowCount === 0) {
      return 0;
    } else {
      return res.rows[0].count;
    }
  });

  const isClientLimitReached =
    clientCampaignConsultations >= campaignData.max_coupons_per_client;
  const isCouponsLimitReached =
    totalCampaignConsultations >= campaignData.no_coupons;

  if (isClientLimitReached) {
    throw clientLimitReached(language);
  }

  if (isCouponsLimitReached) {
    throw couponsLimitReached(language);
  }

  if (
    campaignData.max_coupons_per_client > clientCampaignConsultations &&
    campaignData.no_coupons > totalCampaignConsultations
  ) {
    return {
      campaign_id: campaignData.campaign_id,
      success: true,
    };
  }
};

export const deleteChatHistory = async ({
  country,
  client_detail_id,
  time,
}) => {
  return await deleteChatHistoryQuery({
    poolCountry: country,
    client_detail_id,
    time,
  })
    .then(() => {
      return { success: true };
    })
    .catch((err) => {
      throw err;
    });
};

export const addClientCategoryInteraction = async ({
  country,
  clientDetailId,
  categoryId,
  articleId,
  podcastId,
  videoId,
  tagIds,
}) => {
  const mediaType = articleId ? "article" : videoId ? "video" : "podcast";
  const mediaId = articleId || videoId || podcastId;
  return await addClientCategoryInteractionQuery({
    poolCountry: country,
    clientDetailId,
    categoryId,
    mediaType,
    mediaId,
    tagIds,
  })
    .then((res) => {
      return {
        success: true,
        data: res.rows[0],
      };
    })
    .catch((err) => {
      throw err;
    });
};

export const getCategoryInteractions = async ({ country, clientDetailId }) => {
  return await getCategoryInteractionsQuery({
    poolCountry: country,
    clientDetailId,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        return [];
      } else {
        return res.rows.map((x) => ({
          category_id: x.category_id,
          article_id: x.media_type === "article" ? x.media_id : null,
          count: x.count,
          tag_ids: x.tag_ids,
        }));
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const addPlatformSuggestion = async ({
  country,
  client_id,
  suggestion,
  type,
}) => {
  return await addPlatformSuggestionQuery({
    poolCountry: country,
    client_id,
    suggestion,
    type,
  })
    .then(() => {
      return { success: true };
    })
    .catch((err) => {
      throw err;
    });
};

export const addBaselineAssessmentAnswer = async ({
  country,
  language,
  clientDetailId,
  questionId,
  answerValue,
  baselineAssessmentId,
  currentPosition,
}) => {
  try {
    const questionsCacheKey = `baseline_assessment_questions`;
    const questionsCacheItem = await getCacheItem(questionsCacheKey).catch(
      (err) => {
        console.log("Error getting item from cache: ", err);
      }
    );

    const currentQuestion = questionsCacheItem.find(
      (question) => question.questionId === questionId
    );
    const currentQuestionPosition = currentQuestion.position;

    const assessment = await getOrCreateBaselineAssessmentQuery({
      poolCountry: country,
      clientDetailId,
      baselineAssessmentId,
    })
      .then((res) => {
        return res.rows[0];
      })
      .catch((err) => {
        throw err;
      });

    // Add the answer
    const answerResult = await addBaselineAssessmentAnswerQuery({
      poolCountry: country,
      baselineAssessmentId,
      questionId,
      answerValue,
    });

    const answer = answerResult.rows[0];

    // const currentPosition = assessment.current_position;

    const newPosition =
      currentQuestionPosition > currentPosition
        ? currentQuestionPosition
        : currentPosition + 1;

    let finalResult = null;

    // If we are on the last question, the new position will become 28, so we don't need to update the position
    if (newPosition !== 28) {
      // Update assessment position if this question position is higher than current
      // Note: We'd need to get the question position, but for simplicity, we'll increment current position
      await updateBaselineAssessmentPositionQuery({
        poolCountry: country,
        baselineAssessmentId: assessment.baseline_assessment_id,
        position:
          currentQuestionPosition > currentPosition
            ? currentQuestionPosition
            : currentPosition + 1,
      });
    } else {
      // Get all user answers for the assessment, to calculate the score
      const clientAnswers =
        await getClientAnswersForBaselineAssessmentByIdQuery({
          poolCountry: country,
          clientDetailId,
          baselineAssessmentId: assessment.baseline_assessment_id,
        }).then((res) => {
          if (res.rowCount === 0) {
            return [];
          } else {
            return res.rows;
          }
        });

      const {
        psychological: psychologicalScore,
        biological: biologicalScore,
        social: socialScore,
      } = clientAnswers.reduce(
        (acc, answer) => {
          const question = questionsCacheItem.find(
            (question) => question.questionId === answer.question_id
          );
          acc[question.dimension] = acc[question.dimension] || 0;
          acc[question.dimension] += answer.answer_value;
          return acc;
        },
        { psychological: 0, biological: 0, social: 0 }
      );

      finalResult = await calculateBaselineAssessmentScore(
        {
          psychological: psychologicalScore,
          biological: biologicalScore,
          social: socialScore,
        },
        country
      );

      await updateBaselineAssessmentStatusQuery({
        poolCountry: country,
        baselineAssessmentId: assessment.baseline_assessment_id,
        status: "completed",
        psychologicalScore,
        biologicalScore,
        socialScore,
      });
    }

    return {
      success: true,
      baselineAssessmentId: assessment.baseline_assessment_id,
      answerId: answer.answer_id,
      answeredAt: answer.answered_at,
      finalResult,
    };
  } catch (err) {
    throw err;
  }
};

export const getAllBaselineAssessmentQuestions = async ({
  country,
  language,
}) => {
  try {
    if (country !== "RO") {
      throw countryNotSupported(language);
    }

    const cacheKey = "baseline_assessment_questions";
    const cacheItem = await getCacheItem(cacheKey).catch((err) => {
      console.log("Error getting item from cache: ", err);
    });

    if (cacheItem) {
      return cacheItem;
    }

    return await getAllBaselineAssessmentQuestionsQuery({
      poolCountry: country,
    }).then(async (res) => {
      const questions = res.rows.map((question) => ({
        questionId: question.question_id,
        position: question.position,
        questionText: question.question_text,
        dimension: question.dimension,
        isCritical: question.is_critical,
        createdAt: question.created_at,
      }));

      await setCacheItem(cacheKey, questions, 60 * 60 * 24 * 30).catch(
        (err) => {
          console.log("Erro saving item to cache: ", err);
        }
      );

      return questions;
    });
  } catch (err) {
    throw err;
  }
};

export const getClientBaselineAssessments = async ({
  country,
  language,
  clientDetailId,
}) => {
  try {
    if (country !== "RO") {
      throw countryNotSupported(language);
    }

    const assessments = await getClientBaselineAssessmentsQuery({
      poolCountry: country,
      clientDetailId,
    }).then((res) => {
      const assessments = res.rows.map((assessment) => ({
        baselineAssessmentId: assessment.baseline_assessment_id,
        clientDetailId: assessment.client_detail_id,
        startedAt: assessment.started_at,
        completedAt: assessment.completed_at,
        currentPosition: assessment.current_position,
        status: assessment.status,
        createdAt: assessment.created_at,
        updatedAt: assessment.updated_at,
        totalQuestions: QUESTIONS_COUNT,
        completionPercentage: Math.round(
          (parseInt(assessment.current_position - 1) / QUESTIONS_COUNT) * 100
        ),
        finalResult: {
          psychological: assessment.psychological_score,
          biological: assessment.biological_score,
          social: assessment.social_score,
        },
      }));
      return assessments;
    });

    // Calculate the final result for each assessment
    await Promise.all(
      assessments.map(async (assessment, index) => {
        if (assessment.status === "completed") {
          const finalResult = await calculateBaselineAssessmentScore(
            {
              psychological: assessment.finalResult.psychological,
              biological: assessment.finalResult.biological,
              social: assessment.finalResult.social,
            },
            country
          );
          assessments[index].finalResult = finalResult;
          return finalResult;
        }
      })
    );

    return assessments;
  } catch (err) {
    throw err;
  }
};

export const getClientAnswersForBaselineAssessmentById = async ({
  country,
  language,
  clientDetailId,
  baselineAssessmentId,
}) => {
  return await getClientAnswersForBaselineAssessmentByIdQuery({
    poolCountry: country,
    clientDetailId,
    baselineAssessmentId,
  }).then((res) => {
    if (res.rowCount === 0) {
      return [];
    } else {
      // Convert the array of rows into a single object mapping question_id to answer_value
      const answersObj = {};
      res.rows.forEach((x) => {
        answersObj[x.question_id] = x.answer_value;
      });
      return answersObj;
    }
  });
};

export const createBaselineAssessment = async ({
  country,
  language,
  clientDetailId,
}) => {
  try {
    if (country !== "RO") {
      throw countryNotSupported(language);
    }

    // When a new assessment is created, we need to anonimize the previous assessments
    await anonimizeClientBaselineAssessmentsQuery({
      country,
      clientDetailId,
    }).catch((err) => {
      console.log(
        `Error "${err}" anonimizing client baseline assessments: `,
        clientDetailId
      );
    });

    return await createBaselineAssessmentQuery({
      poolCountry: country,
      clientDetailId,
    }).then((res) => {
      const assessment = res.rows[0];
      return {
        baselineAssessmentId: assessment.baseline_assessment_id,
        clientDetailId: assessment.client_detail_id,
        startedAt: assessment.started_at,
        completedAt: assessment.completed_at,
        currentPosition: assessment.current_position,
        status: assessment.status,
        createdAt: assessment.created_at,
        updatedAt: assessment.updated_at,
        totalQuestions: QUESTIONS_COUNT,
        completionPercentage: 0,
      };
    });
  } catch (err) {
    throw err;
  }
};

export const updateClientHasCheckedBaselineAssessment = async ({
  country,
  language,
  clientDetailId,
  hasCheckedBaselineAssessment,
}) => {
  return await updateClientHasCheckedBaselineAssessmentQuery({
    poolCountry: country,
    clientDetailId,
    hasCheckedBaselineAssessment,
  })
    .then(() => {
      return {
        success: true,
      };
    })
    .catch((err) => {
      console.log(err);
      throw clientNotFound(language);
    });
};

export const getLatestBaselineAssessment = async ({
  country,
  language,
  clientDetailId,
}) => {
  try {
    if (country !== "RO") {
      throw countryNotSupported(language);
    }

    const assessment = await getLatestBaselineAssessmentQuery({
      poolCountry: country,
      clientDetailId,
    }).then((res) => {
      if (res.rowCount === 0) {
        return {};
      }

      const assessmentData = res.rows[0];
      return {
        baselineAssessmentId: assessmentData.baseline_assessment_id,
        clientDetailId: assessmentData.client_detail_id,
        startedAt: assessmentData.started_at,
        completedAt: assessmentData.completed_at,
        currentPosition: assessmentData.current_position,
        status: assessmentData.status,
        createdAt: assessmentData.created_at,
        updatedAt: assessmentData.updated_at,
        totalQuestions: QUESTIONS_COUNT,
        completionPercentage: Math.round(
          (parseInt(assessmentData.current_position - 1) / QUESTIONS_COUNT) *
            100
        ),
        finalResult: {
          psychological: assessmentData.psychological_score,
          biological: assessmentData.biological_score,
          social: assessmentData.social_score,
        },
      };
    });

    if (assessment && assessment.status === "completed") {
      const finalResult = await calculateBaselineAssessmentScore(
        {
          psychological: assessment.finalResult.psychological,
          biological: assessment.finalResult.biological,
          social: assessment.finalResult.social,
        },
        country
      );
      assessment.finalResult = finalResult;
    }

    return assessment;
  } catch (err) {
    throw err;
  }
};

export const addSOSCenterClick = async ({
  country,
  language,
  clientDetailId,
  sosCenterId,
  isMain,
  platform,
}) => {
  return await addSOSCenterClickQuery({
    poolCountry: country,
    clientDetailId,
    sosCenterId,
    isMain,
    platform,
  })
    .then(() => {
      return { success: true };
    })
    .catch((err) => {
      console.log("Error adding SOS center click: ", err);
      return { success: false };
    });
};
