import { getDBPool } from "#utils/dbConfig";

export const getClientByUserID = async (poolCountry, user_id) =>
  await getDBPool("piiDb", poolCountry).query(
    `
    WITH userData AS (

      SELECT client_detail_id 
      FROM "user"
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1

    ), clientData AS (

        SELECT client_detail."client_detail_id", "name", surname, nickname, email, image, sex, year_of_birth as yearOfBirth, living_place, data_processing, access_token
        FROM client_detail
          JOIN userData ON userData.client_detail_id = client_detail.client_detail_id
        ORDER BY client_detail.created_at DESC
        LIMIT 1

    )
    
    SELECT * FROM clientData;
    `,
    [user_id]
  );

export const updateClientDataQuery = async ({
  poolCountry,
  client_id,
  name,
  surname,
  nickname,
  email,
  image,
  sex,
  yearOfBirth,
  livingPlace,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      UPDATE client_detail
      SET name = $1, 
          surname = $2, 
          nickname = $3, 
          email = $4, 
          image = $5,
          sex = $6,
          year_of_birth = $7,
          living_place = $8
      WHERE client_detail_id = $9
      RETURNING *;
    `,
    [
      name,
      surname,
      nickname,
      email,
      image,
      sex,
      yearOfBirth,
      livingPlace,
      client_id,
    ]
  );
