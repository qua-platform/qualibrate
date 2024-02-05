import React, { useMemo } from "react";
import { ButtonProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/ButtonProps";
import { CompareIcon } from "../../../ui-lib/Icons/CompareIcon";
import { OUTLINE_BUTTON_DISABLE_TEXT, OUTLINE_BUTTON_TEXT } from "../../../utils/colors";
import OutlineButton from "../../../ui-lib/components/Button/OutlineButton";
import cyKeys from "../../../utils/cyKeys";
import { useDiffVisibilityContext } from "../context/DiffVisibilityContext";
import { useJobsSelectionContext } from "../context/JobsSelectionContext";

const CompareButton = ({ minify, ...props }: ButtonProps) => {
  const { selectedJobs } = useJobsSelectionContext();

  const { setDiffIsShown } = useDiffVisibilityContext();

  const isActive = useMemo(() => Boolean(selectedJobs && selectedJobs?.length >= 2), [selectedJobs]);

  return (
    <OutlineButton
      onClick={() => {
        setDiffIsShown(true);
      }}
      disabled={!isActive}
      data-cy={cyKeys.jobs.COMPARE_BUTTON}
    >
      <CompareIcon color={isActive ? OUTLINE_BUTTON_TEXT : OUTLINE_BUTTON_DISABLE_TEXT} />
      {!minify && <span>Compare</span>}
    </OutlineButton>
  );
};

export default CompareButton;
