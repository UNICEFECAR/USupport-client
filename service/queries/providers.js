import { getDBPool } from "#utils/dbConfig";

export const getProviderByIdQuery = async ({ poolCountry, providerId }) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      SELECT provider_detail."provider_detail_id", "name", patronym, surname, nickname, email, phone_prefix, phone, image, specializations, street, city, postcode, education, sex, consultation_price, description
      FROM provider_detail
        JOIN "user" ON "user".provider_detail_id = provider_detail.provider_detail_id AND "user".deleted_at IS NULL
      WHERE provider_detail.provider_detail_id = $1
      ORDER BY provider_detail.created_at DESC
      LIMIT 1;
    `,
    [providerId]
  );
