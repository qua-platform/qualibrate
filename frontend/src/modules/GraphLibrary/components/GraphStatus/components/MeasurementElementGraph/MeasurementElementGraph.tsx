import React from "react";
import styles from "./MeasurementElementGraph.module.scss";
import CytoscapeGraph from "../../../CytoscapeGraph/CytoscapeGraph";
import cytoscape from "cytoscape";
import { useGraphContext } from "../../../../context/GraphContext";
import { CircularProgress } from "@mui/material";
import { SnapshotsApi } from "../../../../../Snapshots/api/SnapshotsApi";
import BlueButton from "../../../../../../ui-lib/components/Button/BlueButton";
import { ErrorStatusWrapper } from "../../../../../common/Error/ErrorStatusWrapper";

interface IProps {
  workflowGraphElements: cytoscape.ElementDefinition[];
  onCytoscapeNodeClick?: (name: string) => void;
  active?: boolean;
  nodesCompleted?: number;
  runDuration?: number;
}

export const MeasurementElementGraph: React.FC<IProps> = ({ workflowGraphElements, onCytoscapeNodeClick }) => {
  const title = "Calibration Graph Progress";
  const { lastRunInfo } = useGraphContext();
  const graphProgressMessage =
    lastRunInfo?.nodesCompleted !== undefined &&
    lastRunInfo?.nodesCompleted !== null &&
    lastRunInfo?.nodesTotal !== undefined &&
    lastRunInfo?.nodesTotal !== null
      ? `${lastRunInfo?.nodesCompleted}/${lastRunInfo?.nodesTotal} node${lastRunInfo?.nodesCompleted > 1 ? "s" : ""} completed`
      : "";
  const runDurationMessage = lastRunInfo?.runDuration ? `${lastRunInfo?.runDuration}s` : undefined;
  const statusMessage = lastRunInfo?.error
    ? "error"
    : lastRunInfo?.active
      ? "running"
      : lastRunInfo?.status !== "error"
        ? "finished"
        : lastRunInfo.status;
  const handleStopClick = () => {
    SnapshotsApi.stopNodeRunning();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{title}</div>
      <div className={styles.insideWrapper}>
        <div className={styles.lowerContainer}>
          <div className={styles.lowerUpperContainer}>
            <div className={styles.lowerUpperLeftContainer}>
              <div>Status: {statusMessage}</div>
              <div>Graph progress: {graphProgressMessage ?? <CircularProgress size="2rem" />}</div>
              {lastRunInfo?.error && <ErrorStatusWrapper error={lastRunInfo?.error} />}
              <div>Run duration: {runDurationMessage ?? <CircularProgress size="2rem" />}</div>
            </div>
            <div className={styles.lowerUpperRightContainer}>
              {lastRunInfo?.active && <BlueButton onClick={handleStopClick}>Stop</BlueButton>}
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
