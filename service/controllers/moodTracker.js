import {
  getMoodTrackForTodayQuery,
  addMoodTrackForTodayQuery,
  getMoodTrackEntriesQuery,
} from "#queries/moodTracker";

export const getMoodTrackForToday = async ({ country, client_id }) => {
  const moodTracks = await getMoodTrackForTodayQuery({
    poolCountry: country,
    client_id,
  }).then((res) => {
    if (res.rowCount === 0) {
      return [];
    } else {
      return res.rows;
    }
  });

  return moodTracks;
};

export const addMoodTrackForToday = async ({
  country,
  client_id,
  mood,
  comment,
  emergency,
}) => {
  await addMoodTrackForTodayQuery({
    poolCountry: country,
    client_id,
    mood,
    comment,
    emergency: emergency || false,
  }).catch((err) => {
    throw err;
  });

  return { success: true };
};

export const getMoodTrackEntries = async ({
  country,
  client_id,
  limit,
  pageNum,
}) => {
  const limitToUse = limit === 0 ? 1 : limit;
  const pageNumToUse = pageNum === 0 ? 1 : pageNum;
  const offset = pageNum === 0 ? 0 : pageNumToUse * limitToUse;

  const moodTracks = await getMoodTrackEntriesQuery({
    poolCountry: country,
    client_id,
    limit: limit * 2,
    offset,
  }).then((res) => {
    if (res.rowCount === 0) {
      return { currentEntries: [], previousEntries: [], hasMore: false };
    } else {
      const hasMore = res.rows.length >= limitToUse * 2;

      const currentEntries = res.rows.slice(0, limit).reverse() || [];
      const previousEntries = res.rows.slice(limit).reverse() || [];

      return { currentEntries, previousEntries, hasMore };
    }
  });
  return moodTracks;
};
