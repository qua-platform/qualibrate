/**
 * @fileoverview Active graph execution visualization with real-time status.
 *
 * Displays Cytoscape graph with blinking status dot, run progress, and stop button.
 * Updates via WebSocket runStatus for graph name, status, duration, and node progress.
 *
 * @see CytoscapeGraph - Graph visualization component
 * @see GraphStatus - Parent component
 * @see WebSocketContext - Provides real-time runStatus updates
 */
import React, {useCallback} from "react";
import {useSelector} from "react-redux";
import styles from "./MeasurementElementGraph.module.scss";
import {CircularProgress} from "@mui/material";
import {SnapshotsApi} from "../../../../stores/SnapshotsStore";
import {BlueButton} from "../../../../components";
import {classNames} from "../../../../utils/classnames";
import {
  getRunStatusGraphFinishedNodes,
  getRunStatusGraphName,
  getRunStatusGraphRunDuration,
  getRunStatusGraphStatus,
  getRunStatusGraphTotalNodes,
} from "../../../../stores/WebSocketStore";
import {Graph, SubgraphBreadcrumbs} from "../../../Graph";
import {useRootDispatch} from "../../../../stores";
import {
  getGraphStatuSelectedNodeNameInWorkflow,
  getGraphStatuSubgraphBreadcrumbs,
  setGraphStasetSubgraphBack,
  setGraphStatusSubgraphForward,
} from "../../../../stores/GraphStores/GraphStatus";

interface IProps {
  onNodeClick?: (name?: string) => void;
}

export const MeasurementElementGraph: React.FC<IProps> = ({ onNodeClick }) => {
  const dispatch = useRootDispatch();
  const runStatusGraphStatus = useSelector(getRunStatusGraphStatus);
  const runStatusGraphFinishedNodes = useSelector(getRunStatusGraphFinishedNodes);
  const runStatusGraphTotalNodes = useSelector(getRunStatusGraphTotalNodes);
  const runStatusGraphName = useSelector(getRunStatusGraphName);
  const runStatusGraphRunDuration = useSelector(getRunStatusGraphRunDuration);
  const subgraphBreadcrumbs = useSelector(getGraphStatuSubgraphBreadcrumbs);
  const selectedNodeNameInWorkflow = useSelector(getGraphStatuSelectedNodeNameInWorkflow);

  const handleSetSubgraphBreadcrumbs = (key: string) => dispatch(setGraphStatusSubgraphForward(key));
  const handleBreadcrumbClick = (index: number) => dispatch(setGraphStasetSubgraphBack(index));

  const isRunning = runStatusGraphStatus === "running";

  const graphProgressMessage =
    runStatusGraphFinishedNodes && runStatusGraphTotalNodes
      ? `${runStatusGraphFinishedNodes}/${runStatusGraphTotalNodes} node${runStatusGraphFinishedNodes > 1 ? "s" : ""} completed`
      : "-";

  const handleStopClick = useCallback(() => {
    SnapshotsApi.stopNodeRunning();
  }, []);

  return (
    <div className={styles.wrapper} data-testid="measurement-element-graph">
      <div className={styles.calibrationTitle}>
        <span
          className={classNames(
            styles.dot,
            isRunning ? styles.blinkingYellow : runStatusGraphStatus === "finished" ? styles.solidGreen : styles.defaultBlue
          )}
        />
        <span className={styles.label}>Active Calibration Graph:</span>
        <span className={styles.tuneUpName}>{runStatusGraphName || "Unknown Tune-up"}</span>
      </div>

      <div className={styles.insideWrapper}>
        <div className={styles.lowerContainer}>
          <div className={styles.lowerUpperContainer}>
            <div className={styles.lowerUpperLeftContainer}>
              <div>Status: {runStatusGraphStatus}</div>
              <div>
                Run duration:&nbsp;
                {runStatusGraphRunDuration ? `${runStatusGraphRunDuration}s` : undefined}
              </div>
              <div>Graph progress:&nbsp;{graphProgressMessage ?? <CircularProgress size="2rem" />}</div>
            </div>
            <div className={styles.lowerUpperRightContainer}>
              {runStatusGraphStatus === "running" && <BlueButton onClick={handleStopClick}>Stop</BlueButton>}
            </div>
          </div>
          <div className={styles.lowerLowerContainer}>
            <SubgraphBreadcrumbs
              className={styles.subgraphBreadcrumbs}
              selectedWorkflowName={runStatusGraphName}
              subgraphBreadcrumbs={subgraphBreadcrumbs}
              onBreadcrumbClick={handleBreadcrumbClick}
            />
            <Graph
              selectedWorkflowName={runStatusGraphName}
              selectedNodeNameInWorkflow={selectedNodeNameInWorkflow}
              onNodeClick={onNodeClick}
              subgraphBreadcrumbs={subgraphBreadcrumbs}
              onNodeSecondClick={handleSetSubgraphBreadcrumbs}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
