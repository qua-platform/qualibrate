import React, { CSSProperties } from "react";

import { JobStatuses } from "../../DEPRECATED_common/DEPRECATED_enum/JobStatuses";
import styles from "./JobStatus.module.scss";
import { classNames } from "../../utils/classnames";

interface JobStatusProps {
  status?: JobStatuses;
  className?: string;
}

const COLOR_KEYS = {
  RED: "red",
  GREEN: "green",
  YELLOW: "yellow",
  BLUE: "blue",
  GREY: "grey",
};
const getStyleByKey = (key: string): CSSProperties => {
  return {
    color: `var(--${key})`,
    background: `var(--${key}-light)`,
  };
};

export const getStyleByStatus = (status: string | null): CSSProperties => {
  switch (status?.toLowerCase()) {
    case "failed":
    case "failure":
      return getStyleByKey(COLOR_KEYS.RED);
    case "terminated":
      return getStyleByKey(COLOR_KEYS.GREY);
    case "successful":
    case "successfully":
    case "partially successful":
      return getStyleByKey(COLOR_KEYS.GREEN);
    case "running":
      return getStyleByKey(COLOR_KEYS.BLUE);
    case "scheduled":
    case "pending":
      return getStyleByKey(COLOR_KEYS.YELLOW);
    default:
      return getStyleByKey(COLOR_KEYS.GREY);
  }
};

export const JobStatus = ({ status = JobStatuses.DEFAULT, className }: JobStatusProps) => {
  return (
    <button style={getStyleByStatus(status)} className={classNames(styles.jobStatus, className)} title={status}>
      {status}
    </button>
  );
};

export default JobStatus;
