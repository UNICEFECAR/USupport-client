import { t } from "#translations/index";

const formatDateToDDMMYYYY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

const formatDateTimeToReadable = (dateTime) => {
  // Handle different types of date input
  let d;
  if (dateTime instanceof Date) {
    d = dateTime;
  } else if (typeof dateTime === "string") {
    d = new Date(dateTime);
  } else {
    // Fallback for any other type
    d = new Date(String(dateTime));
  }

  // Check if the date is valid
  if (isNaN(d.getTime())) {
    return "Invalid Date";
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

export const generateMoodTrackerCSV = ({
  moodTracks,
  startDateString,
  endDateString,
  language = "en",
}) => {
  const dateRangeHeader = `${formatDateToDDMMYYYY(
    startDateString
  )} - ${formatDateToDDMMYYYY(endDateString)}`;

  // Calculate mood statistics
  const moodCounts = {};
  moodTracks.forEach((moodTrack) => {
    moodCounts[moodTrack.mood] = (moodCounts[moodTrack.mood] || 0) + 1;
  });

  // Find the most selected mood
  let mostSelectedMood = "N/A";
  let mostSelectedMoodKey = "N/A";
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostSelectedMoodKey = mood;
      mostSelectedMood = t(`mood_${mood}`, language) || mood;
    }
  });

  // Sort moods by frequency for breakdown
  const moodBreakdown = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: ((count / moodTracks.length) * 100).toFixed(1),
    }));

  // Add UTF-8 BOM for proper encoding in Excel and other applications
  let csvContent = "\uFEFF";
  csvContent += `"${t("csv_report_title", language)}"\n`;
  csvContent += `"${t("csv_date_range", language)}: ${dateRangeHeader}"\n`;
  csvContent += `"${t("csv_total_mood_tracks", language)}: ${
    moodTracks.length
  }"\n`;
  csvContent += `"${t(
    "csv_most_selected_mood",
    language
  )}: ${mostSelectedMood} (${maxCount} ${t("csv_times", language)})"\n`;
  csvContent += "\n";

  // Mood Statistics Section
  csvContent += `"${t("csv_mood_statistics", language)}"\n`;
  csvContent += `"${t("csv_mood", language)}","${t(
    "csv_count",
    language
  )}","${t("csv_percentage", language)}"\n`;
  moodBreakdown.forEach(({ mood, count, percentage }) => {
    const translatedMood = t(`mood_${mood}`, language) || mood;
    csvContent += `"${translatedMood}","${count}","${percentage}%"\n`;
  });
  csvContent += "\n";

  // Detailed Records Section
  csvContent += `"${t("csv_detailed_records", language)}"\n`;
  csvContent += `"${t("csv_mood", language)}","${t(
    "csv_comment",
    language
  )}","${t("csv_time", language)}","${t("csv_is_critical", language)}"\n`;

  moodTracks.forEach((moodTrack) => {
    const formattedTime = formatDateTimeToReadable(moodTrack.time);
    const translatedMood =
      t(`mood_${moodTrack.mood}`, language) || moodTrack.mood;
    const criticalStatus = moodTrack.is_critical
      ? t("csv_yes", language)
      : t("csv_no", language);
    csvContent += `"${translatedMood}","${moodTrack.comment}","${formattedTime}","${criticalStatus}"\n`;
  });

  return csvContent;
};
