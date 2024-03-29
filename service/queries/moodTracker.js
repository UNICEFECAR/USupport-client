import { getDBPool } from "#utils/dbConfig";

export const getMoodTrackForTodayQuery = async ({ poolCountry, client_id }) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      SELECT mood, comment, time
      FROM mood_tracker
      WHERE client_detail_id = $1
        AND time between now() - interval '1 day' AND now() + interval '1 day';
    `,
    [client_id]
  );
};

export const addMoodTrackForTodayQuery = async ({
  poolCountry,
  client_id,
  mood,
  comment,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      INSERT INTO mood_tracker (client_detail_id, mood, comment, time)
      VALUES ($1, $2, $3, now());
    `,
    [client_id, mood, comment]
  );
};

export const getMoodTrackEntriesQuery = async ({
  poolCountry,
  client_id,
  limit,
  offset,
}) => {
  return await getDBPool("clinicalDb", poolCountry).query(
    `
      SELECT mood, comment, time, mood_tracker_id
      FROM mood_tracker
      WHERE client_detail_id = $1
      ORDER BY id DESC
      OFFSET $2 LIMIT $3;
    `,
    [client_id, offset, limit]
  );
};
