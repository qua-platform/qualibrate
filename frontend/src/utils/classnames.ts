export const classNames = (...cls: Array<string | undefined | false>): string => {
  return cls
    .map((v) => {
      if (typeof v === "undefined" || v === false) {
        // ignore
      } else if (typeof v === "string") {
        return v;
      } else if ((v as string)?.length && !!v[1]) {
        return v[0];
      }
      return null;
    })
    .filter((v) => !!v)
    .join(" ");
};
