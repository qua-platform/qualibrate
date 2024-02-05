import React from "react";
import styles from "./styles/Popup.module.scss";

interface PopupHeader {
  headerName: string;
}
const PopupHeader = (props: PopupHeader) => {
  return <div className={styles.header}>{props.headerName}</div>;
};

export default PopupHeader;
