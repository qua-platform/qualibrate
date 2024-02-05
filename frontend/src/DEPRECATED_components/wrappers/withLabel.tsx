import React, { useMemo } from "react";

import { classNames } from "../../utils/classnames";
import styles from "./styles/withLabel.module.scss";

interface Props {
  children: React.ReactElement;
  className?: string;
  position?: "right" | "left" | "bottom" | "top";
  label: string;
}
const WithLabel = ({ children, className, position, label = "Custom label" }: Props) => {
  const positionedStyles: React.CSSProperties = useMemo(() => {
    switch (position) {
      case "bottom":
        return { flexDirection: "column", alignItems: "start" };
      case "top":
        return { flexDirection: "column-reverse", alignItems: "start" };
      case "left":
        return { flexDirection: "row-reverse" };
      default:
        return { flexDirection: "row" };
    }
  }, [position]);

  return (
    <div className={classNames(styles.withLabel, className)} style={positionedStyles}>
      {children}
      <span>{label}</span>
    </div>
  );
};

export default WithLabel;
