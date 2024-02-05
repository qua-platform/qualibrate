import React from "react";

import { JobDTO } from "../../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import cyKeys from "../../../../utils/cyKeys";
import JobRow from "../jobList/jobRow/JobRow";
import { MinifyProp } from "../../../../types";

type Props = {
  jobs: JobDTO[];
} & MinifyProp;

const JobItems = ({ jobs, minify }: Props) => {
  return (
    <div data-cy={cyKeys.jobs.LIST}>
      {jobs?.map((job) => (
        <JobRow job={job} key={job.id} minify={minify} />
      ))}
    </div>
  );
};

export default JobItems;
