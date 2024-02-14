// const templateCommit = "#950bb3";
//
// export const croppText = (commit?: string, maxLength = 6, prefix = "#", postfix = "...") => {
//   if (!commit) {
//     return "-";
//   }
//
//   return commit?.length > maxLength ? prefix + commit.slice(0, maxLength) + postfix : commit ?? templateCommit;
// };
//
// export const tryParseJSON = (value: string) => {
//   let result;
//   try {
//     result = JSON.parse(value.toString());
//   } catch (err) {
//     result = value;
//   }
//
//   return result;
// };
