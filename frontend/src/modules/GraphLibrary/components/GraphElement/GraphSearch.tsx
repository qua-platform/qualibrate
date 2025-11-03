/**
 * @fileoverview Search input for filtering calibration graphs.
 *
 * Currently non-functional UI placeholder - search functionality not implemented.
 */
import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./GraphElement.module.scss";
import { SearchIcon } from "../../../../ui-lib/Icons/SearchIcon";
import { IconType } from "../../../../common/interfaces/InputProps";
import InputField from "../../../../common/ui-components/common/Input/InputField";

export const GraphSearch: React.FC = () => {
  return (
    <div className={styles.searchContainer}>
      <InputField placeholder={"graph name"} iconType={IconType.INNER} icon={<SearchIcon height={18} width={18} />}></InputField>
    </div>
  );
};
