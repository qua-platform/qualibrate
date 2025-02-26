export interface SnapshotDTO {
  created_at: string;
  id: number;
  result?: object;
  data?: object;
  metadata?: {
    data_path: string;
    name: string;
  };
  parents: [];
}
