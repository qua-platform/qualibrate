import React from "react";

import { EDITING_FUNCTION_ACTIVE } from "../../../../../dev.config";

import cyKeys from "../../../../../utils/cyKeys";
import { useEditParameterContext } from "../../../GraphModule/nodeInfo/parameters/EditParameterContext";
import styles from "./EditableTableValue.module.scss";
import { classNames } from "../../../../../utils/classnames";

interface Props {
  value: string | null;
  name: string;
  isEditable?: boolean;
  highlight?: boolean;
}

const EditableTableValue = ({ value, name, isEditable, highlight }: Props) => {
  const { selectParameter } = useEditParameterContext();

  const handleReferenceEdit = () => {
    selectParameter({ name, value: value || "" });
  };

  if (!EDITING_FUNCTION_ACTIVE) {
    return <div className={styles.content}>{value}</div>;
  }

  return (
    <button
      title={"Edit: " + value}
      disabled={!isEditable}
      onClick={handleReferenceEdit}
      data-cy={cyKeys.EDITABLE_CELL}
      className={classNames(styles.content, highlight && styles.highlight)}
    >
      {value}
    </button>
  );
};

export default EditableTableValue;
