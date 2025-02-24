import React from "react";
import styles from "./MeasurementElement.module.scss";
import { Measurement, useGraphStatusContext } from "../../context/GraphStatusContext";
import { classNames } from "../../../../../../utils/classnames";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";
import { useGraphContext } from "../../../../context/GraphContext";
import {
  MeasurementElementOutcomes,
  MeasurementElementStatusInfoAndParameters,
} from "../MeasurementElementInfoSection/MeasurementElementInfoSection";

interface MeasurementElementProps {
  key: string;
  element: Measurement;
  dataMeasurementId: string;
}

// Formats a date-time string into a more readable format.
export const formatDateTime = (dateTimeString: string) => {
  const [date, time] = dateTimeString.split("T");
  const [timeWithoutMilliseconds] = time.split(".");
  return `${date} ${timeWithoutMilliseconds}`;
};

export const MeasurementElement: React.FC<MeasurementElementProps> = ({ key, element, dataMeasurementId }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow } = useGraphContext();
  const { fetchResultsAndDiffData, setResult, setDiffData } = useGraphStatusContext();
  const { trackLatest, setTrackLatest } = useGraphStatusContext();

  // Check if the current measurement is selected in either the list or Cytoscape graph
  const measurementSelected =
    selectedItemName && (selectedItemName === element.snapshot_idx?.toString() || selectedItemName === element.name);
  const cytoscapeNodeSelected =
    selectedNodeNameInWorkflow &&
    (selectedNodeNameInWorkflow === element.snapshot_idx?.toString() || selectedNodeNameInWorkflow === element.name);

  const getDotStyle = () => {
    if (!element.outcomes || Object.keys(element.outcomes).length === 0) {
      return { backgroundColor: "#40a8f5" }; // Default blue color if no outcomes
    }
    const outcomes = Object.values(element.outcomes);
    const total = outcomes.length;
    const successes = outcomes.filter((status) => status === "successful").length;
    const successPercentage = total !== 0 ? (successes / total) * 100 : 0;
    return {
      background: `conic-gradient(rgb(40, 167, 69, 0.9) ${successPercentage}%, rgb(220, 53, 69, 0.9) 0)`,
    };
  };

  const handleOnClick = () => {
    if (selectedItemName !== element.name && trackLatest) {
      setTrackLatest(false);
    }
    setSelectedItemName(element.name);
    setSelectedNodeNameInWorkflow(element.name);
    if (element.snapshot_idx) {
      fetchResultsAndDiffData(element.snapshot_idx);
    } else {
      setResult({});
      setDiffData({});
    }
  };
  return (
    <div
      key={key}
      data-measurement-id={dataMeasurementId}
      className={classNames(
        styles.rowWrapper,
        (measurementSelected || cytoscapeNodeSelected) && styles.nodeSelected,
        selectedItemName !== element.name && styles.expanded
      )}
    >
      <div className={styles.row} onClick={handleOnClick}>
        <div className={styles.dot} style={getDotStyle()}></div>
        <div className={styles.titleOrName}>
          #{element.snapshot_idx} {element.name}
        </div>
        <div className={styles.description}>{element.description}</div>
      </div>
      {(measurementSelected || cytoscapeNodeSelected) && (
        <div className={styles.expandedContent}>
          <div className={styles.runInfoAndParameters}>
            <MeasurementElementStatusInfoAndParameters
              data={{
                Status: element.status || "Unknown",
                "Run duration": `${element.run_duration}s`,
                "Run start": formatDateTime(element.run_start),
              }}
              className={styles.runInfo}
              evenlySpaced={true}
            />
            <MeasurementElementStatusInfoAndParameters
              title="Parameters"
              data={element.parameters || {}}
              filterEmpty={true}
              className={styles.parameters}
            />
          </div>
          <MeasurementElementOutcomes outcomes={element.outcomes} />
        </div>
      )}
    </div>
  );
};
