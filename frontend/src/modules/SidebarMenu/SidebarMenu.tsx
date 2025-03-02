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
import { HelpIcon } from "../../ui-lib/Icons/HelpIcon";
import { SearchIcon } from "../../ui-lib/Icons/SearchIcon";
import ExpandSideMenuIcon from "../../ui-lib/Icons/ExpandSideMenuIcon";
import CollapseSideMenuIcon from "../../ui-lib/Icons/CollapseSideMenuIcon";

const SidebarMenu: React.FunctionComponent = () => {
  const { pinSideMenu } = useContext(GlobalThemeContext) as GlobalThemeContextState;
  const [minify, setMinify] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const containerClassName = classNames(styles.sidebarMenu, minify ? styles.collapsed : styles.expanded);

  useEffect(() => {
    setMinify(!pinSideMenu);
  }, [pinSideMenu]);

  // 
  const handleHelpClick = () => {
    window.open(
      "https://quantum-machines.atlassian.net/wiki/spaces/hlsw/pages/2838986848/QUAlibrate+web+app+QAPP"
    );
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    setSearchQuery(""); // Reset search input on toggle
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Search Query:", searchQuery);
    // Future: Implement search functionality here
  };

  return (
    <>
    <div className={containerClassName}>
      <button className={styles.qualibrateLogo} data-cy={cyKeys.HOME_PAGE}>
        {minify ? <QUAlibrateLogoSmallIcon /> : <QUAlibrateLogoIcon />}
      </button>

      <div className={styles.menuContent}>
        <div className={styles.menuUpperContent}>
          {menuItems.map((item, index) => (
            <MenuItem {...item} key={index} hideText={minify} data-testid={`menu-item-${index}`} />
          ))}
        </div>

        <div className={styles.menuBottomContent}>
          {bottomMenuItems.map((item) => (
            <MenuItem {...item} key={item.keyId} hideText={minify} onClick={() => {}} />
          ))}
          <MenuItem 
            menuItem={{ title: "Search", icon: SearchIcon, dataCy: "search-btn" }} 
            keyId="search" 
            hideText={minify} 
            onClick={handleSearchToggle} 
          />
          <MenuItem 
            menuItem={{ title: "Help", icon: HelpIcon, dataCy: "help-btn" }} 
            keyId="help" 
            hideText={minify} 
            onClick={handleHelpClick} 
          />
          {THEME_TOGGLE_VISIBLE && (
            <div className={styles.menuBottomContent}>
              <ThemeToggle showText={!minify} />
            </div>
          )}
          <MenuItem
            menuItem={{
              icon: minify ? ExpandSideMenuIcon : CollapseSideMenuIcon,
              dataCy: "toggle-sidebar",
            }}
            keyId="toggle"
            hideText={minify}
            onClick={() => setMinify(!minify)}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default SidebarMenu;
