export interface LastRunStatusGraphResponseDTO {
  name: string;
  status: string;
  run_start: string;
  run_end: string;
  total_nodes: number;
  finished_nodes: number;
  run_duration: number;
  percentage_complete: number;
  time_remaining: number | null;
}

export interface LastRunStatusNodeResponseDTO {
  status: string;
  run_start: string;
  run_duration: number;
  name: string;
  id?: number;
  percentage_complete: number;
  current_action?: string | null;
  time_remaining: number | null;
}

export const fallbackNode: LastRunStatusNodeResponseDTO = {
    status: "pending",
    run_start: "",
    run_duration: 0,
    name: "",
    percentage_complete: 0,
    time_remaining: 0,
};

export const fallbackGraph: LastRunStatusGraphResponseDTO = {
    name: "",
    status: "pending",
    run_start: "",
    run_end: "",
    total_nodes: 1,
    finished_nodes: 0,
    run_duration: 0,
    percentage_complete: 0,
    time_remaining: 0,
};

export const GRAPH_STATUS = {
  RUNNING: "running",
  FINISHED: "finished",
  ERROR: "error",
  PENDING: "pending",
};
export const NODE_STATUS = {
  RUNNING: "running",
  FINISHED: "finished",
  ERROR: "error",
  PENDING: "pending",
};

// export const GRAPH_TABS = {
//   LIBRARY: "graph-library",
//   STATUS: "graph-status",
// };

// TODO: Define correct colors for graph status and node status (something like this):
// export const GRAPH_STATUS_COLORS = {
//   [GRAPH_STATUS.RUNNING]: "#4CAF50", // Green
//   [GRAPH_STATUS.FINISHED]: "#2196F3", // Blue
//   [GRAPH_STATUS.ERROR]: "#F44336", // Red
//   [GRAPH_STATUS.PENDING]: "#9E9E9E", // Grey
// };

// export const NODE_STATUS_COLORS = {
//   [NODE_STATUS.RUNNING]: "#4CAF50", // Green
//   [NODE_STATUS.FINISHED]: "#2196F3", // Blue
//   [NODE_STATUS.ERROR]: "#F44336", // Red
//   [NODE_STATUS.PENDING]: "#9E9E9E", // Grey
// };
