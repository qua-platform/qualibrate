import "./assets/styles/index.scss";
import "./assets/styles/_base.scss";
import React, { PropsWithChildren, ReactElement, useEffect } from "react";
import { ApiContextProvider } from "./DEPRECATED_context/ApiContext";
import AppRoutes from "./routing/AppRoutes";
import { BrowserRouter } from "react-router-dom";
import { FlexLayoutContextProvider } from "./routing/flexLayout/FlexLayoutContext";
import { render } from "react-dom";
import { updateColorTheme } from "./modules/themeModule/themeHelper";
import { GlobalThemeContextProvider } from "./modules/themeModule/GlobalThemeContext";

const contextProviders: Array<(props: PropsWithChildren<any>) => ReactElement<PropsWithChildren<any>>> = [
  ApiContextProvider,
  FlexLayoutContextProvider,
  BrowserRouter,
];
const Application: React.FunctionComponent = () => {
  useEffect(updateColorTheme, []);
  return (
    <GlobalThemeContextProvider>
      {/*// todo make local for modules or split into simple functions*/}
      {contextProviders.reduce(
        (Comp, Provider) => (
          <Provider>{Comp}</Provider>
        ),
        <AppRoutes />
      )}
    </GlobalThemeContextProvider>
  );
};

render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>,
  document.getElementById("root")
);
