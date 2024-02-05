import React from "react";
import { UserFilledIcon } from "../../ui-lib/Icons/UserFilledIcon";
import styles from "./User.module.scss";

const UserThumbnail = () => {
  return (
    <div className={styles.thumbnail}>
      <UserFilledIcon />
    </div>
  );
};

export default UserThumbnail;
