import { getDBPool } from "#utils/dbConfig";

export const getOrganizationsQuery = async ({
  country,
  search,
  district,
  paymentMethod,
  userInteraction,
  specialisation,
  propertyType,
  userLocation,
}) => {
  const { lat, lng } = userLocation || {};
  return await getDBPool("piiDb", country).query(
    `
      WITH org_with_dist AS (
        SELECT 
          o.organization_id,
          o.name,
          o.website_url,
          o.address,
          o.phone,
          o.email,
          o.description,
          o.created_by,
          o.created_at,
          o.district_id,
          ST_X(o.geolocation) AS longitude,
          ST_Y(o.geolocation) AS latitude,
          d.name AS district,
          COALESCE(sp.specialisations, '[]'::json) AS specialisations,
          COALESCE(pm.payment_methods, '[]'::json) AS payment_methods,
          COALESCE(ui.user_interactions, '[]'::json) AS user_interactions,
          COALESCE(pt.property_types, '[]'::json) AS property_types,
          
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
        LEFT JOIN district d ON o.district_id = d.district_id

        LEFT JOIN (
          SELECT 
            organization_id,
            JSON_AGG(JSON_BUILD_OBJECT(
              'id', osl.organization_specialisation_id,
              'name', os.name
            )) AS specialisations
          FROM organization_specialisation_links osl
          LEFT JOIN organization_specialisation os
            ON osl.organization_specialisation_id = os.organization_specialisation_id
          GROUP BY organization_id
        ) sp ON o.organization_id = sp.organization_id

        LEFT JOIN (
          SELECT 
            organization_id,
            JSON_AGG(JSON_BUILD_OBJECT(
              'id', opml.payment_method_id,
              'name', pm_inner.name
            )) AS payment_methods
          FROM organization_payment_method_links opml
          LEFT JOIN payment_method pm_inner
            ON opml.payment_method_id = pm_inner.payment_method_id
          GROUP BY organization_id
        ) pm ON o.organization_id = pm.organization_id

        LEFT JOIN (
          SELECT 
            organization_id,
            JSON_AGG(JSON_BUILD_OBJECT(
              'id', ouil.user_interaction_id,
              'name', ui_inner.name
            )) AS user_interactions
          FROM organization_user_interaction_links ouil
          LEFT JOIN user_interaction ui_inner
            ON ouil.user_interaction_id = ui_inner.user_interaction_id
          GROUP BY organization_id
        ) ui ON o.organization_id = ui.organization_id

        -- Property types aggregation
        LEFT JOIN (
          SELECT 
            organization_id,
            JSON_AGG(JSON_BUILD_OBJECT(
              'id', optl.organization_property_type_id,
              'name', opt.name
            )) AS property_types
          FROM organization_property_type_links optl
          LEFT JOIN organization_property_type opt
            ON optl.organization_property_type_id = opt.organization_property_type_id
          GROUP BY organization_id
        ) pt ON o.organization_id = pt.organization_id

        WHERE 
          (o.is_deleted IS FALSE OR o.is_deleted IS NULL)
          
          AND ($1::text IS NULL OR o.name ILIKE '%' || $1 || '%')
          
          AND ($2::uuid IS NULL OR o.district_id = $2)
          
          AND ($3::uuid IS NULL OR EXISTS (
                SELECT 1
                FROM organization_payment_method_links
                WHERE organization_id = o.organization_id
                  AND payment_method_id = $3
              ))
          
          AND ($4::uuid IS NULL OR EXISTS (
                SELECT 1
                FROM organization_user_interaction_links
                WHERE organization_id = o.organization_id
                  AND user_interaction_id = $4
              ))
          
          AND ($5::uuid IS NULL OR EXISTS (
                SELECT 1
                FROM organization_specialisation_links
                WHERE organization_id = o.organization_id
                  AND organization_specialisation_id = $5
              ))
          
          AND ($6::uuid IS NULL OR EXISTS (
                SELECT 1
                FROM organization_property_type_links
                WHERE organization_id = o.organization_id
                  AND organization_property_type_id = $6
              ))
      )

      SELECT
        organization_id,
        name,
        website_url,
        address,
        phone,
        email,
        description,
        created_by,
        created_at,
        district_id,
        longitude,
        latitude,
        district,
        specialisations,
        payment_methods,
        user_interactions,
        property_types,
        distance_km

      FROM org_with_dist

      ORDER BY
        CASE WHEN distance_km IS NOT NULL THEN distance_km END ASC NULLS LAST,
        created_at ASC;

    `,
    [
      search,
      district,
      paymentMethod,
      userInteraction,
      specialisation,
      propertyType,
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
      organization.website_url,
      organization.address,
      organization.phone,
      organization.email,
      organization.description,
      organization.created_by,
      organization.created_at,
      organization.district_id,
      ST_X(organization.geolocation) as longitude, 
      ST_Y(organization.geolocation) as latitude,
      district.name as district,
      COALESCE(specialisations_agg.specialisations, '[]'::json) as specialisations,
      COALESCE(payment_methods_agg.payment_methods, '[]'::json) as payment_methods,
      COALESCE(user_interactions_agg.user_interactions, '[]'::json) as user_interactions,
      COALESCE(property_types_agg.property_types, '[]'::json) as property_types
    FROM organization
    LEFT JOIN district ON organization.district_id = district.district_id
    
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
      WHERE organization_specialisation_links.organization_id = $1
      GROUP BY organization_id
    ) specialisations_agg ON organization.organization_id = specialisations_agg.organization_id
    
    LEFT JOIN (
      SELECT 
        organization_id,
        JSON_AGG(JSON_BUILD_OBJECT(
          'id', organization_payment_method_links.payment_method_id,
          'name', payment_method.name
        )) as payment_methods
      FROM organization_payment_method_links
      LEFT JOIN payment_method ON (
        organization_payment_method_links.payment_method_id = payment_method.payment_method_id
      )
      WHERE organization_payment_method_links.organization_id = $1
      GROUP BY organization_id
    ) payment_methods_agg ON organization.organization_id = payment_methods_agg.organization_id
    
    LEFT JOIN (
      SELECT 
        organization_id,
        JSON_AGG(JSON_BUILD_OBJECT(
          'id', organization_user_interaction_links.user_interaction_id,
          'name', user_interaction.name
        )) as user_interactions
      FROM organization_user_interaction_links
      LEFT JOIN user_interaction ON (
        organization_user_interaction_links.user_interaction_id = user_interaction.user_interaction_id
      )
      WHERE organization_user_interaction_links.organization_id = $1
      GROUP BY organization_id
    ) user_interactions_agg ON organization.organization_id = user_interactions_agg.organization_id
    
    LEFT JOIN (
      SELECT 
        organization_id,
        JSON_AGG(JSON_BUILD_OBJECT(
          'id', organization_property_type_links.organization_property_type_id,
          'name', organization_property_type.name
        )) as property_types
      FROM organization_property_type_links
      LEFT JOIN organization_property_type ON (
        organization_property_type_links.organization_property_type_id = organization_property_type.organization_property_type_id
      )
      WHERE organization_property_type_links.organization_id = $1
      GROUP BY organization_id
    ) property_types_agg ON organization.organization_id = property_types_agg.organization_id
    
    WHERE organization.organization_id = $1 
      AND (organization.is_deleted IS FALSE OR organization.is_deleted IS NULL)
    `,
    [organizationId]
  );
};
