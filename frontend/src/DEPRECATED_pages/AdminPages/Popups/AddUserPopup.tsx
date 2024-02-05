import React, { useContext } from "react";
import InputController from "../../../DEPRECATED_components/common/Input/InputController";
import PopupActions from "../../../DEPRECATED_components/Popup/PopupActions";
import PopupContainer from "../../../DEPRECATED_components/Popup/PopupContainer";
import PopupHeader from "../../../DEPRECATED_components/Popup/PopupHeader";
import PopupItems from "../../../DEPRECATED_components/Popup/PopupItems";
import { PopupTypes } from "../../../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import styles from "../../styles/AdminPage.module.scss";
import BlueButton from "../../../ui-lib/components/Button/BlueButton";
import InterfaceContext from "../../../DEPRECATED_context/InterfaceContext";
import { InputTypes } from "../../../DEPRECATED_common/DEPRECATED_interfaces/InputTypes";
import { UserApi } from "../../../DEPRECATED_common/DEPRECATED_api/user";
import UserContext from "../../../DEPRECATED_context/UserContext";
import { toast } from "react-toastify";

const AddUserPopup = () => {
  const {
    actions: { closeCurrentPopup },
  } = useContext(InterfaceContext);
  const { getUsers } = useContext(UserContext);

  const handleSubmit = async (data: any) => {
    if (data.password === data.confirm_password) {
      const resp = await UserApi.createUser(data);
      console.log(resp);
      if ((resp as any).error) {
        toast((resp as any).error, { type: "error" });
      } else {
        toast("New user added", { type: "success" });
        await getUsers();
        closeCurrentPopup(PopupTypes.ADD_USER);
      }
    } else {
      alert("password and confirm password don't match");
    }
  };

  return (
    <PopupContainer formName="addNewUser" customClassName={styles.changePasswordPopup} type={PopupTypes.ADD_USER} onSubmit={handleSubmit}>
      <PopupHeader headerName="Add user" />
      <PopupItems>
        <InputController fieldName={"User name"} name={"username"} newLineBetween={true} onChange={() => {}} />
        <InputController fieldName={"First name"} name={"name"} newLineBetween={true} onChange={() => {}} />
        <InputController fieldName={"Last name"} name={"surname"} newLineBetween={true} onChange={() => {}} />
        <InputController fieldName={"Password"} name={"password"} type={InputTypes.PASSWORD} newLineBetween={true} onChange={() => {}} />
        <InputController
          fieldName={"Confirm password"}
          name={"confirm_password"}
          type={InputTypes.PASSWORD}
          newLineBetween={true}
          onChange={() => {}}
        />
      </PopupItems>
      <PopupActions>
        <BlueButton
          isSecondary
          onClick={() => {
            closeCurrentPopup(PopupTypes.ADD_USER);
          }}
        >
          Cancel
        </BlueButton>
        <BlueButton type="submit">Add</BlueButton>
      </PopupActions>
    </PopupContainer>
  );
};

export default AddUserPopup;
