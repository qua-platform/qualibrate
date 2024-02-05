import React, { PropsWithChildren, useContext, useEffect, useState } from "react";

import InterfaceContext from "../../../DEPRECATED_context/InterfaceContext";
import { PanelsEnum } from "../types";

interface IExperimentModulesContext {
  activePanel: PanelsEnum;
  setActivePanel: (panel: PanelsEnum) => void;
}

const ExperimentModulesContext = React.createContext<IExperimentModulesContext | any>(null);

export const useExperimentModulesContext = (): IExperimentModulesContext => useContext<IExperimentModulesContext>(ExperimentModulesContext);

export function ExperimentModulesContextProvider(props: PropsWithChildren<void>): React.ReactElement {
  const { children } = props;

  const [activePanel, setActivePanel] = useState(PanelsEnum.CODE);

  const {
    actions: { toggleSystemInfoVisibility },
  } = useContext(InterfaceContext);

  useEffect(() => {
    if (activePanel === PanelsEnum.SYSTEM) toggleSystemInfoVisibility.on();
  }, [activePanel]);

  return <ExperimentModulesContext.Provider value={{ activePanel, setActivePanel }}>{children}</ExperimentModulesContext.Provider>;
}
