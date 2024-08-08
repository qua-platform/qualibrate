import React, { useContext, useState } from "react";
import noop from "../../../common/helpers";

interface ISelectionContext {
  selectedItemName?: string;
  setSelectedItemName: (selectedNode: string | undefined) => void;
}

const SelectionContext = React.createContext<ISelectionContext>({
  selectedItemName: undefined,
  setSelectedItemName: noop,
});

export const useSelectionContext = (): ISelectionContext => useContext<ISelectionContext>(SelectionContext);

interface SelectionContextProviderProps {
  children: React.JSX.Element;
}

export function SelectionContextProvider(props: SelectionContextProviderProps): React.ReactElement {
  const [selectedItemName, setSelectedItemName] = useState<string | undefined>(undefined);

  return (
    <SelectionContext.Provider
      value={{
        selectedItemName,
        setSelectedItemName,
      }}
    >
      {props.children}
    </SelectionContext.Provider>
  );
}
