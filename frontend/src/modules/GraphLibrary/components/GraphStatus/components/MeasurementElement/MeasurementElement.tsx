import React, { useEffect } from "react";
import styles from "./MeasurementElement.module.scss";
import { Measurement, useGraphStatusContext } from "../../context/GraphStatusContext";
import { classNames } from "../../../../../../utils/classnames";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";
import { useGraphContext } from "../../../../context/GraphContext";

interface MeasurementElementProps {
  element: Measurement;
  isExpanded: boolean;
  onExpand: (name: string | null) => void; 
}

export const formatDateTime = (dateTimeString: string) => {
  const [date, time] = dateTimeString.split("T");
  const [timeWithoutMilliseconds] = time.split(".");
  return `${date} ${timeWithoutMilliseconds}`;
};

export const MeasurementElement: React.FC<MeasurementElementProps> = ({ element, isExpanded, onExpand }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow } = useGraphContext();
  const { fetchResultsAndDiffData, setResult, setDiffData, trackLatest, setTrackLatest } = useGraphStatusContext();

  const measurementSelected =
    selectedItemName && (selectedItemName === element.snapshot_idx?.toString() || selectedItemName === element.name);
  const cytoscapeNodeSelected =
    selectedNodeNameInWorkflow &&
    (selectedNodeNameInWorkflow === element.snapshot_idx?.toString() || selectedNodeNameInWorkflow === element.name);

  const handleSelectNode = () => {
    if (selectedItemName === element.name) {
      setSelectedItemName(null);
      setTrackLatest(false);
      onExpand(null);
    } else {
      setSelectedItemName(element.name);
      setTrackLatest(false);
      onExpand(element.name);
      if (element.snapshot_idx) {
        fetchResultsAndDiffData(element.snapshot_idx);
      } else {
        setResult({});
        setDiffData({});
      }
    }
  };

  const handleOnClick = () => {
    if (cytoscapeNodeSelected) {
      setSelectedNodeNameInWorkflow(null);
      onExpand(null);
    } else {
      setSelectedNodeNameInWorkflow(element.name);
      onExpand(element.name);
    }
  };

  useEffect(() => {
    if (cytoscapeNodeSelected && !isExpanded) {
      onExpand(element.name);
    } else if (!cytoscapeNodeSelected && isExpanded) {
      onExpand(null);
    }
  }, [cytoscapeNodeSelected, isExpanded, onExpand, element.name]);

  const getDotStyle = () => {
    if (!element.outcomes || Object.keys(element.outcomes).length === 0) {
      return { backgroundColor: "#40a8f5" }; // Default blue color if no outcomes
    }

    const outcomes = Object.values(element.outcomes);
    const total = outcomes.length;
    const successes = outcomes.filter((status) => status === "successful").length;
    const successPercentage = (successes / total) * 100;

    return {
      background: `conic-gradient(rgb(40, 167, 69, 0.9) ${successPercentage}%, rgb(220, 53, 69, 0.9) 0)`,
    };
  };

  const hasOutcomes = element.outcomes && Object.keys(element.outcomes).length > 0;

  return (
    <div
      className={classNames(
        styles.rowWrapper,
        (measurementSelected || cytoscapeNodeSelected) && styles.nodeSelected,
        isExpanded && styles.expanded 
      )}
      onClick={handleOnClick} 
    >
      <div className={styles.row} onClick={handleSelectNode}>
        <div className={styles.dot} style={getDotStyle()}></div>
        <div className={styles.titleOrName}>
          #{element.snapshot_idx} {element.name}
        </div>
        <div className={styles.description}>{element.description}</div>
      </div>
      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.runInfoAndParameters}>
            {/* Run info */}
            <div className={styles.runInfo}>
              <div className={styles.barItem}>
                <span className={styles.label}>Status:</span>
                <span className={styles.value}>{element.status || "Unknown"}</span>
              </div>
              <div className={styles.barItem}>
                <span className={styles.label}>Run duration:</span>
                <span className={styles.value}>{element.run_duration}s</span>
              </div>
              <div className={styles.barItem}>
                <span className={styles.label}>Run start:</span>
                <span className={styles.value}>{formatDateTime(element.run_start)}</span>
              </div>
            </div>
            {/* Parameters */}
            <div className={styles.parameters}>
              <h4>Parameters</h4>
              <div className={styles.parameterContent}>
                {Object.entries(element.parameters || {})
                  .filter(([, value]) => value != null && value !== "")
                  .map(([key, value]) => (
                    <div className={styles.parameterItem} key={key}>
                      <span className={styles.label}>{key}:</span>
                      <span className={styles.value}>
                        {Array.isArray(value) ? value.join(", ") : value?.toString() || "N/A"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {/* Outcomes */}
          {hasOutcomes && (
            <div className={styles.outcomes}>
              <h4>Outcomes</h4>
              <div className={styles.outcomeContainer}>
                {Object.entries(element.outcomes).map(([qubit, result]) => {
                  const isSuccess = result === "successful";
                  return (
                    <span
                      key={qubit}
                      className={classNames(styles.outcomeBubble, isSuccess ? styles.success : styles.failure)}
                    >
                      <span className={classNames(styles.qubitLabel, isSuccess ? styles.success : styles.failure)}>
                        {qubit || "N/A"}
                      </span>
                      <span className={styles.outcomeStatus}>{result}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
