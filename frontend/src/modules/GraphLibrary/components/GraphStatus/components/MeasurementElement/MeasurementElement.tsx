import React from "react";
import styles from "./MeasurementElement.module.scss";
import { GlobalParameterStructure, Measurement, useGraphStatusContext } from "../../context/GraphStatusContext";
import { classNames } from "../../../../../../utils/classnames";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";
import { useGraphContext } from "../../../../context/GraphContext";

interface MeasurementElementProps {
  element: Measurement;
  isExpanded: boolean; // Prop for expanded state
  onExpand: () => void; // Prop to toggle expansion
}

export const formatDateTime = (dateTimeString: string) => {
  const [date, time] = dateTimeString.split("T");
  const [timeWithoutMilliseconds] = time.split(".");
  return `${date} ${timeWithoutMilliseconds}`;
};

// Function to recursively render any object structure
const renderParameters = (data: any, depth = 0) => {
  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      return (
        <ul className={styles.parameterList}>
          {data.map((item, index) => (
            <li key={index}>{renderParameters(item, depth + 1)}</li>
          ))}
        </ul>
      );
    } else {
      return (
        <ul className={styles.parameterList}>
          {Object.entries(data).map(([key, value]) => (
            <li key={key}>
              <span className={styles.parameterKey}>{key}:</span> {renderParameters(value, depth + 1)}
            </li>
          ))}
        </ul>
      );
    }
  }
  return <span className={styles.parameterValue}>{data === null ? "null" : data.toString()}</span>;
};

export const MeasurementElement: React.FC<MeasurementElementProps> = ({ element, isExpanded, onExpand }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow } = useGraphContext();
  const { fetchResultsAndDiffData, setResult, setDiffData, trackLatest, setTrackLatest } = useGraphStatusContext();

  const handleSelectNode = () => {
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

  // Generate pie-chart-like gradient for the dot
  const getDotStyle = () => {
    if (!element.outcomes || Object.keys(element.outcomes).length === 0) {
      return { backgroundColor: "#40a8f5" }; // Blue for no qubits
    }

    const outcomeValues = Object.values(element.outcomes);
    const total = outcomeValues.length;
    const successes = outcomeValues.filter((status) => status === "successful").length;
    const failures = total - successes;

    const successPercentage = (successes / total) * 100;
    const failurePercentage = (failures / total) * 100;

    return {
      background: `conic-gradient(rgb(40, 167, 70, 0.9) ${successPercentage}%,rgb(220, 53, 69, 0.9) 0 ${failurePercentage}%)`,
    };
  };

  // Render outcome bubbles
  const renderOutcomeBubbles = (outcomes: GlobalParameterStructure | undefined) => {
    if (!outcomes) return null;
    return Object.entries(outcomes).map(([qubit, result]) => {
      const isSuccess = result === "successful";
      return (
        <span
          key={qubit}
          className={classNames(styles.outcomeBubble, isSuccess ? styles.success : styles.failure)}
        >
          {qubit}: {result}
        </span>
      );
    });
  };

  return (
    <div
      className={classNames(
        styles.rowWrapper,
        selectedItemName === element.name && styles.nodeSelected,
        isExpanded && styles.expanded
      )}
      onClick={onExpand} // Toggle expansion on click
    >
      <div className={styles.row} onClick={handleSelectNode}>
        <div className={styles.dot} style={getDotStyle()}></div> {/* Dynamic pie chart-style dot */}
        <div className={styles.titleOrName}>
          #{element.snapshot_idx} {element.name}
        </div>
        <div className={styles.description}>{element.description}</div>
      </div>
      {isExpanded && (
        <div className={styles.expandedContent}>
          {/* Top Bar */}
          <div className={styles.topBar}>
            <div className={styles.barItem}>
              <span className={styles.label}>Run start:</span>{" "}
              <span className={styles.value}>{formatDateTime(element.run_start)}</span>
            </div>
            <div className={styles.barItem}>
              <span className={styles.label}>Run duration:</span>{" "}
              <span className={styles.value}>{element.run_duration}s</span>
            </div>
            <div className={styles.barItem}>
              <span className={styles.label}>Status:</span>{" "}
              <span className={styles.value}>{element.status || "Unknown"}</span>
            </div>
          </div>

          {/* Containers */}
          <div className={styles.contentContainers}>
            {/* Parameters */}
            <div className={styles.parameters}>
              <h4>Parameters</h4>
              <div className={styles.parameterContent}>
                {Object.entries(element.parameters || {})
                  .filter(([_, value]) => value !== null && value !== undefined) // Exclude null or undefined values
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
            {/* Outcomes */}
            <div className={styles.outcomes}>
              <h4>Outcomes</h4>
              <div className={styles.outcomeContainer}>{renderOutcomeBubbles(element.outcomes)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
