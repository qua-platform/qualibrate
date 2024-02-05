import { JobStatuses } from "../../../DEPRECATED_common/DEPRECATED_enum/JobStatuses";
import { DataDictionary } from "../../Experiments/GraphModule/nodeInfo/Status/Status";

export enum WSStatus {
  IDLE = "idle",
  CONNECTING = "connecting",
  CONNECT = "connect",
  ERROR = "error",
  RECONNECT = "reconnect",
  MESSAGE = "message",
}

export type NodeStatus = {
  node: string;
  msg: string;
  resources?: { cpu: string | number; ram: string | number };
  style: "initialised" | "running" | "finished" | "error";
};

export type NodesStatusMap = {
  [key: string]: NodeStatus;
};

export type StatusFromNode = {
  eui: string;
  msg: DataDictionary;
  style: DataDictionary;
};

export type MQJobStatus = {
  id: number;
  status: JobStatuses;
  dry_run?: boolean;
};

export function parseMessage(message: string) {
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(message);
  } catch (err) {
    parsedPayload = message;
  }
  return parsedPayload;
}

export function checkJobTopic(topic: string, jobEUI?: string) {
  if (!jobEUI) return false;
  const eui = "/j" + jobEUI.split("/j")[1];
  return topic.includes(eui);
}
