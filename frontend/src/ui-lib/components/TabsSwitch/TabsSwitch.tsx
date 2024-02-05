import React from "react";
import styles from "./TabsSwitch.module.scss";
import { classNames } from "../../../utils/classnames";
import { OUTLINE_BUTTON_ACTIVE_TEXT, OUTLINE_BUTTON_TEXT } from "../../../utils/colors";
import { IconProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

export interface TabProps {
  icon: React.FC<IconProps>;
  text: string;
  value: string;
  dataCy?: string;
  isHidden?: boolean;
}

interface Props {
  tabs: TabProps[];
  onSelect: (value: string) => void;
  selected: string;
  minify?: boolean;
}

export default function TabsSwitch(props: Props): React.ReactElement {
  const { tabs, onSelect, selected, minify } = props;

  return (
    <div className={styles.wrapper}>
      {tabs
        .filter((t) => !t.isHidden)
        .map((tab) => (
          <Tab key={tab.value} {...tab} selected={selected} minify={minify} onSelect={onSelect} />
        ))}
    </div>
  );
}

function Tab({
  value,
  icon: Icon,
  text,
  dataCy,
  selected,
  minify,
  onSelect,
}: TabProps & {
  selected: string;
  minify?: boolean;
  onSelect: (key: string) => void;
}): React.ReactElement {
  const isActive = selected === value;
  const color = isActive ? OUTLINE_BUTTON_ACTIVE_TEXT : OUTLINE_BUTTON_TEXT;
  return (
    <button className={classNames(styles.button, isActive && styles.active)} onClick={() => onSelect(value)} data-cy={dataCy} title={text}>
      <Icon color={color} />
      {minify ? null : text}
    </button>
  );
}
