import React, { useRef, useEffect } from "react";
import styles from "./MeasurementElement.module.scss";
import { Measurement, useGraphStatusContext } from "../../context/GraphStatusContext";
import { classNames } from "../../../../../../utils/classnames";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";

interface MeasurementElementProps {
  element: Measurement; // The measurement element to display
  isExpanded: boolean; // Whether the element is currently expanded
  onExpand: () => void; // Callback to toggle the expanded state
}

// Utility function to format date-time strings into a readable format
export const formatDateTime = (dateTimeString: string) => {
  const [date, time] = dateTimeString.split("T");
  const [timeWithoutMilliseconds] = time.split(".");
  return `${date} ${timeWithoutMilliseconds}`;
};

export const MeasurementElement: React.FC<MeasurementElementProps> = ({ element, isExpanded, onExpand }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { fetchResultsAndDiffData, setResult, setDiffData, trackLatest, setTrackLatest } = useGraphStatusContext();

  const expandedSectionRef = useRef<HTMLDivElement>(null);

  // Handle node selection logic
  const handleSelectNode = () => {
    if (selectedItemName !== element.name && trackLatest) {
      setTrackLatest(false); // Disable auto-tracking if a manual selection is made
    }
    setSelectedItemName(element.name); // Set the selected node name
    if (element.snapshot_idx) {
      fetchResultsAndDiffData(element.snapshot_idx); // Fetch results and diff data for the selected node
    } else {
      setResult({}); // Clear results if no snapshot index is present
      setDiffData({});
    }
  };

  // Handle the expand/collapse action
  const handleExpand = () => {
    onExpand();
  };

  // Automatically scroll to the expanded section when it is expanded
  useEffect(() => {
    if (isExpanded && expandedSectionRef.current) {
      expandedSectionRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isExpanded]);

  // Generate a dynamic style for the dot indicator based on outcomes
  const getDotStyle = () => {
    if (!element.outcomes || Object.keys(element.outcomes).length === 0) {
      return { backgroundColor: "#40a8f5" }; // Default blue color if no outcomes
    }

    const outcomes = Object.values(element.outcomes);
    const total = outcomes.length;
    const successes = outcomes.filter((status) => status === "successful").length;
    const successPercentage = (successes / total) * 100;

    // Create a pie-chart-like gradient to represent success vs failure
    return {
      background: `conic-gradient(rgb(40, 167, 69, 0.9) ${successPercentage}%, rgb(220, 53, 69, 0.9) 0)`,
    };
  };

  // Check if the element has any outcomes to display
  const hasOutcomes = element.outcomes && Object.keys(element.outcomes).length > 0;

  return (
    <div
      className={classNames(
        styles.rowWrapper,
        selectedItemName === element.name && styles.nodeSelected, // Highlight the selected node
        isExpanded && styles.expanded // Apply expanded styling
      )}
      onClick={handleExpand} // Trigger expansion/collapse on click
    >
      <div className={styles.row} onClick={handleSelectNode}>
        {/* Dot indicator for the measurement's outcomes */}
        <div className={styles.dot} style={getDotStyle()}></div>
        <div className={styles.titleOrName}>
          #{element.snapshot_idx} {element.name}
        </div>
        <div className={styles.description}>{element.description}</div>
      </div>
      {isExpanded && (
        <div ref={expandedSectionRef} className={styles.expandedContent}>
          {/* Run Info and Parameters Section */}
          <div className={styles.runInfoAndParameters}>
            {/* Run Info */}
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
                  .filter(([, value]) => value != null && value !== "") // Filter out null or empty parameters (e.g. )
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
          {/* Outcomes Section */}
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
                        {qubit || "N/A"} {/* Display "N/A" if qubit is null or undefined */}
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
