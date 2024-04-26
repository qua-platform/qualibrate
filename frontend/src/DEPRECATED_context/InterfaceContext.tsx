import React, { useEffect, useState } from "react";
import { Popup } from "../DEPRECATED_common/DEPRECATED_interfaces/Popup";
// import { any } from "../DEPRECATED_common/DEPRECATED_enum/any";
import noop from "../DEPRECATED_common/helpers";
// import { registeredPopups } from "../routing/DEPRECATEDpopups";
import { useFlexLayoutContext } from "../routing/flexLayout/FlexLayoutContext";
import useSwitch from "@react-hook/switch";

interface InterfaceContextProps {
  actions: {
    openPopup: (id: any) => void;
    closeCurrentPopup: (id: any) => void;
    toggleSystemInfoVisibility: () => void;
    getPopup: (id: any) => void;
    getActivePopup: () => JSX.Element | null | undefined;
  };

  values: {
    registeredPopups: Popup[];
    systemInfoVisible: boolean;
  };

  openedPopupIDs: any[] | undefined;
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
  const registeredPopups: any[] = [];
  const [openedPopupIDs, setCurrentPopupIDs] = useState<any[] | undefined>(undefined);
  const [openedPopupId, setCurrentPopupId] = useState<any | undefined>(undefined);

  const [systemInfoVisible, toggleSystemInfoVisibility] = useSwitch(false);

  const { activeTabsetName, activeTab } = useFlexLayoutContext();

  const openPopup = (id: any) => {
    const activePopup = registeredPopups.find((p: any) => p.id === id);
    if (activeTabsetName && activePopup?.frameId !== activeTabsetName) {
      return;
    }

    setCurrentPopupId(id);
    // setCurrentPopupIDs((prev) => {
    //   const IDs = prev ? [...prev] : [];
    //
    //   IDs.push(id);
    //
    //   return IDs;
    // });
  };

  // const closeCurrentPopup = (id: any) => {
  //   setCurrentPopupIDs((prev) => {
  //     return prev?.filter((p) => p !== id);
  //   });
  // };

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

  const getPopup = (targetId: any) => {
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

export default InterfaceContext;
