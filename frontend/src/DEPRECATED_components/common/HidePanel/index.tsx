import React, { MouseEventHandler } from "react";

import { CloseIcon } from "../../../ui-lib/Icons/CloseIcon";
import styles from "./HidePanel.module.scss";

interface Props {
  callback: MouseEventHandler<HTMLDivElement>;
}

const HidePanel = ({ callback }: Props) => {
  return (
    <div className={styles.close} onClick={callback}>
      <CloseIcon />
    </div>
  );
};

export default HidePanel;
