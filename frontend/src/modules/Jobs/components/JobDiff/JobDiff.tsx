import "react-diff-view/style/index.css";
import React from "react";

import { CompareJobsIcon } from "../../../../ui-lib/Icons/CompareJobsIcon";
import LoadingBar from "../../../../ui-lib/loader/LoadingBar";
import styles from "./styles/JobDiff.module.scss";
import { parseDiffStr } from "../../jobDiff/utils";
import DiffComponent from "./DiffContent";
import { useJobDiffContext } from "../../context/JobDiffContext";
import ErrorIcon from "../../../../ui-lib/Icons/ErrorIcon";
import { isError, isPending } from "../../../../utils/statusHelpers";

type Props = {
  jobsDiff?: string;
};

const JobDiff = ({ jobsDiff }: Props) => {
  const { diffStatus } = useJobDiffContext();

  if (isError(diffStatus)) {
    return <LoadingBar text={diffStatus.message} icon={<ErrorIcon />} />;
  }

  if (isPending(diffStatus)) {
    return <LoadingBar text="Diff is loading" icon={<CompareJobsIcon />} />;
  }

  if (!jobsDiff) {
    return <LoadingBar text="No git diff available" icon={<CompareJobsIcon />} />;
  }
  const data = parseDiffStr(jobsDiff);

  return (
    <div className={styles.diff}>
      <div className={styles.wrapper}>
        {data.map((props) => (
          <DiffComponent {...props} />
        ))}
      </div>
    </div>
  );
};

export default JobDiff;
