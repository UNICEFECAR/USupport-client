import { getDBPool } from "#utils/dbConfig";

export const getAllConsultationsQuery = async ({ poolCountry, client_id }) =>
  await getDBPool("clinicalDb", poolCountry).query(
    `
    
      SELECT *
      FROM consultation
      WHERE client_detail_id = $1 AND (status = 'suggested' OR status = 'scheduled' OR status = 'finished')
      ORDER BY created_at DESC

    `,
    [client_id]
  );
