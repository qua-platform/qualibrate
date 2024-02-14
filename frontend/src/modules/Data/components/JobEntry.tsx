// import React, { useContext, useMemo } from "react";
// import { JobDTO } from "../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
// import styles from "./JobEntry.module.scss";
// import DataViewContext from "../context/DataViewContext";
// import cyKeys from "../../../utils/cyKeys";
// import Checkbox from "../../../ui-lib/components/Checkbox/Checkbox";
// import { formatDate } from "../../../utils/date";
// import { classNames } from "../../../utils/classnames";
// import { Tooltip } from "@mui/material";
//
// const JobEntry = ({ job, handleOnClick }: { job: JobDTO; handleOnClick: () => void }) => {
//   const { selectedJob } = useContext(DataViewContext);
//   const isActive = useMemo(() => selectedJob?.id === job.id, [selectedJob, job]);
//
//   return (
//     <Tooltip title={`${formatDate(job.submit)} – ${formatDate(job.end)}`}>
//       <button className={classNames(styles.experiment, isActive && styles.active)} data-cy={cyKeys.data.EXPERIMENT} onClick={handleOnClick}>
//         <Checkbox checked={isActive} onChange={() => {}} />
//         <div className={styles.experimentInfo}>
//           <div className={styles.description}>{job.description}</div>
//           <div className={styles.operation}>
//             <div>{job.eui?.path}</div>
//             <div>
//               {formatDate(job.submit)} {job.author?.username}
//             </div>
//           </div>
//         </div>
//       </button>
//     </Tooltip>
//   );
// };
//
// export default JobEntry;
