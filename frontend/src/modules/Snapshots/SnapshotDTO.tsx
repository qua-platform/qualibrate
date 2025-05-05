import { GlobalParameterStructure } from "../GraphLibrary/components/GraphStatus/context/GraphStatusContext";

export interface SnapshotDTO {
  created_at: string;
  status?: string;
  id: number;
  result?: object;
  data?: { [key: string]: object };
  metadata?: {
    description?: string | null;
    data_path: string;
    name: string;
    run_start?: string | null;
    run_end?: string | null;
    run_duration?: number | null;
  };
  parents: [];
  parameters?: GlobalParameterStructure;
  outcomes?: object;
}
