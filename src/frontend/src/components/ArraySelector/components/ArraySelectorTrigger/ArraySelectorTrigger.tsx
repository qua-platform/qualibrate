import React from "react";
import styles from "./ArraySelectorTrigger.module.scss";
import { classNames } from "../../../../utils/classnames";

const MAX_SHOWN_VALUES = 2;

const ArraySelectorTrigger = ({
  value,
  disabled,
  onClick,
  icon,
}: {
  value?: string[] | string;
  disabled: boolean
  onClick: () => void
  icon?: React.ReactNode
}) => (
  <div
    className={classNames(styles.wrapper, disabled && styles.disabled)}
    onClick={() => !disabled && onClick()}
  >
    <span className={styles.list}>
      {Array.isArray(value)
        ? value.slice(0, MAX_SHOWN_VALUES).join(", ")
        : value
      }
      {value && <span className={styles.counter}>
        {(value.length > MAX_SHOWN_VALUES) ? `+${(value.length - MAX_SHOWN_VALUES)}` : ""}
      </span>}
    </span>
    {!disabled && icon}
  </div>
);

export default ArraySelectorTrigger;