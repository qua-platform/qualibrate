import React from "react";
import UserThumbnail from "./UserThumbnail";
import styles from "./User.module.scss";
import { classNames } from "../../utils/classnames";

interface Props {
  isSelected?: boolean;
  name: string;
  surname?: string;
  thumbnailURL?: string;
  onClick: () => void;
}

const User = ({ isSelected = false, name = "", surname, onClick }: Props) => {
  return (
    <div key={`${name}-${surname ?? ""}`} className={classNames(styles.wrapper, isSelected && styles.active)} onClick={onClick}>
      <UserThumbnail />
      <div className={classNames(styles.userName, isSelected && styles.active)}>{`${name} ${surname ?? ""}`}</div>
    </div>
  );
};

export default User;
