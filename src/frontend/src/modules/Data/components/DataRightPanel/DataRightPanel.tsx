import React from "react";
import styles from "./DataRightPanel.module.scss";
import { useSelector } from "react-redux";
import { getBreadCrumbs, getJsonData, getResult, getSelectedSnapshot } from "../../../../stores/SnapshotsStore";
import { JSONEditor, ResizableTabSidebar, ParametersViewer } from "../../../../components";
import { snapshotMetadataToParameters } from "./helpers";
import GraphView from "./GraphView";
import { SnapshotData } from "../../../../stores/SnapshotsStore/api/SnapshotsApi";
import { useRootDispatch } from "../../../../stores";
import { runNodeOfSelectedSnapshot, runWorkflowOfSelectedSnapshot } from "../../../../stores/SnapshotsStore/actions";
import { getRunStatusIsRunning } from "../../../../stores/WebSocketStore";
import { formatDateTime } from "../../../../utils";
import SnapshotComments from "../SnapshotComments";

export const formatParamValue = (key: string, value: string | number | string[] | null | boolean | undefined) => {
  if (["run_end", "run_start"].includes(key) && !!value) return formatDateTime(value as string);

  return value === null || value === undefined ? "—" : typeof value === "object" ? JSON.stringify(value, null, 2) : value;
};

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

  const tabs = [
    {
      title: "Metadata",
      render: (
        <div className={styles.tabContainer}>
          <ParametersViewer data={snapshotMetadataToParameters(selectedSnapshot?.metadata)} />
          <SnapshotComments />
        </div>
      ),
    },
    {
      title: "Parameters",
      render: (
        <div className={styles.tabContainer}>
          <ParametersViewer data={jsonData?.parameters?.model ?? {}} />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.viewer}>
      <ResizableTabSidebar tabs={tabs} />
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
