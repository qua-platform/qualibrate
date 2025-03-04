import React from "react";
import { Module } from "../../routing/ModulesRegistry";
import styles from "./styles/MenuItem.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import { MENU_TEXT_COLOR } from "../../utils/colors";

const MenuItem: React.FunctionComponent<Module & { hideText: boolean; onClick?: () => void }> = ({
  menuItem,
  keyId,
  hideText,
  onClick,
}) => {
  const { openTab } = useFlexLayoutContext();
  if (!menuItem) {
    return null;
  }

  const { dataCy, title, sideBarTitle, icon: Icon } = menuItem;

  const displayTitle = sideBarTitle || title; 

  return (
    <button onClick={onClick || (() => openTab(keyId))} className={styles.itemWrapper} data-cy={dataCy} data-testid={`menu-item-${keyId}`}>
      {Icon && <Icon color={MENU_TEXT_COLOR} />}
      {!hideText && displayTitle && ( <div data-testid={`menu-item-title-${keyId}`} className={styles.menuText}> {displayTitle} </div>)}
    </button>
  );
};

export default MenuItem;
