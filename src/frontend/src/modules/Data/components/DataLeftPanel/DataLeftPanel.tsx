import React, { useEffect, useState } from "react";
import styles from "./DataLeftPanel.module.scss";
import { AppliedFilterLabel, DateFilter, SearchField, SortButton } from "../../../../components";
import SnapshotsTimeline from "../SnapshotsTimeline";
import PaginationWrapper from "../Pagination/PaginationWrapper";
import { useSelector } from "react-redux";
import { getBreadCrumbs, getSelectedWorkflow, goBackOneLevel, setSnapshotsFilters } from "../../../../stores/SnapshotsStore";
import { useRootDispatch } from "../../../../stores";
import { SortType } from "../../../../stores/SnapshotsStore/SnapshotsStore";

const sortOptions = [
  {
    label: "Date (Newest first)",
    value: SortType.Date
  },
  {
    label: "Name (A-Z)",
    value: SortType.Name
  },
  {
    label: "Result (Success First)",
    value: SortType.Status
  },
];

const DataLeftPanel: React.FC = () => {
  const dispatch = useRootDispatch();
  const selectedWorkflow = useSelector(getSelectedWorkflow);
  const breadCrumbs = useSelector(getBreadCrumbs);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | undefined>(undefined);
  const [selectedSortType, setSelectedSortType] = useState<SortType>(SortType.Date);
  const [searchText, setSearchText] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  let firstNavigationValue = undefined;
  if (breadCrumbs.length === 1) {
    firstNavigationValue = "← History";
  } else if (breadCrumbs.length >= 2) {
    firstNavigationValue = `← ${breadCrumbs[breadCrumbs.length - 2]}`;
  }

  useEffect(() => {
    dispatch(setSnapshotsFilters({
      sortType: selectedSortType,
      searchString: searchText,
      minDate: fromDate,
      maxDate: toDate,
    }));
  }, [selectedSortType, searchText, fromDate, toDate]);

  const handleOnDateFilterSelect = (dateFilterType?: string) => {
    setSelectedDateFilter(dateFilterType);
    setFromDate("");
    setToDate("");
  };

  const handleOnDateFilterRemove = (filterName?: string) => {
    setSelectedDateFilter(undefined);
    if (filterName === "From") {
      setFromDate("");
    } else if (filterName === "To") {
      setToDate("");
    }
  };

  const handleGoingBackOneLevel = () => {
    dispatch(goBackOneLevel());
  };

  const handleOnSortSelect = (sortType: SortType) => {
    setSelectedSortType(sortType);
  };

  return (
    <div className={styles.dataWrapper}>
      <div className={styles.data}>
        <div className={styles.headerPanel}>
          {selectedWorkflow && (
            <h2>
              <span className={styles.titleArrow} onClick={() => handleGoingBackOneLevel()}>
                {firstNavigationValue}
              </span>
              {breadCrumbs.length > 0 && (
                <>
                  <span className={styles.titleSlash}>/</span>
                  <span className={styles.title}>{selectedWorkflow?.metadata?.name}</span>
                </>
              )}
            </h2>
          )}
          {!selectedWorkflow && <h2>Execution History</h2>}
          <div className={styles.searchFilterContainer}>
            <SearchField placeholder="Search executions..." value={searchText} onChange={setSearchText} debounceMs={500} />
            <DateFilter from={fromDate} to={toDate} setFrom={setFromDate} setTo={setToDate} onSelect={handleOnDateFilterSelect} />
            <SortButton key={"sortFilter"} options={sortOptions} onSelect={handleOnSortSelect} />
          </div>
          <div className={styles.searchFilterContainer}>
            {selectedDateFilter && <AppliedFilterLabel value={selectedDateFilter} onRemove={handleOnDateFilterRemove} label={"Date"} />}
            {fromDate && <AppliedFilterLabel value={fromDate} onRemove={() => handleOnDateFilterRemove("From")} label={"From"} />}
            {toDate && <AppliedFilterLabel value={toDate} onRemove={() => handleOnDateFilterRemove("To")} label={"To"} />}
          </div>
        </div>
        <div className={styles.snapshotsWrapper}>
          <SnapshotsTimeline />
        </div>
        {!selectedWorkflow && <PaginationWrapper />}
      </div>
    </div>
  );
};
export default DataLeftPanel;
