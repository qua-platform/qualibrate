import React, { useState } from "react";
import BlueButton from "../../../ui-lib/components/Button/BlueButton";
import { BLUE_BUTTON_TEXT } from "../../../utils/colors";
import { AddIcon } from "../../../ui-lib/Icons/AddIcon";
import cyKeys from "../../../utils/cyKeys";
import CreateNewWorkflowPopup from "../createNewWorkflow/CreateNewWorkflowPopup";

const AddJobButton = () => {
  const [showNewWorkflowPopup, setShowNewWorkflowPopup] = useState(false);

  return (
    <>
      {showNewWorkflowPopup && <CreateNewWorkflowPopup onClose={() => setShowNewWorkflowPopup(false)} />}
      <BlueButton
        onClick={() => setShowNewWorkflowPopup((s) => !s)}
        key={4}
        style={{ gap: "10px" }}
        data-cy={cyKeys.jobs.ADD_JOB_BUTTON}
        title="Create new job"
        isCircle
      >
        <AddIcon color={BLUE_BUTTON_TEXT} height={12} width={12} />
      </BlueButton>
    </>
  );
};

export default AddJobButton;
