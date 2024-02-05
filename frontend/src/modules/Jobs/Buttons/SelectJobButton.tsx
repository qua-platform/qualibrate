import React from "react";
import CancelButton from "../../../DEPRECATED_components/DEPRECATED_Buttons/CancelButton";
import { CheckedIcon } from "../../../ui-lib/Icons/CheckedIcon";
import cyKeys from "../../../utils/cyKeys";
import OutlineButton from "../../../ui-lib/components/Button/OutlineButton";
import { OUTLINE_BUTTON_TEXT } from "../../../utils/colors";
import { useJobsSelectionContext } from "../context/JobsSelectionContext";

const SelectJobButton = () => {
  const { unselectAllJobs, setIsActive: setSelectionMode, isActive: isSelectMode } = useJobsSelectionContext();

  const enableSelectingMode = () => {
    setSelectionMode(true);
  };

  const disableSelectingMode = () => {
    setSelectionMode(false);
    unselectAllJobs();
  };

  if (isSelectMode) {
    return <CancelButton onClick={disableSelectingMode} />;
  }

  return (
    <OutlineButton onClick={enableSelectingMode} isCircle title={"Select jobs"} data-cy={cyKeys.jobs.SELECT_JOB_BUTTON}>
      <CheckedIcon color={OUTLINE_BUTTON_TEXT} />
    </OutlineButton>
  );
};

export default SelectJobButton;
