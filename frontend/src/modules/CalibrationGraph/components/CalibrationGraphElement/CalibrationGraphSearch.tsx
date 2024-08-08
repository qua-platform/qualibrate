import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../CalibrationGraphElement/CalibrationGraphElement.module.scss";
import InputField from "../../../../DEPRECATED_components/common/Input/InputField";
import { SearchIcon } from "../../../../ui-lib/Icons/SearchIcon";
import { IconType } from "../../../../common/interfaces/InputProps";

export const CalibrationGraphSearch: React.FC = () => {
  return (
    <div className={styles.searchContainer}>
      <InputField placeholder={"graph name"} iconType={IconType.INNER} icon={<SearchIcon height={18} width={18} />}></InputField>
    </div>
  );
};
