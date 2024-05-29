import { SHOW_DEBUG } from "../dev.config";

export const log = (...message: string[]) => {
  SHOW_DEBUG && console.log(...message);
};
