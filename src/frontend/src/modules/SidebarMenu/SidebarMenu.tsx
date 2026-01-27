import React, { useCallback, useContext, useEffect, useState } from "react";
import { bottomMenuItems, HELP_KEY, menuItems, PROJECT_KEY, TOGGLE_SIDEBAR_KEY } from "../AppRoutes";
import MenuItem from "./MenuItem";
// import { THEME_TOGGLE_VISIBLE } from "../../dev.config";
// import ThemeToggle from "../themeModule/ThemeToggle";
import { classNames } from "../../utils/classnames";
import styles from "./styles/SidebarMenu.module.scss";
import cyKeys from "../../utils/cyKeys";
import GlobalThemeContext, { GlobalThemeContextState } from "../themeModule/GlobalThemeContext";
import { QUAlibrateLogoIcon, QualibrateLogoSmallIcon, ExpandSideMenuIcon, CollapseSideMenuIcon, ProjectFolderIcon } from "../../components";
import { extractInitials, getColorIndex, colorPalette } from "../Project";
import { useSelector } from "react-redux";
import { getActiveProject, getShouldGoToProjectPage } from "../../stores/ProjectStore";
import { getActivePage, setActivePage } from "../../stores/NavigationStore";
import { useRootDispatch } from "../../stores";

const SidebarMenu: React.FunctionComponent = () => {
  const { pinSideMenu } = useContext(GlobalThemeContext) as GlobalThemeContextState;
  const [minify, setMinify] = useState(false);
  const dispatch = useRootDispatch();
  const activePage = useSelector(getActivePage);
  const containerClassName = classNames(styles.sidebarMenu, minify ? styles.collapsed : styles.expanded);
  const activeProject = useSelector(getActiveProject);
  const shouldGoToProjectPage = useSelector(getShouldGoToProjectPage);

  const handleProjectClick = useCallback(() => {
    dispatch(setActivePage(PROJECT_KEY));
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
          {minify ? <QualibrateLogoSmallIcon /> : <QUAlibrateLogoIcon />}
        </button>

        <div className={styles.menuContent}>
          <div className={styles.menuUpperContent}>
            {menuItems.map((item) => {
              return (
                <MenuItem
                  {...item}
                  key={item.keyId}
                  hideText={minify}
                  onClick={() => dispatch(setActivePage(item.keyId))}
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
