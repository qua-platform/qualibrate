import { useState } from "react";
import cyKeys from "../../../utils/cyKeys";
import DropdownSelect from "../../../ui-lib/components/Button/DropdownSelect";
import { SortingAscendingIcon } from "../../../ui-lib/Icons/SortingAscendingIcon";
import { MinifyProp } from "../../../types";
import { SortOrder } from "../types";
// import { useJobsListContext } from "../context/JobsListContext";

const sortOptions: Array<SortItem> = [
  { value: "newest", key: "descending" },
  { value: "oldest", key: "ascending" },
];

type SortItem = { value: string; key: SortOrder };

const OrderSortButton = ({ minify }: MinifyProp) => {
  // const { setSortOrder } = useJobsListContext();
  const [selected, setSelected] = useState<SortItem>(sortOptions[0]);

  // useEffect(() => {
  //   setSortOrder({ field: "date", order: selected.key });
  // }, [selected, setSortOrder]);

  return (
    <DropdownSelect
      minify={minify}
      selected={selected}
      list={sortOptions}
      onChange={(e) => setSelected(e as any)}
      icon={SortingAscendingIcon}
      dataCy={cyKeys.jobs.START_DATE_SORT_BUTTON}
    />
  );
};

export default OrderSortButton;
