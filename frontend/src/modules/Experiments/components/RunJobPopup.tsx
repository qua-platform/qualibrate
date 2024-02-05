import React, { useCallback, useState } from "react";

import BlueButton from "../../../ui-lib/components/Button/BlueButton";
import InputController from "../../../DEPRECATED_components/common/Input/InputController";
import PopupHeader from "../../../DEPRECATED_components/Popup/PopupHeader";
import PopupItems from "../../../DEPRECATED_components/Popup/PopupItems";
import styles from "./styles/RunJobPopup.module.scss";
import cyKeys from "../../../utils/cyKeys";
import { PopupProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/Popup";
// import { useMQTTContext } from "../../MQTT/MQTTContext";

type Props = PopupProps<{ description: string }>;
const RunJobPopup: React.FC<Props> = ({ onSubmit, onClose }) => {
  const [description, setDescription] = useState<string>("");
  // const { setStatusFromNode, setStatusFromNodeArray } = useMQTTContext();
  const handleSubmit = useCallback(() => {
    onSubmit && onSubmit({ description });
    // setStatusFromNodeArray([]);
    // setStatusFromNode(undefined);
  }, [onSubmit, description]);

  return (
    <div className={styles.popup} data-cy={cyKeys.popup.RUN_JOB_IN_WORKFLOW}>
      <PopupHeader headerName="Add Job" />
      <PopupItems>
        <InputController placeholder="Job description" name="description" onChange={setDescription} />
      </PopupItems>
      <div className={styles.actionButtons}>
        <BlueButton className={styles.popupButton} disabled={!Boolean(description)} onClick={handleSubmit}>
          Submit to queue
        </BlueButton>
        <BlueButton isSecondary className={styles.popupButton} onClick={onClose}>
          Cancel
        </BlueButton>
      </div>
    </div>
  );
};

export default RunJobPopup;
