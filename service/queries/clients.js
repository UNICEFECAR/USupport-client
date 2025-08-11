import { getDBPool } from "#utils/dbConfig";

export const getClientByIdQuery = async ({ poolCountry, clientId }) =>
  await getDBPool("piiDb", poolCountry).query(
    `

      SELECT client_detail_id, name, surname, nickname, email, image, push_notification_tokens
      FROM client_detail
      WHERE client_detail_id = $1
      LIMIT 1;
      
    `,
    [clientId]
  );

export const getClientByUserID = async (poolCountry, user_id) =>
  await getDBPool("piiDb", poolCountry).query(
    `
    WITH userData AS (

      SELECT client_detail_id 
      FROM "user"
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1

    ), clientData AS (

        SELECT client_detail."client_detail_id", "name", surname, nickname, email, image, sex, year_of_birth, urban_rural, data_processing, access_token, push_notification_tokens
        FROM client_detail
          JOIN userData ON userData.client_detail_id = client_detail.client_detail_id
        ORDER BY client_detail.created_at DESC
        LIMIT 1

    )
    
    SELECT * FROM clientData;
    `,
    [user_id]
  );

export const getCliendDetailByUserIdQuery = async ({
  poolCountry,
  user_id,
}) => {
  return await getDBPool("piiDb", poolCountry).query(
    `
      SELECT client_detail_id 
      FROM "user"
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
    [user_id]
  );
};

export const checkIfEmailIsUsedQuery = async ({ country, email }) =>
  await getDBPool("piiDb", country).query(
    `
    SELECT email
    FROM client_detail
    WHERE email = $1
    `,
    [email]
  );

export const updateClientDataQuery = async ({
  poolCountry,
  client_id,
  name,
  surname,
  nickname,
  email,
  sex,
  yearOfBirth,
  urbanRural,
  pushNotificationTokens,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      UPDATE client_detail
      SET name = $1, 
          surname = $2, 
          nickname = $3, 
          email = $4, 
          sex = $5,
          year_of_birth = $6,
          urban_rural = $7,
          push_notification_tokens = $8
      WHERE client_detail_id = $9
      RETURNING *;
    `,
    [
      name,
      surname,
      nickname,
      email,
      sex,
      yearOfBirth,
      urbanRural,
      pushNotificationTokens,
      client_id,
    ]
  );

export const deleteClientDataQuery = async ({
  poolCountry,
  client_id,
  user_id,
}) => {
  const piiPool = getDBPool("piiDb", poolCountry);

  try {
    // Begin transaction
    await piiPool.query("BEGIN");

    // Delete client data
    const res = await piiPool.query(
      `
          UPDATE client_detail
          SET name = 'DELETED',
              surname = 'DELETED',
              nickname = 'DELETED',
              email = 'DELETED',
              image = 'default',
              sex = NULL,
              push_token = NULL,
              year_of_birth = NULL,
              urban_rural = NULL,
              data_processing = false,
              access_token = NULL
          WHERE client_detail_id = $1
          RETURNING *;
      `,
      [client_id]
    );

    // Invalidate the user
    await piiPool.query(
      `
          UPDATE "user"
          SET deleted_at = NOW()
          WHERE user_id = $1
      `,
      [user_id]
    );

    // Commit transaction
    await piiPool.query("COMMIT");

    return res;
  } catch (e) {
    // Rollback transaction in case of error
    await piiPool.query("ROLLBACK");
    throw e;
  }
};

export const updateClientImageQuery = async ({
  poolCountry,
  client_id,
  image,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      UPDATE client_detail
      SET image = $1
      WHERE client_detail_id = $2
      RETURNING *;
    `,
    [image, client_id]
  );

export const deleteClientImageQuery = async ({ poolCountry, client_id }) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        UPDATE client_detail
        SET image = 'default'
        WHERE client_detail_id = $1
        RETURNING *;
      `,
    [client_id]
  );

export const updateClientDataProcessingQuery = async ({
  poolCountry,
  client_id,
  dataProcessing,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        UPDATE client_detail
        SET data_processing = $1
        WHERE client_detail_id = $2
        RETURNING *;
      `,
    [dataProcessing, client_id]
  );

export const addInformationPortalSuggestionQuery = async ({
  poolCountry,
  client_id,
  suggestion,
  type,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      INSERT INTO platform_suggestion (client_detail_id, suggestion, type)
      VALUES ($1, $2, $3)   
    `,
    [client_id, suggestion, type]
  );

export const addClientRatingQuery = async ({
  poolCountry,
  client_id,
  rating,
  comment,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      INSERT INTO client_rating (client_detail_id, rating, comment)
      VALUES ($1, $2, $3)
    `,
    [client_id, rating, comment]
  );

export const addClientPushNotificationTokenQuery = async ({
  poolCountry,
  client_id,
  pushNotificationToken,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      UPDATE client_detail
      SET push_notification_tokens = (SELECT array_agg(distinct e) FROM UNNEST(push_notification_tokens || $1::VARCHAR) e)
      WHERE client_detail_id = $2
      RETURNING *;
    `,
    [pushNotificationToken, client_id]
  );

export const checkIsCouponAvailableQuery = async ({
  poolCountry,
  couponCode,
}) => {
  return await getDBPool("piiDb", poolCountry).query(
    `
        SELECT campaign_id, coupon_code, max_coupons_per_client, no_coupons, active, start_date, end_date
        FROM campaign
        WHERE coupon_code = $1 AND NOW() BETWEEN start_date AND end_date AND active = true
        LIMIT 1;
    `,
    [couponCode]
  );
};

export const getClientCampaignConsultationsQuery = async ({
  poolCountry,
  client_detail_id,
  campaign_id,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
        SELECT COUNT(*) AS count
        FROM consultation
          JOIN transaction_log ON transaction_log.consultation_id = consultation.consultation_id AND transaction_log.campaign_id = $2
        WHERE client_detail_id = $1 AND (consultation.status = 'finished' OR consultation.status = 'scheduled')
    `,
    [client_detail_id, campaign_id]
  );
};

export const getTotalCampaignConsultationsQuery = async ({
  poolCountry,
  campaign_id,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
        SELECT COUNT(*) AS count
        FROM consultation
          JOIN transaction_log ON transaction_log.consultation_id = consultation.consultation_id AND transaction_log.campaign_id = $1
        WHERE consultation.status = 'finished' OR consultation.status = 'scheduled'
    `,
    [campaign_id]
  );
};

export const deleteChatHistoryQuery = async ({
  poolCountry,
  client_detail_id,
  time,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
    UPDATE chat
    SET messages = ARRAY[JSON_BUILD_OBJECT(
      'type', 'system',
      'content', 'chat_history_deleted_by_client',
      'time', $2::text,
      'senderId', $1
    )]
    WHERE client_detail_id = $1;
  `,
    [client_detail_id, time]
  );
};

export const deleteMoodTrackDataQuery = async ({
  poolCountry,
  client_detail_id,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
    UPDATE mood_tracker
    SET comment = 'DELETED', mood = 'DELETED'
    WHERE client_detail_id = $1;
  `,
    [client_detail_id]
  );
};

export const addClientCategoryInteractionQuery = async ({
  poolCountry,
  clientDetailId,
  categoryId,
  mediaType,
  mediaId,
  tagIds,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
    INSERT INTO client_category_interaction (client_detail_id, category_id, media_type, media_id, tag_ids, count, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, 1, NOW(), NOW())
    ON CONFLICT (client_detail_id, category_id, media_type, media_id)
    DO UPDATE SET 
      count = client_category_interaction.count + 1,
      updated_at = NOW()
    RETURNING *;
    `,
    [clientDetailId, categoryId, mediaType, mediaId, tagIds]
  );
};

export const getCategoryInteractionsQuery = async ({
  poolCountry,
  clientDetailId,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
    SELECT category_id, media_type, media_id, count, tag_ids
    FROM client_category_interaction
    WHERE client_detail_id = $1
    `,
    [clientDetailId]
  );
};

export const addPlatformSuggestionQuery = async ({
  poolCountry,
  client_id,
  suggestion,
  type,
}) => {
  return await getDBPool("piiDb", poolCountry).query(
    `
      INSERT INTO platform_suggestion (client_detail_id, suggestion, type)
      VALUES ($1, $2, $3)
    `,
    [client_id, suggestion, type]
  );
};

export const getOrCreateScreeningSessionQuery = async ({
  poolCountry,
  clientDetailId,
  screeningSessionId,
}) => {
  if (screeningSessionId) {
    // Return existing session
    return await getDBPool("clinicalDb", poolCountry).query(
      `
        SELECT screening_session_id, client_detail_id, started_at, completed_at, current_position, status
        FROM screening_session
        WHERE screening_session_id = $1 AND client_detail_id = $2
        LIMIT 1
      `,
      [screeningSessionId, clientDetailId]
    );
  } else {
    // Create new session
    return await getDBPool("clinicalDb", poolCountry).query(
      `
        INSERT INTO screening_session (client_detail_id)
        VALUES ($1)
        RETURNING screening_session_id, client_detail_id, started_at, completed_at, current_position, status
      `,
      [clientDetailId]
    );
  }
};

export const addScreeningAnswerQuery = async ({
  poolCountry,
  screeningSessionId,
  questionId,
  answerValue,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      INSERT INTO screening_answer (screening_session_id, question_id, answer_value)
      VALUES ($1, $2, $3)
      ON CONFLICT (screening_session_id, question_id)
      DO UPDATE SET 
        answer_value = EXCLUDED.answer_value,
        answered_at = NOW()
      RETURNING answer_id, screening_session_id, question_id, answer_value, answered_at
    `,
    [screeningSessionId, questionId, answerValue]
  );
};

export const updateScreeningSessionPositionQuery = async ({
  poolCountry,
  screeningSessionId,
  position,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      UPDATE screening_session
      SET current_position = $1, updated_at = NOW()
      WHERE screening_session_id = $2
      RETURNING screening_session_id, current_position
    `,
    [position, screeningSessionId]
  );
};

export const getAllScreeningQuestionsQuery = async ({ poolCountry }) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      SELECT question_id, position, question_text, dimension, is_critical, created_at
      FROM screening_question
      ORDER BY position ASC
    `
  );
};

export const getClientScreeningSessionsQuery = async ({
  poolCountry,
  clientDetailId,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      SELECT *
      FROM screening_session ss
      WHERE ss.client_detail_id = $1
      ORDER BY ss.created_at DESC
    `,
    [clientDetailId]
  );
};

export const getClientAnswersForSessionByIdQuery = async ({
  poolCountry,
  screeningSessionId,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      SELECT *
      FROM screening_answer
      WHERE screening_session_id = $1
    `,
    [screeningSessionId]
  );
};

export const createScreeningSessionQuery = async ({
  poolCountry,
  clientDetailId,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      INSERT INTO screening_session (client_detail_id)
      VALUES ($1)
      RETURNING screening_session_id, client_detail_id, started_at, completed_at, current_position, status, created_at, updated_at
    `,
    [clientDetailId]
  );
};

export const updateScreeningSessionStatusQuery = async ({
  poolCountry,
  screeningSessionId,
  status,
  psychologicalProfile,
  biologicalProfile,
  socialProfile,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      UPDATE screening_session
      SET status = $1, updated_at = NOW(), psychological_profile = $3, biological_profile = $4, social_profile = $5
      WHERE screening_session_id = $2
      RETURNING screening_session_id, status
    `,
    [
      status,
      screeningSessionId,
      psychologicalProfile,
      biologicalProfile,
      socialProfile,
    ]
  );
};

export const updateClientHasCheckedBaselineAssessmentQuery = async ({
  poolCountry,
  clientDetailId,
  hasCheckedBaselineAssessment,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      UPDATE client_detail 
      SET has_checked_baseline_assessment = $1
      WHERE client_detail_id = $2
      RETURNING *;
    `,
    [hasCheckedBaselineAssessment, clientDetailId]
  );
export const addSOSCenterClickQuery = async ({
  poolCountry,
  clientDetailId,
  sosCenterId,
  isMain,
  platform,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      INSERT INTO sos_center_click (sos_center_id, is_main, client_detail_id, platform)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
    [sosCenterId, isMain, clientDetailId || null, platform]
  );
};
