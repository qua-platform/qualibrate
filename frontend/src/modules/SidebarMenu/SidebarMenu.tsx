import React, { useCallback, useContext, useEffect, useState } from "react";
import { bottomMenuItems, HELP_KEY, menuItems, PROJECT_KEY, TOGGLE_SIDEBAR_KEY } from "../../routing/ModulesRegistry";
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
import { useMainPageContext } from "../../routing/MainPageContext";
import { extractInitials, getColorIndex } from "../Project/helpers";
import { colorPalette } from "../Project/constants";
import { useSelector } from "react-redux";
import { getActiveProject, getShouldGoToProjectPage } from "../../stores/ProjectStore/selectors";

const SidebarMenu: React.FunctionComponent = () => {
  const { pinSideMenu } = useContext(GlobalThemeContext) as GlobalThemeContextState;
  const [minify, setMinify] = useState(false);
  const { activePage, setActivePage } = useMainPageContext();
  const containerClassName = classNames(styles.sidebarMenu, minify ? styles.collapsed : styles.expanded);
  const activeProject = useSelector(getActiveProject);
  const shouldGoToProjectPage = useSelector(getShouldGoToProjectPage);

  const handleProjectClick = useCallback(() => {
    setActivePage(PROJECT_KEY);
  }, [setActivePage]);

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
            {menuItems.map((item) => {
              return (
                <MenuItem
                  {...item}
                  key={item.keyId}
                  hideText={minify}
                  onClick={() => setActivePage(item.keyId)}
                  isSelected={activePage === item.keyId}
                  isDisabled={!activeProject || shouldGoToProjectPage}
                  data-testid={`menu-item-${item.keyId}`}
                />
              );
            })}
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
              } else if (item.keyId === PROJECT_KEY) {
                handleOnClick = handleProjectClick;
                if (activeProject) {
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
              }

              return (
                <MenuItem
                  {...item}
                  menuItem={menuItem}
                  key={item.keyId}
                  hideText={minify}
                  isSelected={item.keyId === PROJECT_KEY && activePage === PROJECT_KEY}
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
