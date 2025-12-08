import React, { useEffect } from "react";
import "./styles/index.scss";
import "./styles/_base.scss";
import { AppRoutes } from "./modules/AppRoutes";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { updateColorTheme } from "./modules/themeModule/themeHelper";
import { GlobalThemeContextProvider } from "./modules/themeModule/GlobalThemeContext";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./stores";

const RouterProvider = process.env.USE_RELATIVE_PATHS === "true" ? HashRouter : BrowserRouter;

const Application: React.FunctionComponent = () => {
  useEffect(updateColorTheme, []);
  return (
    <Provider store={store}>
      <GlobalThemeContextProvider>
        <RouterProvider>
          <AppRoutes />
        </RouterProvider>
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
