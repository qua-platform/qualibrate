export const getSearchStringIndex = (sourceString: string, searchValue: string) =>
  sourceString.trim().toLowerCase().indexOf(searchValue.trim().toLowerCase());

export const getHighlightedText = (option: string, searchValue: string) => {
  const searchStringIndex = getSearchStringIndex(option, searchValue);
  const parts = [
    option.slice(0, searchStringIndex),
    option.slice(searchStringIndex, searchStringIndex + searchValue.trim().length),
    option.slice(searchStringIndex + searchValue.trim().length),
  ];

  return <>{parts.map((part, index) => (index === 1 ? <strong key={part}>{part}</strong> : part))}</>;
};
