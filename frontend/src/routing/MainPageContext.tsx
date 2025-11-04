import React, { PropsWithChildren, ReactElement, ReactNode, useContext, useEffect, useState } from "react";
import { ModuleKey } from "./ModulesRegistry";

interface IMainPageContext {
  setActivePage: (tab: ModuleKey) => void;
  activePage: null | ModuleKey;
  openedOncePages: ModuleKey[];
  topBarAdditionalComponents?: { [id: string]: React.JSX.Element };
  setTopBarAdditionalComponents: (a: { [id: string]: React.JSX.Element } | undefined) => void;
}

const MainPageContext = React.createContext<IMainPageContext | null>(null);

export const useMainPageContext = (): IMainPageContext =>
  useContext<IMainPageContext | null>(MainPageContext) as IMainPageContext;

export function MainPageContextProvider(props: PropsWithChildren<ReactNode | React.JSX.Element>): ReactElement {
  const { children } = props;
  const [activePage, setActivePage] = useState<null | ModuleKey>(null);
  const [openedOncePages, setOpenedOncePages] = useState<ModuleKey[]>([]);
  const [topBarAdditionalComponents, setTopBarAdditionalComponents] = useState<
    | {
        [id: string]: React.JSX.Element;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    if (activePage && !openedOncePages.includes(activePage))
      setOpenedOncePages([...openedOncePages, activePage]);
  }, [activePage]);

  return (
    <MainPageContext.Provider
      value={{
        setActivePage,
        activePage,
        openedOncePages,
        topBarAdditionalComponents,
        setTopBarAdditionalComponents,
      }}
    >
      {children}
    </MainPageContext.Provider>
  );
}
