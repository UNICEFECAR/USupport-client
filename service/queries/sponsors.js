import { getDBPool } from "#utils/dbConfig";

export const getSponsorNameAndImageByCampaignIdQuery = async ({
  poolCountry,
  campaignIds,
}) => {
  const campaigns = await getDBPool("piiDb", poolCountry).query(
    `
        SELECT sponsor.name as sponsor_name, sponsor.image as sponsor_image, campaign.campaign_id, campaign.coupon_code
            FROM campaign
            JOIN sponsor ON sponsor.sponsor_id = campaign.sponsor_id
        WHERE campaign_id = ANY($1)
        `,
    [campaignIds]
  );
  return campaigns;
};
