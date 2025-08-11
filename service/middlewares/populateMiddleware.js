import { getClientByUserID } from "#queries/clients";
import { getUserByID } from "#queries/users";

import { clientNotFound } from "#utils/errors";
import { getCacheItem, setCacheItem } from "#utils/cache";

export const populateClient = async (req, res, next) => {
  const country = req.header("x-country-alpha-2");
  const user_id = req.header("x-user-id");

  const cacheKey = `client_${country}_${user_id}`;
  const cachedClientData = await getCacheItem(cacheKey);

  if (cachedClientData) req.client = cachedClientData;
  else {
    const client = await getClientByUserID(country, user_id)
      .then((res) => res.rows[0])
      .catch((err) => {
        throw err;
      });

    if (!client) {
      return next(clientNotFound(country));
    }

    await setCacheItem(cacheKey, client, 60 * 60 * 2); // cache data for 2 hours
    req.client = client;
  }

  return next();
};

export const populateUser = async (req, res, next) => {
  const country = req.header("x-country-alpha-2");
  const user_id = req.header("x-user-id");

  const cacheKey = `user_${country}_${user_id}`;
  const cachedUserData = await getCacheItem(cacheKey);

  if (cachedUserData) req.user = cachedUserData;
  else {
    const user = await getUserByID(country, user_id)
      .then((res) => res.rows[0])
      .catch((err) => {
        throw err;
      });

    await setCacheItem(cacheKey, user, 60 * 60 * 2); // cache data for 2 hours
    req.user = user;
  }

  return next();
};

export const populateExistingUser = async (req, res, next) => {
  const user_id = req.header("x-user-id");
  if (!user_id || user_id === "null") {
    return next();
  }

  populateUser(req, res, next);
};
