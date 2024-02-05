export const AUTH_HEADER = {
  Authorization: "Basic bWVhc3VyZW1lbnQ6ZW50YW5nbGU=",
};

export const BASIC_HEADERS = {
  Accept: "application/json",
  "Access-Control-Allow-Origin": "*",
  ...AUTH_HEADER,
};
