import DEPRECATEDButton from "./ButtonWrapper";
import { ButtonTypes } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import { CalendarIcon } from "../../ui-lib/Icons/CalendarIcon";
import React from "react";
import styles from "./styles/CalendarButton.module.scss";

const CalendarButton = () => {
  return (
    <DEPRECATEDButton
      actionName="02/05/22 – 18/05/22 "
      icon={<CalendarIcon />}
      type={ButtonTypes.ACTION}
      iconSide="RIGHT"
      customClassName={styles.calendarButton}
    />
  );
};

export default CalendarButton;
