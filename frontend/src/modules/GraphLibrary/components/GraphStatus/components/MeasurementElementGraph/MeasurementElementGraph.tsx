import React from "react";
import styles from "./MeasurementElementGraph.module.scss";
import { useGraphContext } from "../../../../context/GraphContext";
import { GraphList } from "../../../GraphList";

export const MeasurementElementGraph: React.FC = () => {
  const title = "Calibration Graph Progress";
  const { workflowGraphElements } = useGraphContext();

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{title}</div>
      <div className={styles.insideWrapper}>
        <div className={styles.lowerContainer}>
          <div className={styles.lowerUpperContainer}>
            <div className={styles.lowerUpperLeftContainer}>
              <div>Graph progress: 2/4 nodes completed</div>
              <div>Run duration: 3m 6s</div>
            </div>
            <div className={styles.lowerUpperRightContainer}>
              <div>Graph parameters</div>
              <div>Qubits: q0, q2, q3</div>
              <div>Orchestrator parameters</div>
              <div>Skip failed: True</div>
            </div>
          </div>
          <div className={styles.lowerLowerContainer}>
            <GraphList />
            {/*<div className={styles.lowerLowerLeftContainer}>left</div>*/}
            {/*<div className={styles.lowerLowerRightContainer}>right</div>*/}
            {/*<CytoscapeGraph elements={workflowGraphElements} />*/}
          </div>
        </div>
      </div>
    </div>
  );
};
