export const isJobPath = (path: string) => {
  return /#\/\d?.*(\d|j)$/gm.test(path);
};

export const isParametersPath = (path: string) => {
  return /#\/{1}j?\d?.*\/[_A-z0-9]*/gm.test(path);
};

// export const likeJobPath = (path: string) => {
//   return /#\/j\d?.*$/gm.test(path);
// };

// export const pipe =
//   (...fn) =>
//   (x) =>
//     fn.reduce((v, f) => f(v, x));

export const removeQuotes = (path: string) => (path || "").replaceAll('"', "");
