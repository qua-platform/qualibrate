import { PopupModes, PopupTypes } from "../../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import React, { useContext } from "react";

import DEPRECATEDButton from "../../DEPRECATED_components/DEPRECATED_Buttons/ButtonWrapper";
import { ButtonTypes } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import InterfaceContext from "../../DEPRECATED_context/InterfaceContext";
import PopupActions from "../../DEPRECATED_components/Popup/PopupActions";
import PopupContainer from "../../DEPRECATED_components/Popup/PopupContainer";
import PopupHeader from "../../DEPRECATED_components/Popup/PopupHeader";
import PopupItems from "../../DEPRECATED_components/Popup/PopupItems";
import PopupText from "../../DEPRECATED_components/Popup/PopupText";
import { useJobsSelectionContext } from "./context/JobsSelectionContext";

const DeleteSelectedJobsPopup = () => {
  const {
    actions: { closeCurrentPopup },
  } = useContext(InterfaceContext);

  // const { deleteSelectedJobs } = useJobsSelectionContext();

  const handleDeletion = () => {
    closeCurrentPopup(PopupTypes.DELETE_SELECTED_JOBS);
    // deleteSelectedJobs();
  };

  return (
    <PopupContainer type={PopupTypes.DELETE_SELECTED_JOBS} mode={PopupModes.CENTER_VIEW}>
      <PopupHeader headerName="Delete jobs" />
      <PopupItems>
        <PopupText>Are you sure you want to delete the selected jobs?</PopupText>
      </PopupItems>
      <PopupActions>
        <DEPRECATEDButton
          actionName="Cancel"
          type={ButtonTypes.ACTION}
          onClickCallback={closeCurrentPopup.bind({}, PopupTypes.DELETE_SELECTED_JOBS)}
        />
        <DEPRECATEDButton actionName="Delete" type={ButtonTypes.ACTION} onSubmitType="submit" onClickCallback={handleDeletion} />
      </PopupActions>
    </PopupContainer>
  );
};

export default DeleteSelectedJobsPopup;
