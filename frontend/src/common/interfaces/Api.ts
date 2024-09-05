import { NodeStatusErrorWithDetails } from "../../modules/Nodes/context/NodesContext";

export type Res<P = Record<string, never>> = {
  isOk: boolean;
  error?: string | { detail: string } | NodeStatusErrorWithDetails;
  result?: P;
};
