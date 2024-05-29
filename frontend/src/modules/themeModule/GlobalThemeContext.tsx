import React, { ReactNode, useCallback, useContext, useState } from "react";
import { getColorTheme, Theme, toggleColorTheme } from "./themeHelper";

interface GlobalThemeContextState {
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

export function useGlobalThemeContext(): GlobalThemeContextState {
  const context = useContext(GlobalThemeContext);
  if (!context) {
    throw new Error("useGlobalThemeContext must be used within a GlobalThemeContextProvider");
  }
  return context;
}

export default GlobalThemeContext;
