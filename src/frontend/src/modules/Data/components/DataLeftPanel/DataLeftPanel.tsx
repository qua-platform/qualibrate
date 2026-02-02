import React, {useEffect, useState} from "react";
import styles from "./DataLeftPanel.module.scss";
import {AppliedFilterLabel, DateFilter, SearchField, SortButton, TagFilter} from "../../../../components";
import SnapshotsTimeline from "../SnapshotsTimeline";
import PaginationWrapper from "../Pagination/PaginationWrapper";
import {useSelector} from "react-redux";
import {getBreadCrumbs, getSelectedWorkflow, goBackOneLevel, setSnapshotsFilters} from "../../../../stores/SnapshotsStore";
import {useRootDispatch} from "../../../../stores";
import {SortType} from "../../../../stores/SnapshotsStore/SnapshotsStore";
import {classNames} from "../../../../utils/classnames";
import {stringToHexColor} from "../ExecutionCard/components/TagsList/helpers";

export enum DateOption {
    Today = "Today",
    LastWeek = "LastWeek",
    LastMonth = "LastMonth",
}

const defaultOptions = [
    {
        label: "Today",
        value: DateOption.Today,
    },
    {
        label: "Last 7 days",
        value: DateOption.LastWeek,
    },
    {
        label: "Last 30 days",
        value: DateOption.LastMonth,
    },
];

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
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    let firstNavigationValue = undefined;
    if (breadCrumbs.length === 1) {
        firstNavigationValue = "← History";
    } else if (breadCrumbs.length >= 2) {
        firstNavigationValue = `← ${breadCrumbs[breadCrumbs.length - 2]}`;
    }

    useEffect(() => {
        dispatch(setSnapshotsFilters({
            tags: selectedTags,
            sortType: selectedSortType,
            searchString: searchText,
            minDate: fromDate,
            maxDate: toDate,
        }));
    }, [selectedSortType, searchText, fromDate, toDate, selectedTags]);

    const handleOnDateFilterSelect = (dateFilterType?: { value: DateOption; label: string }) => {
        setSelectedDateFilter(dateFilterType?.label);
        const today = new Date();
        const dateToString = (date: Date) => `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

        switch (dateFilterType?.value) {
            case DateOption.Today: {
                setFromDate(dateToString(today));
                setToDate(dateToString(today));
                break;
            }
            case DateOption.LastWeek: {
                const weekBefore = new Date(today);
                weekBefore.setDate(today.getDate() - 7);

                setFromDate(dateToString(weekBefore));
                setToDate(dateToString(today));
                break;
            }
            case DateOption.LastMonth: {
                const monthBefore = new Date(today);
                monthBefore.setMonth(today.getMonth() - 1);

                setFromDate(dateToString(monthBefore));
                setToDate(dateToString(today));
                break;
            }
        }
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

    const handleSetFrom = (from: string) => {
        setSelectedDateFilter(undefined);
        setFromDate(from);
    };

    const handleSetTo = (to: string) => {
        setSelectedDateFilter(undefined);
        setToDate(to);
    };
    const handleToggleTag = (tagName: string) => {
        const indexOfSelectedTag = selectedTags.indexOf(tagName);
        if (indexOfSelectedTag === -1) {
            setSelectedTags([...selectedTags, tagName]);
        } else {
            setSelectedTags([...selectedTags.filter((tag) => tag !== tagName)]);
        }
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
                        <SearchField placeholder="Search executions..." value={searchText} onChange={setSearchText}
                                     debounceMs={500}/>
                        <DateFilter options={defaultOptions} from={fromDate} to={toDate} setFrom={handleSetFrom}
                                    setTo={handleSetTo} onSelect={handleOnDateFilterSelect}/>
                        <SortButton key={"sortFilter"} options={sortOptions} onSelect={handleOnSortSelect}/>
                        <TagFilter key={"tagFilter"} selectedTags={selectedTags} handleToggleTag={handleToggleTag}/>
                    </div>
                    <div className={classNames(styles.searchFilterContainer, styles.wrapAppliedFilters)}>
                        {selectedDateFilter &&
                            <AppliedFilterLabel value={selectedDateFilter} onRemove={handleOnDateFilterRemove} label={"Date"}/>}
                        {!selectedDateFilter && fromDate &&
                            <AppliedFilterLabel value={fromDate} onRemove={() => handleOnDateFilterRemove("From")} label={"From"}/>}
                        {!selectedDateFilter && toDate &&
                            <AppliedFilterLabel value={toDate} onRemove={() => handleOnDateFilterRemove("To")} label={"To"}/>}
                        {selectedTags.map(tag => <AppliedFilterLabel value={tag} showDot={true} dotColor={stringToHexColor(tag)}
                                                                     onRemove={() => handleToggleTag(tag)}/>)}
                    </div>
                </div>
                <div className={styles.snapshotsWrapper}>
                    <SnapshotsTimeline/>
                </div>
                {!selectedWorkflow && <PaginationWrapper/>}
            </div>
        </div>
    );
};
export default DataLeftPanel;
