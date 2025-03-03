import { GlobalParameterStructure } from "../GraphLibrary/components/GraphStatus/context/GraphStatusContext";

export interface SnapshotDTO {
  created_at: string;
  status?: string;
  id: number;
  result?: object;
  data?: object;
  metadata?: {
    description?: string | null;
    data_path: string;
    name: string;
    run_start?: string;
    run_end?: string;
  };
  parents: [];
  run_start?: string;
  run_duration?: number;
  parameters?: GlobalParameterStructure;
  outcomes?: object;
}
