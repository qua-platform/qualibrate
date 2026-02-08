/**
 * @fileoverview Collapsible measurement list item showing node execution results.
 *
 * Displays measurement ID, name, status dot (success/failure ratio), and expandable
 * details including run info, parameters, and per-qubit outcomes. Clicking fetches
 * snapshot data and displays in Results panel.
 *
 * @see MeasurementHistory - Parent list component
 * @see MeasurementElementInfoSection - Renders expandable details
 */
import React from "react";
import styles from "./MeasurementElement.module.scss";
import {classNames} from "../../../../utils/classnames";
import {formatDateTime} from "../../../../utils/formatDateTime";
import {InfoIcon, MeasurementElementOutcomes, MeasurementElementStatusInfoAndParameters} from "../../../../components";
import {Tooltip} from "@mui/material";
import {
  getGraphStatuSelectedNodeNameInWorkflow,
  getTrackLatest,
  setGraphStatusSelectedNodeNameInWorkflow,
  setTrackLatest,
} from "../../../../stores/GraphStores/GraphStatus";
import {useSelector} from "react-redux";
import {useRootDispatch} from "../../../../stores";
import {Measurement} from "../../GraphStatus";
import {
  fetchOneSnapshot,
  setClickedForSnapshotSelection,
  setDiffData,
  setResult,
  setSelectedSnapshot,
  setSelectedSnapshotId,
} from "../../../../stores/SnapshotsStore/actions";

interface MeasurementElementProps {
  element: Measurement;
  dataMeasurementId: string;
}

// TODO: probably merge with src/modules/Data/components/SnapshotElement/SnapshotElement.tsx
// and move to src/components
export const MeasurementElement: React.FC<MeasurementElementProps> = ({ element, dataMeasurementId }) => {
  const dispatch = useRootDispatch();
  const selectedNodeNameInWorkflow = useSelector(getGraphStatuSelectedNodeNameInWorkflow);
  const trackLatest = useSelector(getTrackLatest);

  // Check if selected via list click or Cytoscape graph node click
  const measurementSelected =
    selectedNodeNameInWorkflow &&
    (selectedNodeNameInWorkflow === element.id?.toString() || selectedNodeNameInWorkflow === element.metadata?.name);
  const cytoscapeNodeSelected =
    selectedNodeNameInWorkflow &&
    (selectedNodeNameInWorkflow === element.id?.toString() || selectedNodeNameInWorkflow === element.metadata?.name);

  /**
   * Generates conic gradient for status dot based on outcome success ratio.
   * Green segment shows success percentage, red shows failures.
   */
  const getDotStyle = () => {
    if (!element.data?.outcomes || Object.keys(element.data?.outcomes).length === 0) {
      return { backgroundColor: "#40a8f5" };
    }
    const outcomes = Object.values(element.data?.outcomes);
    const total = outcomes.length;
    const successes = outcomes.filter((status) => status === "successful").length;
    const successPercentage = total !== 0 ? (successes / total) * 100 : 0;
    return {
      background: `conic-gradient(rgb(40, 167, 69, 0.9) ${successPercentage}%, rgb(220, 53, 69, 0.9) 0)`,
    };
  };

  const handleOnClick = () => {
    if (selectedNodeNameInWorkflow !== element.metadata?.name && trackLatest) {
      dispatch(setTrackLatest(false));
    }
    dispatch(setGraphStatusSelectedNodeNameInWorkflow(element.metadata?.name));
    if (element.id) {
      dispatch(setSelectedSnapshotId(element.id));
      dispatch(setSelectedSnapshot(element));
      dispatch(setClickedForSnapshotSelection(true));
      dispatch(fetchOneSnapshot(element.id));
    } else {
      dispatch(setResult({}));
      dispatch(setDiffData({}));
    }
  };
  return (
    <div data-measurement-id={dataMeasurementId} className={classNames(styles.rowWrapper)}>
      <div className={styles.row} onClick={handleOnClick}>
        <div className={styles.dot} style={getDotStyle()}></div>
        <div className={styles.titleOrName}>
          #{element.id} {element.metadata?.name}
        </div>
        <div className={styles.descriptionWrapper}>
          {element.metadata?.description && (
            <Tooltip
              title={<div className={styles.descriptionTooltip}>{element.metadata?.description ?? ""}</div>}
              placement="left-start"
              arrow
            >
              <span>
                <InfoIcon />
              </span>
            </Tooltip>
          )}
        </div>
      </div>
      {(measurementSelected || cytoscapeNodeSelected) && (
        <div className={styles.expandedContent}>
          <div className={styles.runInfoAndParameters}>
            <MeasurementElementStatusInfoAndParameters
              data={{
                Status: element.metadata?.status || "Unknown",
                ...(element.metadata?.run_start && { "Run start": formatDateTime(element.metadata?.run_start) }),
                ...(element.metadata?.run_end && { "Run end": formatDateTime(element.metadata?.run_end) }),
                ...(element.metadata?.run_duration && { "Run duration": `${element.metadata?.run_duration}s` }),
              }}
              isInfoSection={true}
              className={styles.runInfo}
              evenlySpaced={true}
            />
            <MeasurementElementStatusInfoAndParameters
              title="Parameters"
              data={element.data?.parameters || {}}
              filterEmpty={true}
              className={styles.parameters}
            />
          </div>
          <MeasurementElementOutcomes outcomes={element.data?.outcomes} />
        </div>
      )}
    </div>
  );
};
