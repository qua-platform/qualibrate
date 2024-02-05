import { useRef, useState } from "react";

import { EmptyWorkflowIcon } from "../../../ui-lib/Icons/EmptyWorkflowIcon";
import { WorkflowIcon } from "../../../ui-lib/Icons/WorkflowIcon";
import styles from "../styles/NewWorkflowPopup.module.scss";
import cyKeys from "../../../utils/cyKeys";
import IconButton from "../../../ui-lib/components/Button/IconButton";
import useOnClickOutside from "../../../ui-lib/hooks/useOnClickOutside";
import useAddEmptyWorkflow from "./useAddEmptyWorkflow";
import { PopupProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/Popup";
import AddJobPopup from "./AddJobPopup";

const CreateNewWorkflowPopup = ({ onClose }: PopupProps) => {
  const popupRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(popupRef, onClose);

  const [showJobPopup, setShowJobPopup] = useState(false);
  const [handleAddEmpty, addEmptyStatus] = useAddEmptyWorkflow((isOk) => {
    isOk && onClose();
  });

  // TODO: See what the writer wanted to say because this don't make any sense and the code doesn't do anything
  // useEffect(() => {
  //   return () => console.log("unmount");
  // }, []);

  return (
    <div className={styles.popup} ref={popupRef}>
      {showJobPopup && <AddJobPopup onClose={onClose} />}
      <IconButton
        title="New empty workflow"
        withText
        icon={EmptyWorkflowIcon}
        onClick={handleAddEmpty}
        className={styles.addJobButton}
        status={addEmptyStatus}
      />
      <IconButton
        title="New from existing workflow"
        icon={WorkflowIcon}
        withText
        onClick={() => setShowJobPopup(true)}
        data-cy={cyKeys.jobs.EXISTING_WORKFLOW_BUTTON}
        className={styles.addJobButton}
      />
    </div>
  );
};

export default CreateNewWorkflowPopup;
