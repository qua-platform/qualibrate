import React from "react";
import styles from "./styles/Popup.module.scss";

interface Props {
  children?: React.ReactNode;
}
const PopupText: React.FunctionComponent<Props> = ({ children }: Props) => {
  return <div className={styles.text}>{children}</div>;
};

export default PopupText;
