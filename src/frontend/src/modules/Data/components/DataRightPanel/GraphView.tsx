import React from "react";
import styles from "./GraphView.module.scss";
import { Graph } from "../../../Graph";
import { useSelector } from "react-redux";
import {
  getBreadCrumbs,
  getJsonData,
  getSelectedSnapshot,
  getSelectedWorkflow,
  setSelectedNodeInWorkflowId,
  setSelectedSnapshotInSnapshotList,
  setSelectedWorkflow,
  setSelectedWorkflowFromBreadcrumbs,
  setSubgraphForward,
} from "../../../../stores/SnapshotsStore";
import { useRootDispatch } from "../../../../stores";
import QubitStatusList from "./QubitStatusList";
import { SnapshotData } from "../../../../stores/SnapshotsStore/api/SnapshotsApi";
import { classNames } from "../../../../utils/classnames";

const GraphView: React.FC = () => {
  const dispatch = useRootDispatch();

  const selectedSnapshotWithWorkflowType = useSelector(getSelectedSnapshot);
  const selectedWorkflow = useSelector(getSelectedWorkflow);
  const breadCrumbs = useSelector(getBreadCrumbs);
  const jsonData = useSelector(getJsonData) as SnapshotData;

  const nodesFailed = selectedSnapshotWithWorkflowType?.nodes_completed !== selectedSnapshotWithWorkflowType?.nodes_total;
  const nodesSuccess = !nodesFailed && selectedSnapshotWithWorkflowType?.nodes_completed !== null;
  const qubitsFailed = selectedSnapshotWithWorkflowType?.qubits_completed !== selectedSnapshotWithWorkflowType?.qubits_total;
  const qubitsSuccess = !qubitsFailed && selectedSnapshotWithWorkflowType?.qubits_completed !== null;

  const handleOnNodeClick = (name?: string) => {
    const id = selectedWorkflow?.items?.find(node => node.metadata.name === name)?.id;
    if (id) dispatch(setSelectedNodeInWorkflowId(id));
  };

  const handleOnNodeSecondClick = (name: string, isWorkflow?: boolean) => {
    const id = selectedWorkflow?.items?.find(node => node.metadata.name === name)?.id;
    if (isWorkflow) {
      if (breadCrumbs.length === 0) {
        dispatch(setSubgraphForward(selectedSnapshotWithWorkflowType?.metadata?.name));
        dispatch(setSelectedWorkflow(selectedSnapshotWithWorkflowType));
      } else {
        dispatch(setSubgraphForward(name));
        // dispatch(setSelectedWorkflow(selectedSnapshotWithWorkflowType));
        dispatch(setSelectedWorkflowFromBreadcrumbs());
      }
      if (id) dispatch(setSelectedNodeInWorkflowId(id));
      dispatch(setSelectedSnapshotInSnapshotList(name));
    } else {
      if (selectedWorkflow?.metadata?.name !== selectedSnapshotWithWorkflowType?.metadata?.name) {
        dispatch(setSubgraphForward(selectedSnapshotWithWorkflowType?.metadata?.name));
        dispatch(setSelectedWorkflow(selectedSnapshotWithWorkflowType));
      }
      dispatch(setSelectedSnapshotInSnapshotList(name));
      if (id) dispatch(setSelectedNodeInWorkflowId(id));
    }
  };

  return (
    <div className={styles.contentArea} id="contentArea">
      <div className={styles.contentMain}>
        <div className={styles.graphVisualization}>
          <div className={styles.graphExecSummary}>
            <div className={classNames(styles.summaryStat, nodesFailed && styles.error, nodesSuccess && styles.success)}>
              <div className={styles.statLabel}>Nodes Completed</div>
              <div className={styles.statValue}>
                {selectedSnapshotWithWorkflowType?.nodes_completed ?? "unavailable"}/
                {selectedSnapshotWithWorkflowType?.nodes_total ?? "unavailable"}
              </div>
            </div>

            <div className={classNames(styles.summaryStat, qubitsFailed && styles.error, qubitsSuccess && styles.success)}>
              <div className={styles.statLabel}>Qubits Success</div>
              <div className={styles.statValue}>
                {selectedSnapshotWithWorkflowType?.qubits_completed ?? "unavailable"}/
                {selectedSnapshotWithWorkflowType?.qubits_total ?? "unavailable"}
              </div>
            </div>
          </div>

          <div className={styles.mainLayout}>
            <div className={styles.graphCanvasContainer}>
              <Graph
                selectedWorkflowName={breadCrumbs[0] ?? selectedSnapshotWithWorkflowType?.metadata?.name} // since we know that selected snapshot is a type of workflow
                selectedNodeNameInWorkflow={selectedSnapshotWithWorkflowType?.metadata?.name}
                onNodeClick={handleOnNodeClick}
                subgraphBreadcrumbs={
                  selectedSnapshotWithWorkflowType?.metadata?.name
                    ? [...breadCrumbs.slice(1), selectedSnapshotWithWorkflowType?.metadata?.name]
                    : breadCrumbs.slice(1)
                }
                onNodeSecondClick={handleOnNodeSecondClick}
              />
            </div>

            <div className={styles.sidePanel}>
              <div className={styles.sidePanelHeader}>
                <div className={styles.sidePanelTitle}>By Qubit</div>
              </div>

              <div className={styles.qubitList}>
                <QubitStatusList outcomes={jsonData?.outcomes} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GraphView;
