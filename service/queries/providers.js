import { getDBPool } from "#utils/dbConfig";

export const getProviderByIdQuery = async ({ poolCountry, providerId, languageId }) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      SELECT provider_detail."provider_detail_id",
             COALESCE(pdt.name, provider_detail."name") AS name,
             COALESCE(pdt.patronym, provider_detail.patronym) AS patronym,
             COALESCE(pdt.surname, provider_detail.surname) AS surname,
             COALESCE(pdt.nickname, provider_detail.nickname) AS nickname,
             provider_detail.email, provider_detail.phone, provider_detail.image,
             provider_detail.specializations,
             COALESCE(pdt.street, provider_detail.street) AS street,
             COALESCE(pdt.city, provider_detail.city) AS city,
             provider_detail.postcode,
             COALESCE(pdt.education, provider_detail.education) AS education,
             provider_detail.sex, provider_detail.consultation_price,
             COALESCE(pdt.description, provider_detail.description) AS description,
             provider_detail.video_link
      FROM provider_detail
        JOIN "user" ON "user".provider_detail_id = provider_detail.provider_detail_id AND "user".deleted_at IS NULL
        LEFT JOIN provider_detail_translations pdt
          ON pdt.provider_detail_id = provider_detail.provider_detail_id
          AND pdt.language_id = $2::UUID
      WHERE provider_detail.provider_detail_id = $1
      ORDER BY provider_detail.created_at DESC
      LIMIT 1;
    `,
    [providerId, languageId]
  );

export const getMultipleProvidersDataByIDs = async ({
  poolCountry,
  providerDetailIds,
  languageId,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        SELECT
          provider_detail.provider_detail_id,
          COALESCE(pdt.name, provider_detail.name) AS name,
          COALESCE(pdt.surname, provider_detail.surname) AS surname,
          COALESCE(pdt.patronym, provider_detail.patronym) AS patronym,
          provider_detail.email,
          provider_detail.image
        FROM provider_detail
        JOIN "user" ON "user".provider_detail_id = provider_detail.provider_detail_id AND "user".deleted_at IS NULL
        LEFT JOIN provider_detail_translations pdt
          ON pdt.provider_detail_id = provider_detail.provider_detail_id
          AND pdt.language_id = $2::UUID
        WHERE provider_detail.provider_detail_id = ANY($1) AND provider_detail.status = 'active';
      `,
    [providerDetailIds, languageId]
  );

export const getLanguageIdByAlpha2Query = async (alpha2) =>
  await getDBPool("masterDb").query(
    "SELECT language_id FROM language WHERE alpha2 = $1 LIMIT 1",
    [alpha2]
  );
