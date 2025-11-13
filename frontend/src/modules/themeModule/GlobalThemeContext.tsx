import React, { ReactNode, useCallback, useState } from "react";
import { getColorTheme, Theme, toggleColorTheme } from "./themeHelper";

export interface GlobalThemeContextState {
  theme: Theme;
  toggleTheme: () => void;
  pinSideMenu: boolean;
  setPinSideMenu: (value: boolean) => void;
}

interface GlobalThemeContextProviderProps {
  children?: ReactNode | undefined;
}

const GlobalThemeContext = React.createContext<GlobalThemeContextState | null>(null);

export function GlobalThemeContextProvider(props: GlobalThemeContextProviderProps): React.ReactNode {
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
