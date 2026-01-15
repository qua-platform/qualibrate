import React, { useState } from "react";
import EnumSelectorDropdown from "./components/EnumSelectorDropdown/EnumSelectorDropdown";
import ArraySelectorTrigger from "./components/ArraySelectorTrigger/ArraySelectorTrigger";
import { ExpandIcon } from "../Icons";
import { classNames } from "../../utils/classnames";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./ArraySelector.module.scss";

type IProps = {
  disabled: boolean
  value: string | string[]
  options: string[]
  onChange: (value: string | string[]) => void
}

const EnumSelector = ({
  disabled,
  value,
  options,
  onChange,
}: IProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleTogglePopup = () => setIsPopupOpen(prev => !prev);
  const handleClosePopup = () => setIsPopupOpen(false);

  return <>
    <ArraySelectorTrigger
      onClick={handleTogglePopup}
      value={value}
      disabled={disabled}
      icon={<ExpandIcon className={classNames(isPopupOpen && styles.enumIconExpanded)} />}
    />
    <EnumSelectorDropdown
      open={isPopupOpen}
      onClose={handleClosePopup}
      onChange={onChange}
      options={options}
      value={value}
    />
  </>;
};

export default EnumSelector;
