import React from "react";
import { MarkIcon } from "../../../../../Icons/MarkIcon";
import styles from "./style.module.scss";
import { classNames } from "../../../../../../utils/classnames";
import { BLUE_BUTTON } from "../../../../../../utils/colors";
import { Item } from "../../index";

type Props = {
  onClick: () => void;
  item: Item;
  isSelected?: boolean;
};

const DropdownListItem: React.FunctionComponent<Props> = ({ item, isSelected, onClick }: Props) => {
  return (
    <div className={classNames(styles.item)} onClick={onClick}>
      {item.value}
      {isSelected && <MarkIcon color={isSelected && BLUE_BUTTON} />}
    </div>
  );
};

export default DropdownListItem;
