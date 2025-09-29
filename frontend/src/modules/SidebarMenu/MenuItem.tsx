import React from "react";
import { Module } from "../../routing/ModulesRegistry";
import styles from "./styles/MenuItem.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import { MENU_TEXT_COLOR } from "../../utils/colors";
import { classNames } from "../../utils/classnames";

const MenuItem: React.FC<
  Module & {
    hideText: boolean;
    onClick?: () => void;
    isSelected?: boolean;
    isDisabled?: boolean;
  }
> = ({ menuItem, keyId, hideText, onClick, isSelected = false, isDisabled = false }) => {
  const { openTab } = useFlexLayoutContext();
  if (!menuItem) {
    return null;
  }

  const { dataCy, title, sideBarTitle, icon: Icon, atBottom } = menuItem;
  const displayTitle = sideBarTitle || title;

  const handleClick = () => {
    if (!atBottom) {
      openTab(keyId);
    }
    onClick?.();
  };

  return (
    <button
      disabled={isDisabled}
      onClick={handleClick}
      className={classNames(styles.itemWrapper, isSelected && styles.selected)}
      data-cy={dataCy}
      data-testid={`menu-item-${keyId}`}
    >
      {Icon && <Icon color={MENU_TEXT_COLOR} />}
      {!hideText && displayTitle && <div data-testid={`menu-item-title-${keyId}`}> {displayTitle} </div>}
    </button>
  );
};

export default MenuItem;
