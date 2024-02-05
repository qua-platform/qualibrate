import React, { KeyboardEvent, KeyboardEventHandler, useContext, useEffect, useState } from "react";
import styles from "./JobsList.module.scss";
import cyKeys from "../../../utils/cyKeys";
import { withContexts } from "../../../ui-lib/hooks/withContexts";
import JobsListContextProvider, { useJobsListContext } from "../../Jobs/context/JobsListContext";
import OrderSortButton from "../../Jobs/components/OrderSortButton";
import { JobStatuses } from "../../../DEPRECATED_common/DEPRECATED_enum/JobStatuses";
import FilterExperimentsPopup from "../jobsList/filter/FilterExperimentsPopup";
import FilterButton from "../../../DEPRECATED_components/DEPRECATED_Buttons/FilterButton";
import { DEFAULT_JOB_FILTER_TYPE } from "../../Jobs/components/jobPage/JobsModule";
import { JobsFilter } from "../../Jobs/types";
import { DisplayMessage } from "../../Jobs/components/jobPage/JobList";
import JobEntry from "./JobEntry";
import PaginationWrapper from "../../Pagination/PaginationWrapper";
import DataViewContext from "../context/DataViewContext";
import { JobDTO } from "../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";

export const FIXED_DATA_JOBS_FILTER = {
  statuses: [JobStatuses.SUCCESSFULLY, JobStatuses.TERMINATED],
};

const checkIfFilterIsApplied = (filter: JobsFilter | undefined) => {
  return filter !== undefined && Object.keys(filter).filter((prop) => prop !== "statuses").length > 0;
};
const JobsList = () => {
  const { list, filter, setFiltering, message, setPageNumber, totalPages } = useJobsListContext();
  const [filterIsApplied, setFilterIsApplied] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string>(DEFAULT_JOB_FILTER_TYPE);
  const [indexOfSelectedJob, setIndexOfSelectedJob] = useState<number>(-1);
  const { selectJob } = useContext(DataViewContext);

  const handleChangeSelectedJob: KeyboardEventHandler<HTMLDivElement> = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp" && list && indexOfSelectedJob - 1 >= 0) {
      selectJob(list[indexOfSelectedJob - 1]);
      setIndexOfSelectedJob(indexOfSelectedJob - 1);
    } else if (event.key === "ArrowDown" && list && indexOfSelectedJob < list.length - 1) {
      selectJob(list[indexOfSelectedJob + 1]);
      setIndexOfSelectedJob(indexOfSelectedJob + 1);
    }
  };

  const onClickHandler = (job: JobDTO, index: number) => {
    selectJob(job);
    setIndexOfSelectedJob(index);
  };

  useEffect(() => {
    setFiltering(FIXED_DATA_JOBS_FILTER);
  }, []);
  useEffect(() => {
    setFilterIsApplied(checkIfFilterIsApplied(filter));
  }, [filter]);
  return (
    <div className={styles.listWrapper} data-cy={cyKeys.data.EXPERIMENT_LIST}>
      {showFilter && (
        <FilterExperimentsPopup
          selectedFilterType={selectedFilterType}
          setSelectedFilterType={setSelectedFilterType}
          onClose={() => setShowFilter(false)}
        />
      )}
      <div className={styles.listHeader}>
        <div className={styles.header}>Select job</div>
        <OrderSortButton minify />
        <FilterButton key={3} isApplied={filterIsApplied} onClick={() => setShowFilter((s) => !s)} dataCy={cyKeys.data.FILTER_BUTTON} />
      </div>
      <div className={styles.list} onKeyDown={handleChangeSelectedJob}>
        {!list?.length && DisplayMessage((message as { detail: string })?.detail ?? "No jobs were found", true)}
        {list?.map((job, index) => (
          <JobEntry key={job.id} job={job} handleOnClick={() => onClickHandler(job, index)} />
        ))}
        <PaginationWrapper numberOfPages={totalPages} setPageNumber={setPageNumber} />
      </div>
    </div>
  );
};

export default withContexts(JobsList, [JobsListContextProvider]);
