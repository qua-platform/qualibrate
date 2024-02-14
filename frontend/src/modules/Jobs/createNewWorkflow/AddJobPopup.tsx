import DEPRECATEDCheckbox from "../../../DEPRECATED_components/common/Checkbox/DEPRECATEDCheckbox";
import React, { useCallback, useState } from "react";

import BlueButton from "../../../ui-lib/components/Button/BlueButton";
import DEPRECATEDButton from "../../../DEPRECATED_components/DEPRECATED_Buttons/ButtonWrapper";
import { DRIVER_FIELDS_VISIBLE } from "../../../dev.config";
import { DriverIcon } from "../../../ui-lib/Icons/DriverIcon";
import InputController from "../../../DEPRECATED_components/common/Input/InputController";
import InputField from "../../../DEPRECATED_components/common/Input/InputField";
import { ParameterIcon } from "../../../ui-lib/Icons/ParameterIcon";
import PopupActions from "../../../DEPRECATED_components/Popup/PopupActions";
import PopupContainer from "../../../DEPRECATED_components/Popup/PopupContainer";
import PopupHeader from "../../../DEPRECATED_components/Popup/PopupHeader";
import PopupItems from "../../../DEPRECATED_components/Popup/PopupItems";
import { PopupTypes } from "../../../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import { TargetIcon } from "../../../ui-lib/Icons/TargetIcon";
import WithLabel from "../../../DEPRECATED_components/wrappers/withLabel";
import { WorkflowCircleIcon } from "../../../ui-lib/Icons/WorkflowCircleIcon";
import styles from "./AddJobPopup.module.scss";
import cyKeys from "../../../utils/cyKeys";
import { useJobActionsContext } from "../context/JobActionsContext";
import { PopupProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/Popup";

type DefaultValueCheckbox = {
  isChecked: boolean;
  name: string;
};

const AddJobPopup = ({ onClose }: PopupProps) => {
  const { runJob } = useJobActionsContext();

  const handleJobAdding = (data: any) => {
    runJob(data);
    onClose();
  };

  // DEPRECATEDCheckbox logic

  const [defaultValues, setDefaultValues] = useState<DefaultValueCheckbox[]>([
    {
      name: "workflow",
      isChecked: true,
    },
    {
      name: "parameters",
      isChecked: true,
    },
  ]);

  const handleDefaultValuesChange = useCallback((newStatus: boolean, checkboxName: string) => {
    setDefaultValues((prev) => prev.map((v) => (v.name === checkboxName ? { ...v, isChecked: newStatus } : { ...v })));
  }, []);

  const getCheckboxPropsByName = (name: string): DefaultValueCheckbox | Record<string, unknown> =>
    defaultValues.find((v) => v.name === name) ?? {};

  return (
    <PopupContainer
      onSubmit={handleJobAdding}
      formName="addJobForm"
      customClassName={styles.addJobPopup}
      type={PopupTypes.ADD_JOB}
      data-cy={cyKeys.jobs.ADD_JOB_POPUP}
    >
      <PopupHeader headerName="Add Job" />
      <PopupItems className={styles.popupWrapper}>
        {/*<InputField icon={<TargetIcon />} label="Run target" options={["Localhost"]} />*/}
        <InputField icon={<TargetIcon />} label="Run target" />
        {DRIVER_FIELDS_VISIBLE && (
          <InputField icon={<DriverIcon />} label="Drivers" placeholder="Add commit ID #driver" />
        ) ? <InputField icon={<DriverIcon />} label="Drivers" placeholder="Add commit ID #driver" />: <></>}
        <InputField
          icon={<WorkflowCircleIcon />}
          label="Workflow"
          placeholder="Add commit ID"
          name="workflow_id"
          disabled={Boolean(getCheckboxPropsByName("workflow")?.isChecked)}
          className={styles.inputWithCheckbox}
        />
        <WithLabel label="Use current workflow" className={styles.checkboxLabel}>
          <DEPRECATEDCheckbox onChange={handleDefaultValuesChange} {...getCheckboxPropsByName("workflow")} />
        </WithLabel>

        <InputField
          icon={<ParameterIcon />}
          label="Parameters"
          placeholder="Add commit ID #parameter"
          name="parameters_id"
          disabled={Boolean(getCheckboxPropsByName("parameters").isChecked)}
          className={styles.inputWithCheckbox}
        />
        <WithLabel label="Use current parameters" className={styles.checkboxLabel}>
          <DEPRECATEDCheckbox onChange={handleDefaultValuesChange} {...getCheckboxPropsByName("parameters")} />
        </WithLabel>

        <InputController placeholder="Job description" name="description" onChange={() => {}}/>
        {/* <DEPRECATEDCheckbox description="Don't schedule, just checkout configuration" /> */}
      </PopupItems>
      <PopupActions>
        <DEPRECATEDButton onClickCallback={onClose} actionName="Cancel" />
        <BlueButton type="submit">Add</BlueButton>
      </PopupActions>
    </PopupContainer>
  );
};

export default AddJobPopup;
