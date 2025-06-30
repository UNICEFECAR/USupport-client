import { getDBPool } from "#utils/dbConfig";

export const getOrganizationsQuery = async ({
  country,
  search,
  workWith,
  district,
  paymentMethod,
  userInteraction,
  specialisation,
  userLocation,
}) => {
  const { lat, lng } = userLocation || {};
  return await getDBPool("piiDb", country).query(
    `
      WITH org_with_dist AS (
        SELECT 
          o.organization_id,
          o.name,
          o.unit_name,
          o.website_url,
          o.address,
          o.phone,
          o.email,
          o.description,
          o.created_by,
          o.created_at,
          o.district_id,
          o.payment_method_id,
          o.user_interaction_id,
          ST_X(o.geolocation) AS longitude,
          ST_Y(o.geolocation) AS latitude,
          d.name  AS district,
          pm.name AS payment_method,
          ui.name AS user_interaction,
          COALESCE(ww.work_with, '[]'::json)       AS work_with,
          COALESCE(sp.specialisations, '[]'::json) AS specialisations,
          
          -- If user location is provided, calculate distance using PostGIS
          CASE
            WHEN $7::double precision IS NOT NULL
            AND $8::double precision IS NOT NULL
            THEN
              ST_Distance(
                o.geolocation::geography,
                ST_Point($8::double precision, $7::double precision)::geography
              ) / 1000.0  -- Convert meters to kilometers
            ELSE NULL
          END AS distance_km

        FROM organization o
        LEFT JOIN district            d  ON o.district_id            = d.district_id
        LEFT JOIN payment_method      pm ON o.payment_method_id      = pm.payment_method_id
        LEFT JOIN user_interaction    ui ON o.user_interaction_id    = ui.user_interaction_id

        LEFT JOIN (
          SELECT 
            organization_id,
            JSON_AGG(JSON_BUILD_OBJECT('id', owl.organization_work_with_id,
                                      'topic', ow.topic)
                    ) AS work_with
          FROM organization_work_with_links owl
          LEFT JOIN organization_work_with ow
            ON owl.organization_work_with_id = ow.organization_work_with_id
          GROUP BY organization_id
        ) ww ON o.organization_id = ww.organization_id

        LEFT JOIN (
          SELECT 
            organization_id,
            JSON_AGG(JSON_BUILD_OBJECT('id', osl.organization_specialisation_id,
                                      'name', os.name)
                    ) AS specialisations
          FROM organization_specialisation_links osl
          LEFT JOIN organization_specialisation os
            ON osl.organization_specialisation_id = os.organization_specialisation_id
          GROUP BY organization_id
        ) sp ON o.organization_id = sp.organization_id

        WHERE 
          ($1::text IS NULL OR o.name ILIKE '%' || $1 || '%' OR o.unit_name ILIKE '%' || $1 || '%')
          AND ($2::uuid IS NULL OR EXISTS (
                SELECT 1
                  FROM organization_work_with_links
                WHERE organization_id           = o.organization_id
                  AND organization_work_with_id = $2
              ))
          AND ($3::uuid IS NULL OR o.district_id         = $3)
          AND ($4::uuid IS NULL OR o.payment_method_id   = $4)
          AND ($5::uuid IS NULL OR o.user_interaction_id = $5)
          AND ($6::uuid IS NULL OR EXISTS (
                SELECT 1
                  FROM organization_specialisation_links
                WHERE organization_id                  = o.organization_id
                  AND organization_specialisation_id  = $6
              ))
      )

      SELECT
        organization_id,
        name,
        unit_name,
        website_url,
        address,
        phone,
        email,
        description,
        created_by,
        created_at,
        district_id,
        payment_method_id,
        user_interaction_id,
        longitude,
        latitude,
        district,
        payment_method,
        user_interaction,
        work_with,
        specialisations,
        distance_km

      FROM org_with_dist

      ORDER BY
        CASE WHEN distance_km IS NOT NULL THEN distance_km END ASC NULLS LAST,
        created_at ASC;

    `,
    [
      search,
      workWith,
      district,
      paymentMethod,
      userInteraction,
      specialisation,
      lat || null,
      lng || null,
    ]
  );
};

export const getOrganizationByIdQuery = async ({ country, organizationId }) => {
  return await getDBPool("piiDb", country).query(
    `
    SELECT 
      organization.organization_id,
      organization.name,
      organization.unit_name,
      organization.website_url,
      organization.address,
      organization.phone,
      organization.email,
      organization.description,
      organization.created_by,
      organization.created_at,
      organization.district_id,
      organization.payment_method_id,
      organization.user_interaction_id,
      ST_X(organization.geolocation) as longitude, 
      ST_Y(organization.geolocation) as latitude,
      district.name as district,
      payment_method.name as payment_method,
      user_interaction.name as user_interaction,
      COALESCE(work_with_agg.work_with, '[]'::json) as work_with,
      COALESCE(specialisations_agg.specialisations, '[]'::json) as specialisations
    FROM organization
    LEFT JOIN district ON organization.district_id = district.district_id
    LEFT JOIN payment_method ON organization.payment_method_id = payment_method.payment_method_id
    LEFT JOIN user_interaction ON organization.user_interaction_id = user_interaction.user_interaction_id
    LEFT JOIN (
      SELECT 
        organization_id,
        JSON_AGG(JSON_BUILD_OBJECT(
          'id', organization_work_with_links.organization_work_with_id,
          'topic', organization_work_with.topic
        )) as work_with
      FROM organization_work_with_links
      LEFT JOIN organization_work_with ON (
        organization_work_with_links.organization_work_with_id = organization_work_with.organization_work_with_id
      )
      GROUP BY organization_id
    ) work_with_agg ON organization.organization_id = work_with_agg.organization_id
    LEFT JOIN (
      SELECT 
        organization_id,
        JSON_AGG(JSON_BUILD_OBJECT(
          'id', organization_specialisation_links.organization_specialisation_id,
          'name', organization_specialisation.name
        )) as specialisations
      FROM organization_specialisation_links
      LEFT JOIN organization_specialisation ON (
        organization_specialisation_links.organization_specialisation_id = organization_specialisation.organization_specialisation_id
      )
      GROUP BY organization_id
    ) specialisations_agg ON organization.organization_id = specialisations_agg.organization_id
    WHERE organization.organization_id = $1
    `,
    [organizationId]
  );
};
