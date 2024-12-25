import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./MeasurementElement.module.scss";
import { GlobalParameterStructure, Measurement, useGraphStatusContext } from "../../context/GraphStatusContext";
import { classNames } from "../../../../../../utils/classnames";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";
import { GlobalElementParameters } from "../../../../../common/GlobalElementParameters/GlobalElementParameters";
import { useGraphContext } from "../../../../context/GraphContext";

export const formatDateTime = (dateTimeString: string) => {
  const [date, time] = dateTimeString.split("T");
  const [timeWithoutMilliseconds] = time.split(".");
  return `${date} ${timeWithoutMilliseconds}`;
};
export const MeasurementElement: React.FC<{ element: Measurement }> = ({ element }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow } = useGraphContext();
  // const { isNodeRunning, setRunningNodeInfo, setIsNodeRunning, setRunningNode, allNodes, setAllNodes } = useNodesContext();
  const { fetchResultsAndDiffData, setResult, setDiffData } = useGraphStatusContext();

  const measurementSelected =
    selectedItemName && (selectedItemName === element.snapshot_idx?.toString() || selectedItemName === element.name);
  const cytoscapeNodeSelected =
    selectedNodeNameInWorkflow &&
    (selectedNodeNameInWorkflow === element.snapshot_idx?.toString() || selectedNodeNameInWorkflow === element.name);
  return (
    <div
      className={classNames(styles.rowWrapper, (measurementSelected || cytoscapeNodeSelected) && styles.nodeSelected)}
      onClick={() => {
        setSelectedItemName(element.name);
        setSelectedNodeNameInWorkflow(element.name);
        if (element.snapshot_idx) {
          fetchResultsAndDiffData(element.snapshot_idx);
        } else {
          setResult({});
          setDiffData({});
        }
      }}
    >
      <div className={styles.row}>
        <div className={styles.titleOrName}>
          <div className={styles.rectangle}></div>#{element.snapshot_idx}&nbsp;{element.name}
        </div>
        <div className={styles.description}>{element.description}</div>
      </div>
      {(measurementSelected || cytoscapeNodeSelected) && (
        <div className={styles.lowerRow}>
          <div className={styles.left}>
            <div>Status:</div>
            <div>Run start: {formatDateTime(element.run_start)}</div>
            <div>Run duration: {element.run_duration}s</div>
          </div>
          <div className={styles.right}>
            <GlobalElementParameters title={"Parameters"} parameters={element.parameters} />
            <GlobalElementParameters title={"Outcomes"} parameters={element.outcomes as GlobalParameterStructure} />
          </div>
        </div>
      )}
    </div>
  );
};
