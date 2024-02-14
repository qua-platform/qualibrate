// import React, { useContext, useEffect, useMemo } from "react";
// import GroupedByDateJobs from "../../GroupedByDateJobs";
// import JobItems from "./JobItems";
// import LoadingBar from "../../../../ui-lib/loader/LoadingBar";
// import { GroupType } from "../../../../DEPRECATED_common/DEPRECATED_enum/JobsSortTypes";
// import WorkflowContext from "../../../Experiments/context/WorkflowContext";
// import WorkflowWithJobs from "../../WorkflowWithJobs";
// import jobListStyles from "./Job.module.scss";
// import styles from "../../styles/JobList.module.scss";
// import { useJobsListContext } from "../../context/JobsListContext";
// import { MinifyProp } from "../../../../types";
// import { WorkflowPlaceHolderIcon } from "../../../../ui-lib/Icons/WorkflowPlaceholderIcon";
// import PaginationWrapper from "../../../Pagination/PaginationWrapper";
// import { WorkflowDTO } from "../../../Experiments/types";
//
// export const DisplayMessage = (text: string, smallWorkflowIcon?: boolean) => {
//   if (smallWorkflowIcon) {
//     return <LoadingBar text={text} icon={<WorkflowPlaceHolderIcon width={273} height={55} />} />;
//   }
//   return <LoadingBar text={text} />;
// };
// const JobList: React.FunctionComponent<MinifyProp> = ({ minify }) => {
//   const { list, sort, message, setPageNumber, totalPages } = useJobsListContext();
//
//   const { group } = useJobsListContext();
//
//   const { workflows, getWorkflows } = useContext(WorkflowContext);
//
//   useEffect(() => {
//     getWorkflows(sort.order);
//   }, [sort]);
//
//   const Jobs = useMemo(() => {
//     if (!workflows) {
//       return;
//     }
//
//     const ListOfJobsByWorkflows = workflows?.map((workflow: WorkflowDTO, index: number) => (
//       <WorkflowWithJobs key={index} workflow={workflow} />
//     ));
//
//     const ListOfJobs = list && <div className={jobListStyles.job}>{<JobItems jobs={list} minify={minify} />}</div>;
//
//     switch (group) {
//       case GroupType.NO_GROUPING:
//         return ListOfJobs;
//       case GroupType.BY_DATE:
//         return <GroupedByDateJobs />;
//       default:
//         return ListOfJobsByWorkflows;
//     }
//   }, [group, list, workflows, minify]);
//
//   return (
//     <div className={styles.jobList}>
//       {list?.length ? Jobs : DisplayMessage((message as { detail: string })?.detail ?? "No jobs were found")}
//       <PaginationWrapper numberOfPages={totalPages} setPageNumber={setPageNumber} />
//     </div>
//   );
// };
//
// export default JobList;
