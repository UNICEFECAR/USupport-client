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

        SELECT client_detail."client_detail_id", "name", surname, nickname, email, image, sex, year_of_birth, living_place, data_processing, access_token
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
          sex = $5,
          year_of_birth = $6,
          living_place = $7
      WHERE client_detail_id = $8
      RETURNING *;
    `,
    [name, surname, nickname, email, sex, yearOfBirth, livingPlace, client_id]
  );

export const deleteClientDataQuery = async ({
  poolCountry,
  client_id,
  user_id,
}) => {
  const piiPool = getDBPool("piiDb", poolCountry);

  try {
    // Begin transaction
    await piiPool.query("BEGIN");

    // Delete client data
    const res = await piiPool.query(
      `
          UPDATE client_detail
          SET name = 'DELETED',
              surname = 'DELETED',
              nickname = 'DELETED',
              email = 'DELETED',
              image = 'default',
              sex = NULL,
              push_token = NULL,
              year_of_birth = NULL,
              living_place = NULL,
              data_processing = false,
              access_token = NULL
          WHERE client_detail_id = $1
          RETURNING *;
      `,
      [client_id]
    );

    // Invalide the user
    await piiPool.query(
      `
          UPDATE "user"
          SET is_deleted = true
          WHERE user_id = $1
      `,
      [user_id]
    );

    // Commit transaction
    await piiPool.query("COMMIT");

    return res;
  } catch (e) {
    // Rollback transaction in case of error
    await piiPool.query("ROLLBACK");
    throw e;
  }
};
