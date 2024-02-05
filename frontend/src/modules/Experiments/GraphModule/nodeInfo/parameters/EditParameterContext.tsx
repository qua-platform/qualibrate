import React, { PropsWithChildren, useContext, useState } from "react";
import { CurrentParameter, EditReferenceType, SuggestedItem } from "../../../types";

import { useNodeInfoContext } from "../../utils/NodeInfoContext";
import useSuggestions from "./parameterEdit/utils/suggestions";

interface IEditParameterContext {
  setReference: (value: EditReferenceType) => void;
  applyReference: () => void;
  suggestedReferences: SuggestedItem[] | null;
  reference: EditReferenceType | null;
  currentParameter: CurrentParameter | null;
  selectParameter: (param: CurrentParameter | null) => void;
}

const EditParameterContext = React.createContext<IEditParameterContext | any>(null);

export const useEditParameterContext = (): IEditParameterContext => useContext<IEditParameterContext>(EditParameterContext);

export function EditParameterContextContainer(props: PropsWithChildren<any>): React.ReactElement {
  const { children } = props;
  const { editInputParameter } = useNodeInfoContext();

  const [currentParameter, setCurrentParameter] = useState<CurrentParameter | null>(null);

  const [reference, setReference] = useState<EditReferenceType | null>(null);

  const [suggestedReferences] = useSuggestions(reference || "");
  const selectParameter = (value: CurrentParameter | null) => {
    setReference(value?.value || null);
    setCurrentParameter(value);
  };

  const applyReference = () => {
    if (!currentParameter) {
      return;
    }

    const payload = {
      [currentParameter.name]: JSON.parse(reference || ""),
    };
    editInputParameter(payload);
    selectParameter(null);
  };

  return (
    <EditParameterContext.Provider
      value={{
        suggestedReferences,
        applyReference,
        currentParameter,
        selectParameter,
        reference,
        setReference,
      }}
    >
      {children}
    </EditParameterContext.Provider>
  );
}
