import React from "react";
import styles from "./DataRightPanel.module.scss";
import { useSelector } from "react-redux";
import { getBreadCrumbs, getJsonData, getResult, getSelectedSnapshot } from "../../../../stores/SnapshotsStore";
import { JSONEditor, VerticalResizableComponent } from "../../../../components";
import { snapshotMetadataToParameters } from "../../../../components/VerticalResizableComponent/helpers";
import GraphView from "./GraphView";
import { SnapshotData } from "../../../../stores/SnapshotsStore/api/SnapshotsApi";
import { useRootDispatch } from "../../../../stores";
import { runNodeOfSelectedSnapshot, runWorkflowOfSelectedSnapshot } from "../../../../stores/SnapshotsStore/actions";
import { getRunStatusIsRunning } from "../../../../stores/WebSocketStore";

const DataRightPanel = () => {
  const dispatch = useRootDispatch();
  const result = useSelector(getResult);
  const selectedSnapshot = useSelector(getSelectedSnapshot);
  const jsonData = useSelector(getJsonData) as SnapshotData;
  const breadcrumbs = useSelector(getBreadCrumbs);
  const isNodeRunning = !!useSelector(getRunStatusIsRunning);

  const isSelectedSnapshotTypeOfWorkflow = selectedSnapshot?.metadata.type_of_execution?.toLocaleLowerCase() === "workflow";
  const showRunButton = selectedSnapshot && breadcrumbs.length === 0;

  const handleOnClickRunButton = () => {
    if (selectedSnapshot?.metadata.type_of_execution === "node") {
      dispatch(runNodeOfSelectedSnapshot());
    } else if (selectedSnapshot?.metadata.type_of_execution === "workflow") {
      dispatch(runWorkflowOfSelectedSnapshot());
    }
  };

  if (isSelectedSnapshotTypeOfWorkflow) {
    return (
      <>
        <GraphView />
        {showRunButton && (
          <button disabled={isNodeRunning} title={isNodeRunning ? "Node is already running" : ""} className={styles.floatingRerunButton} id="floatingRerunBtn" onClick={handleOnClickRunButton}>
            ▶ Rerun
          </button>
        )}
      </>
    );
  }

  return (
    <div className={styles.viewer}>
      <VerticalResizableComponent
        tabData={{
          metadata: snapshotMetadataToParameters(selectedSnapshot?.metadata),
          parameters: jsonData?.parameters?.model ?? {},
        }}
      />
      {result && <JSONEditor title="RESULTS" jsonDataProp={result} height="100%" />}
      {showRunButton && (
        <button disabled={isNodeRunning} title={isNodeRunning ? "Node is already running" : ""} className={styles.floatingRerunButton} id="floatingRerunBtn" onClick={handleOnClickRunButton}>
          ▶ Rerun
        </button>
      )}
    </div>
  );
};
export default DataRightPanel;
