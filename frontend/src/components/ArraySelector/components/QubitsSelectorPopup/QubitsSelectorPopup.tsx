import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./QubitsSelectorPopup.module.scss";
import { Dialog, Button } from "@mui/material";
import { classNames } from "../../../../utils/classnames";

type SelectorOption = {
  id: string;
  title: string;
  online: boolean;
  percent: number;
  lastRun: string;
}

type IProps = {
  open: boolean;
  onClose: () => void;
  value: string[];
  options: SelectorOption[];
  onChange: (value: string[]) => void;
}

const getSearchStringIndex = (string: string, searchValue: string) =>
  string.trim().toLowerCase().indexOf(searchValue.trim().toLowerCase());

const SelectorOption = ({
  option,
  handleSelect,
  handleRemoveItem,
  selection,
  searchValue,
}: {
  option: SelectorOption;
  handleSelect: (id: string) => void;
  handleRemoveItem: (id: string) => void;
  selection: string[];
  searchValue: string;
}) => {
  const searchStringIndex = getSearchStringIndex(option.title, searchValue);
  const isOnline = option.online;
  const isSelected = selection.includes(option.id);
  const parts = [
    option.title.slice(0, searchStringIndex),
    option.title.slice(searchStringIndex, searchStringIndex + searchValue.trim().length),
    option.title.slice(searchStringIndex + searchValue.trim().length),
  ];

  const handleClick = () => {
    if (!isOnline) return;

    isSelected
      ? handleRemoveItem(option.id)
      : handleSelect(option.id);
  };

  return <div
    onClick={handleClick}
    data-value={option.id}
    data-testid={`option_${option.id}`}
    className={classNames(styles.popupOption, !isOnline && styles.offline, isSelected && styles.selected)}
  >
    <span className={styles.popupOptionLabel} title={parts.join("")}>
      {parts.map((part, index) => index === 1 ? <strong key={part}>{part}</strong> : part)}
    </span>
    <div className={styles.popupOptionStatus}>{isOnline ? "online" : "offline"}</div>
    <span className={styles.popupOptionFooter}>
      {option.percent}% • {option.lastRun} ago
    </span>
  </div>;
};

const QubitsSelectorPopup = ({
  open,
  onClose,
  value,
  options,
  onChange,
}: IProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [selection, setSelection] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredOptions = useMemo(
    () => options.filter(option => getSearchStringIndex(option.title, searchValue) !== -1),
    [options, searchValue]
  );

  const handleSelect = (id: string) => setSelection(prev => [...prev, id]);
  const handleRemoveItem = useCallback((id: string) => setSelection(selection.filter(option => option !== id)), [selection]);
  const handleSelectAll = useCallback(() =>
    setSelection(filteredOptions.map(option => option.id))
  , [filteredOptions]);
  const handleClear = () => setSelection([]);
  const handleSelectOnline = () => setSelection(options.filter(option => option.online).map(option => option.id));
  const handleApply = () => {
    onChange(selection);
    onClose();
  };
  const handleCancel = () => {
    setSelection(value);
    onClose();
  };

  const handleEnterSearchValue = (evt: ChangeEvent<HTMLInputElement>) => setSearchValue(evt.target.value);
  const handleClearSearchValue = () => setSearchValue("");

  useEffect(() => {
    open && inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setSelection(value);
  }, [value]);

  return <Dialog
      open={open}
      onClose={handleCancel}
      classes={{ paper: styles.popup }}
    >
      <div className={styles.popupHeader}>
        Select qubits...
      </div>
      <div className={styles.popupContent}>
        <div className={styles.popupControls}>
          <div className={styles.popupInput}>
            <input
              className={styles.searchField}
              value={searchValue}
              onChange={handleEnterSearchValue}
              role={"search"}
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
          <Button className={classNames(styles.button, styles.selectButton)} onClick={handleSelectAll} data-testid="selectAll">
            Select All
          </Button>
          <Button className={classNames(styles.button, styles.selectButton)} onClick={handleClear} data-testid="clearAll">
            Clear All
          </Button>
          <Button className={classNames(styles.button, styles.selectButton)} onClick={handleSelectOnline} data-testid="onlineOnly">
            Online Only
          </Button>
        </div>
        <div className={styles.popupList}>
          {filteredOptions.map((option) => (
            <SelectorOption
              key={option.id}
              option={option}
              handleSelect={handleSelect}
              handleRemoveItem={handleRemoveItem}
              selection={selection}
              searchValue={searchValue}
            />
          ))}
        </div>
      </div>
      <div className={styles.popupFooter}>
        <span className={styles.popupFooterCounter}>
          <strong>{selection.length}</strong> qubits selected
        </span>
        <div>
          <Button className={classNames(styles.button, styles.cancelButton)} onClick={handleCancel} role="cancel">
            Cancel
          </Button>
          <Button className={classNames(styles.button, styles.applyButton)} onClick={handleApply} role="apply">
            Apply Selection
          </Button>
        </div>
      </div>
    </Dialog>;
};

export default QubitsSelectorPopup;
