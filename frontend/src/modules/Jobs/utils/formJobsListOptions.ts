// import { JobListOptions, JobsFilter, SortOrder } from "../types";
// import { GroupType } from "../../../DEPRECATED_common/DEPRECATED_enum/JobsSortTypes";
// import { formatDateForAPI } from "../../../utils/formatDateForAPI";
//
// export default function formJobsListOptions({
//   sort,
//   filter,
// }: {
//   sort?: { field: string; order: SortOrder };
//   group?: GroupType;
//   filter?: JobsFilter;
// }): JobListOptions {
//   const options: JobListOptions = Object.fromEntries(Object.entries(filter || {}).filter(([_, v]) => v != null && v !== ""));
//
//   if (filter?.start_date) {
//     if (filter?.filterType === "By name") {
//       options.start_date = formatDateForAPI(filter.start_date);
//     } else if (filter?.filterType === "By EUI") {
//       options.submit_min_date = formatDateForAPI(filter.start_date);
//       delete options.start_date;
//     }
//   }
//
//   /***
//    * This change is requested by Nikola
//    */
//   if (filter?.search_request && filter?.filterType === "By EUI") {
//     if (filter.search_request.startsWith("#/j*/")) {
//       options.search_path = filter.search_request.replace("#/j*/", "/");
//     } else if (!filter.search_request.startsWith("/")) {
//       options.search_path = decodeURI("/" + filter.search_request);
//     } else {
//       options.search_path = decodeURI(filter.search_request);
//     }
//     delete options.search_request;
//   }
//
//   if (filter?.end_date) {
//     if (filter?.filterType === "By name") {
//       options.end_date = formatDateForAPI(filter.end_date);
//     } else if (filter?.filterType === "By EUI") {
//       options.submit_max_date = formatDateForAPI(filter.end_date);
//       delete options.end_date;
//     }
//   }
//
//   if (filter?.filterType === "By EUI") {
//     options.order = sort?.order;
//   } else {
//     if (sort?.field === "date") {
//       options.date_order = sort.order;
//     }
//   }
//
//   if (filter?.username) {
//     options.username = filter?.username;
//   }
//
//   if (filter?.filterType === "By EUI") {
//     delete options.statuses;
//   }
//
//   delete options.filterType;
//   return options;
// }
