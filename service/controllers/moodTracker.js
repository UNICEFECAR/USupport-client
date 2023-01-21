import {
  getMoodTrackForTodayQuery,
  addMoodTrackForTodayQuery,
  getMoodTrackForWeekQuery,
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
}) => {
  await addMoodTrackForTodayQuery({
    poolCountry: country,
    client_id,
    mood,
    comment,
  }).catch((err) => {
    throw err;
  });

  return { success: true };
};

export const getMoodTrackForWeek = async ({
  country,
  client_id,
  startDate,
}) => {
  const date = new Date(Number(startDate) * 1000);
  const moodTracks = await getMoodTrackForWeekQuery({
    poolCountry: country,
    client_id,
    startDate: date,
  }).then((res) => {
    if (res.rowCount === 0) {
      return [];
    } else {
      return res.rows;
    }
  });
  return moodTracks;
};
