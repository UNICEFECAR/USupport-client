import { getDBPool } from "#utils/dbConfig";

export const getCountryUserGuidesActiveQuery = async ({ country }) =>
  await getDBPool("masterDb").query(
    `
      SELECT user_guides_active
      FROM country
      WHERE alpha2 = $1 AND is_active = TRUE;
    `,
    [country]
  );
