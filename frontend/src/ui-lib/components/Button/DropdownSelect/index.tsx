import React, { useState } from "react";
import DropdownList from "./DropdownList";

import styles from "./style.module.scss";
import DropdownButton from "./DropdownButton";
import { IconProps } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import { MinifyProp } from "../../../../types";
import { classNames } from "../../../../utils/classnames";

export type Item = {
  key: string | number;
  value?: string | number;
};

type Props = {
  list: Array<Item>;
  onChange: (selectedItem: Item) => void;
  selected: Item | undefined;
  icon?: React.FunctionComponent<IconProps>;
  dataCy?: string;
  className?: string;
} & MinifyProp;

const DropdownSelect: React.FunctionComponent<Props> = ({ onChange, list, icon, selected, dataCy, minify, className }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  return (
    <div className={classNames(styles.button, className)} data-cy={dataCy}>
      <DropdownButton value={(!minify && selected?.value) || ""} icon={icon} expanded={expanded} onClick={() => setExpanded((s) => !s)} />

      {expanded && (
        <DropdownList
          list={list}
          selected={selected}
          onSelect={(item) => {
            setExpanded(false);
            onChange(item);
          }}
        />
      )}
    </div>
  );
};

export default DropdownSelect;
