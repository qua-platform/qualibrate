// copied from https://github.com/otakustay/react-diff-view/pull/148/files
export type DiffLanguage = "python" | "json";

export type TokenizeOptions = {
  highlight: boolean;
  refractor: any;
  language: DiffLanguage;
  enhancers: Array<any>;
};

interface InsertChange {
  type: "insert";
  content: string;
  isInsert: true;
  isDelete?: boolean;
  isNormal?: boolean;
  lineNumber: number;
}

interface DeleteChange {
  type: "delete";
  content: string;
  isInsert?: boolean;
  isDelete: true;
  isNormal?: boolean;
  lineNumber: number;
}

interface NormalChange {
  type: "normal";
  content: string;
  isInsert?: boolean;
  isDelete?: boolean;
  isNormal: true;
  oldLineNumber: number;
  newLineNumber: number;
}

export type Change = InsertChange | DeleteChange | NormalChange;

export type IHunk = {
  content: string;
  oldStart: number;
  newStart: number;
  oldLines: number;
  newLines: number;
  changes: Array<Change>;

  // react-diff-view 新增
  isPlain: boolean;
};

export interface DiffData {
  hunks: IHunk[];
  oldPath: string;
  newPath: string;
  oldEndingNewLine: boolean;
  newEndingNewLine: boolean;
  oldMode: string;
  newMode: string;
  oldRevision: string;
  newRevision: string;
  similarity: number;
  isBinary: boolean;
}
