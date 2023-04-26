import { getCliendDetailByUserIdQuery } from "#queries/clients";
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
