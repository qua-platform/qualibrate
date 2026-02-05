/**
 * Formats ISO 8601 timestamp to "YYYY-MM-DD HH:MM:SS" format.
 */
export const formatDateTime = (dateTimeString: string) => {
  const [date, time] = dateTimeString.split("T");
  const timeWithoutZone = time.split("+")[0].split("Z")[0];
  const timeWithoutMilliseconds = timeWithoutZone.split(".")[0];
  return `${date} ${timeWithoutMilliseconds}`;
};

/**
 * Formats ISO 8601 timestamp to "YYYY-MM-DD" format.
 */
export const formatDate = (dateTimeString: string) => {
  const dateAndTime = dateTimeString.split("T");
  return `${dateAndTime[0]} `;
};
