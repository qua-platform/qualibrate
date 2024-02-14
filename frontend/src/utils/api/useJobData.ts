// import { JobDTO } from "../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
// import { JobApi } from "../../DEPRECATED_common/DEPRECATED_api/job";
// import { useCallback, useEffect, useState } from "react";
// // import mqClient, { MQEmitData } from "../../modules/MQTT/utils/MQClient";
// import { MQEvents } from "../../modules/MQTT/utils/mqtt";
// import { MQJobStatus } from "../../modules/MQTT/utils/utils";
//
// export default function useJobData(jobId: number | undefined | null): JobDTO | undefined {
//   const [job, setJob] = useState<JobDTO | undefined>(undefined);
//   const _handleMqttJobStatus = useCallback(
//     ({ data }: MQEmitData<MQJobStatus>) => {
//       const { id, status } = data;
//       if (jobId === id) {
//         setJob((j) => (j ? { ...j, current_status: status } : undefined));
//       }
//     },
//     [jobId]
//   );
//
//   useEffect(() => {
//     mqClient.on(MQEvents.JOB_STATUS, _handleMqttJobStatus);
//
//     return () => {
//       mqClient.off(MQEvents.JOB_STATUS, _handleMqttJobStatus);
//     };
//   }, [_handleMqttJobStatus]);
//   useEffect(() => {
//     loadJob();
//   }, [jobId]);
//
//   const loadJob = useCallback(async () => {
//     if (jobId) {
//       const { result, isOk } = await JobApi.getJobById("" + jobId);
//       if (isOk) {
//         setJob(result);
//       }
//     }
//   }, [jobId, setJob]);
//
//   return job;
// }
