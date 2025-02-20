import React, { useEffect, useState } from "react";
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
  element: Measurement;
  isExpanded: boolean;
  onExpand: (name: string | undefined) => void;
}

// Formats a date-time string into a more readable format.
export const formatDateTime = (dateTimeString: string) => {
  const [date, time] = dateTimeString.split("T");
  const [timeWithoutMilliseconds] = time.split(".");
  return `${date} ${timeWithoutMilliseconds}`;
};

export const MeasurementElement: React.FC<MeasurementElementProps> = ({ element, isExpanded, onExpand }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow, lastRunInfo } = useGraphContext();
  const { fetchResultsAndDiffData, setResult, setDiffData, setTrackLatest } = useGraphStatusContext();
  // Syncs the expansion state with the Cytoscape graph selection.
  const [autoDisabledTrackLatest, setAutoDisabledTrackLatest] = useState(false);

  // Check if the current measurement is selected in either the list or Cytoscape graph
  const measurementSelected =
    selectedItemName && (selectedItemName === element.snapshot_idx?.toString() || selectedItemName === element.name);
  const cytoscapeNodeSelected =
    selectedNodeNameInWorkflow &&
    (selectedNodeNameInWorkflow === element.snapshot_idx?.toString() || selectedNodeNameInWorkflow === element.name);

  // Handles selecting/deselecting a measurement in the list.
  // If already selected, it collapses the measurement.
  const handleOnClick = () => {
      setTrackLatest(false);
    if (selectedItemName === element.name) {
      setSelectedItemName(undefined);
      setSelectedNodeNameInWorkflow(undefined);
      onExpand(undefined);
    } else {
      setSelectedItemName(element.name);
      setSelectedNodeNameInWorkflow(element.name);
      onExpand(element.name || undefined);
    }
  };

  // Syncs the expansion state with the Cytoscape graph selection.
  useEffect(() => {
    if (cytoscapeNodeSelected && !isExpanded) {
      onExpand(element.name);
    } else if (!cytoscapeNodeSelected && isExpanded) {
      onExpand(undefined);
    }
  
    // Auto disable Track Latest only when all nodes have completed processing
    if (
      cytoscapeNodeSelected &&
      lastRunInfo?.nodesCompleted === lastRunInfo?.nodesTotal &&
      !autoDisabledTrackLatest // Prevent overriding manual user changes
    ) {
      setTrackLatest(false);
      setAutoDisabledTrackLatest(true); // Mark it as auto-disabled
    }
  }, [cytoscapeNodeSelected, isExpanded, lastRunInfo, onExpand, element.name, setTrackLatest, autoDisabledTrackLatest]);
        
  // Generates a dynamic style for the dot indicator based on the measurement outcomes.
  // The dot displays a success/failure ratio using a conic gradient.
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
            {/* Run Info Section */}
            <MeasurementElementStatusInfoAndParameters
              data={{
                Status: element.status || "Unknown",
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
