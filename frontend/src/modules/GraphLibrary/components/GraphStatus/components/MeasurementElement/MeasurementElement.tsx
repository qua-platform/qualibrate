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
import { useSnapshotsContext } from "../../../../../Snapshots/context/SnapshotsContext";
import { Tooltip } from "@mui/material";
import { InfoIcon } from "../../../../../../ui-lib/Icons/InfoIcon";

interface MeasurementElementProps {
  element: Measurement;
  dataMeasurementId: string;
}

// Formats a date-time string into a more readable format.
export const formatDateTime = (dateTimeString: string) => {
  const [date, time] = dateTimeString.split("T");
  const timeWithoutZone = time.split("+")[0].split("Z")[0];
  const timeWithoutMilliseconds = timeWithoutZone.split(".")[0];
  return `${date} ${timeWithoutMilliseconds}`;
};

export const MeasurementElement: React.FC<MeasurementElementProps> = ({ element, dataMeasurementId }) => {
  const { selectedItemName, setSelectedItemName } = useSelectionContext();
  const { selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow } = useGraphContext();
  // const { fetchResultsAndDiffData } = useGraphStatusContext();
  const { fetchOneSnapshot, setResult, setDiffData, setSelectedSnapshotId, setClickedForSnapshotSelection } = useSnapshotsContext();
  const { trackLatest, setTrackLatest } = useGraphStatusContext();

  // Check if the current measurement is selected in either the list or Cytoscape graph
  const measurementSelected =
    selectedItemName && (selectedItemName === element.id?.toString() || selectedItemName === element.metadata?.name);
  const cytoscapeNodeSelected =
    selectedNodeNameInWorkflow &&
    (selectedNodeNameInWorkflow === element.id?.toString() || selectedNodeNameInWorkflow === element.metadata?.name);

  const getDotStyle = () => {
    if (!element.data?.outcomes || Object.keys(element.data?.outcomes).length === 0) {
      return { backgroundColor: "#40a8f5" }; // Default blue color if no outcomes
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
    if (selectedItemName !== element.metadata?.name && trackLatest) {
      setTrackLatest(false);
    }
    setSelectedItemName(element.metadata?.name);
    setSelectedNodeNameInWorkflow(element.metadata?.name);
    if (element.id) {
      setSelectedSnapshotId(element.id);
      setClickedForSnapshotSelection(true);
      fetchOneSnapshot(element.id);
    } else {
      setResult({});
      setDiffData({});
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
