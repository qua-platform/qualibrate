import { SHOW_DEBUG } from "../dev.config";

export const log = (...message: any[]) => {
  SHOW_DEBUG && console.log(...message);
};

export const logError = (...message: any[]) => {
  SHOW_DEBUG && console.error(...message);
};
