import React, { useEffect, useState } from "react";
import { Popup } from "../DEPRECATED_common/DEPRECATED_interfaces/Popup";
import { PopupTypes } from "../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import noop from "../DEPRECATED_common/helpers";
import { registeredPopups } from "../routing/DEPRECATEDpopups";
import { useFlexLayoutContext } from "../routing/flexLayout/FlexLayoutContext";
import useSwitch from "@react-hook/switch";

interface InterfaceContextProps {
  actions: {
    openPopup: (id: PopupTypes) => void;
    closeCurrentPopup: (id: PopupTypes) => void;
    toggleSystemInfoVisibility: () => void;
    getPopup: (id: PopupTypes) => any;
    getActivePopup: () => JSX.Element | null | undefined;
  };

  values: {
    registeredPopups: Popup[];
    systemInfoVisible: boolean;
  };

  openedPopupIDs: PopupTypes[] | undefined;
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
  const [openedPopupIDs, setCurrentPopupIDs] = useState<PopupTypes[] | undefined>(undefined);
  const [openedPopupId, setCurrentPopupId] = useState<PopupTypes | undefined>(undefined);

  const [systemInfoVisible, toggleSystemInfoVisibility] = useSwitch(false);

  const { activeTabsetName, activeTab } = useFlexLayoutContext();

  const openPopup = (id: PopupTypes) => {
    const activePopup = registeredPopups.find((p) => p.id === id);
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

  // const closeCurrentPopup = (id: PopupTypes) => {
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

  const getPopup = (targetId: PopupTypes) => {
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
