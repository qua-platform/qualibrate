import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { Module } from "../AppRoutes";
import styles from "./styles/MenuItem.module.scss";
import { MENU_TEXT_COLOR } from "../../utils/colors";
import { classNames } from "../../utils/classnames";
import { setActivePage } from "../../stores/NavigationStore";
import { useRootDispatch } from "../../stores";

const MenuItem: React.FC<
  Module & {
    hideText: boolean;
    onClick?: () => void;
    isSelected?: boolean;
    isDisabled?: boolean;
  }
> = ({ menuItem, keyId, hideText, onClick, isSelected = false, isDisabled = false }) => {
  const dispatch = useRootDispatch();
  if (!menuItem) {
    return null;
  }

  const { dataCy, title, sideBarTitle, icon: Icon, atBottom } = menuItem;
  const displayTitle = sideBarTitle || title;

  const handleClick = () => {
    if (!atBottom) {
      dispatch(setActivePage(keyId));
    }
    onClick?.();
  };

  const button = (
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

  return isDisabled ? (
    <Tooltip title="Please select a project before accessing these pages" placement="right">
      <span>{button}</span>
    </Tooltip>
  ) : (
    button
  );
};

export default MenuItem;
