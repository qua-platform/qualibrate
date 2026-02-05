/**
 * Formats number of seconds into "2h 22m 5s" format.
 */

export const formatTimeDuration = (duration: number): string => {
  if (duration <= 0) {
    return "0s";
  }

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  return [hours && `${hours}h`, minutes && `${minutes}m`, seconds || (!hours && !minutes) ? `${seconds}s` : null].filter(Boolean).join(" ");
};
