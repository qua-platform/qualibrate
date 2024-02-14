import React, { useMemo } from "react";
import { classNames } from "../../utils/classnames";
import styles from "./Table.module.scss";

export enum RowTypes {
  HEADER = "HEADER",
  VALUE = "VALUE",
}

interface Props {
  icon?: React.ReactElement;
  editable?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  controls?: React.ReactElement | React.ReactElement[];
  type?: RowTypes;
  position?: "left" | "right" | "center";
  children: React.ReactNode;
}
const Row = ({ icon, editable = false, children, controls, type = RowTypes.VALUE, position = "left", ...restProps }: Props) => {
  const classNameForType = useMemo(() => {
    switch (type) {
      case RowTypes.HEADER:
        return styles.rowHeader;
      default:
        return styles.rowValue;
    }
  }, [type]);

  // const positionStyle = useMemo(() => {
  //   switch (position) {
  //     case "left":
  //       return {
  //         justifyContent: "",
  //       };
  //     case "right":
  //       return {};
  //   }
  // }, [position]);

  return (
    <div className={classNames(styles.row, classNameForType)} {...restProps}>
      {icon}
      <div className={styles.rowValue}>{children}</div>
      <div className={styles.rowControls}>{controls}</div>
    </div>
  );
};

export default Row;
