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

const ChangeOrganisationNamePopup = () => {
  const {
    actions: { closeCurrentPopup },
  } = useContext(InterfaceContext);

  return (
    <PopupContainer formName="addJobForm" customClassName={styles.changePasswordPopup} type={PopupTypes.CHANGE_ORGANISATION_NAME}>
      <PopupHeader headerName="Change organisation name" />
      <PopupItems>
        <InputController
          placeholder="Your organisation name"
          name="organisation_name"
          defaultValue="Schrodinger’s lab"
          label="Your organisation name"
          onChange={() => {}}
        />
      </PopupItems>
      <PopupActions>
        <BlueButton onClick={() => closeCurrentPopup(PopupTypes.CHANGE_ORGANISATION_NAME)}>Cancel</BlueButton>
        <BlueButton type="submit">Apply</BlueButton>
      </PopupActions>
    </PopupContainer>
  );
};

export default ChangeOrganisationNamePopup;
