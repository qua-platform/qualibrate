import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../GraphLibrary.module.scss";
import { GraphElement } from "./GraphElement/GraphElement";
import { NodeMap } from "../../Nodes/components/NodeElement/NodeElement";
import { useGraphContext } from "../context/GraphContext";
import { InputParameter } from "../../common/Parameters";

export interface GraphWorkflow {
  name?: string;
  title?: string;
  description: string;
  parameters?: InputParameter;
  nodes?: NodeMap[];
  connectivity?: string[][];
}

export const GraphList: React.FC = () => {
  const { allGraphs } = useGraphContext();
  if (!allGraphs || Object.entries(allGraphs).length === 0) return <div>No calibration graphs</div>;
  return (
    <div className={styles.listWrapper}>
      {Object.entries(allGraphs ?? {}).map(([key, graph]) => {
        return <GraphElement key={key} calibrationGraphKey={key} calibrationGraph={graph} />;
      })}
    </div>
  );
};
