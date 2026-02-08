import React, { useEffect, useRef, useState } from "react";
import styles from "./SearchField.module.scss";
import InputField from "../Input";

type Props = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
};

const SearchField: React.FC<Props> = ({ placeholder, value, onChange, debounceMs = 300 }) => {
  const [internalValue, setInternalValue] = useState(value);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      onChange(internalValue);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [internalValue, debounceMs, onChange]);

  return (
    <InputField
      dataTestId="search-field"
      inputClassName={styles.searchBoxInput}
      name="search"
      type="search"
      value={internalValue}
      placeholder={placeholder}
      autoComplete="off"
      onChange={(val) => setInternalValue(val)}
    />
  );
};

export default SearchField;
