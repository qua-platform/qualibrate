export const copyToKeyboard = (value: string | number) => {
  navigator.clipboard.writeText("" + value);
};
