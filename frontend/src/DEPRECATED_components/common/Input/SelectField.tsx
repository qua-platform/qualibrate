import React, { useState } from "react";
import { SelectProps } from "../../../common/interfaces/SelectProps";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Input.module.scss";

const SelectField = (props: SelectProps) => {
  const [value, setValue] = useState(props.value ?? "");

  const handleChange = (event: {
    target: { value: React.SetStateAction<string | number>; selectedIndex: React.SetStateAction<number> };
  }) => {
    setValue(event.target.value as string);
    props.onSelectionChange && props.onSelectionChange(event.target.value as string);
  };

  return (
    <select className={styles.input} value={value} onChange={handleChange} name={props.placeholder ?? "Select a value from the list"}>
      {props.options?.map((optionName, index) => (
        <option value={optionName} key={index}>
          {optionName}
        </option>
      ))}
    </select>
  );
};

export default SelectField;
