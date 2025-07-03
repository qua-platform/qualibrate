import React, { useContext, useEffect, useState } from "react";
import { bottomMenuItems, HELP_KEY, menuItems, ModuleKey, NODES_KEY, TOGGLE_SIDEBAR_KEY } from "../../routing/ModulesRegistry";
import MenuItem from "./MenuItem";
// import { THEME_TOGGLE_VISIBLE } from "../../dev.config";
// import ThemeToggle from "../themeModule/ThemeToggle";
import { classNames } from "../../utils/classnames";
import styles from "./styles/SidebarMenu.module.scss";
import cyKeys from "../../utils/cyKeys";
import GlobalThemeContext, { GlobalThemeContextState } from "../themeModule/GlobalThemeContext";
import QUAlibrateLogoIcon from "../../ui-lib/Icons/QUAlibrateLogoIcon";
import QUAlibrateLogoSmallIcon from "../../ui-lib/Icons/QualibrateLogoSmall";
import ExpandSideMenuIcon from "../../ui-lib/Icons/ExpandSideMenuIcon";
import CollapseSideMenuIcon from "../../ui-lib/Icons/CollapseSideMenuIcon";

const SidebarMenu: React.FunctionComponent = () => {
  const { pinSideMenu } = useContext(GlobalThemeContext) as GlobalThemeContextState;
  const [minify, setMinify] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState<ModuleKey>(NODES_KEY);

  const containerClassName = classNames(styles.sidebarMenu, minify ? styles.collapsed : styles.expanded);

  useEffect(() => {
    setMinify(!pinSideMenu);
  }, [pinSideMenu]);

  const handleHelpClick = () => {
    window.open("https://qua-platform.github.io/qualibrate/", "_blank", "noopener,noreferrer,width=800,height=600");
  };

  return (
    <>
      <div className={containerClassName}>
        <button className={styles.qualibrateLogo} data-cy={cyKeys.HOME_PAGE}>
          {minify ? <QUAlibrateLogoSmallIcon /> : <QUAlibrateLogoIcon />}
        </button>

        <div className={styles.menuContent}>
          <div className={styles.menuUpperContent}>
            {menuItems.map((item) => (
              <MenuItem
                {...item}
                key={item.keyId}
                hideText={minify}
                onClick={() => setSelectedMenuItem(item.keyId)}
                isSelected={selectedMenuItem === item.keyId}
                data-testid={`menu-item-${item.keyId}`}
              />
            ))}
          </div>

          <div className={styles.menuBottomContent}>
            {bottomMenuItems.map((item) => {
              const menuItem = { ...item.menuItem };
              let handleOnClick = () => {};

              if (item.keyId === TOGGLE_SIDEBAR_KEY) {
                handleOnClick = () => setMinify(!minify);
                menuItem.icon = minify ? ExpandSideMenuIcon : CollapseSideMenuIcon;
              } else if (item.keyId === HELP_KEY) {
                handleOnClick = handleHelpClick;
              }

              return (
                <MenuItem {...item} menuItem={menuItem} key={item.keyId} hideText={minify} isSelected={false} onClick={handleOnClick} />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
