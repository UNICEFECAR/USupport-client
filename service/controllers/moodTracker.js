import {
  getMoodTrackForTodayQuery,
  addMoodTrackForTodayQuery,
  getMoodTrackForWeekQuery,
} from "#queries/moodTracker";

export const getMoodTrackForToday = async ({ country, client_id }) => {
  const moodTracks = await getMoodTrackForTodayQuery({
    poolCountry: country,
    client_id,
  })
    .then((res) => res.rows)
    .catch((err) => {
      throw err;
    });

  return moodTracks;
};

export const addMoodTrackForToday = async (props) => {
  await addMoodTrackForTodayQuery({
    ...props,
    poolCountry: props.country,
  }).catch((err) => {
    throw err;
  });

  return { success: true };
};

export const getMoodTrackForWeek = async (props) => {
  const date = new Date(Number(props.startDate) * 1000);
  const moodTracks = await getMoodTrackForWeekQuery({
    poolCountry: props.country,
    client_id: props.client_id,
    startDate: date,
  })
    .then((res) => res.rows)
    .catch((err) => {
      throw err;
    });

  return moodTracks;
};
