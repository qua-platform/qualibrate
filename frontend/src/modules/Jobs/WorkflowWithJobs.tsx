import React, { useCallback, useEffect } from "react";

// import { JobDTO } from "../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import JobItems from "./components/jobPage/JobItems";
import WorkflowHeader from "./WorkflowHeader";
import styles from "./components/jobPage/Job.module.scss";
import useSwitch from "@react-hook/switch";
// import { useJobsListContext } from "./context/JobsListContext";
import { classNames } from "../../utils/classnames";
import { WorkflowDTO } from "../Experiments/types";

interface Props {
  workflow: WorkflowDTO;
  // jobFilterCallback?: () => void;
  groupHeader?: React.ReactElement;
}

const WorkflowWithJobs = ({ workflow, groupHeader }: Props) => {
  const [contentIsVisible, toggleContentAppearance] = useSwitch(false);

  // const { list: jobs, filter } = useJobsListContext();

  // useEffect(() => {
  //   if (!filter) {
  //     return;
  //   }
  //
  //   toggleContentAppearance.on();
  //   return () => {
  //     toggleContentAppearance.off();
  //   };
  // }, [filter]);

  // const filterCallback = useCallback(
  //   (job: JobDTO, index: number, jobs: JobDTO[]) => {
  //     if (jobFilterCallback) {
  //       return jobFilterCallback(job, index, jobs);
  //     }
  //
  //     return job.workflow_id === workflow.id;
  //   },
  //   [jobFilterCallback, workflow.id]
  // );

  const workflowJobs: any =[];
  // const workflowJobs = jobs?.filter(filterCallback);

  // const jobsList = workflowJobs && <JobItems workflowId={workflow?.id} jobs={workflowJobs} />;
  const jobsList = workflowJobs && <JobItems jobs={workflowJobs} />;

  const workflowHeader = (
    <WorkflowHeader workflow={workflow} onClickCallback={toggleContentAppearance} showInfo={contentIsVisible} headerName={groupHeader} />
  );

  return (
    <div className={classNames(styles.job, contentIsVisible && styles.expanded)}>
      {workflowHeader}
      {contentIsVisible && jobsList}
    </div>
  );
};

export default WorkflowWithJobs;
