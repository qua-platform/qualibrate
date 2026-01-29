import React from "react";
import { DateFilterIcon } from "../Icons";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./DateFilter.module.scss";
import { classNames } from "../../utils/classnames";
import useClickOutside from "../../utils/hooks/useClickOutside";

type Props = {
  options?: string[];
  from?: string;
  to?: string;
  setFrom?: (date: string) => void;
  setTo?: (date: string) => void;
  onSelect?: (preset?: string) => void;
};

const defaultOptions = ["Today", "Last 7 days", "Last 30 days"];

const DateFilter: React.FC<Props> = ({ options = defaultOptions, from, to, setFrom, setTo, onSelect }) => {
  const [showOptions, setShowOptions] = React.useState(false);
  const ref = useClickOutside(() => setShowOptions(false));

  const toggleDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  const selectPreset = (e: React.MouseEvent<HTMLDivElement>, option: string) => {
    e.stopPropagation();
    setShowOptions(false);
    if (onSelect) onSelect(option);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, type: "from" | "to", value: string) => {
    const parts = value.split("-");
    if (parts.length === 3) {
      let year = parts[0];
      const month = parts[1];
      const day = parts[2];
      if (year.length > 4) {
        year = year.slice(0, 4);
        e.preventDefault();
      }
      value = `${year}-${month}-${day}`;
    }

    if (type === "from" && setFrom) setFrom(value);
    if (type === "to" && setTo) setTo(value);
  };

  return (
    <div className={styles.wrapper}>
      <div data-testid="date-filter" className={styles.filterButton} onClick={toggleDropdown}>
        <DateFilterIcon width={16} height={16} />
      </div>
      <div className={classNames(styles.dateFilterDropdown, showOptions && styles.active)} ref={ref}>
        {options.map((option) => (
          <div key={option} onClick={(e) => selectPreset(e, option)} className={styles.dateFilterOption} data-filter={option}>
            {option}
          </div>
        ))}

        <div className={styles.dateRangeInputs}>
          <div className={styles.dateInputGroup}>
            <label>From</label>
            <input
              data-testid="execution-history-date-filter-input-from"
              type="date"
              value={from || ""}
              onChange={(e) => handleDateChange(e, "from", e.target.value)}
            />
          </div>

          <div className={styles.dateInputGroup}>
            <label>To</label>
            <input
              data-testid="execution-history-date-filter-input-to"
              type="date"
              value={to || ""}
              onChange={(e) => handleDateChange(e, "to", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateFilter;
