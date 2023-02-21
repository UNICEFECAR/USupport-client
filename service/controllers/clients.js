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
} from "#queries/clients";

import { clientNotFound, incorrectPassword, emailUsed } from "#utils/errors";
import { deleteCacheItem } from "#utils/cache";

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const handleClientQueryResponse = async ({
  res,
  language,
  country,
  user_id,
}) => {
  if (res.rowCount === 0) {
    throw clientNotFound(language);
  } else {
    const cacheKey = `client_${country}_${user_id}`;
    await deleteCacheItem(cacheKey);

    return res.rows[0];
  }
};

export const getClientById = async ({ country, language, client_id }) => {
  return await getClientByIdQuery({
    poolCountry: country,
    client_id,
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
          throw emailUsed(language);
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
    .then(async (res) =>
      handleClientQueryResponse({ res, language, country, user_id })
    )
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
    .then(async (res) =>
      handleClientQueryResponse({ res, language, country, user_id })
    )
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
    .then(async (res) =>
      handleClientQueryResponse({ res, language, country, user_id })
    )
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
    .then(async (res) =>
      handleClientQueryResponse({ res, language, country, user_id })
    )
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
