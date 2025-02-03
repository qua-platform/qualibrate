import React, { useRef, useEffect } from "react";
import styles from "./MeasurementElement.module.scss";
import { Measurement, useGraphStatusContext } from "../../context/GraphStatusContext";
import { classNames } from "../../../../../../utils/classnames";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";

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

export const MeasurementElement: React.FC<MeasurementElementProps> = ({ element, isExpanded, onExpand }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { fetchResultsAndDiffData, setResult, setDiffData, trackLatest, setTrackLatest } = useGraphStatusContext();

  const expandedSectionRef = useRef<HTMLDivElement>(null);

  // Handle selecting a node
  const handleSelectNode = () => {
    if (selectedItemName !== element.name && trackLatest) {
      setTrackLatest(false);
    }
    setSelectedItemName(element.name);
    if (element.snapshot_idx) {
      fetchResultsAndDiffData(element.snapshot_idx);
    } else {
      setResult({});
      setDiffData({});
    }
  };

  // Handle expanding or collapsing the element
  const handleExpand = () => {
    onExpand();
  };

  // Scroll into view when expanded
  useEffect(() => {
    if (isExpanded && expandedSectionRef.current) {
      expandedSectionRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isExpanded]);

  // Generate style for the dot indicator
  const getDotStyle = () => {
    if (!element.outcomes || Object.keys(element.outcomes).length === 0) {
      return { backgroundColor: "#40a8f5" }; // Default blue color for no qubits
    }

    const outcomes = Object.values(element.outcomes);
    const total = outcomes.length;
    const successes = outcomes.filter((status) => status === "successful").length;
    const successPercentage = (successes / total) * 100;

    return {
      background: `conic-gradient(rgb(40, 167, 70, 0.9) ${successPercentage}%, rgb(220, 53, 69, 0.9) 0)`,
    };
  };

  return (
    <div
      className={classNames(
        styles.rowWrapper,
        selectedItemName === element.name && styles.nodeSelected,
        isExpanded && styles.expanded
      )}
      onClick={handleExpand} // Toggle expansion on click
    >
      <div className={styles.row} onClick={handleSelectNode}>
        <div className={styles.dot} style={getDotStyle()}></div> {/* Dynamic pie chart-style dot */}
        <div className={styles.titleOrName}>
          #{element.snapshot_idx} {element.name}
        </div>
        <div className={styles.description}>{element.description}</div>
      </div>
      {isExpanded && (
        <div ref={expandedSectionRef} className={styles.expandedContent}>
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
                  .filter(([, value]) => value !== null && value !== undefined) // Exclude null or undefined values
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
              <div className={styles.outcomeContainer}>
                {Object.entries(element.outcomes || {}).map(([qubit, result]) => {
                  const isSuccess = result === "successful";
                  return (
                    <span
                      key={qubit}
                      className={classNames(styles.outcomeBubble, isSuccess ? styles.success : styles.failure)}
                    >
                      <span
                        className={styles.qubitLabel}
                        style={{
                          backgroundColor: isSuccess
                            ? "rgba(40, 167, 69, 0.6)" // Green shading
                            : "rgba(220, 53, 69, 0.6)", // Red shading
                        }}
                      >
                        {qubit}
                      </span>
                      <span className={styles.divider}></span>
                      <span className={styles.outcomeStatus}>{result}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
