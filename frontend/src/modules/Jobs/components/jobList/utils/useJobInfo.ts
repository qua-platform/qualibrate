import { useCallback, useEffect, useState } from "react";
import { JobApi } from "../../../../../DEPRECATED_common/DEPRECATED_api/job";
import { JobDTO } from "../../../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import { IJobParameters, JobStatusDetails } from "../../../types";

export default function useJobInfo(job: JobDTO): {
  status: JobStatusDetails | undefined;
  params: IJobParameters | undefined;
  fetchData: () => void;
} {
  const [status, setStatus] = useState<JobStatusDetails | undefined>();
  const [params, setParams] = useState<IJobParameters | undefined>();

  const fetchData = useCallback(async () => {
    const { isOk: statusOk, result: newStatus } = await JobApi.getJobStatus(job.id);
    if (statusOk && newStatus) {
      const sorted = newStatus.job_statuses.sort((st1, st2) => -Date.parse(st1.timestamp) + Date.parse(st2.timestamp));
      setStatus(sorted[0].details);
    }
    const { isOk: paramOk, result: newParams } = await JobApi.getJobParameters(job.id, job.eui);

    if (paramOk) {
      setParams(newParams);
    }
  }, [job, setParams, setStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { status, params, fetchData };
}
