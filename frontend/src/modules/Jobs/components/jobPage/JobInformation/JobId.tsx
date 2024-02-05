import React from "react";
import styles from "../../jobList/jobRow/JobRow.module.scss";
import { classNames } from "../../../../../utils/classnames";
import { CopyButton } from "../../../../../ui-lib/components/Button/CopyButton";

interface Props {
  id: string | number;
  className?: string;
}

const JobId = ({ id = "da82da1", className }: Props) => {
  return (
    <div className={classNames(styles.jobLink, className)}>
      <span>{id}</span>
      <CopyButton value={id} hideLabel />
    </div>
  );
};

export default JobId;
