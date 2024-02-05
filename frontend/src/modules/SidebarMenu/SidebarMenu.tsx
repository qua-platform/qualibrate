import React, { useContext, useEffect, useState } from "react";
import { bottomMenuItems, menuItems } from "../../routing/ModulesRegistry";

import EntropyLogoIcon from "../../ui-lib/Icons/EntropyLogoIcon";
import EntropyLogoSmallIcon from "../../ui-lib/Icons/EntropyLogoSmall";
import LogoutButton from "../auth/logout/LogoutButton";
import MenuItem from "./MenuItem";
import { THEME_TOGGLE_VISIBLE } from "../../dev.config";
import ThemeToggle from "../themeModule/ThemeToggle";
import { classNames } from "../../utils/classnames";
import styles from "./styles/SidebarMenu.module.scss";
import cyKeys from "../../utils/cyKeys";
import ProjectPopup from "./projectPopup/ProjectPopup";
import GlobalThemeContext from "../themeModule/GlobalThemeContext";
import { useActiveProjectContext } from "../ActiveProject/ActiveProjectContext";
import { ADMIN_PANEL_URL } from "../../DEPRECATED_common/modules";
import { useNavigate } from "react-router-dom";
import { SettingIcon } from "../../ui-lib/Icons/SettingsIcon";
// import { useAuthContext } from "../auth/AuthContext";

const SidebarMenu: React.FunctionComponent = () => {
  const { pinSideMenu } = useContext(GlobalThemeContext);
  const { activeProject } = useActiveProjectContext();
  const [showPopup, setShowPopup] = useState(false);
  const [minify, setMinify] = React.useState(true);
  const containerClassName = classNames(styles.sidebarMenu, !minify && styles.opened);
  const hideSideMenuItems = !activeProject;
  const navigate = useNavigate();
  // const { userInfo } = useAuthContext();

  useEffect(() => {
    setMinify(!pinSideMenu);
  }, [pinSideMenu]);

  return (
    <>
      {showPopup && <ProjectPopup onClose={() => setShowPopup(false)} />}
      <div
        className={styles.container}
        onMouseEnter={() => (!pinSideMenu ? setMinify(false) : {})}
        onMouseLeave={() => (!pinSideMenu ? setMinify(true) : {})}
      >
        <div className={containerClassName}>
          <button onClick={() => setShowPopup(true)} className={styles.entropyLogo} data-cy={cyKeys.HOME_PAGE}>
            {minify ? <EntropyLogoSmallIcon /> : <EntropyLogoIcon />}
          </button>
          <div className={styles.menuContent}>
            <div className={styles.menuUpperContent}>
              {hideSideMenuItems ? [] : menuItems.map((item, index) => <MenuItem {...item} key={index} hideText={minify} />)}
            </div>
            <div className={styles.menuBottomContent}>
              {/*{userInfo?.is_admin && (*/}
                <div onClick={() => navigate(ADMIN_PANEL_URL)}>
                  <MenuItem key={"admin-settings"} menuItem={{ icon: SettingIcon, title: "Settings" }} hideText={minify} />
                </div>
              {/*)}*/}
              {bottomMenuItems.map((item) => (
                <MenuItem {...item} key={item.keyId} hideText={minify} />
              ))}
              {/*{THEME_TOGGLE_VISIBLE && <ThemeToggle showText={!minify} />}*/}
              {/*{<LogoutButton hideText={minify} />}*/}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
