import React, { useContext, useMemo, useState } from "react";

import JobItems from "./components/jobPage/JobItems";
import WorkflowContext from "../Experiments/context/WorkflowContext";
import WorkflowHeader from "./WorkflowHeader";
import styles from "./components/jobPage/Job.module.scss";
import { useJobsListContext } from "./context/JobsListContext";
import { groupJobsByDate } from "./components/jobList/utils/jobsGrouping";
import { classNames } from "../../utils/classnames";

const GroupedByDateJobs = () => {
  const { currentWorkflow } = useContext(WorkflowContext);
  const { list } = useJobsListContext();
  const groupedByDatesJobs = useMemo(() => groupJobsByDate(list), [list]);

  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [name]: !expandedGroups[name],
    }));
  };

  return (
    <>
      {groupedByDatesJobs &&
        Object.keys(groupedByDatesJobs)?.map((dateName) => (
          <div className={classNames(styles.job, expandedGroups[dateName] && styles.expanded)}>
            <WorkflowHeader
              onClickCallback={() => toggleGroup(dateName)}
              showInfo={expandedGroups[dateName]}
              headerName={dateName}
              workflow={currentWorkflow}
            />
            {expandedGroups[dateName] && <JobItems jobs={groupedByDatesJobs[dateName]} />}
          </div>
        ))}
    </>
  );
};

export default GroupedByDateJobs;
