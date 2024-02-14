// const MQTT_PROTOCOL = window.location.protocol.includes("https") ? "wss://" : "ws://"; // should not be edited
// const URL = window.location.host ?? "dev.entropy-lab.io";
// export const MQTT_HOST = process.env.REACT_APP_MQTT_HOST ?? MQTT_PROTOCOL + URL + "/updates/ws";
//
// export const MQTT_OPTIONS = {
//   clean: true, // retain session
//   connectTimeout: 4000, // Timeout period
//   // Authentication information
//   clientId: "ui" + Math.floor(Math.random() * 1000).toString(),
//   username: "webui_user",
//   password: "webui_password",
//   keepalive: 30,
// };
//
// export enum MQEvents {
//   JOB_STATUS = "job_status_update",
//   NODE_STATUS = "status_updates",
//   STATUS_UPDATE_FROM_NODE = "nodes_status_updates",
// }
//
// export const getEventFromTopic = (topic: string): string => {
//   return topic.split("/")[0];
// };
// export function anySubTopic(topic: string) {
//   return topic + "/+";
// }
// export type TopicItem = {
//   topic: string;
//   qos: 0 | 1 | 2;
// };
//
// export const MQTT_TOPICS: Array<TopicItem> = [
//   {
//     topic: anySubTopic(MQEvents.NODE_STATUS + "/1"), // topic: "status_updates/1/+", test: mqttHQ-client-test
//     qos: 2,
//   },
//   {
//     topic: MQEvents.JOB_STATUS,
//     qos: 2,
//   },
// ];
