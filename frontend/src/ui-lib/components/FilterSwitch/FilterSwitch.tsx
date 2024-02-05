import React from "react";
import styles from "./../TabsSwitch/TabsSwitch.module.scss";
import { classNames } from "../../../utils/classnames";

interface Props {
  options: string[];
  defaultOption: string;
  onChange: (value: string) => void;
}

export const FilterSwitch: React.FC<Props> = (props) => {
  const { options, defaultOption, onChange } = props;
  return (
    <div className={styles.wrapper} style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex" }}>
        {options.map((option) => {
          const isActive = defaultOption === option;
          return (
            <button
              key={option}
              className={classNames(styles.button, isActive && styles.active)}
              onClick={() => onChange(option)}
              data-cy={`data-${option}`}
              title={option}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};
