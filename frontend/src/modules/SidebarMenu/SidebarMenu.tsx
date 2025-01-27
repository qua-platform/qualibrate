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
        onMouseEnter={() => (!pinSideMenu ? setMinify(false) : {})}
        onMouseLeave={() => (!pinSideMenu ? setMinify(true) : {})}
      >
        <div className={containerClassName}>
          <button onClick={() => setShowPopup(true)} className={styles.qualibrateLogo} data-cy={cyKeys.HOME_PAGE}>
            {minify ? <QUAlibrateLogoSmallIcon /> : <QUAlibrateLogoIcon />}
          </button>
          <div className={styles.menuContent}>
            <div className={styles.menuUpperContent}>
              {hideSideMenuItems ? [] : menuItems.map((item, index) => <MenuItem {...item} key={index} hideText={minify} data-testid={`menu-item-${index}`}/>)}
            </div>
            <div className={styles.menuBottomContent}>
              {bottomMenuItems.map((item) => (
                <MenuItem {...item} key={item.keyId} hideText={minify} onClick={() => {}} />
              ))}
              {THEME_TOGGLE_VISIBLE && <ThemeToggle showText={!minify} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
