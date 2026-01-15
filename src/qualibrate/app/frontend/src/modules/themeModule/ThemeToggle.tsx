import React, { useContext } from "react";

import styles from "./ThemeToggle.module.scss";
import { LIGHT } from "./themeHelper";
import ThemeIcon from "./ThemeIcon";
import { MENU_TEXT_COLOR } from "../../utils/colors";
import GlobalThemeContext, { GlobalThemeContextState } from "./GlobalThemeContext";

const ThemeToggle: React.FC<{ showText: boolean }> = (props) => {
  const { theme, toggleTheme } = useContext(GlobalThemeContext) as GlobalThemeContextState;
  return (
    <button data-cy="theme-toggle" onClick={toggleTheme} className={styles.themeToggleContainer}>
      <ThemeIcon isLight={theme === LIGHT} color={MENU_TEXT_COLOR} />
      {props.showText && <div>{theme === LIGHT ? "Light theme" : "Dark theme"}</div>}
    </button>
  );
};

export default ThemeToggle;
