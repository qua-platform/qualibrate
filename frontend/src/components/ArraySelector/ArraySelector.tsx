import React, { ChangeEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./ArraySelector.module.scss";

type SelectorOption = {
  id: string;
  title: string;
}

type IProps = {
  key: string
  disabled: boolean
  value: string[]
  options: SelectorOption[]
  onChange: (value: string[]) => void
}

const ArraySelector = ({
  disabled,
  value,
  options,
  onChange,
}: IProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [position, setPosition] = useState<DOMRect>();
  const [openPopup, setOpenPopup] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getSearchStringIndex = useCallback(
    (string: string) => string.trim().toLowerCase().indexOf(searchValue.trim().toLowerCase()),
    [searchValue]
  );
  const showOptionsSelector = useMemo(
    () => options.filter(option => !value.includes(option.id)).length > 0,
    [value, options]
  );
  const filteredOptions = useMemo(
    () => options.filter(option => !value.includes(option.id)).filter(option => getSearchStringIndex(option.title) !== -1),
    [value, options, getSearchStringIndex]
  );

  const togglePopup = () => setOpenPopup(prev => !prev);
  const handleEsc = (evt: KeyboardEvent) => evt.key === "Escape" && setOpenPopup(false);
  const handleSelect = (id: string) => onChange([...value, id]);
  const handleRemoveItem = (id: string) => onChange(value.filter(option => option !== id));
  const handleEnterSearchValue = (evt: ChangeEvent<HTMLInputElement>) => setSearchValue(evt.target.value);
  const handleClearSearchValue = () => setSearchValue("");

  useLayoutEffect(() => {
    const handleClick = (evt: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(evt.target as Node)) {
        setOpenPopup(false);
      }
    };

    if (openPopup) {
      window.addEventListener("mouseup", handleClick);
      window.addEventListener("touchend", handleClick);
      window.addEventListener("keydown", handleEsc);
      return () => {
        window.removeEventListener("mouseup", handleClick);
        window.removeEventListener("touchend", handleClick);
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [openPopup]);

  useEffect(() => {
    openPopup && inputRef.current?.focus();
  }, [openPopup]);

  useEffect(() => {
    if (ref.current)
      setPosition(ref.current.getBoundingClientRect());
  }, [openPopup, value]);

  const renderChip = (optionId: string) => {
    const title = options.find(option => option.id === optionId)?.title || optionId;

    return <div key={optionId} className={styles.chip}>
      <span className={styles.chipLabel} title={title}>{title}</span>
      <button
        className={styles.chipRemoveButton}
        onClick={() => handleRemoveItem(optionId)}
      >
        &times;
      </button>
    </div>;
  };

  const renderSelectorOption = (option: SelectorOption) => {
    const searchStringIndex = getSearchStringIndex(option.title);
    const parts = [
      option.title.slice(0, searchStringIndex),
      option.title.slice(searchStringIndex, searchStringIndex + searchValue.trim().length),
      option.title.slice(searchStringIndex + searchValue.trim().length),
    ];

    return <span
      key={option.id}
      onClick={() => handleSelect(option.id)}
      data-value={option.id}
      className={styles.popupOption}
    >
      {parts.map((part, index) => index === 1 ? <strong key={part}>{part}</strong> : part)}
    </span>;
  };

  return <div className={styles.field}>
    {value.map(renderChip)}
    {showOptionsSelector && !disabled && <div className={styles.popupWrapper} ref={ref}>
      <button className={styles.openPopupButton} onClick={togglePopup}>+</button>
      {openPopup && <div className={styles.popup} style={{ top: position?.bottom, left: position?.left }}>
        <div className={styles.popupInput}>
          <input
            className={styles.searchField}
            value={searchValue}
            onChange={handleEnterSearchValue}
            ref={inputRef}
            type={"text"}
            placeholder={"Search option..."}
          />
          <button
            className={styles.clearSearchButton}
            onClick={handleClearSearchValue}
          >
            &times;
          </button>
        </div>
        <div className={styles.popupList}>
          {filteredOptions.map(renderSelectorOption)}
        </div>
      </div>}
    </div>}
  </div>;
};

export default ArraySelector;
