import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import Checkbox from "../../ui-lib/components/Checkbox/Checkbox";
import InputField from "../../DEPRECATED_components/common/Input/InputField";
import { JobStatuses } from "../../DEPRECATED_common/DEPRECATED_enum/JobStatuses";
import PopupHeader from "../../DEPRECATED_components/Popup/PopupHeader";
import cyKeys from "../../utils/cyKeys";
// import { useJobsListContext } from "./context/JobsListContext";
import { JobsFilter } from "./types";
import useOnFieldChange from "../../ui-lib/hooks/useOnFieldChange";
import RightPopupContainer from "../../ui-lib/components/RightPopup/RightPopupContainer";
import { useShowFilterContext } from "./components/jobPage/layoutContexts";
import LabelWrap from "../../ui-lib/components/formFields/LabelWrap";
import { FilterSwitch } from "../../ui-lib/components/FilterSwitch/FilterSwitch";
import DateRange from "../../ui-lib/components/DateInput/DateRange";
import { DEFAULT_JOB_FILTER_TYPE } from "./components/jobPage/JobsModule";

const allowedForFilterStatuses = [
  JobStatuses.SUCCESSFULLY,
  JobStatuses.RUNNING,
  JobStatuses.SCHEDULED,
  JobStatuses.CANCELED,
  JobStatuses.FAILURE,
];

const FilterJobsPopup = ({
  selectedFilterType,
  setSelectedFilterType,
}: {
  selectedFilterType: string;
  setSelectedFilterType: Dispatch<SetStateAction<string>>;
}) => {
  const [, setShowFilter] = useShowFilterContext();

  // const { filter, setFiltering } = useJobsListContext();
  // const [newFilter, setNewFilter] = useState<JobsFilter>(filter || ({ statuses: [] } as JobsFilter));
  const [newFilter, setNewFilter] = useState<JobsFilter>( ({ statuses: [] } as JobsFilter));

  const isChecked = useCallback(
    (name: JobStatuses) => {
      return [...(newFilter.statuses || [])].findIndex((s) => s === name) > -1;
    },
    [newFilter]
  );

  useEffect(() => {
    const filterType: "By name" | "By EUI" = selectedFilterType === DEFAULT_JOB_FILTER_TYPE ? DEFAULT_JOB_FILTER_TYPE : "By EUI";
    setNewFilter({ ...newFilter, filterType });
  }, [selectedFilterType]);

  const onFieldChange = useOnFieldChange(setNewFilter);

  const onCheckStatus = (val: string) => (check: boolean) => {
    const stats = Array.from(newFilter.statuses || []).filter((s) => s !== val);
    if (check) {
      stats.push(val as JobStatuses);
      onFieldChange("statuses")([...stats]);
    } else {
      onFieldChange("statuses")([...stats].filter((s) => s !== val));
    }
  };
  //
  // const handleSubmit = useCallback(() => {
  //   setFiltering(newFilter);
  //   setShowFilter(false);
  // }, [setFiltering, newFilter]);
  //
  // const handleReset = useCallback(() => {
  //   setFiltering(undefined);
  //   setShowFilter(false);
  // }, [setFiltering, setShowFilter]);

  return (
    <RightPopupContainer
      onClose={() => setShowFilter(false)}
      onCancel={() => {}}
      onSubmit={() => {}}
      // onCancel={handleReset}
      // onSubmit={handleSubmit}
      cancelText="Reset"
      submitText="Apply"
      data-cy={cyKeys.jobs.FILTER_JOBS_POPUP}
    >
      <PopupHeader headerName="Filter" />
      <FilterSwitch
        key={"filterSwitch"}
        options={["By name", "By EUI"]}
        defaultOption={selectedFilterType}
        onChange={setSelectedFilterType}
      />
      <InputField
        placeholder={`${selectedFilterType} contains`}
        name="search_request"
        onChange={onFieldChange("search_request")}
        value={newFilter.search_request}
      />
      <LabelWrap text="Date" withBottomMargin withUpperMargin>
        <DateRange
          start={newFilter.start_date}
          onStartChange={onFieldChange("start_date")}
          end={newFilter.end_date}
          onEndChange={onFieldChange("end_date")}
        />
      </LabelWrap>
      <div style={{ paddingBottom: "20px" }}>
        <InputField placeholder={"Username"} name="username" onChange={onFieldChange("username")} value={newFilter.username ?? ""} />
      </div>
      {selectedFilterType !== "By EUI" && (
        <LabelWrap text="Status" withBottomMargin>
          <div style={{ display: "grid", gap: "5px" }}>
            {allowedForFilterStatuses?.map((name) => (
              <Checkbox placeholder={name} checked={isChecked(name)} onChange={(value: boolean) => onCheckStatus(name)(value)} />
            ))}
          </div>
        </LabelWrap>
      )}
    </RightPopupContainer>
  );
};

export default FilterJobsPopup;
