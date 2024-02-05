import React from "react";
import styles from "./DropdownButton.module.scss";
import { ArrowIcon } from "../../../Icons/ArrowIcon";
import { classNames } from "../../../../utils/classnames";
import { IconProps } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import cyKeys from "../../../../utils/cyKeys";

type Props = {
  icon?: React.FunctionComponent<IconProps>;
  value: string | number;
  expanded: boolean;
  onClick: () => void;
};
export default function DropdownButton({ value, expanded, onClick, icon: Icon }: Props): React.ReactElement {
  return (
    <button
      title={value + ""}
      onClick={onClick}
      data-cy={cyKeys.common.DROPDOWN_BUTTON}
      className={classNames(styles.button, expanded && styles.active)}
    >
      {Icon && <Icon />}
      {value && <span className={styles.text}>{value}</span>}
      <ArrowIcon options={{ rotationDegree: expanded ? 180 : 0 }} />
    </button>
  );
}
