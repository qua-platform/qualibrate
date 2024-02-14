// import React, { useContext } from "react";
// import { RequestStatus } from "../../../types";
// import { JobDTO } from "../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
// import { AbstractContextWithProjectProvider, AProps } from "../../../utils/contexts/AbstractContextWithProject";
// import { JobApi } from "../../../DEPRECATED_common/DEPRECATED_api/job";
// import { withActiveProjectContext } from "../../ActiveProject/ActiveProjectContext";
// import { JobsFilter, SortOrder } from "../types";
// import { GroupType } from "../../../DEPRECATED_common/DEPRECATED_enum/JobsSortTypes";
// import mqClient, { MQEmitData } from "../../MQTT/utils/MQClient";
// import { MQEvents } from "../../MQTT/utils/mqtt";
// import { MQJobStatus } from "../../MQTT/utils/utils";
// import { JobStatuses } from "../../../DEPRECATED_common/DEPRECATED_enum/JobStatuses";
// import imc, { IMSEvents } from "../../../interModulesCommunicator/InterModulesCommunicator";
// import formJobsListOptions from "../utils/formJobsListOptions";
//
// type RequestsState = {
//   listStatus?: RequestStatus;
// };
// type JobsListState = {
//   list?: Array<JobDTO>;
//   sort: { field: string; order: SortOrder };
//   group: GroupType;
//   filter?: JobsFilter;
//   pageNumber: number;
//   totalPages: number;
//   jobsData?: { total: number; running: number };
//   message?: string | { detail: string };
// };
//
// interface JobsListFunctions {
//   fetchJobsList: (pageNumber?: number) => void;
//   setSortOrder: (sort: { field: string; order: SortOrder }) => void;
//   setGrouping: (groupType: GroupType) => void;
//   setFiltering: (filter?: JobsFilter) => void;
//   setPageNumber: (pageNumber: number) => void;
// }
//
// type IJobsListContext = JobsListState & JobsListFunctions & RequestsState;
//
// const JobsListContext = React.createContext<IJobsListContext | any>(null);
//
// export const useJobsListContext = (): IJobsListContext => useContext<IJobsListContext>(JobsListContext);
//
// export type WithJobsListProps = {
//   list?: Array<JobDTO>;
//   fetchJobsList: (pageNumber?: number) => void;
// };
// export function withJobsListContext(WrappedComponent: React.ComponentType<any>) {
//   // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
//   return function Component(props: any): React.ReactElement {
//     const { list, fetchJobsList } = useJobsListContext();
//     return <WrappedComponent list={list} fetchJobsList={fetchJobsList} {...props} />;
//   };
// }
//
// class JobsListContextContainer extends AbstractContextWithProjectProvider<any, JobsListState, RequestsState, JobsListFunctions> {
//   constructor(props: Readonly<AProps>) {
//     super(props);
//     this.state = {
//       group: GroupType.NO_GROUPING,
//       sort: { field: "date", order: "ascending" },
//       pageNumber: 1,
//       totalPages: 0,
//     };
//   }
//   Context = JobsListContext;
//
//   componentDidMount() {
//     this.fetchJobsList();
//
//     mqClient.on(MQEvents.JOB_STATUS, this._handleMqttJobStatus);
//     imc.on(IMSEvents.JOBS_UPDATE, this._handleIMCJobsUpdate);
//   }
//
//   componentWillUnmount() {
//     mqClient.off(MQEvents.JOB_STATUS, this._handleMqttJobStatus);
//     imc.off(IMSEvents.JOBS_UPDATE, this._handleIMCJobsUpdate);
//   }
//
//   _handleMqttJobStatus = ({ data }: MQEmitData<MQJobStatus>) => {
//     const { id, status, dry_run } = data;
//     this._updateJobStatus(id, status);
//     if (dry_run) {
//       this.fetchJobsList();
//     }
//   };
//
//   _handleIMCJobsUpdate = () => {
//     this.fetchJobsList();
//   };
//
//   _updateJobStatus = (id: number, newStatus: JobStatuses) => {
//     const jobsCopy = [...(this.state.list || [])];
//     const index = jobsCopy.findIndex((j) => j.id === id);
//     if (index > -1) {
//       jobsCopy[index].current_status = newStatus;
//       this.setState({ list: jobsCopy });
//     }
//   };
//
//   fetchJobsList = async (): Promise<void> => {
//     const { sort, filter, group, pageNumber } = this.state;
//     const limit = 50;
//     let isOkFinal: boolean;
//     let resultFinal: JobDTO[] | undefined;
//     let errorFinal: string | { detail: string } | undefined;
//     let totalCount = 0;
//     let totalPages = 0;
//     if (filter?.filterType === "By EUI") {
//       const { isOk, error, result } = await this._fetchWithStatus(
//         ({ project_id }) =>
//           JobApi.getFilteredJobsByEUI({
//             limit,
//             page_number: pageNumber - 1,
//             ...formJobsListOptions({ sort, filter, group }),
//             project_id,
//           }),
//         "listStatus"
//       );
//       isOkFinal = isOk;
//       resultFinal = result?.items as JobDTO[];
//       totalCount = result?.total_items ?? 0;
//       totalPages = result?.total_pages ? result?.total_pages : 0;
//       errorFinal = error;
//     } else {
//       const { isOk, error, result } = await this._fetchWithStatus(
//         ({ project_id }) =>
//           JobApi.getFilteredJobs({
//             limit,
//             page_number: pageNumber - 1,
//             ...formJobsListOptions({ sort, filter, group }),
//             project_id,
//           }),
//         "listStatus"
//       );
//       isOkFinal = isOk;
//       resultFinal = result?.items as JobDTO[];
//       totalCount = result?.total_items ?? 0;
//       totalPages = result?.total_pages ? result?.total_pages : 0;
//       errorFinal = error;
//     }
//
//     this.setState({ list: isOkFinal ? resultFinal : undefined, message: errorFinal, totalPages }, () => this._countJobsData(totalCount));
//   };
//
//   // todo need to be done via backend
//   _countJobsData = (totalCount: number) => {
//     const running = this.state.list?.filter((job) => job.current_status === JobStatuses.RUNNING).length || 0;
//
//     this.setState({ jobsData: { total: totalCount, running } });
//   };
//
//   setSortOrder = (sort: { field: string; order: SortOrder }): void => {
//     this.setState({ sort }, this.fetchJobsList);
//   };
//
//   setGrouping = (group: GroupType) => {
//     this.setState({ group }, this.fetchJobsList);
//   };
//
//   setFiltering = (filter?: JobsFilter): void => {
//     this.setState({ filter }, this.fetchJobsList);
//   };
//   setPageNumber = (pageNumber: number): void => {
//     this.setState({ pageNumber }, this.fetchJobsList);
//   };
//
//   protected funcs = {
//     fetchJobsList: this.fetchJobsList,
//     setSortOrder: this.setSortOrder,
//     setGrouping: this.setGrouping,
//     setFiltering: this.setFiltering,
//     setPageNumber: this.setPageNumber,
//   };
// }
//
// export default withActiveProjectContext(JobsListContextContainer);
