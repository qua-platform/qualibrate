export enum NodeNames {
  CALIBRATION,
  SCAN_LIST,
  QPU,
  EXTERNAL_INSTRUMENTS,
  CORRECTION,
  FINAL_REPORT,
}

export type NodeCoordinates = {
  x: number;
  y: number;
};

export type NodeType = {
  [name: string]: NodeCoordinates;
};

export type MockAliasType = string;

export type RequestBody = { [key: string]: unknown };
