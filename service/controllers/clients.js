import { updateClientDataQuery } from "#queries/clients";

import { userNotFound } from "#utils/errors";

export const updateClientData = async ({
  country,
  language,
  client_id,
  name,
  surname,
  nickname,
  email,
  image,
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
    image,
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
