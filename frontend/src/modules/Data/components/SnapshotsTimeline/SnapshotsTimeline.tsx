import { SnapshotDTO } from "../../../Snapshots/SnapshotDTO";
import React from "react";
import { SnapshotElement } from "../SnapshotElement/SnapshotElement";
import styles from "./SnapshotsTimeline.module.scss";

export const SnapshotsTimeline = ({
  allSnapshots,
  selectedSnapshotId,
  setSelectedSnapshotId,
  fetchOneSnapshot,
}: {
  allSnapshots: SnapshotDTO[];
  selectedSnapshotId: number | undefined;
  setSelectedSnapshotId: (a: number | undefined) => void;
  fetchOneSnapshot: (selectedIndex: number) => void;
}) => {
  const handleOnClick = (id: number) => {
    setSelectedSnapshotId(id);
    fetchOneSnapshot(id);
  };
  return (
    allSnapshots?.length > 0 && (
      <div className={styles.wrapper}>
        {allSnapshots.map((snapshot) => {
          return (
            <SnapshotElement
              key={snapshot.id}
              el={snapshot}
              isSelected={snapshot.id === selectedSnapshotId}
              handleOnClick={() => handleOnClick(snapshot.id)}
            />
          );
        })}
      </div>
    )
  );
};
