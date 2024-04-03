import React, { PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as FlexLayout from "flexlayout-react";

import { APP_URL } from "../../DEPRECATED_common/modules";
import FlexLayoutBuilder from "./FlexLayoutBuilder";
import { Model } from "flexlayout-react";
import { ModuleKey } from "../ModulesRegistry";
import { useNavigate } from "react-router-dom";

interface IFlexLayoutContext {
  openTab: (tab: ModuleKey) => void;
  checkIsEmpty: () => void;
  getActiveTabset: () => void;
  getActiveTabsetName: () => void;
  flexLayoutListener: (action: FlexLayout.Action) => void;
  model: Model;
  activeTab: null | ModuleKey;
  activeTabsetName: string | null;
  activeTabsetId: null | number;
}

const FlexLayoutContext = React.createContext<IFlexLayoutContext | any>(null);

export const useFlexLayoutContext = (): IFlexLayoutContext => useContext<IFlexLayoutContext>(FlexLayoutContext);

type Props = PropsWithChildren<any>;

export function FlexLayoutContextProvider(props: Props): React.ReactElement {
  const navigate = useNavigate();
  const LayoutBuilder = useRef(new FlexLayoutBuilder());
  const [model, setModel] = useState(LayoutBuilder.current.model);
  const [activeTab, setActiveTab] = useState<null | ModuleKey>(null);
  const [activeTabsetName, setActiveTabsetName] = useState(null);
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
    setActiveTabsetName(activeTab as any);
  }, []);

  const [activeTabsetId, setActiveTabsetId] = useState(null);

  const flexLayoutListener = useCallback(
    (props: FlexLayout.Action) => {
      const tabName = model
        .getActiveTabset()
        ?.getChildren()
        // @ts-ignore TODO Fix this
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
      {props.children}
    </FlexLayoutContext.Provider>
  );
}
