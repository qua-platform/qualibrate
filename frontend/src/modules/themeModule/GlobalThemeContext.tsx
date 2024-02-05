import React, { PropsWithChildren, useCallback, useState } from "react";
import { getColorTheme, Theme, toggleColorTheme } from "./themeHelper";

interface GlobalThemeContextState {
  theme: Theme;
  toggleTheme: () => void;
  pinSideMenu: boolean;
  setPinSideMenu: () => void;
}

const GlobalThemeContext = React.createContext<GlobalThemeContextState | any>(null);

export function GlobalThemeContextProvider(props: PropsWithChildren<any>): React.ReactElement {
  const { children } = props;

  const [theme, _setTheme] = useState<Theme>(getColorTheme());
  const [pinSideMenu, setPinSideMenu] = useState<boolean>(true);

  const toggleTheme = useCallback(() => {
    _setTheme(toggleColorTheme());
  }, [_setTheme]);
  return (
    <GlobalThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        pinSideMenu,
        setPinSideMenu,
      }}
    >
      {children}
    </GlobalThemeContext.Provider>
  );
}

export default GlobalThemeContext;
