import React, { useContext } from "react";
import { DeleteIcon } from "../../../ui-lib/Icons/DeleteIcon";
import { HIDE_DELETE_BUTTON_ON_JOBS_PAGE } from "../../../dev.config";
import InterfaceContext from "../../../DEPRECATED_context/InterfaceContext";
import { PopupTypes } from "../../../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import { MinifyProp } from "../../../types";
import OutlineButton from "../../../ui-lib/components/Button/OutlineButton";
import { OUTLINE_BUTTON_DISABLE_TEXT, OUTLINE_BUTTON_TEXT } from "../../../utils/colors";
import { useJobsSelectionContext } from "../context/JobsSelectionContext";

const DeleteJobButton = ({ minify }: MinifyProp) => {
  const {
    actions: { openPopup },
  } = useContext(InterfaceContext);

  const { selectedJobs } = useJobsSelectionContext();

  if (HIDE_DELETE_BUTTON_ON_JOBS_PAGE) {
    return <></>;
  }

  return (
    <OutlineButton onClick={() => openPopup(PopupTypes.DELETE_SELECTED_JOBS)} disabled={!selectedJobs?.length}>
      <DeleteIcon color={selectedJobs?.length ? OUTLINE_BUTTON_TEXT : OUTLINE_BUTTON_DISABLE_TEXT} />
      {!minify && <span>Delete</span>}
    </OutlineButton>
  );
};

export default DeleteJobButton;
