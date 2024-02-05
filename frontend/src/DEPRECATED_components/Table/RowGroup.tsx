import React, { CSSProperties } from "react";
import { classNames } from "../../utils/classnames";
import styles from "./RowGroup.module.scss";

interface Props {
  className?: string;
  children: React.ReactNode;
  highlight?: boolean;
  gridStyle?: CSSProperties["gridTemplateColumns"];
  isClickable?: boolean;
}
const RowGroup = ({ children, className, highlight, gridStyle, isClickable }: Props) => {
  return (
    <div
      className={classNames(styles.rowGroup, className, highlight && styles.highlight, isClickable && styles.isClickable)}
      style={gridStyle ? { gridTemplateColumns: gridStyle, display: "grid", gap: "8px" } : {}}
    >
      {children}
    </div>
  );
};

export default RowGroup;
