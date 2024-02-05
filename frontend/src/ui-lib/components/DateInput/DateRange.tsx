import "react-datepicker/dist/react-datepicker.css";
import styles from "./DateRange.module.scss";
import DateInput from "./index";

type Props = {
  start?: Date;
  end?: Date;
  onStartChange: (d: Date) => void;
  onEndChange: (d: Date) => void;
};
const DateRange = ({ start, end, onEndChange, onStartChange }: Props) => {
  return (
    <div className={styles.inputContainer}>
      <DateInput value={start} onChange={onStartChange} />
      -
      <DateInput value={end} onChange={onEndChange} />
    </div>
  );
};

export default DateRange;
