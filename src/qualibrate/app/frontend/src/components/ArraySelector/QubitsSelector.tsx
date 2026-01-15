import React, { useState } from "react";
import QubitsSelectorPopup from "./components/QubitsSelectorPopup/QubitsSelectorPopup";
import ArraySelectorTrigger from "./components/ArraySelectorTrigger/ArraySelectorTrigger";
import { QubitMetadataList } from "../Parameters/Parameters";

type IProps = {
  disabled: boolean
  value: string[]
  metadata: QubitMetadataList
  onChange: (value: string[]) => void
}

const QubitsSelector = ({
  disabled,
  value,
  metadata,
  onChange,
}: IProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleTogglePopup = () => setIsPopupOpen(prev => !prev);
  const handleClosePopup = () => setIsPopupOpen(false);

  return <>
    <ArraySelectorTrigger onClick={handleTogglePopup} value={value} disabled={disabled} />
    <QubitsSelectorPopup
      open={isPopupOpen}
      onClose={handleClosePopup}
      onChange={onChange}
      metadata={metadata}
      value={value}
    />
  </>;
};

export default QubitsSelector;
