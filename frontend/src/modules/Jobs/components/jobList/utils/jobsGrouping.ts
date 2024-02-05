import { JobDTO } from "../../../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";

function extractDate(dateString?: Date) {
  return dateString ? dateString.toString().split("T")[0] : null;
}

export function groupJobsByDate(jobs?: Array<JobDTO>): {
  [key: string]: Array<JobDTO>;
} {
  if (!jobs) {
    return {};
  }
  // todo use it or remake API JobApi.getJobDateRanges
  const uniqDatesEntries = new Set(jobs.map((jobs) => [extractDate(jobs.submit), []]));
  const groupedJobs: {
    [key: string]: Array<JobDTO>;
  } = Object.fromEntries(uniqDatesEntries);

  jobs.map((j) => {
    const jobDate = extractDate(j.submit) || "-";
    groupedJobs[jobDate].push(j);
  });

  return groupedJobs;
}
