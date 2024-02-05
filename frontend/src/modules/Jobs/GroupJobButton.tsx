import React, { useMemo } from "react";
import { GroupType } from "../../DEPRECATED_common/DEPRECATED_enum/JobsSortTypes";
import { SortingTableIcon } from "../../ui-lib/Icons/SortingTableIcon";
import DropdownSelect, { Item } from "../../ui-lib/components/Button/DropdownSelect";
import cyKeys from "../../utils/cyKeys";
import { MinifyProp } from "../../types";
import { useJobsListContext } from "./context/JobsListContext";

const groupOptions: Array<Item> = [
  { value: "by workflow", key: GroupType.BY_WORKFLOW },
  { value: "by date", key: GroupType.BY_DATE },
  { value: "no grouping", key: GroupType.NO_GROUPING },
];

const GroupJobButton = ({ minify }: MinifyProp) => {
  const { group, setGrouping } = useJobsListContext();
  const selected = useMemo(() => {
    return groupOptions.find((el) => el.key === group);
  }, [group]);

  return (
    <DropdownSelect
      minify={minify}
      selected={selected}
      list={groupOptions}
      onChange={(item) => setGrouping(item.key as GroupType)}
      icon={SortingTableIcon}
      dataCy={cyKeys.jobs.GROUP_SORT_BUTTON}
    />
  );
};

export default GroupJobButton;
