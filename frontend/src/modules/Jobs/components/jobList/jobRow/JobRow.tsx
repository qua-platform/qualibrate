import React, { useMemo, useRef } from "react";

import { JobDTO } from "../../../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import JobDate from "../../jobPage/JobInformation/JobDate";
import JobId from "../../jobPage/JobInformation/JobId";
import JobParameters from "./JobParameters";
import styles from "./JobRow.module.scss";
import useSwitch from "@react-hook/switch";
import { MinifyProp } from "../../../../../types";
import { classNames } from "../../../../../utils/classnames";
import cyKeys from "../../../../../utils/cyKeys";
import JobCheckBox from "./JobCheckBox";
import JobStatus from "../../../../../DEPRECATED_components/Status/JobStatus";
import useHover from "../../../../../ui-lib/hooks/useHover";
import JobActions from "./JobActions";
import { useJobsSelectionContext } from "../../../context/JobsSelectionContext";

const getPipelineClassName = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "failed":
    case "failure":
      return styles.redPipeline;
    case "terminated":
      return styles.greyPipeline;
    case "successful":
    case "successfully":
    case "partially successful":
      return styles.greenPipeline;
    case "running":
      return styles.bluePipeline;
    case "scheduled":
    case "pending":
      return styles.yellowPipeline;
    default:
      return styles.greyPipeline;
  }
};

const JobRow: React.FunctionComponent<{ job: JobDTO } & MinifyProp> = ({ job, minify }) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const isHovered = useHover(rowRef);
  const { selectedJobs, isActive: showCheckBox } = useJobsSelectionContext();

  const [expand, toggleExpand] = useSwitch(false);
  const isSelected = useMemo(() => Boolean(selectedJobs?.find((j) => j.id === job.id)), [job, selectedJobs]);
  return (
    <div
      ref={rowRef}
      className={classNames(
        styles.jobStep,
        minify && styles.minified,
        showCheckBox && styles.withCheckBox,
        isSelected && styles.isSelected
      )}
    >
      {showCheckBox && <JobCheckBox className={styles.checkBox} jobId={job.id} />}
      <button
        className={classNames(styles.jobPipeline, expand && styles.expanded, getPipelineClassName(job.current_status))}
        onClick={toggleExpand}
        data-cy={cyKeys.jobs.JOB_STEP_NAME}
      >
        <div className={classNames(styles.cell, styles.jobStepName)}>{job.description || "[ Job name not stated ]"}</div>
        {expand && <JobParameters job={job} />}
      </button>

      <JobId id={job.eui?.path} className={styles.cell} />
      {!minify && <JobDate start={job.submit} authorUsername={job.author?.username} showDevice className={styles.cell} />}
      {!minify && (
        <div className={styles.cell}>
          <JobStatus status={job.current_status} />
        </div>
      )}
      <JobActions job={job} minify={minify} isShown={isHovered} />
    </div>
  );
};

export default JobRow;
