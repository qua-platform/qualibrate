import React from "react";
import { SnapshotElement } from "../SnapshotElement/SnapshotElement";
import styles from "./SnapshotsTimeline.module.scss";
import { useSelector } from "react-redux";
import {
  getAllSnapshots,
  getSelectedSnapshotId,
  fetchOneSnapshot,
  setClickedForSnapshotSelection,
  setSelectedSnapshotId,
} from "../../../../stores/SnapshotsStore";
import { useRootDispatch } from "../../../../stores";

export const SnapshotsTimeline = () => {
  const dispatch = useRootDispatch();
  const allSnapshots = useSelector(getAllSnapshots);
  const selectedSnapshotId = useSelector(getSelectedSnapshotId);

  const handleOnClick = (id: number) => {
    dispatch(setSelectedSnapshotId(id));
    dispatch(setClickedForSnapshotSelection(true));
    dispatch(fetchOneSnapshot(id));
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
