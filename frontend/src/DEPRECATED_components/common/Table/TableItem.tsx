import React from "react";
import { TRACKER_BUTTON_VISIBLE, TWEAK_BUTTON_VISIBLE } from "../../../dev.config";

import { ACCENT_COLOR_LIGHT } from "../../../utils/colors";
import DEPRECATEDButton from "../../DEPRECATED_Buttons/ButtonWrapper";
import { ButtonTypes } from "../../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import { OperationIcon } from "../../../ui-lib/Icons/OperationIcon";
import { TableItemProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/TableItemsProps";
import TargetButton from "../../DEPRECATED_Buttons/TargetButton";
import TweakButton from "../../DEPRECATED_Buttons/TweakButton";
import { copyToKeyboard } from "../../../utils/ui/copyToKeyboard";
import styles from "./Table.module.scss";
import useSwitch from "@react-hook/switch";
import { useNodeInfoContext } from "../../../modules/Experiments/GraphModule/utils/NodeInfoContext";

const TableItem = ({
  rowIcon,
  rowName = "Parameter",
  rowValue = 0,
  allowCopy,
  allowTweakable,
  allowRealtimeTracking,
  rowId,
}: TableItemProps) => {
  const [isActive, toggle] = useSwitch(false); //todo: pass exact value from API

  const { selectedNode } = useNodeInfoContext();

  // todo: ask Maxim to send values
  return (
    <div className={styles.item}>
      <div className={styles.name}>
        <div>{rowIcon}</div>
        <span>{rowName}</span>
      </div>
      <div className={styles.value}>{rowValue}</div>
      <div className={styles.itemActions}>
        {allowCopy && (
          <DEPRECATEDButton
            icon={<OperationIcon color={ACCENT_COLOR_LIGHT} />}
            type={ButtonTypes.PLAIN}
            onClickCallback={() => copyToKeyboard("#" + selectedNode?.id + "/" + rowId)}
          />
        )}
        {TWEAK_BUTTON_VISIBLE && allowTweakable && <TweakButton isActive={true} onClick={() => {}} />}
        {TRACKER_BUTTON_VISIBLE && allowRealtimeTracking && <TargetButton isActive={isActive} onClick={toggle} />}
      </div>
    </div>
  );
};

export default TableItem;
