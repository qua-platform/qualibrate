import React from "react";
import { ArrowIcon } from "../../../../ui-lib/Icons/ArrowIcon";

import styles from "./styles/DiffPanel.module.scss";

type Props = {
  name: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  active: boolean;
};

const DiffPanel = ({ name, onClick, active }: Props) => {
  const Icon = <ArrowIcon options={{ rotationDegree: !active ? 180 : 0 }} />;
  return (
    <div onClick={onClick} className={styles.panel}>
      {name} {Icon}
    </div>
  );
};

export default DiffPanel;
