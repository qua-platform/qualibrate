import styles from "./EnumSelectorDropdown.module.scss";
import React, { useState, useRef, useCallback, useMemo, ChangeEvent, useLayoutEffect, useEffect } from "react";
import { SelectorOption } from "../../ArraySelector";

const EnumSelectorDropdown = ({
  open,
  onClose,
  onChange,
  options,
  value,
  position,
}: {
  open: boolean
  onClose: () => void;
  onChange: (id: string[]) => void;
  options: SelectorOption[];
  value: string[];
  position?: DOMRect;
}) => {
  const [searchValue, setSearchValue] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const getSearchStringIndex = useCallback(
    (sourceString: string) => sourceString.trim().toLowerCase().indexOf(searchValue.trim().toLowerCase()),
    [searchValue]
  );
  const filteredOptions = useMemo(
    () => options.filter(option => !value.includes(option.id)).filter(option => getSearchStringIndex(option.title) !== -1),
    [value, options, getSearchStringIndex]
  );

  const handleEsc = (evt: KeyboardEvent) => evt.key === "Escape" && onClose();
  const handleEnterSearchValue = (evt: ChangeEvent<HTMLInputElement>) => setSearchValue(evt.target.value);
  const handleClearSearchValue = () => setSearchValue("");
  const handleSelect = useCallback((id: string) => onChange([...value, id]), [value]);

  useLayoutEffect(() => {
    const handleClick = (evt: MouseEvent | TouchEvent) => {
      if (buttonRef?.current && !buttonRef.current.contains(evt.target as Node)) {
        onClose();
      }
    };

    if (open) {
      window.addEventListener("mouseup", handleClick);
      window.addEventListener("touchend", handleClick);
      window.addEventListener("keydown", handleEsc);
      return () => {
        window.removeEventListener("mouseup", handleClick);
        window.removeEventListener("touchend", handleClick);
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [open]);

  useEffect(() => {
    open && inputRef.current?.focus();
  }, [open]);

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

  return open && (
    <div className={styles.popup} style={{ top: position?.bottom, left: position?.left }} ref={buttonRef}>
      <div className={styles.popupInput}>
        <input
          className={styles.searchField}
          value={searchValue}
          onChange={handleEnterSearchValue}
          ref={inputRef}
          type={"text"}
          placeholder={"Search option..."} />
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
    </div>
  );
};

export default EnumSelectorDropdown;