import React, { useCallback, useContext, useEffect, useState } from "react";
import { bottomMenuItems, HELP_KEY, menuItems, TOGGLE_SIDEBAR_KEY, PROJECT_TAB } from "../../routing/ModulesRegistry";
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
import ProjectFolderIcon from "../../ui-lib/Icons/ProjectFolderIcon";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import { useProjectContext } from "../Project/context/ProjectContext";
import { getColorIndex, extractInitials } from "../Project/helpers";
import { colorPalette } from "../Project/constants";

const SidebarMenu: React.FunctionComponent = () => {
  const { pinSideMenu } = useContext(GlobalThemeContext) as GlobalThemeContextState;
  const [minify, setMinify] = useState(true);
  const { activeTabsetName, setActiveTabsetName, openTab } = useFlexLayoutContext();
  const containerClassName = classNames(styles.sidebarMenu, minify ? styles.collapsed : styles.expanded);
  const { activeProject } = useProjectContext();
  
  const handleProjectClick = useCallback(() => {
    openTab(PROJECT_TAB);
  }, [openTab]);
  
  const handleHelpClick = useCallback(() => {
    window.open("https://qua-platform.github.io/qualibrate/", "_blank", "noopener,noreferrer,width=800,height=600");
  }, []);

  useEffect(() => {
    setMinify(!pinSideMenu);
  }, [pinSideMenu]);

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
                onClick={() => setActiveTabsetName(item.keyId)}
                isSelected={activeTabsetName === item.keyId}
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
              } else if (item.keyId === PROJECT_TAB) {
                if (!activeProject) return null;
                handleOnClick = handleProjectClick;
                menuItem.sideBarTitle = activeProject.name;
                menuItem.icon = () => (
                  <ProjectFolderIcon
                    initials={extractInitials(activeProject.name)}
                    fillColor={colorPalette[getColorIndex(activeProject.name)]}
                    width={28}
                    height={28}
                    fontSize={13}
                  />
                );
              }

              return (
                <MenuItem 
                  {...item} 
                  menuItem={menuItem} 
                  key={item.keyId} 
                  hideText={minify} 
                  isSelected={item.keyId === PROJECT_TAB && activeTabsetName === PROJECT_TAB} 
                  onClick={handleOnClick} 
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
