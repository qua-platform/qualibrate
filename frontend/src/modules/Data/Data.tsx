import React from "react";
import styles from "../Data/Data.module.scss";
import PaginationWrapper from "./components/Pagination/PaginationWrapper";
import { JSONEditor } from "../../components";
import { SnapshotsTimeline } from "./components/SnapshotsTimeline/SnapshotsTimeline";
import { useSelector } from "react-redux";
import { getResult } from "../../stores/SnapshotsStore";

export const Data = () => {
  const result = useSelector(getResult);

  return (
    <div className={styles.wrapper}>
      <div className={styles.explorer}>
        <div className={styles.dataWrapper}>
          <div className={styles.data}>
            <SnapshotsTimeline />
          </div>
          <PaginationWrapper />
        </div>
        <div className={styles.viewer}>{result && <JSONEditor title={"RESULTS"} jsonDataProp={result} height={"100%"} />}</div>
      </div>
    </div>
  );
};
