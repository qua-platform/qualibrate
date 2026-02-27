export const stringToHexColor = (str: string): string => {
  const hash = [...str].reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return "#" + [0, 1, 2].map((i) => ((hash >> (i * 8)) & 0xff).toString(16).padStart(2, "0")).join("");
};
