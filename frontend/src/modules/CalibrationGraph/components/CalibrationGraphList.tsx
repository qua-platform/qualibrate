import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../CalibrationGraph.module.scss";
import { CalibrationGraphElement } from "./CalibrationGraphElement/CalibrationGraphElement";
import { NodeMap } from "../../Nodes/components/NodeElement/NodeElement";
import { useCalibrationGraphContext } from "../context/CalibrationGraphContext";
import { InputParameter } from "../../common/Parameters";

export interface CalibrationGraphWorkflow {
  name?: string;
  title?: string;
  description: string;
  parameters?: InputParameter;
  nodes?: NodeMap;
  connectivity?: string[][];
}

export const CalibrationGraphList: React.FC = () => {
  const { allCalibrationGraphs } = useCalibrationGraphContext();
  if (!allCalibrationGraphs || Object.entries(allCalibrationGraphs).length === 0) return <div>No calibration graphs</div>;
  return (
    <div className={styles.listWrapper}>
      {Object.entries(allCalibrationGraphs ?? {}).map(([key, graph]) => {
        return <CalibrationGraphElement key={key} calibrationGraphKey={key} calibrationGraph={graph} />;
      })}
    </div>
  );
};
