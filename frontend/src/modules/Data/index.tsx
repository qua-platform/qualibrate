import React from "react";
import styles from "../Data/Data.module.scss";
import cyKeys from "../../utils/cyKeys";
import useModuleStyle from "../../ui-lib/hooks/useModuleStyle";
import { classNames } from "../../utils/classnames";
import { SnapshotsContextProvider, useSnapshotsContext } from "../Snapshots/context/SnapshotsContext";
import PaginationWrapper from "../Pagination/PaginationWrapper";
import { JSONEditor } from "./components/JSONEditor";
import { SnapshotsTimeline } from "./components/SnapshotsTimeline/SnapshotsTimeline";

const Data = () => {
  const {
    totalPages,
    setPageNumber,
    allSnapshots,
    selectedSnapshotId,
    setSelectedSnapshotId,
    jsonData,
    diffData,
    result,
    fetchOneSnapshot,
  } = useSnapshotsContext();
  return (
    <div className={styles.wrapper}>
      <div className={styles.explorer}>
        <div className={styles.dataWrapper}>
          <div className={styles.data}>
            <SnapshotsTimeline
              allSnapshots={allSnapshots}
              selectedSnapshotId={selectedSnapshotId}
              setSelectedSnapshotId={setSelectedSnapshotId}
              fetchOneSnapshot={fetchOneSnapshot}
            />
          </div>
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
            {jsonData && diffData && <JSONEditor title={"QUAM Updates"} jsonDataProp={diffData} height={"34%"} />}
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
