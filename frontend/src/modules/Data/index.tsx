import React from "react";
import styles from "../Data/Data.module.scss";
import cyKeys from "../../utils/cyKeys";
import { classNames } from "../../utils/classnames";
import { SnapshotsContextProvider, useSnapshotsContext } from "../Snapshots/context/SnapshotsContext";
import PaginationWrapper from "../Pagination/PaginationWrapper";
import { JSONEditor } from "./components/JSONEditor";
import { SnapshotsTimeline } from "./components/SnapshotsTimeline/SnapshotsTimeline";

const Data = () => {
  const { totalPages, setPageNumber, allSnapshots, setSelectedSnapshotId, jsonData, diffData, result, fetchOneSnapshot } =
    useSnapshotsContext();
  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.explorer)}>
        <div className={classNames(styles.data)}>
          <div data-cy={cyKeys.data.EXPERIMENT_LIST}></div>
          <SnapshotsTimeline
            allSnapshots={allSnapshots}
            setSelectedSnapshotId={setSelectedSnapshotId}
            fetchOneSnapshot={fetchOneSnapshot}
          />
          <PaginationWrapper numberOfPages={totalPages} setPageNumber={setPageNumber} />
        </div>
        <div className={styles.viewer}>
          {result && <JSONEditor title={"RESULTS"} jsonDataProp={result} height={"100%"} />}
          <div
            style={{
              overflow: "auto",
              flex: 1,
            }}
          >
            {jsonData && !diffData && <JSONEditor title={"QUAM"} jsonDataProp={jsonData} height={"100%"} />}
            {jsonData && diffData && <JSONEditor title={"QUAM"} jsonDataProp={jsonData} height={"66%"} />}
            {jsonData && diffData && <JSONEditor title={"QUAM Updates"} jsonDataProp={diffData} height={"33%"} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default () => (
  <SnapshotsContextProvider>
    <Data />
  </SnapshotsContextProvider>
);
