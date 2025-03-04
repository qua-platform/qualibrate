import React from "react";
import styles from "../Data/Data.module.scss";
import useModuleStyle from "../../ui-lib/hooks/useModuleStyle";
import { classNames } from "../../utils/classnames";
import { SnapshotsContextProvider, useSnapshotsContext } from "../Snapshots/context/SnapshotsContext";
import PaginationWrapper from "../Pagination/PaginationWrapper";
import { JSONEditor } from "./components/JSONEditor";
import { TimelineGraph } from "./components/TimelineGraph";

const Data = () => {
  const [ref] = useModuleStyle<HTMLDivElement>();
  const {
    totalPages,
    setPageNumber,
    allSnapshots,
    selectedSnapshotIndex,
    setSelectedSnapshotIndex,
    setSelectedSnapshotId,
    jsonData,
    diffData,
    result,
    setFlag,
    fetchOneGitgraphSnapshot,
  } = useSnapshotsContext();
  return (
    <div ref={ref} className={styles.wrapper}>
      <div className={classNames(styles.explorer)}>
        <div className={classNames(styles.dataWrapper)}>
          <div className={classNames(styles.data)}>
            <TimelineGraph
              allSnapshots={allSnapshots}
              setFlag={setFlag}
              selectedSnapshotIndex={selectedSnapshotIndex}
              setSelectedSnapshotIndex={setSelectedSnapshotIndex}
              setSelectedSnapshotId={setSelectedSnapshotId}
              fetchOneGitgraphSnapshot={fetchOneGitgraphSnapshot}
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
