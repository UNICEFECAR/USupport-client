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

export const getSecurityCheckAnswersByConsultationIdQuery = async ({
  poolCountry,
  consultation_id,
}) =>
  await getDBPool("clinicalDb", poolCountry).query(
    `
    
      SELECT *
      FROM consultation_security_check
      WHERE consultation_id = $1

    `,
    [consultation_id]
  );

export const addSecurityCheckAnswersQuery = async ({
  poolCountry,
  consultationId,
  providerAttend,
  contactsDisclosure,
  suggestOutsideMeeting,
  identityCoercion,
  unsafeFeeling,
  moreDetails,
  feeling,
  addressedNeeds,
  improveWellbeing,
  feelingsNow,
  additionalComment,
}) =>
  await getDBPool("clinicalDb", poolCountry).query(
    `
    
      INSERT INTO consultation_security_check
      (consultation_id, contacts_disclosure, suggest_outside_meeting, identity_coercion, unsafe_feeling, more_details, provider_attend, feeling, addressed_needs, improve_wellbeing, feelings_now, additional_comment)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *

    `,
    [
      consultationId,
      contactsDisclosure,
      suggestOutsideMeeting,
      identityCoercion,
      unsafeFeeling,
      moreDetails,
      providerAttend,
      feeling,
      addressedNeeds,
      improveWellbeing,
      feelingsNow,
      additionalComment,
    ]
  );

export const updateSecurityCheckAnswersQuery = async ({
  poolCountry,
  consultationId,
  providerAttend,
  contactsDisclosure,
  suggestOutsideMeeting,
  identityCoercion,
  unsafeFeeling,
  moreDetails,
  feeling,
  addressedNeeds,
  improveWellbeing,
  feelingsNow,
  additionalComment,
}) =>
  await getDBPool("clinicalDb", poolCountry).query(
    `
    
      UPDATE consultation_security_check
      SET contacts_disclosure = $2, suggest_outside_meeting = $3, identity_coercion = $4, unsafe_feeling = $5, more_details = $6, provider_attend = $7, feeling = $8, addressed_needs = $9, improve_wellbeing = $10, feelings_now = $11, additional_comment = $12
      WHERE consultation_id = $1
      RETURNING *

    `,
    [
      consultationId,
      contactsDisclosure,
      suggestOutsideMeeting,
      identityCoercion,
      unsafeFeeling,
      moreDetails,
      providerAttend,
      feeling,
      addressedNeeds,
      improveWellbeing,
      feelingsNow,
      additionalComment,
    ]
  );

export const unblockSlotQuery = async ({
  poolCountry,
  consultationId,
  clientDetailId,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      UPDATE consultation
      SET status = 'timeout'
      WHERE consultation_id = $1 AND client_detail_id = $2
      RETURNING *
    `,
    [consultationId, clientDetailId]
  );
};
