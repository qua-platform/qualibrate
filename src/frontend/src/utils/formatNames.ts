/**
 * Formats text replacing all underscores with space and makes all first letters of words capital.
 */

export const formatNames = (value: string): string => {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};
