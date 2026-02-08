import { ParameterStructure, SnapshotMetadata } from "../../stores/SnapshotsStore/api/SnapshotsApi";

export const snapshotMetadataToParameters = (metadata?: SnapshotMetadata): ParameterStructure => {
  if (!metadata) return {};

  return {
    description: metadata.description,
    data_path: metadata.data_path,
    name: metadata.name,
    run_start: metadata.run_start,
    run_end: metadata.run_end,
    run_duration: metadata.run_duration,
    status: metadata.status,
  };
};
