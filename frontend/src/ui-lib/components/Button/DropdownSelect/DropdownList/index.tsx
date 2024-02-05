import React from "react";
import { classNames } from "../../../../../utils/classnames";
import DropdownListItem from "./DropdownListItem";
import styles from "./style.module.scss";
import { Item } from "../index";
import cyKeys from "../../../../../utils/cyKeys";

type Props = {
  selected: Item | undefined;
  list: Array<Item>;
  onSelect: (selectedItem: Item) => void;
};

const DropdownList: React.FunctionComponent<Props> = ({ selected, list, onSelect }: Props) => {
  return (
    <div data-cy={cyKeys.common.DROPDOWN_LIST} className={classNames(styles.list)}>
      {list.map((item, i) => (
        <DropdownListItem item={item} key={i} isSelected={selected?.key === item.key} onClick={() => onSelect(item)} />
      ))}
    </div>
  );
};

export default DropdownList;
