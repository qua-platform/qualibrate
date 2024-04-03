import React, { useCallback, useEffect, useState } from "react";
import PopupHeader from "../../../../DEPRECATED_components/Popup/PopupHeader";
import cyKeys from "../../../../utils/cyKeys";
import RightPopupContainer from "../../../../ui-lib/components/RightPopup/RightPopupContainer";
import { PopupProps } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/Popup";
import LabelWrap from "../../../../ui-lib/components/formFields/LabelWrap";
import { FilterSwitch } from "../../../../ui-lib/components/FilterSwitch/FilterSwitch";
import InputField from "../../../../DEPRECATED_components/common/Input/InputField";

const FilterExperimentsPopup: React.FC<PopupProps> = ({ selectedFilterType, setSelectedFilterType, onClose }) => {
  // const { filter, setFiltering } = useJobsListContext();
  // const [newFilter, setNewFilter] = useState<JobsFilter>(
  //   filter || {
  //     statuses: [],
  //   }
  // );

  // useEffect(() => {
  //   const filterType: "By name" | "By EUI" = selectedFilterType === DEFAULT_JOB_FILTER_TYPE ? DEFAULT_JOB_FILTER_TYPE : "By EUI";
  //   setNewFilter({ ...newFilter, filterType });
  // }, [selectedFilterType]);

  // const submitFilter = useCallback(() => {
  //   setFiltering(newFilter);
  //   onClose();
  // }, [newFilter]);
  // const resetFilter = () => {
  //   setFiltering(FIXED_DATA_JOBS_FILTER);
  //   onClose();
  // };

  // const onFieldChange = useOnFieldChange(setNewFilter);

  return (
    <RightPopupContainer
      onClose={onClose}
      // onCancel={resetFilter}
      // onSubmit={submitFilter}
      cancelText="Reset"
      submitText="Apply"
      data-cy={cyKeys.popup.FILTER_EXPERIMENTS_POPUP}
    >
      <PopupHeader headerName="Filter" />
      <FilterSwitch
        key={"filterSwitch"}
        options={["By name", "By EUI"]}
        defaultOption={selectedFilterType ?? ""}
        onChange={setSelectedFilterType ? setSelectedFilterType : () => {}}
      />
      <InputField
        placeholder={`${selectedFilterType} contains`}
        name="search_request"
        onChange={() => {}}
        value={""}
        // onChange={onFieldChange("search_request")}
        // value={newFilter.search_request ?? ""}
      />
      <LabelWrap text="Date" withBottomMargin withUpperMargin>
        {/*<DateRange*/}
        {/*  start={newFilter.start_date}*/}
        {/*  onStartChange={onFieldChange("start_date")}*/}
        {/*  end={newFilter.end_date}*/}
        {/*  onEndChange={onFieldChange("end_date")}*/}
        {/*/>*/}
      </LabelWrap>
      {/*<InputField placeholder={"Username"} name="username" onChange={onFieldChange("username")} value={newFilter.username ?? ""} />*/}
      <InputField placeholder={"Username"} name="username" onChange={() => {}} value={""} />
    </RightPopupContainer>
  );
};

export default FilterExperimentsPopup;
