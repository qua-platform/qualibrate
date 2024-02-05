import React, { useMemo } from "react";

import { formatDate } from "../../../../../utils/date";
import styles from "../../jobList/jobRow/JobRow.module.scss";
import { classNames } from "../../../../../utils/classnames";

interface Props {
  className?: string;
  start: Date;
  showDevice?: boolean; // should also add device prop when it will be received from backend
  authorUsername?: string;
}

const JobDate = ({ authorUsername, start = new Date(), showDevice = false, className }: Props) => {
  const jobCreationDate = useMemo(() => {
    return formatDate(start);
  }, [start]);
  const showString = `${jobCreationDate}  ${authorUsername ? authorUsername : ""}${showDevice ? "@localhost" : ""}`;
  return <div className={classNames(className, styles.jobCreationInfo)}>{showString}</div>;
};

export default JobDate;
