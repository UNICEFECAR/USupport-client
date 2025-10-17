import {
  getMoodTrackForTodayQuery,
  addMoodTrackForTodayQuery,
  getMoodTrackEntriesQuery,
  deleteMoodTrackDataQuery,
  getMoodTrackEntriesForPeriodQuery,
  getHasCompletedMoodTrackerEverQuery,
} from "#queries/moodTracker";

import { generateMoodTrackerCSV } from "#utils/mood-tracker";

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

export const deleteMoodTrackerHistory = async ({
  country,
  client_detail_id,
}) => {
  return await deleteMoodTrackDataQuery({
    poolCountry: country,
    client_detail_id,
  })
    .then(() => ({ success: true }))
    .catch((err) => {
      throw err;
    });
};

export const generateReportForPeriod = async ({
  country,
  client_detail_id,
  startDate,
  endDate,
  language,
}) => {
  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setHours(0, 0, 0, 0);

  const normalizedEndDate = new Date(endDate);
  normalizedEndDate.setHours(23, 59, 59, 999);

  return await getMoodTrackEntriesForPeriodQuery({
    poolCountry: country,
    client_detail_id,
    startDate: normalizedStartDate,
    endDate: normalizedEndDate,
  })
    .then((res) => {
      const startDateString = new Date(startDate).toISOString().split("T")[0];
      const endDateString = new Date(endDate).toISOString().split("T")[0];
      const fileName = `mood-tracker-report-${country}-${startDateString}-to-${endDateString}.csv`;
      const csvData = generateMoodTrackerCSV({
        moodTracks: res.rows,
        startDateString,
        endDateString,
        language,
      });
      return {
        success: true,
        message: "Mood tracker report generated successfully",
        csvData,
        fileName,
        totalMoodTracks: res.rows.length,
        dateRange: {
          start: startDateString,
          end: endDateString,
        },
      };
    })
    .catch((err) => {
      throw err;
    });
};

export const getHasCompletedMoodTrackerEver = async ({
  country,
  client_detail_id,
}) => {
  const res = await getHasCompletedMoodTrackerEverQuery({
    poolCountry: country,
    client_detail_id,
  }).catch((err) => {
    throw err;
  });

  return { hasCompleted: res.rowCount > 0 };
};
