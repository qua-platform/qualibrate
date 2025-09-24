import React, { useCallback } from "react";
import styles from "./MeasurementElementGraph.module.scss";
import CytoscapeGraph from "../../../CytoscapeGraph/CytoscapeGraph";
import cytoscape from "cytoscape";
import { CircularProgress } from "@mui/material";
import { SnapshotsApi } from "../../../../../Snapshots/api/SnapshotsApi";
import BlueButton from "../../../../../../ui-lib/components/Button/BlueButton";
import { classNames } from "../../../../../../utils/classnames";
import { useWebSocketData } from "../../../../../../contexts/WebSocketContext";

interface IProps {
  workflowGraphElements: cytoscape.ElementDefinition[];
  onCytoscapeNodeClick?: (name: string) => void;
}

export const MeasurementElementGraph: React.FC<IProps> = ({ workflowGraphElements, onCytoscapeNodeClick }) => {
  const { runStatus } = useWebSocketData();

  const isRunning = runStatus?.graph?.status === "running";

  const graphProgressMessage =
    runStatus?.graph?.finished_nodes && runStatus?.graph?.total_nodes
      ? `${runStatus?.graph?.finished_nodes}/${runStatus?.graph?.total_nodes} node${runStatus?.graph?.finished_nodes > 1 ? "s" : ""} completed`
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
            isRunning ? styles.blinkingYellow : runStatus?.graph?.status === "finished" ? styles.solidGreen : styles.defaultBlue
          )}
        />
        <span className={styles.label}>Active Calibration Graph:</span>
        <span className={styles.tuneUpName}>{runStatus?.graph?.name || "Unknown Tune-up"}</span>
      </div>

      <div className={styles.insideWrapper}>
        <div className={styles.lowerContainer}>
          <div className={styles.lowerUpperContainer}>
            <div className={styles.lowerUpperLeftContainer}>
              <div>Status: {runStatus?.graph?.status}</div>
              <div>
                Run duration:&nbsp;
                {runStatus?.graph?.run_duration ? `${runStatus?.graph?.run_duration}s` : undefined}
              </div>
              <div>Graph progress:&nbsp;{graphProgressMessage ?? <CircularProgress size="2rem" />}</div>
            </div>
            <div className={styles.lowerUpperRightContainer}>
              {runStatus?.graph?.status === "running" && <BlueButton onClick={handleStopClick}>Stop</BlueButton>}
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
