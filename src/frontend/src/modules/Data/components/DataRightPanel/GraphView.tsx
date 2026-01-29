import React from "react";
import styles from "./GraphView.module.scss";
import { Graph } from "../../../Graph";
import { useSelector } from "react-redux";
import {
  getBreadCrumbs,
  getSelectedSnapshot,
  getSelectedWorkflow,
  setSelectedNodeInWorkflowName,
  setSelectedSnapshotInSnapshotList,
  setSelectedWorkflow,
  setSelectedWorkflowFromBreadcrumbs,
  setSubgraphForward,
} from "../../../../stores/SnapshotsStore";
import { useRootDispatch } from "../../../../stores";
import QubitStatusList from "./QubitStatusList";

const GraphView: React.FC = () => {
  const dispatch = useRootDispatch();

  const selectedSnapshotWithWorkflowType = useSelector(getSelectedSnapshot);
  const selectedWorkflow = useSelector(getSelectedWorkflow);
  const breadCrumbs = useSelector(getBreadCrumbs);

  const handleOnNodeClick = (name?: string) => {
    dispatch(setSelectedNodeInWorkflowName(name));
  };

  const handleOnNodeSecondClick = (name: string, isWorkflow?: boolean) => {
    if (isWorkflow) {
      if (breadCrumbs.length === 0) {
        dispatch(setSubgraphForward(selectedSnapshotWithWorkflowType?.metadata?.name));
        dispatch(setSelectedWorkflow(selectedSnapshotWithWorkflowType));
      } else {
        dispatch(setSubgraphForward(name));
        // dispatch(setSelectedWorkflow(selectedSnapshotWithWorkflowType));
        dispatch(setSelectedWorkflowFromBreadcrumbs());
      }
      dispatch(setSelectedNodeInWorkflowName(name));
      dispatch(setSelectedSnapshotInSnapshotList(name));
    } else {
      if (selectedWorkflow?.metadata?.name !== selectedSnapshotWithWorkflowType?.metadata?.name) {
        dispatch(setSubgraphForward(selectedSnapshotWithWorkflowType?.metadata?.name));
        dispatch(setSelectedWorkflow(selectedSnapshotWithWorkflowType));
      }
      dispatch(setSelectedSnapshotInSnapshotList(name));
      dispatch(setSelectedNodeInWorkflowName(name));
    }
  };

  return (
    <div className={styles.contentArea} id="contentArea">
      <div className={styles.contentMain}>
        <div className={styles.graphVisualization}>
          <div className={styles.graphExecSummary}>
            <div className={`${styles.summaryStat} ${styles.error}`}>
              <div className={styles.statLabel}>Nodes Completed</div>
              <div className={styles.statValue}>
                {selectedSnapshotWithWorkflowType?.nodes_completed ?? "unavailable"}/
                {selectedSnapshotWithWorkflowType?.nodes_total ?? "unavailable"}
              </div>
            </div>

            <div className={`${styles.summaryStat} ${styles.error}`}>
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
                <QubitStatusList outcomes={selectedSnapshotWithWorkflowType?.outcomes} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GraphView;
