import React from "react";
import styles from "../Data/Data.module.scss";
import { useSnapshotsContext } from "../Snapshots/context/SnapshotsContext";
import PaginationWrapper from "../Pagination/PaginationWrapper";
import { JSONEditor } from "./components/JSONEditor";
import { SnapshotsTimeline } from "./components/SnapshotsTimeline/SnapshotsTimeline";

export const Data = () => {
  const { totalPages, setPageNumber, result } = useSnapshotsContext();
  return (
    <div className={styles.wrapper}>
      <div className={styles.explorer}>
        <div className={styles.dataWrapper}>
          <div className={styles.data}>
            <SnapshotsTimeline />
          </div>
          <PaginationWrapper numberOfPages={totalPages} setPageNumber={setPageNumber} />
        </div>
        <div className={styles.viewer}>{result && <JSONEditor title={"RESULTS"} jsonDataProp={result} height={"100%"} />}</div>
      </div>
    </div>
  );
};
