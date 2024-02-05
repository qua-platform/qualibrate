import React, { useContext } from "react";

import InputController from "../../../DEPRECATED_components/common/Input/InputController";
import InterfaceContext from "../../../DEPRECATED_context/InterfaceContext";
import PopupActions from "../../../DEPRECATED_components/Popup/PopupActions";
import PopupContainer from "../../../DEPRECATED_components/Popup/PopupContainer";
import PopupHeader from "../../../DEPRECATED_components/Popup/PopupHeader";
import PopupItems from "../../../DEPRECATED_components/Popup/PopupItems";
import { PopupTypes } from "../../../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import styles from "../../styles/AdminPage.module.scss";
import BlueButton from "../../../ui-lib/components/Button/BlueButton";

const ChangeAdminPasswordPopup = () => {
  const {
    actions: { closeCurrentPopup },
  } = useContext(InterfaceContext);

  return (
    <PopupContainer formName="changeAdminPassword" customClassName={styles.changePasswordPopup} type={PopupTypes.CHANGE_ADMIN_PASSWORD}>
      <PopupHeader headerName="Change admin password" />
      <PopupItems>
        <InputController placeholder="Current password" name="current_password" defaultValue="********" onChange={() => {}} />
        <InputController placeholder="New password" name="new_password" defaultValue="********" onChange={() => {}} />
        <InputController placeholder="Confirm password" name="confirm_password" defaultValue="********" onChange={() => {}} />
      </PopupItems>
      <PopupActions>
        <BlueButton onClick={() => closeCurrentPopup(PopupTypes.CHANGE_ADMIN_PASSWORD)}>Cancel</BlueButton>
        <BlueButton type="submit">Apply</BlueButton>
      </PopupActions>
    </PopupContainer>
  );
};

export default ChangeAdminPasswordPopup;
