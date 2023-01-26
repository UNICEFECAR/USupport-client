import { getDBPool } from "#utils/dbConfig";

export const addInformationPortalSuggestionQuery = async ({
  poolCountry,
  client_id,
  suggestion,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      INSERT INTO information_portal_suggestion (client_detail_id, suggestion)
      VALUES ($1, $2,)   
    `,
    [client_id, suggestion]
  );
