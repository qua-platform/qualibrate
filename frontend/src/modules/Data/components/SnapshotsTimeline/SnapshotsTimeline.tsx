import { SnapshotDTO } from "../../../Snapshots/SnapshotDTO";
import React from "react";
import { SnapshotElement } from "../SnapshotElement/SnapshotElement";

export const SnapshotsTimeline = ({
  allSnapshots,
  selectedSnapshotIndex,
  setSelectedSnapshotIndex,
  setSelectedSnapshotId,
  fetchOneSnapshot,
}: {
  allSnapshots: SnapshotDTO[];
  selectedSnapshotIndex: number | undefined;
  setSelectedSnapshotIndex: (a: number | undefined) => void;
  setSelectedSnapshotId: (a: number | undefined) => void;
  fetchOneSnapshot: (snapshots: SnapshotDTO[], selectedIndex: number) => void;
}) => {
  // const formatDateTime = (dateTime: string): string => {
  //   const date = new Date(dateTime);
  //   return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  // };
  //
  // const handleOnClick = (id: number) => {
  //   setSelectedSnapshotId(id);
  //   fetchOneSnapshot(id);
  // };
  return (
    allSnapshots?.length > 0 && (
      <div>
        {allSnapshots.map((snapshot) => {
          return <SnapshotElement key={snapshot.id} el={snapshot} handleOnClick={() => {}} />;
        })}
      </div>
    )
  );
};
