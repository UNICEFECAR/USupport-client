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

        SELECT "name", surname, username, email, image, sex, year_of_birth, living_place, data_processing, access_token
        FROM client_detail
          JOIN userData ON userData.client_detail_id = client_detail.client_detail_id
        ORDER BY client_detail.created_at DESC
        LIMIT 1

    )
    
    SELECT * FROM clientData;
    `,
    [user_id]
  );
