import React, { PropsWithChildren, ReactElement, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as FlexLayout from "flexlayout-react";
import { Model } from "flexlayout-react";

import { APP_URL } from "../../DEPRECATED_common/modules";
import FlexLayoutBuilder from "./FlexLayoutBuilder";
import { ModuleKey } from "../ModulesRegistry";
import { useNavigate } from "react-router-dom";

interface IFlexLayoutContext {
  openTab: (tab: ModuleKey) => void;
  checkIsEmpty: () => void;
  getActiveTabset?: () => void;
  getActiveTabsetName?: () => void;
  flexLayoutListener: (action: FlexLayout.Action) => FlexLayout.Action;
  model: Model;
  activeTab: null | ModuleKey;
  activeTabsetName: string | null;
  activeTabsetId: null | number;
}

const FlexLayoutContext = React.createContext<IFlexLayoutContext | null>(null);

export const useFlexLayoutContext = (): IFlexLayoutContext =>
  useContext<IFlexLayoutContext | null>(FlexLayoutContext) as IFlexLayoutContext;

export function FlexLayoutContextProvider(props: PropsWithChildren<ReactNode | React.JSX.Element>): ReactElement {
  const { children } = props;
  const navigate = useNavigate();
  const LayoutBuilder = useRef(new FlexLayoutBuilder());
  const [model, setModel] = useState(LayoutBuilder.current.model);
  const [activeTab, setActiveTab] = useState<null | ModuleKey>(null);
  const [activeTabsetName, setActiveTabsetName] = useState<string | null>(null);
  useEffect(() => {
    openTab("data");
    localStorage.setItem("flexModel", JSON.stringify(model.toJson()));
  }, [model]);

  const checkIsEmpty = useCallback(() => {
    if (LayoutBuilder.current.isEmpty()) {
      // history.push(HOME_URL);
    }
  }, [LayoutBuilder]);

  const openTab = useCallback((tab: ModuleKey) => {
    navigate(APP_URL);
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
        flexLayoutListener,
        activeTabsetId,
      }}
    >
      {children}
    </FlexLayoutContext.Provider>
  );
}
