import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./DateInput.module.scss";

type Props = {
  value?: Date;
  onChange: (d: Date) => void;
};
const DateInput = ({ value, onChange }: Props) => {
  return (
    <div>
      <DatePicker
        selected={value}
        onChange={onChange}
        className={styles.calendar}
        calendarClassName={styles.calendarBody}
        dayClassName={() => styles.calendarDay}
        showPopperArrow={false}
        dateFormat="yyyy-MM-dd"
        placeholderText="yyyy-mm-dd"
      />
    </div>
  );
};

export default DateInput;
