import React, { useEffect } from "react";
import styles from "./MeasurementElement.module.scss";
import { Measurement, useGraphStatusContext } from "../../context/GraphStatusContext";
import { classNames } from "../../../../../../utils/classnames";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";
import { useGraphContext } from "../../../../context/GraphContext";
import { MeasurementElementStatusInfoAndParameters, MeasurementElementOutcomes } from "../MeasurementElementInfoSection/MeasurementElementInfoSection";

interface MeasurementElementProps {
  element: Measurement;
  isExpanded: boolean;
  onExpand: (name: string | null) => void;
}

/**
 * Formats a date-time string into a more readable format.
 * @param dateTimeString - The original date-time string.
 * @returns A formatted string with date and time.
 */
export const formatDateTime = (dateTimeString: string) => {
  const [date, time] = dateTimeString.split("T");
  const [timeWithoutMilliseconds] = time.split(".");
  return `${date} ${timeWithoutMilliseconds}`;
};

export const MeasurementElement: React.FC<MeasurementElementProps> = ({ element, isExpanded, onExpand }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow } = useGraphContext();
  const { fetchResultsAndDiffData, setResult, setDiffData, setTrackLatest } = useGraphStatusContext();

  // Check if the current measurement is selected in either the list or Cytoscape graph
  const measurementSelected =
    selectedItemName && (selectedItemName === element.snapshot_idx?.toString() || selectedItemName === element.name);
  const cytoscapeNodeSelected =
    selectedNodeNameInWorkflow &&
    (selectedNodeNameInWorkflow === element.snapshot_idx?.toString() || selectedNodeNameInWorkflow === element.name);

  /**
   * Handles selecting/deselecting a measurement in the list.
   * If already selected, it collapses the measurement.
   */
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

  /**
   * Handles selecting/deselecting a measurement via the Cytoscape graph.
   */
  const handleOnClick = () => {
    if (cytoscapeNodeSelected) {
      setSelectedNodeNameInWorkflow(null);
      onExpand(null);
    } else {
      setSelectedNodeNameInWorkflow(element.name);
      onExpand(element.name);
    }
  };

  /**
   * Syncs the expansion state with the Cytoscape graph selection.
   */
  useEffect(() => {
    if (cytoscapeNodeSelected && !isExpanded) {
      onExpand(element.name);
    } else if (!cytoscapeNodeSelected && isExpanded) {
      onExpand(null);
    }
  }, [cytoscapeNodeSelected, isExpanded, onExpand, element.name]);

  /**
   * Generates a dynamic style for the dot indicator based on the measurement outcomes.
   * The dot displays a success/failure ratio using a conic gradient.
   */
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
            {/* Run Info Section */}
            <MeasurementElementStatusInfoAndParameters
              data={{
                "Status": element.status || "Unknown",
                "Run duration": `${element.run_duration}s`,
                "Run start": formatDateTime(element.run_start),
              }}
              className={styles.runInfo}
              evenlySpaced={true}
            />

            {/* Parameters Section */}
            <MeasurementElementStatusInfoAndParameters
              title="Parameters"
              data={element.parameters || {}}
              filterEmpty={true}
              className={styles.parameters}
            />
          </div>

          {/* Outcomes Section */}
          {hasOutcomes && <MeasurementElementOutcomes outcomes={element.outcomes} />}
        </div>
      )}
    </div>
  );
};
