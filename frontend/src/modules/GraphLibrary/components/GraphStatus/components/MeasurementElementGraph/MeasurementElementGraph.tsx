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
import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import styles from "./MeasurementElementGraph.module.scss";
import CytoscapeGraph from "../../../CytoscapeGraph/CytoscapeGraph";
import cytoscape from "cytoscape";
import { CircularProgress } from "@mui/material";
import { SnapshotsApi } from "../../../../../Snapshots/api/SnapshotsApi";
import BlueButton from "../../../../../../ui-lib/components/Button/BlueButton";
import { classNames } from "../../../../../../utils/classnames";
import { getRunStatusGraph } from "../../../../../../stores/WebSocketStore/selectors";

interface IProps {
  workflowGraphElements: cytoscape.ElementDefinition[];
  onCytoscapeNodeClick?: (name: string) => void;
}

export const MeasurementElementGraph: React.FC<IProps> = ({ workflowGraphElements, onCytoscapeNodeClick }) => {
  const runStatusGraph = useSelector(getRunStatusGraph);

  const isRunning = runStatusGraph?.status === "running";

  const graphProgressMessage =
    runStatusGraph?.finished_nodes && runStatusGraph?.total_nodes
      ? `${runStatusGraph?.finished_nodes}/${runStatusGraph?.total_nodes} node${runStatusGraph?.finished_nodes > 1 ? "s" : ""} completed`
      : "-";

  const handleStopClick = useCallback(() => {
    SnapshotsApi.stopNodeRunning();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.calibrationTitle}>
        <span
          className={classNames(
            styles.dot,
            isRunning ? styles.blinkingYellow : runStatusGraph?.status === "finished" ? styles.solidGreen : styles.defaultBlue
          )}
        />
        <span className={styles.label}>Active Calibration Graph:</span>
        <span className={styles.tuneUpName}>{runStatusGraph?.name || "Unknown Tune-up"}</span>
      </div>

      <div className={styles.insideWrapper}>
        <div className={styles.lowerContainer}>
          <div className={styles.lowerUpperContainer}>
            <div className={styles.lowerUpperLeftContainer}>
              <div>Status: {runStatusGraph?.status}</div>
              <div>
                Run duration:&nbsp;
                {runStatusGraph?.run_duration ? `${runStatusGraph?.run_duration}s` : undefined}
              </div>
              <div>Graph progress:&nbsp;{graphProgressMessage ?? <CircularProgress size="2rem" />}</div>
            </div>
            <div className={styles.lowerUpperRightContainer}>
              {runStatusGraph?.status === "running" && <BlueButton onClick={handleStopClick}>Stop</BlueButton>}
            </div>
          </div>
          <div className={styles.lowerLowerContainer}>
            <CytoscapeGraph elements={workflowGraphElements} onNodeClick={onCytoscapeNodeClick} />
          </div>
        </div>
      </div>
    </div>
  );
};
