import React from "react";
import styles from "./JobsList.module.scss";
import cyKeys from "../../../utils/cyKeys";
// import OrderSortButton from "../../Jobs/components/OrderSortButton";
// import { JobStatuses } from "../../../DEPRECATED_common/DEPRECATED_enum/JobStatuses";
// import FilterExperimentsPopup from "../jobsList/filter/FilterExperimentsPopup";
// import FilterButton from "../../../DEPRECATED_components/DEPRECATED_Buttons/FilterButton";
// import { DEFAULT_JOB_FILTER_TYPE } from "../../Jobs/components/jobPage/JobsModule";

// export const FIXED_DATA_JOBS_FILTER = {
//   statuses: [JobStatuses.SUCCESSFULLY, JobStatuses.TERMINATED],
// };

const JobsList = () => {
  // const [filterIsApplied] = useState<boolean>(false);
  // const [showFilter, setShowFilter] = useState<boolean>(false);
  // const [selectedFilterType, setSelectedFilterType] = useState<string>(DEFAULT_JOB_FILTER_TYPE);

  // const handleChangeSelectedJob: KeyboardEventHandler<HTMLDivElement> = () => {};

  return (
    <div className={styles.listWrapper} data-cy={cyKeys.data.EXPERIMENT_LIST}>
      {/*{showFilter && (*/}
      {/*  <FilterExperimentsPopup*/}
      {/*    selectedFilterType={selectedFilterType}*/}
      {/*    setSelectedFilterType={setSelectedFilterType}*/}
      {/*    onClose={() => setShowFilter(false)}*/}
      {/*  />*/}
      {/*)}*/}
      {/*<div className={styles.listHeader}>*/}
      {/*  <div className={styles.header}>Select job</div>*/}
      {/*  <OrderSortButton minify />*/}
      {/*  <FilterButton key={3} isApplied={filterIsApplied} onClick={() => setShowFilter((s) => !s)} dataCy={cyKeys.data.FILTER_BUTTON} />*/}
      {/*</div>*/}
      {/*<div className={styles.list} onKeyDown={handleChangeSelectedJob}></div>*/}
    </div>
  );
};

export default JobsList;
