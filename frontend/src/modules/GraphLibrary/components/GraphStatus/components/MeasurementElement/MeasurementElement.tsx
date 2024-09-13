import React from "react";
import styles from "./MeasurementElement.module.scss";
import { GlobalParameterStructure, Measurement, useGraphStatusContext } from "../../context/GraphStatusContext";
import { classNames } from "../../../../../../utils/classnames";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";
import { GlobalElementParameters } from "../../../../../common/GlobalElementParameters/GlobalElementParameters";

export const MeasurementElement: React.FC<{ element: Measurement }> = ({ element }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  // const { isNodeRunning, setRunningNodeInfo, setIsNodeRunning, setRunningNode, allNodes, setAllNodes } = useNodesContext();
  const { fetchResultsAndDiffData, setResult, setDiffData } = useGraphStatusContext();

  const formatDateTime = (dateTimeString: string) => {
    const [date, time] = dateTimeString.split("T");
    const [timeWithoutMilliseconds] = time.split(".");
    return `${date} ${timeWithoutMilliseconds}`;
  };
  return (
    <div
      className={classNames(
        styles.rowWrapper,
        ((selectedItemName && selectedItemName === element.snapshot_idx?.toString()) ||
          (selectedItemName && selectedItemName === element.name?.toString())) &&
          styles.nodeSelected
      )}
      onClick={() => {
        setSelectedItemName(element.snapshot_idx ? element.snapshot_idx.toString() : element.name?.toString());
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
      {selectedItemName && (selectedItemName === element.snapshot_idx?.toString() || selectedItemName === element.name) && (
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
