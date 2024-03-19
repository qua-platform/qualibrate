import React, { useMemo, useState } from "react";

import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { PlusIcon } from "../../ui-lib/Icons/PlusIcon";
import SelectField from "../common/Input/SelectField";
import { SettingsPageIcon } from "../../ui-lib/Icons/SettingsPageIcon";
import styles from "./SelectorList.module.scss";
import { NoItemsIcon } from "../../ui-lib/Icons/NoItemsIcon";

type Items = {
  title: string;
  component: React.ReactElement;
};

export interface ListProps {
  customField?: string;
  customArray?: any;
  customSelect?: boolean;
  listLabel?: string;
  placeholder?: string;
  items?: Array<Items>;
  listItems?: Array<Items>;
  selectIcon?: React.ReactElement;
  onClick?: () => void;
}

const List = ({ listLabel, placeholder = "Select item", items, listItems, selectIcon }: ListProps) => {
  const optionsList = listItems ? useMemo(() => [placeholder, ...listItems.map((i) => i.title)], [listItems]) : [];
  const [selectedOption, setSelectedOption] = useState<string>(placeholder);
  return (
    <div className={styles.list}>
      <div className={styles.actionName}>{listLabel}</div>
      <div className={styles.action}>
        <div className={styles.select}>
          {/*{customSelect && (*/}
          <SelectField
            onSelectionChange={(option: React.SetStateAction<string>) => {
              setSelectedOption(option);
            }}
            options={optionsList}
            icon={<SettingsPageIcon />}
          />
        </div>
        {selectIcon && (
          <div className={styles.selectIcon} onClick={() => {}}>
            {selectIcon}
          </div>
        )}
        {!selectIcon && (
          <div
            className={styles.selectIcon}
            onClick={() => {
              // ProjectsApi.addUserToProject(customArray[selectedOptionIndex + 1].id, customField ?? ""); // + 1 is because of the placeholder
            }}
          >
            {selectedOption !== placeholder && <PlusIcon height={38} width={38} color={ACCENT_COLOR_LIGHT} />}
          </div>
        )}
      </div>
      <div className={styles.items}>
        {items && items.map((i) => i.component)}
        {!items?.length && (
          <div className={styles.noItemWrapper}>
            <div>
              <NoItemsIcon />
            </div>
            <div>This user is not used in any project yet</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
