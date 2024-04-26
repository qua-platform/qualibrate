export interface SnapshotDTO {
  created_at: string;
  id: number;
  result?: any;
  data?: any;
  metadata?: {
    data_path: string;
    name: string;
  };
  parents: [];
  isSelected?: boolean;
}
