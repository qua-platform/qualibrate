export const getSearchStringIndex = (sourceString: string, searchValue: string) =>
  sourceString.trim().toLowerCase().indexOf(searchValue.trim().toLowerCase());
