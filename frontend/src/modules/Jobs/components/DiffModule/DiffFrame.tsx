import useSwitch from "@react-hook/switch";
import JobDiff from "../JobDiff/JobDiff";
import DiffPanel from "./DiffPanel";

import styles from "./styles/DiffFrame.module.scss";
import { classNames } from "../../../../utils/classnames";

type Props = {
  name: string;
  diff?: string;
};

const DiffFrame = ({ name = "Parameters diff", diff }: Props) => {
  const [visible, toggleDiff] = useSwitch(true);

  return (
    <div className={classNames(styles.wrapper, visible && styles.visible)}>
      <DiffPanel name={name} onClick={toggleDiff} active={visible} />
      <div className={classNames(styles.subFrames, visible && styles.visible)}>{visible && <JobDiff jobsDiff={diff} />}</div>
    </div>
  );
};

export default DiffFrame;
