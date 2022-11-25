import { getDBPool } from "#utils/dbConfig";

export const getAllConsultationsQuery = async ({ poolCountry, client_id }) =>
  await getDBPool("clinicalDb", poolCountry).query(
    `
    
      SELECT *
      FROM consultation
      WHERE client_detail_id = $1
      ORDER BY created_at DESC

    `,
    [client_id]
  );
