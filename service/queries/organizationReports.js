import { getDBPool } from "#utils/dbConfig";

export const hasRecentOrganizationReportForClientQuery = async ({
  poolCountry,
  organizationId,
  clientDetailId,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      SELECT 1
      FROM organization_report
      WHERE organization_id = $1
        AND client_detail_id = $2
        AND created_at > NOW() - INTERVAL '1 hour'
      LIMIT 1
    `,
    [organizationId, clientDetailId]
  );

export const insertOrganizationReportQuery = async ({
  poolCountry,
  organizationId,
  clientDetailId,
  reason,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      INSERT INTO organization_report (organization_id, client_detail_id, reason)
      VALUES ($1, $2, $3)
      RETURNING organization_report_id, organization_id, client_detail_id, reason, created_at
    `,
    [organizationId, clientDetailId, reason]
  );
