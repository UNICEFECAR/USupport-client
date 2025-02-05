import {
  getAllAnsweredQuestionsQuery,
  createQuestionQuery,
  getClientQuestionsQuery,
  getAllQuestionsQuery,
  addAnswerVoteQuery,
} from "#queries/myQA";

import { getMultipleProvidersDataByIDs } from "#queries/providers";

import { getClientDetailIdByUserId } from "#utils/helperFunctions";

export const getAllAnsweredQuestions = async ({ country }) => {
  const questions = await getAllAnsweredQuestionsQuery({
    poolCountry: country,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        return [];
      } else {
        return res.rows;
      }
    })
    .catch((err) => {
      throw err;
    });
  return questions;
};

export const createQuestion = async ({
  country,
  question,
  client_detail_id,
}) => {
  return await createQuestionQuery({
    poolCountry: country,
    question,
    clientDetailId: client_detail_id,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        return [];
      } else {
        return { success: true };
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const getClientQuestions = async ({ country, client_detail_id }) => {
  const questions = await getClientQuestionsQuery({
    poolCountry: country,
    clientDetailId: client_detail_id,
  })
    .then(async (res) => {
      if (res.rowCount === 0) {
        return [];
      } else {
        const questions = res.rows;

        // Get the details for all the providers
        const providerIds = Array.from(
          new Set(questions.map((x) => x.provider_detail_id))
        );
        const providersDetails = await getMultipleProvidersDataByIDs({
          poolCountry: country,
          providerDetailIds: providerIds,
        }).then((res) => {
          if (res.rowCount === 0) {
            return [];
          } else {
            return res.rows;
          }
        });

        // For each question find its coresponding tags and provider details
        for (let i = 0; i < questions.length; i++) {
          questions[i].tags = questions[i].tags.filter((x) => x);
          const providerId = questions[i].provider_detail_id;
          if (providerId) {
            const currentQuestionProviderData = providersDetails.find(
              (x) => x.provider_detail_id === providerId
            );
            questions[i].providerData = currentQuestionProviderData;
            questions[i].likes = questions[i].likes?.length || 0;
            questions[i].dislikes = questions[i].dislikes?.length || 0;
          }
        }

        return questions;
      }
    })
    .catch((err) => {
      throw err;
    });
  return questions;
};

export const getAllQuestions = async ({
  country,
  language,
  orderBy,
  authHeader,
  languageId,
}) => {
  const questions = await getAllQuestionsQuery({
    poolCountry: country,
    orderBy,
    languageId,
  })
    .then(async (res) => {
      if (res.rowCount === 0) {
        return [];
      } else {
        const questions = res.rows;

        let clientDetailId;
        if (authHeader) {
          clientDetailId = await getClientDetailIdByUserId(
            authHeader,
            country,
            language
          );
        }

        // Get the details for all the providers
        const providerIds = Array.from(
          new Set(questions.map((x) => x.provider_detail_id))
        );
        const providersDetails = await getMultipleProvidersDataByIDs({
          poolCountry: country,
          providerDetailIds: providerIds,
        }).then((res) => {
          if (res.rowCount === 0) {
            return [];
          } else {
            return res.rows;
          }
        });

        // For each question find its coresponding tags and provider details
        for (let i = 0; i < questions.length; i++) {
          questions[i].tags = questions[i].tags.filter((x) => x);
          const providerId = questions[i].provider_detail_id;
          if (providerId) {
            const currentQuestionProviderData = providersDetails.find(
              (x) => x.provider_detail_id === providerId
            );

            if (clientDetailId) {
              questions[i].isLiked =
                questions[i].likes?.includes(clientDetailId);
              questions[i].isDisliked =
                questions[i].dislikes?.includes(clientDetailId);
              questions[i].isAskedByCurrentClient =
                questions[i].client_detail_id === clientDetailId;
            }

            questions[i].providerData = currentQuestionProviderData;
            questions[i].likes = questions[i].likes?.length || 0;
            questions[i].dislikes = questions[i].dislikes?.length || 0;
          }
        }
        return questions;
      }
    })
    .catch((err) => {
      throw err;
    });
  return questions;
};

export const addAnswerVote = async ({
  country,
  vote,
  answerId,
  client_detail_id,
}) => {
  return await addAnswerVoteQuery({
    poolCountry: country,
    vote,
    answerId,
    client_detail_id,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        // TODO: Throw an error
        return [];
      } else {
        return { success: true };
      }
    })
    .catch((err) => {
      throw err;
    });
};
