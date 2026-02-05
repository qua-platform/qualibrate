import React, { useState, useRef, useCallback, useMemo, ChangeEvent, useEffect } from "react";
import { classNames } from "../../../../utils/classnames";
import styles from "./EnumSelectorDropdown.module.scss";
import { getSearchStringIndex } from "../../utils";
import useClickOutside from "../../../../utils/hooks/useClickOutside";

type EnumSelectorDropdownProps = {
  open: boolean
  onClose: () => void;
  onChange: (id: string | string[]) => void;
  options: string[];
  value: string | string[];
}

const EnumSelectorDropdown = ({
  open,
  onClose,
  onChange,
  options,
  value,
}: EnumSelectorDropdownProps) => {
  const [searchValue, setSearchValue] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useClickOutside(onClose);

  const filteredOptions = useMemo(
    () => options.filter(option => getSearchStringIndex(option, searchValue) !== -1),
    [value, options, searchValue]
  );

  const handleEnterSearchValue = (evt: ChangeEvent<HTMLInputElement>) => setSearchValue(evt.target.value);
  const handleClearSearchValue = () => setSearchValue("");
  const handleSelect = useCallback((id: string) => {
    onChange(id);
    onClose();
  }, [value]);

  useEffect(() => {
    const handleEsc = (evt: KeyboardEvent) => {
      open && evt.key === "Escape" && onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  useEffect(() => {
    open && inputRef.current?.focus();
  }, [open]);

  const renderSelectorOption = (option: string) => {
    const isSelected = value.includes(option);
    const searchStringIndex = getSearchStringIndex(option, searchValue);
    const parts = [
      option.slice(0, searchStringIndex),
      option.slice(searchStringIndex, searchStringIndex + searchValue.trim().length),
      option.slice(searchStringIndex + searchValue.trim().length),
    ];

    return <span
      key={option}
      onClick={() => handleSelect(option)}
      data-value={option}
      className={classNames(styles.popupOption, isSelected && styles.selected)}
    >
      {parts.map((part, index) => index === 1 ? <strong key={part}>{part}</strong> : part)}
    </span>;
  };

  return open && (
    <div className={styles.popupWrapper}>
      <div className={styles.popup} ref={buttonRef}>
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
    </div>
  );
};

export default EnumSelectorDropdown;