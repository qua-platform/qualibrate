import React, { PropsWithChildren, ReactElement, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as FlexLayout from "flexlayout-react";
import { Model } from "flexlayout-react";
import FlexLayoutBuilder from "./FlexLayoutBuilder";
import { ModuleKey } from "../ModulesRegistry";

interface IFlexLayoutContext {
  openTab: (tab: ModuleKey) => void;
  checkIsEmpty: () => void;
  getActiveTabset?: () => void;
  getActiveTabsetName?: () => void;
  flexLayoutListener: (action: FlexLayout.Action) => FlexLayout.Action;
  model: Model;
  activeTab: null | ModuleKey;
  activeTabsetName: string | null;
  setActiveTabsetName: (a: string | null) => void;
  activeTabsetId: null | number;
  topBarAdditionalComponents?: { [id: string]: React.JSX.Element };
  setTopBarAdditionalComponents: (a: { [id: string]: React.JSX.Element } | undefined) => void;
  selectedPageName: ModuleKey | null;
  setSelectedPageName: (a: ModuleKey | null) => void;
}

const FlexLayoutContext = React.createContext<IFlexLayoutContext | null>(null);

export const useFlexLayoutContext = (): IFlexLayoutContext =>
  useContext<IFlexLayoutContext | null>(FlexLayoutContext) as IFlexLayoutContext;

export function FlexLayoutContextProvider(props: PropsWithChildren<ReactNode | React.JSX.Element>): ReactElement {
  const { children } = props;
  const LayoutBuilder = useRef(new FlexLayoutBuilder());
  const [model, setModel] = useState(LayoutBuilder.current.model);
  const [activeTab, setActiveTab] = useState<null | ModuleKey>(null);
  const [activeTabsetName, setActiveTabsetName] = useState<string | null>(null);
  const [topBarAdditionalComponents, setTopBarAdditionalComponents] = useState<
    | {
        [id: string]: React.JSX.Element;
      }
    | undefined
  >(undefined);
  const [selectedPageName, setSelectedPageName] = useState<ModuleKey | null>(null);

  useEffect(() => {
    // openTab("nodes");
    localStorage.setItem("flexModel", JSON.stringify(model.toJson()));
  }, [model]);

  const handleIframeUrlSetup = (tab: ModuleKey) => {
    if (tab === "graph-status") {
      setSelectedPageName("graph-status");
    } else if (tab === "nodes") {
      setSelectedPageName("nodes");
    } else if (tab === "graph-library") {
      setSelectedPageName("graph-library");
    } else if (tab === "data") {
      setSelectedPageName("data");
    } else {
      setSelectedPageName(null);
    }
  };
  const checkIsEmpty = useCallback(() => {
    if (LayoutBuilder.current.isEmpty()) {
      // history.push(HOME_URL);
    }
  }, [LayoutBuilder]);

  const openTab = useCallback((tab: ModuleKey) => {
    // navigate(APP_URL);
    // LayoutBuilder.current.removeAllOpenTabs();
    handleIframeUrlSetup(tab);
    LayoutBuilder.current.openNewTab(tab);
    setModel(LayoutBuilder.current.model);
    setActiveTab(tab);
    setActiveTabsetName(activeTab as string);
  }, []);

  const [activeTabsetId, setActiveTabsetId] = useState(null);

  const flexLayoutListener = useCallback(
    (props: FlexLayout.Action) => {
      const tabName: string = model
        .getActiveTabset()
        ?.getChildren()
        // @ts-expect-error TODO Fix this
        .find(({ _attributes }) => _attributes.id === props.data.tabNode)?._renderedName;

      setActiveTabsetId(props.data.tabNode);

      if (tabName) {
        setActiveTabsetName(tabName);
      }

      return props;
    },
    [model]
  );

  return (
    <FlexLayoutContext.Provider
      value={{
        openTab,
        model,
        checkIsEmpty,
        activeTab,
        activeTabsetName,
        setActiveTabsetName,
        flexLayoutListener,
        activeTabsetId,
        topBarAdditionalComponents,
        setTopBarAdditionalComponents,
        selectedPageName,
        setSelectedPageName,
      }}
    >
      {children}
    </FlexLayoutContext.Provider>
  );
}
