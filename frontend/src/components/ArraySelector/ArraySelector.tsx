import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import styles from "./ArraySelector.module.scss";
import EnumSelectorDropdown from "./components/EnumSelectorDropdown/EnumSelectorDropdown";
import QubitsSelectorPopup from "./components/QubitsSelectorPopup/QubitsSelectorPopup";
import { classNames } from "../../utils/classnames";

const MAX_LIST_HEIGHT = 200;

export type SelectorOption = {
  id: string;
  title: string;
  online: boolean;
  percent: number;
  lastRun: string;
}

type IProps = {
  parameterKey: string
  disabled: boolean
  value: string[]
  options: SelectorOption[]
  onChange: (value: string[]) => void
}

const ArraySelector = ({
  parameterKey,
  disabled,
  value,
  options,
  onChange,
}: IProps) => {
  const handleRemoveItem = (id: string) => onChange(value.filter(option => option !== id));
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [popupPosition, setPopupPosition] = useState<DOMRect>();
  const listRef = useRef<HTMLDivElement>(null);
  const popupButtonInListRef = useRef<HTMLButtonElement>(null);
  const popupButtonInExpandRef = useRef<HTMLButtonElement>(null);
  const isQubitsSelector = parameterKey === "qubits";
  const showOpenPopupButton = !disabled && options.length !== 0 && (!isQubitsSelector || !isPopupOpen);

  const togglePopup = useCallback(() => setIsPopupOpen(prev => !prev), []);
  const handleClosePopup = () => setIsPopupOpen(false);

  useLayoutEffect(() => {
    // For short and expanded lists attach popup to button in list
    if ((expanded || !showExpandButton) && popupButtonInListRef.current)
      setPopupPosition(popupButtonInListRef.current.getBoundingClientRect());

    // For collapsed list attach popup to 'Show more' button
    if (showExpandButton && popupButtonInExpandRef.current)
      setPopupPosition(popupButtonInExpandRef.current.getBoundingClientRect());
  }, [isPopupOpen, value, expanded, showExpandButton]);

  useLayoutEffect(() => {
    if (!listRef.current) return;

    // Show 'Show more' button when list reach MAX_LIST_HEIGHT
    if (listRef.current.getBoundingClientRect().height >= MAX_LIST_HEIGHT) {
      setShowExpandButton(true);
    } else {
      setShowExpandButton(false);
      setExpanded(false);
    }
  }, [value]);

  const renderChip = (optionId: string) => {
    const title = options.find(option => option.id === optionId)?.title || optionId;

    return <div key={optionId} className={styles.chip}>
      <span className={styles.chipLabel} title={title}>{title}</span>
      <button className={styles.chipRemoveButton} onClick={() => handleRemoveItem(optionId)}>
        &times;
      </button>
    </div>;
  };


  return <div className={classNames(styles.field, expanded && styles.expanded)}>
    <div className={styles.chipsContainer} ref={listRef}>
      {value.map(renderChip)}
      {showOpenPopupButton && (
        <button className={styles.openPopupTrigger} onClick={togglePopup} ref={popupButtonInListRef}>+</button>
      )}
    </div>
    {!expanded && showExpandButton && <div className={styles.showMore}>
      <button className={styles.showMoreButton} onClick={() => setExpanded(true)}>Show more</button>
      {showOpenPopupButton && (
        <button className={styles.openPopupTrigger} onClick={togglePopup} ref={popupButtonInExpandRef}>+</button>
      )}
    </div>}
    {expanded && <button className={styles.showLessButton} onClick={() => setExpanded(false)}>Show less</button>}
    {(isQubitsSelector
      ? <QubitsSelectorPopup
        open={isPopupOpen}
        onClose={handleClosePopup}
        onChange={onChange}
        options={options}
        value={value}
      />
      : <EnumSelectorDropdown
        open={isPopupOpen}
        onClose={handleClosePopup}
        onChange={onChange}
        options={options}
        value={value}
        position={popupPosition}
      />
    )}
  </div>;
};

export default ArraySelector;
