import { updateClientDataQuery, deleteClientDataQuery } from "#queries/clients";

import { userNotFound } from "#utils/errors";

export const updateClientData = async ({
  country,
  language,
  client_id,
  name,
  surname,
  nickname,
  email,
  sex,
  yearOfBirth,
  livingPlace,
}) => {
  return await updateClientDataQuery({
    poolCountry: country,
    client_id,
    name,
    surname,
    nickname,
    email,
    sex,
    yearOfBirth,
    livingPlace,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        throw userNotFound(language);
      } else {
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
}) => {
  return await deleteClientDataQuery({
    poolCountry: country,
    client_id,
    user_id,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        throw userNotFound(language);
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};
