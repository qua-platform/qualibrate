import React, { useState } from "react";
import { SortIcon } from "../Icons";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./SortButton.module.scss";
import { classNames } from "../../utils/classnames";
import useClickOutside from "../../utils/hooks/useClickOutside";

type Props = {
  options?: string[];
  onSelect: (type: string) => void;
};

const defaultOptions = ["Date (Newest first)", "Name (A-Z)", "Result (Success First)"];

const SortButton: React.FC<Props> = ({ options = defaultOptions, onSelect }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>(options[0]);
  const ref = useClickOutside(() => setShowOptions(false));

  const onClickHandler = () => {
    setShowOptions(!showOptions);
  };

  const selectOptionHandler = (option: string) => {
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
            key={option}
            onClick={() => selectOptionHandler(option)}
            className={classNames(styles.sortOption, selectedOption === option && styles.selected)}
            data-filter={option}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};
export default SortButton;
