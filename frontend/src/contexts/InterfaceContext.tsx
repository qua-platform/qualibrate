import React, { ReactElement, useEffect, useState } from "react";
import { Popup } from "../common/interfaces/Popup";
import noop from "../common/helpers";
import { useFlexLayoutContext } from "../routing/flexLayout/FlexLayoutContext";
import useSwitch from "@react-hook/switch";

interface InterfaceContextProps {
  actions: {
    openPopup: (id: number | string) => void;
    closeCurrentPopup: (id: number | string) => void;
    toggleSystemInfoVisibility: () => void;
    getPopup: (id: number | string) => void;
    getActivePopup: () => ReactElement | null | undefined;
  };

  values: {
    registeredPopups: Popup[];
    systemInfoVisible: boolean;
  };

  openedPopupIDs: (string | number)[] | undefined;
}

const InterfaceContext = React.createContext<InterfaceContextProps>({
  openedPopupIDs: undefined,
  actions: {
    openPopup: noop,
    closeCurrentPopup: noop,
    toggleSystemInfoVisibility: noop,
    getPopup: noop,
    getActivePopup: () => null,
  },
  values: {
    registeredPopups: [],
    systemInfoVisible: false,
  },
});

interface InterfaceContextProviderProps {
  children: React.ReactNode;
}

export function InterfaceContextProvider(props: InterfaceContextProviderProps): React.ReactElement {
  const { children } = props;
  // const [popups] = useState<Popup[]>(registeredPopups);
  const registeredPopups: Popup[] = [];
  const [openedPopupIDs, setCurrentPopupIDs] = useState<(string | number)[] | undefined>(undefined);
  const [openedPopupId, setCurrentPopupId] = useState<string | number | undefined>(undefined);

  const [systemInfoVisible, toggleSystemInfoVisibility] = useSwitch(false);

  const { activeTabsetName, activeTab } = useFlexLayoutContext();

  const openPopup = (id: string | number) => {
    const activePopup = registeredPopups.find((p: Popup) => p.id === id);
    if (activeTabsetName && activePopup?.frameId !== activeTabsetName) {
      return;
    }

    setCurrentPopupId(id);
  };
  const closeCurrentPopup = () => {
    setCurrentPopupId(undefined);
  };

  useEffect(() => {
    setCurrentPopupIDs((prev) => {
      return prev?.filter((p) => {
        return registeredPopups.find((v) => v.id === p && v.frameId === activeTabsetName);
      });
    });
  }, [activeTabsetName, activeTab]);

  const getPopup = (targetId: string | number) => {
    const isVisible = !!openedPopupIDs?.find((id) => id === targetId);

    const popup = isVisible ? registeredPopups?.find(({ id }) => id === targetId)?.component : null;

    return isVisible ? popup : null;
  };
  const getActivePopup = () => {
    return openedPopupId ? registeredPopups?.find(({ id }) => id === openedPopupId)?.component : null;
  };

  return (
    <InterfaceContext.Provider
      value={{
        openedPopupIDs,
        actions: {
          openPopup,
          closeCurrentPopup,
          toggleSystemInfoVisibility,
          getPopup,
          getActivePopup,
        },
        values: {
          registeredPopups,
          systemInfoVisible,
        },
      }}
    >
      {children}
    </InterfaceContext.Provider>
  );
}

export const useInterfaceContext = () => React.useContext(InterfaceContext);

export default InterfaceContext;
