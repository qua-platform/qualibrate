import React, { useRef, useState } from "react";
import styles from "./JobActions.module.scss";
import { MinifyProp } from "../../../../../types";
import { JobDTO } from "../../../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import { classNames } from "../../../../../utils/classnames";
import ThreeDotsIcon from "../../../../../ui-lib/Icons/ThreeDotsIcon";
import useOnClickOutside from "../../../../../ui-lib/hooks/useOnClickOutside";
import IconButton, { IconButtonProps } from "../../../../../ui-lib/components/Button/IconButton";
import useJobActions from "./useJobActions";

type Props = MinifyProp & { job: JobDTO; isShown: boolean };
const JobActions: React.FC<Props> = ({ job, isShown, minify }) => {
  const [commonActions, scheduleActionProps] = useJobActions(job);
  return minify ? (
    <MinifiedActions commonActions={commonActions} scheduleActionProps={scheduleActionProps} />
  ) : (
    <LargeActions isShown={isShown} commonActions={commonActions} scheduleActionProps={scheduleActionProps} />
  );
};

const LargeActions: React.FC<{
  isShown?: boolean;
  scheduleActionProps?: IconButtonProps;
  commonActions: Array<IconButtonProps>;
}> = ({ isShown, scheduleActionProps, commonActions }) => {
  return (
    <>
      <div className={classNames(styles.commonActions, !isShown && styles.hidden)}>
        {commonActions.map((p, i) => (
          <IconButton key={i} {...p} />
        ))}
        {scheduleActionProps && (
          <div className={classNames(styles.scheduledAction, !isShown && styles.hidden)}>
            <IconButton {...scheduleActionProps} isBlue />
          </div>
        )}
      </div>
    </>
  );
};

const MinifiedActions: React.FC<{
  scheduleActionProps?: IconButtonProps;
  commonActions: Array<IconButtonProps>;
}> = ({ scheduleActionProps, commonActions }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [expand, setExpand] = useState<boolean>(false);
  useOnClickOutside(ref, () => setExpand(false));

  return (
    <div className={classNames(styles.minifiedContainer)} ref={ref}>
      <button onClick={() => setExpand((e) => !e)} className={styles.threeDots}>
        <ThreeDotsIcon />
      </button>
      {expand && (
        <div className={styles.popupList}>
          {commonActions.map((p, i) => (
            <IconButton key={i} {...p} withText />
          ))}
          {scheduleActionProps && <IconButton {...scheduleActionProps} withText />}
        </div>
      )}
    </div>
  );
};

export default JobActions;
