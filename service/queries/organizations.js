import { getDBPool } from "#utils/dbConfig";

export const getOrganizationsQuery = async ({
  country,
  search,
  workWith,
  district,
  paymentMethod,
  userInteraction,
  specialisation,
}) => {
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
    WHERE 
      ($1::text IS NULL OR organization.name ILIKE '%' || $1 || '%' OR organization.unit_name ILIKE '%' || $1 || '%')
      AND ($2::uuid IS NULL OR EXISTS (
        SELECT 1 FROM organization_work_with_links 
        WHERE organization_work_with_links.organization_id = organization.organization_id 
        AND organization_work_with_links.organization_work_with_id = $2
      ))
      AND ($3::uuid IS NULL OR organization.district_id = $3)
      AND ($4::uuid IS NULL OR organization.payment_method_id = $4)
      AND ($5::uuid IS NULL OR organization.user_interaction_id = $5)
      AND ($6::uuid IS NULL OR EXISTS (
        SELECT 1 FROM organization_specialisation_links 
        WHERE organization_specialisation_links.organization_id = organization.organization_id 
        AND organization_specialisation_links.organization_specialisation_id = $6
      ))
    ORDER BY organization.created_at DESC
    `,
    [search, workWith, district, paymentMethod, userInteraction, specialisation]
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
