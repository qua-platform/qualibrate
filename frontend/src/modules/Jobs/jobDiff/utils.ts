// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { tokenize, markEdits, parseDiff } from "react-diff-view";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { refractor } from "refractor";
import { DiffData, DiffLanguage, IHunk, TokenizeOptions } from "./types";

export function getTokens(hunks: Array<IHunk>, language: DiffLanguage = "python"): any | undefined {
  if (!hunks) {
    return undefined;
  }

  const options: TokenizeOptions = {
    highlight: true,
    refractor,
    language,
    enhancers: [markEdits(hunks, { type: "block" })],
  };

  try {
    return tokenize(hunks, options);
  } catch (ex) {
    return undefined;
  }
}

export const parseDiffStr = (data: string): Array<DiffData> => {
  return parseDiff(String.raw`${data}` ?? "");
};

export function getLanguagefromFileName(fileName: string): DiffLanguage {
  if (fileName.endsWith(".json")) {
    return "json";
  }
  return "python";
}
