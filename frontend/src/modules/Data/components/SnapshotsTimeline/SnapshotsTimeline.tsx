import React from "react";
import { SnapshotElement } from "../SnapshotElement/SnapshotElement";
import styles from "./SnapshotsTimeline.module.scss";
import { useSnapshotsContext } from "../../../Snapshots/context/SnapshotsContext";

export const SnapshotsTimeline = () => {
  const { allSnapshots, selectedSnapshotId, setSelectedSnapshotId, setClickedForSnapshotSelection, fetchOneSnapshot } =
    useSnapshotsContext();
  const handleOnClick = (id: number) => {
    setSelectedSnapshotId(id);
    setClickedForSnapshotSelection(true);
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
