import React, { PropsWithChildren, ReactNode, useEffect } from "react";
import "./assets/styles/index.scss";
import "./assets/styles/_base.scss";
import AppRoutes from "./routing/AppRoutes";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { updateColorTheme } from "./modules/themeModule/themeHelper";
import { GlobalThemeContextProvider } from "./modules/themeModule/GlobalThemeContext";
import { createRoot } from "react-dom/client";
import { SnapshotsContextProvider } from "./modules/Snapshots/context/SnapshotsContext";
import { Provider } from "react-redux";
import store from "./stores";

type ProviderComponent = React.FC<PropsWithChildren<ReactNode>>;

const RouterProvider = process.env.USE_RELATIVE_PATHS === "true" ? HashRouter : BrowserRouter;

const contextProviders: ProviderComponent[] = [
  RouterProvider,
  SnapshotsContextProvider,
];

const Application: React.FunctionComponent = () => {
  useEffect(updateColorTheme, []);
  return (
    <Provider store={store}>
      <GlobalThemeContextProvider>
        {contextProviders.reduce(
          (Comp, Provider) => {
            const TempProvider = Provider as unknown as React.FC<PropsWithChildren<object>>;
            return <TempProvider>{Comp}</TempProvider>;
          },
          <AppRoutes />
        )}
      </GlobalThemeContextProvider>
    </Provider>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Application />
    </React.StrictMode>
  );
}
