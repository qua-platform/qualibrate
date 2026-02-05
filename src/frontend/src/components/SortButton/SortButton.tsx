import React, { useState } from "react";
import { SortIcon } from "../Icons";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./SortButton.module.scss";
import { classNames } from "../../utils/classnames";
import useClickOutside from "../../utils/hooks/useClickOutside";

type IOption<T> = {
  label: string
  value: T
}

type Props<T> = {
  options: IOption<T>[];
  onSelect: (type: T) => void;
};

const SortButton = <T,>({ options, onSelect }: Props<T>) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<T>(options[0].value);
  const ref = useClickOutside(() => setShowOptions(false));

  const onClickHandler = () => {
    setShowOptions(!showOptions);
  };

  const selectOptionHandler = (option: T) => {
    setSelectedOption(option);
    setShowOptions(false);
    onSelect(option);
  };
  return (
    <div data-testid="sort-button" className={styles.wrapper}>
      <div className={styles.filterButton} id="dateFilterBtn" onClick={onClickHandler}>
        <SortIcon width={16} height={16} />
      </div>
      <div className={classNames(styles.sortDropdown, showOptions && styles.active)} id="dateFilterDropdown" ref={ref}>
        {options.map((option) => (
          <div
            key={option.value as string}
            onClick={() => selectOptionHandler(option.value)}
            className={classNames(styles.sortOption, selectedOption === option.value && styles.selected)}
            data-filter={option}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};
export default SortButton;
