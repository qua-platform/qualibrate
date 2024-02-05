import React, { useMemo } from "react";
import Checkbox from "../../../../../ui-lib/components/Checkbox/Checkbox";
import cyKeys from "../../../../../utils/cyKeys";
import { useJobsSelectionContext } from "../../../context/JobsSelectionContext";

export default function JobCheckBox({ jobId, className }: { jobId: number; className?: string }): React.ReactElement {
  const { selectJob, unselectJob, selectedJobs } = useJobsSelectionContext();
  const enabled = useMemo(() => Boolean(selectedJobs?.find((j) => j.id === jobId)), [selectedJobs, jobId]);
  return (
    <div
      style={{
        height: "45px",
        width: "45px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Checkbox
        className={className}
        checked={enabled}
        onChange={(val) => (val ? selectJob(jobId) : unselectJob(jobId))}
        data-cy={cyKeys.jobs.SELECT_CHECKBOX}
      />
    </div>
  );
}
