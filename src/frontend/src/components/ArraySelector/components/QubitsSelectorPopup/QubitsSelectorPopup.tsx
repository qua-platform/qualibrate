import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./QubitsSelectorPopup.module.scss";
import { Dialog, Button } from "@mui/material";
import { classNames } from "../../../../utils/classnames";
import { QubitMetadata, QubitMetadataList } from "../../../Parameters/Parameters";
import { getSearchStringIndex } from "../../utils";

type IProps = {
  open: boolean;
  onClose: () => void;
  value: string[];
  metadata: QubitMetadataList;
  onChange: (value: string[]) => void;
}

const Qubit = ({
  option,
  metadata,
  handleSelect,
  handleRemoveItem,
  selection,
  searchValue,
}: {
  option: string;
  metadata: QubitMetadata;
  handleSelect: (id: string) => void;
  handleRemoveItem: (id: string) => void;
  selection: string[];
  searchValue: string;
}) => {
  const searchStringIndex = getSearchStringIndex(option, searchValue);
  const isActive = metadata.active;
  const isSelected = selection.includes(option);
  const parts = [
    option.slice(0, searchStringIndex),
    option.slice(searchStringIndex, searchStringIndex + searchValue.trim().length),
    option.slice(searchStringIndex + searchValue.trim().length),
  ];

  const handleClick = () => {
    if (!isActive) return;

    isSelected
      ? handleRemoveItem(option)
      : handleSelect(option);
  };

  return <div
    onClick={handleClick}
    data-value={option}
    data-testid={`option_${option}`}
    className={classNames(styles.popupOption, !isActive && styles.offline, isSelected && styles.selected)}
  >
    <span className={styles.popupOptionLabel} title={parts.join("")}>
      {parts.map((part, index) => index === 1 ? <strong key={part}>{part}</strong> : part)}
    </span>
    <div className={styles.popupOptionStatus}>{isActive ? "active" : "inactive"}</div>
    <span className={styles.popupOptionFooter}>{metadata.fidelity}%</span>
  </div>;
};

const QubitsSelectorPopup = ({
  open,
  onClose,
  value,
  metadata,
  onChange,
}: IProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [selection, setSelection] = useState<string[]>([]);
  const options = Object.keys(metadata);
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredOptions = useMemo(
    () => options.filter(option => getSearchStringIndex(option, searchValue) !== -1),
    [options, searchValue]
  );

  const handleSelect = (id: string) => setSelection(prev => [...prev, id]);
  const handleRemoveItem = useCallback((id: string) => setSelection(selection.filter(option => option !== id)), [selection]);
  const handleSelectAll = useCallback(() =>
    setSelection(filteredOptions)
  , [filteredOptions]);
  const handleClear = () => setSelection([]);
  const handleSelectOnline = () => setSelection(options.filter(option => metadata[option].active));
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
            <Qubit
              key={option}
              option={option}
              metadata={metadata[option]}
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
