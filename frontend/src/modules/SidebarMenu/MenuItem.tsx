import React from "react";
import { Module } from "../../routing/ModulesRegistry";
import styles from "./styles/MenuItem.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import { MENU_TEXT_COLOR } from "../../utils/colors";
import { classNames } from "../../utils/classnames";

const MenuItem: React.FC<Module & { hideText: boolean; onClick?: () => void; isActive?: boolean }> = ({
  menuItem,
  keyId,
  hideText,
  onClick,
  isActive = false,
}) => {
  const { openTab } = useFlexLayoutContext();
  if (!menuItem) return null;

  const { dataCy, title, sideBarTitle, icon: Icon } = menuItem;
  const displayTitle = sideBarTitle || title;
  const NON_MODULE_KEYS = new Set(["help", "toggle"]);
  const isRealModule = !NON_MODULE_KEYS.has(keyId);

  const handleClick = () => {
    if (isRealModule) openTab(keyId);
    onClick?.();
  };

  return (
    <button onClick={handleClick} className={classNames(styles.itemWrapper, isActive && styles.active)} data-cy={dataCy} data-testid={`menu-item-${keyId}`}>
      {Icon && <Icon color={MENU_TEXT_COLOR} />}
      {!hideText && displayTitle && ( <div data-testid={`menu-item-title-${keyId}`}> {displayTitle} </div> )}
    </button>
  );
};

export default MenuItem;
