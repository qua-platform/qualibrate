import { ErrorWithDetails } from "../../stores/NodesStore/NodesStore";
import { ErrorObject } from "../../modules/common/Error/ErrorStatusInterface";

export type Res<P = Record<string, never>> = {
  isOk: boolean;
  error?: string | { detail: string } | ErrorWithDetails | ErrorObject;
  result?: P;
};
