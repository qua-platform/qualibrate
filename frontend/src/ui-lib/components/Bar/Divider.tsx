import React from "react";
import styles from "./Divider.module.scss";
import { classNames } from "../../../utils/classnames";

interface DividerProps {
  width?: number;
  marginLeft?: number;
  height?: number;
  className?: string;
}

const Divider: React.FC<DividerProps> = ({
  width = 855,
  marginLeft = 0,
  height = 1,
  className,
}) => {
  return (
    <div
      className={classNames(styles.divider, className)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        marginLeft: `${marginLeft}px`,
        marginTop: "1px",
        marginBottom: "1px",
      }}
    />
  );
};

export default Divider;