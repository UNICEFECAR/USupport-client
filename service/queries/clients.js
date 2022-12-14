import { getDBPool } from "#utils/dbConfig";

export const getClientByIdQuery = async ({ poolCountry, clientId }) =>
  await getDBPool("piiDb", poolCountry).query(
    `

      SELECT client_detail_id, name, surname, nickname, email, image
      FROM client_detail
      WHERE client_detail_id = $1
      LIMIT 1;
      
    `,
    [clientId]
  );

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

        SELECT client_detail."client_detail_id", "name", surname, nickname, email, image, sex, year_of_birth, urban_rural, data_processing, access_token
        FROM client_detail
          JOIN userData ON userData.client_detail_id = client_detail.client_detail_id
        ORDER BY client_detail.created_at DESC
        LIMIT 1

    )
    
    SELECT * FROM clientData;
    `,
    [user_id]
  );

export const checkIfEmailIsUsedQuery = async ({ country, email }) =>
  await getDBPool("piiDb", country).query(
    `
    SELECT email
    FROM client_detail
    WHERE email = $1
    `,
    [email]
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
  urbanRural,
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
          urban_rural = $7
      WHERE client_detail_id = $8
      RETURNING *;
    `,
    [name, surname, nickname, email, sex, yearOfBirth, urbanRural, client_id]
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
              urban_rural = NULL,
              data_processing = false,
              access_token = NULL
          WHERE client_detail_id = $1
          RETURNING *;
      `,
      [client_id]
    );

    // Invalidate the user
    await piiPool.query(
      `
          UPDATE "user"
          SET deleted_at = NOW()
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

export const updateClientImageQuery = async ({
  poolCountry,
  client_id,
  image,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      UPDATE client_detail
      SET image = $1
      WHERE client_detail_id = $2
      RETURNING *;
    `,
    [image, client_id]
  );

export const deleteClientImageQuery = async ({ poolCountry, client_id }) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        UPDATE client_detail
        SET image = 'default'
        WHERE client_detail_id = $1
        RETURNING *;
      `,
    [client_id]
  );

export const updateClientDataProcessingQuery = async ({
  poolCountry,
  client_id,
  dataProcessing,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        UPDATE client_detail
        SET data_processing = $1
        WHERE client_detail_id = $2
        RETURNING *;
      `,
    [dataProcessing, client_id]
  );
