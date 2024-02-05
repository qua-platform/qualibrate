import "./assets/styles/index.scss";
import "./assets/styles/_base.scss";

import React, { PropsWithChildren, ReactElement, useEffect } from "react";

import { ApiContextProvider } from "./DEPRECATED_context/ApiContext";
import AppRoutes from "./routing/AppRoutes";
import { AuthContextProvider } from "./modules/auth/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { FlexLayoutContextProvider } from "./routing/flexLayout/FlexLayoutContext";
import { InterfaceContextProvider } from "./DEPRECATED_context/InterfaceContext";
import { MQTTContextProvider } from "./modules/MQTT/MQTTContext";
import { ProjectsContextProvider } from "./modules/WelcomePage/utils/ProjectsContext";
import { UserContextProvider } from "./DEPRECATED_context/UserContext";
import { WorkflowContextProvider } from "./modules/Experiments/context/WorkflowContext";
import { render } from "react-dom";
import { updateColorTheme } from "./modules/themeModule/themeHelper";
import CheckoutContextProvider from "./modules/Checkout/CheckoutContext";
import ActiveProjectContextContextProvider from "./modules/ActiveProject/ActiveProjectContext";
import JobActionsContextContainer from "./modules/Jobs/context/JobActionsContext";
import { GlobalThemeContextProvider } from "./modules/themeModule/GlobalThemeContext";

const contextProviders: Array<(props: PropsWithChildren<any>) => ReactElement<PropsWithChildren<any>>> = [
  WorkflowContextProvider,
  UserContextProvider,
  ApiContextProvider,
  InterfaceContextProvider,
  ProjectsContextProvider,
  AuthContextProvider,
  FlexLayoutContextProvider,
  BrowserRouter,
];
const Application: React.FunctionComponent = () => {
  useEffect(updateColorTheme, []);
  return (
    <GlobalThemeContextProvider>
      <MQTTContextProvider>
        <ActiveProjectContextContextProvider>
          <CheckoutContextProvider>
            {/*// todo make local for modules or split into simple functions*/}
            <JobActionsContextContainer>
              {contextProviders.reduce(
                (Comp, Provider) => (
                  <Provider>{Comp}</Provider>
                ),
                <AppRoutes />
              )}
            </JobActionsContextContainer>
          </CheckoutContextProvider>
        </ActiveProjectContextContextProvider>
      </MQTTContextProvider>
    </GlobalThemeContextProvider>
  );
};

render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>,
  document.getElementById("root")
);
