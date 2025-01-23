import React, { useContext, useEffect, useState } from "react";
import { bottomMenuItems, menuItems } from "../../routing/ModulesRegistry";
import MenuItem from "./MenuItem";
import { THEME_TOGGLE_VISIBLE } from "../../dev.config";
import ThemeToggle from "../themeModule/ThemeToggle";
import { classNames } from "../../utils/classnames";
import styles from "./styles/SidebarMenu.module.scss";
import cyKeys from "../../utils/cyKeys";
import GlobalThemeContext, { GlobalThemeContextState } from "../themeModule/GlobalThemeContext";
import QUAlibrateLogoIcon from "../../ui-lib/Icons/QUAlibrateLogoIcon";
import QUAlibrateLogoSmallIcon from "../../ui-lib/Icons/QualibrateLogoSmall";

const SidebarMenu: React.FunctionComponent = () => {
  const { pinSideMenu } = useContext(GlobalThemeContext) as GlobalThemeContextState;
  const [, setShowPopup] = useState(false);
  const [minify, setMinify] = React.useState(true);
  const containerClassName = classNames(styles.sidebarMenu, !minify && styles.opened);
  const hideSideMenuItems = false;

  useEffect(() => {
    setMinify(!pinSideMenu);
  }, [pinSideMenu]);

  return (
    <>
      <div
        className={styles.container}
        data-testid="sidebar-menu-container"
        onMouseEnter={() => (!pinSideMenu ? setMinify(false) : {})}
        onMouseLeave={() => (!pinSideMenu ? setMinify(true) : {})}
      >
        <div className={containerClassName} data-testid="sidebar-menu">
          <button onClick={() => setShowPopup(true)} className={styles.qualibrateLogo} data-testid="sidebar-logo-button" data-cy={cyKeys.HOME_PAGE}>
            {minify ? <QUAlibrateLogoSmallIcon data-testid="sidebar-small-logo" /> : <QUAlibrateLogoIcon data-testid="sidebar-large-logo" />}
          </button>
          <div className={styles.menuContent} data-testid="menu-content">
            <div className={styles.menuUpperContent} data-testid="menu-upper-content">
              {hideSideMenuItems ? [] : menuItems.map((item, index) => <MenuItem {...item} key={index} hideText={minify} data-testid={`menu-item-${index}`}/>)}
            </div>
            <div className={styles.menuBottomContent} data-testid="menu-bottom-content">
              {bottomMenuItems.map((item) => (
                <MenuItem {...item} key={item.keyId} hideText={minify} onClick={() => {}} data-testid={`bottom-menu-item-${item.keyId}`} />
              ))}
              {THEME_TOGGLE_VISIBLE && <ThemeToggle showText={!minify} data-testid="theme-toggle" />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
