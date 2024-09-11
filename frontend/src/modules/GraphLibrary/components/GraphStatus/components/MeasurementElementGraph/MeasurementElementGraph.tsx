import React from "react";
import styles from "./MeasurementElementGraph.module.scss";
import CytoscapeGraph from "../../../CytoscapeGraph/CytoscapeGraph";
import cytoscape from "cytoscape";
import { useGraphContext } from "../../../../context/GraphContext";
import { GlobalElementParameters } from "../../../../../common/GlobalElementParameters/GlobalElementParameters";

interface IProps {
  workflowGraphElements: cytoscape.ElementDefinition[];
  active?: boolean;
  nodesCompleted?: number;
  runDuration?: number;
}

export const MeasurementElementGraph: React.FC<IProps> = ({ workflowGraphElements }) => {
  const title = "Calibration Graph Progress";
  const { lastRunInfo } = useGraphContext();
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{title}</div>
      <div className={styles.insideWrapper}>
        <div className={styles.lowerContainer}>
          <div className={styles.lowerUpperContainer}>
            <div className={styles.lowerUpperLeftContainer}>
              <div>Status: {lastRunInfo?.active ? "running" : "finished"}</div>
              <div>Graph progress: {lastRunInfo?.nodesCompleted} nodes completed</div>
              <div>Run duration: {lastRunInfo?.runDuration}</div>
            </div>
            <div className={styles.lowerUpperRightContainer}>
              <GlobalElementParameters title={"Graph parameters"} parameters={{ Qubits: "q0, q1, q2" }} />
              <GlobalElementParameters title={"Orchestrator parameters"} parameters={{ "Skip failed": "true" }} />
            </div>
          </div>
          <div className={styles.lowerLowerContainer}>
            <CytoscapeGraph elements={workflowGraphElements} />
          </div>
        </div>
      </div>
    </div>
  );
};
