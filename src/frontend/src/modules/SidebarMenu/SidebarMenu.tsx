import React, { useCallback, useContext, useEffect, useState } from "react";
import { bottomMenuItems, HELP_KEY, menuItems, PROJECT_KEY, TOGGLE_SIDEBAR_KEY } from "../AppRoutes";
import MenuItem from "./MenuItem";
// import { THEME_TOGGLE_VISIBLE } from "../../dev.config";
// import ThemeToggle from "../themeModule/ThemeToggle";
import { classNames } from "../../utils/classnames";
import styles from "./styles/SidebarMenu.module.scss";
import cyKeys from "../../utils/cyKeys";
import GlobalThemeContext, { GlobalThemeContextState } from "../themeModule/GlobalThemeContext";
import { CollapseSideMenuIcon, ExpandSideMenuIcon, QUAlibrateLogoIcon, QualibrateLogoSmallIcon } from "../../components";
import { useSelector } from "react-redux";
import { getActiveProject } from "../../stores/ProjectStore";
import { getActivePage, setActivePage } from "../../stores/NavigationStore";
import { useRootDispatch } from "../../stores";
import { API_METHODS } from "../../utils/api/types";
import { GET_APP_VERSION } from "../../utils/api/apiRoutes";
import Api, { BASIC_HEADERS } from "../../utils/api";

const SidebarMenu: React.FunctionComponent = () => {
  const { pinSideMenu, minifySideMenu, setMinifySideMenu } = useContext(GlobalThemeContext) as GlobalThemeContextState;
  const [appVersion, setAppVersion] = useState<string | undefined>(undefined);
  const dispatch = useRootDispatch();
  const activePage = useSelector(getActivePage);
  const containerClassName = classNames(styles.sidebarMenu, minifySideMenu ? styles.collapsed : styles.expanded);
  const activeProject = useSelector(getActiveProject);

  const handleHelpClick = useCallback(() => {
    window.open("https://qua-platform.github.io/qualibrate/", "_blank", "noopener,noreferrer,width=800,height=600");
  }, []);

  useEffect(() => {
    setMinifySideMenu(!pinSideMenu);
  }, [pinSideMenu]);

  useEffect(() => {
    const fetchAppVersion = async () => {
      try {
        const response = await Api._fetch<{ version: string | undefined }>(Api.api(GET_APP_VERSION()), API_METHODS.GET, {
          headers: BASIC_HEADERS,
        });

        if (response?.isOk) {
          setAppVersion(response.result?.version);
        }
      } catch (error) {
        console.error("Failed to fetch app version:", error);
      }
    };

    fetchAppVersion();
  }, []);

  return (
    <>
      <div className={containerClassName}>
        <button className={styles.qualibrateLogo} data-cy={cyKeys.HOME_PAGE}>
          {minifySideMenu ? <QualibrateLogoSmallIcon /> : <QUAlibrateLogoIcon />}
        </button>

        <div className={styles.menuContent}>
          <div className={styles.menuUpperContent}>
            {menuItems.map((item) => {
              return (
                <MenuItem
                  {...item}
                  key={item.keyId}
                  hideText={minifySideMenu}
                  onClick={() => dispatch(setActivePage(item.keyId))}
                  isSelected={activePage === item.keyId}
                  isDisabled={!activeProject}
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
                handleOnClick = () => setMinifySideMenu(!minifySideMenu);
                menuItem.icon = minifySideMenu ? ExpandSideMenuIcon : CollapseSideMenuIcon;
                menuItem.title = appVersion ? `v${appVersion}` : undefined;
              } else if (item.keyId === HELP_KEY) {
                handleOnClick = handleHelpClick;
              }

              return (
                <MenuItem
                  {...item}
                  menuItem={menuItem}
                  key={item.keyId}
                  hideText={minifySideMenu}
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
