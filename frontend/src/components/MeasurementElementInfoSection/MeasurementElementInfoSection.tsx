/**
 * @fileoverview Reusable components for displaying measurement run info and outcomes.
 *
 * MeasurementElementStatusInfoAndParameters: Generic key-value display for run
 * metadata and parameters with optional filtering and spacing.
 *
 * MeasurementElementOutcomes: Per-qubit outcome badges (success/failure) displayed
 * as colored bubbles with qubit labels.
 *
 * @see MeasurementElement - Uses these for expandable details
 */
import React from "react";
import styles from "./MeasurementElementInfoSection.module.scss";
import { classNames } from "../../utils/classnames";

interface MeasurementElementStatusInfoAndParametersProps {
  title?: string;
  data?: Record<string, string | number | string[] | object> | object;
  isInfoSection?: boolean;
  filterEmpty?: boolean;
  className: string;
  evenlySpaced?: boolean;
}

/**
 * Generic key-value display component for measurement metadata and parameters.
 *
 * @param filterEmpty - Hide entries with null/undefined/empty string values
 * @param evenlySpaced - Apply flexbox space-evenly layout (used for run info section)
 */
export const MeasurementElementStatusInfoAndParameters: React.FC<MeasurementElementStatusInfoAndParametersProps> = ({
  title,
  data,
  isInfoSection = false,
  filterEmpty = false,
  className,
  evenlySpaced = false,
}) => {
  const filteredData = filterEmpty
    ? Object.entries(data ?? {}).filter(([, value]) => value != null && value !== "")
    : Object.entries(data ?? {});

  if (filteredData.length === 0) return null;

  return (
    <div className={className}>
      {title && <div className={styles.sectionTitle}>{title}</div>}
      <div
        className={styles.infoContent}
        style={evenlySpaced ? { height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-evenly" } : {}}
      >
        {filteredData.map(([key, value]) => (
          <div className={styles.infoItem} key={key}>
            <div className={classNames(styles.label, isInfoSection && styles.info)}>{key}:</div>
            <div className={styles.value}>{Array.isArray(value) ? value.join(", ") : value?.toString() || "N/A"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Displays per-qubit calibration outcomes as colored badges.
 * Green for "successful", red for failures.
 */
export const MeasurementElementOutcomes: React.FC<{
  outcomes?: object;
}> = ({ outcomes }) => {
  if (!outcomes || Object.keys(outcomes).length === 0) return null;

  return (
    <div className={styles.outcomes}>
      <div className={styles.outcomesTitle}>Outcomes</div>
      <div className={styles.outcomeContainer}>
        {Object.entries(outcomes).map(([qubit, result]) => {
          const isSuccess = result === "successful";
          return (
            <span
              key={qubit} className={classNames(styles.outcomeBubble, isSuccess ? styles.success : styles.failure)}>
              <span className={classNames(styles.qubitLabel, isSuccess ? styles.success : styles.failure)}>{qubit || "N/A"} </span>
              <span className={styles.outcomeStatus}>{result}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
