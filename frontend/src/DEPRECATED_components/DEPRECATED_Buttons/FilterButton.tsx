import React from "react";

import { AppliedFilterIcon } from "../../ui-lib/Icons/AppliedFilterIcon";
import { FilterIcon } from "../../ui-lib/Icons/FilterIcon";
import styles from "./styles/FilterButton.module.scss";
import OutlineButton from "../../ui-lib/components/Button/OutlineButton";
import { MinifyProp } from "../../types";

type Props = {
  onClick: () => void;
  isApplied: boolean;
  dataCy?: string;
} & MinifyProp;
const FilterButton: React.FunctionComponent<Props> = ({ isApplied, onClick, dataCy }) => {
  return (
    <OutlineButton onClick={onClick} data-cy={dataCy} title={"Filter"} isCircle className={isApplied ? styles.activeFilterButton : null}>
      {isApplied ? <AppliedFilterIcon /> : <FilterIcon />}
    </OutlineButton>
  );
};

export default FilterButton;
