import React from "react";

import DEPRECATEDButton from "../../../DEPRECATED_components/DEPRECATED_Buttons/ButtonWrapper";
import { ButtonProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/ButtonProps";
import { ButtonTypes } from "../../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import styles from "./LogoutButton.module.scss";
import { useAuthContext } from "../AuthContext";
import cyKeys from "../../../utils/cyKeys";

interface UserProps {
  firstName?: string;
  secondName?: string;
  username?: string;
}

type LogoutButtonProps = UserProps & ButtonProps & { hideText: boolean };

export const USER_INITIALS = "A";

const LogoutButton: React.FunctionComponent<LogoutButtonProps> = (props: LogoutButtonProps) => {
  const { hideText } = props;
  const { logout } = useAuthContext();

  return (
    <button className={styles.wrapper} data-cy={cyKeys.login.LOGOUT_BUTTON} onClick={logout} title="Log out">
      <div className={styles.userThumb} data-cy={cyKeys.login.LOGOUT_THUMBNAIL}>
        {USER_INITIALS}
      </div>
      {!hideText && <div>Logout</div>}
    </button>
  );
};

export default LogoutButton;
