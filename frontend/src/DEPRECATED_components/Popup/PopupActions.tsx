import React from "react";
import styles from "./styles/Popup.module.scss";

interface Props {
  children: JSX.Element[] | JSX.Element;
}
const PopupActions = ({ children }: Props) => {
  return <div className={styles.actions}>{children}</div>;
};

export default PopupActions;
