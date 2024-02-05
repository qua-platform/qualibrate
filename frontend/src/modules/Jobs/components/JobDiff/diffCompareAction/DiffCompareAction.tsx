import React, { useCallback, useMemo, useState } from "react";
import { ACTIVE_TEXT } from "../../../../../utils/colors";
import { CompareIcon } from "../../../../../ui-lib/Icons/CompareIcon";
import { useJobDiffContext } from "../../../context/JobDiffContext";

import styles from "./DiffCompareAction.module.scss";
import DropdownButton from "../../../../../ui-lib/components/Button/DropdownSelect/DropdownButton";
import { JobDTO } from "../../../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import cyKeys from "../../../../../utils/cyKeys";
import { useJobsSelectionContext } from "../../../context/JobsSelectionContext";
const DiffCompareAction = () => {
  const { diffObject, setDiffJobs, diffJobs } = useJobDiffContext();
  const [opened, setOpened] = useState<0 | 1 | undefined>(undefined);

  const { selectedJobs } = useJobsSelectionContext();

  const handleSelect = useCallback(
    (job: JobDTO) => {
      if (opened !== undefined && diffJobs) {
        const newVal: [JobDTO, JobDTO] = [...diffJobs];
        newVal[opened] = job;
        setDiffJobs(newVal);
        setOpened(undefined);
      }
    },
    [opened, diffJobs, setOpened]
  );

  const list: JobDTO[] = useMemo(() => {
    if (opened === undefined || !selectedJobs) {
      return [];
    }
    const forbiddenPath = diffJobs[(opened + 1) % 2]?.eui?.path;

    if (!forbiddenPath) {
      return selectedJobs;
    }
    return selectedJobs.filter((job) => job.eui.path !== forbiddenPath);
  }, [diffObject, opened, diffJobs]);

  return (
    <div className={styles.wrapper} data-cy={cyKeys.jobs.diff.SELECT}>
      <DropdownButton
        value={diffJobs && diffJobs[0] ? diffJobs[0].eui.path : ""}
        expanded={opened === 0}
        onClick={() => setOpened((o) => (o === 0 ? undefined : 0))}
      />
      <CompareIcon color={ACTIVE_TEXT} width={22} height={22} />
      <DropdownButton
        value={diffJobs && diffJobs[1] ? diffJobs[1].eui.path : ""}
        expanded={opened === 1}
        onClick={() => setOpened((o) => (o === 1 ? undefined : 1))}
      />
      {opened !== undefined && <JobsList list={list} onSelect={handleSelect} />}
    </div>
  );
};

function JobsList({ list, onSelect }: { list: JobDTO[]; onSelect: (job: JobDTO) => void }) {
  return (
    <div className={styles.list}>
      {list.map((job) => (
        <button data-cy={cyKeys.jobs.diff.SELECT_LIST_ITEM} className={styles.item} onClick={() => onSelect(job)}>
          <div>{job.description}</div>
          <div className={styles.subText}>{job.eui.path}</div>
        </button>
      ))}
    </div>
  );
}

export default DiffCompareAction;
