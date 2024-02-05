import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { checkJobTopic, MQJobStatus, NodesStatusMap, NodeStatus, StatusFromNode } from "./utils/utils";

import mqClient, { MQEmitData, MqState } from "./utils/MQClient";
import { MQEvents } from "./utils/mqtt";

interface IMQTTContext {
  nodesStatus: NodesStatusMap;
  statusFromNode: StatusFromNode;
  setStatusFromNode: (newStatusFromNode: StatusFromNode | undefined) => void;
  statusFromNodeArray: StatusFromNode[];
  setStatusFromNodeArray: (newStatusFromNodeArray: StatusFromNode[]) => void;
  jobStatus?: MQJobStatus;
  subscribeToJob?: (jobEUI?: string) => void;
}

const MQTTContext = React.createContext<IMQTTContext | any>(null);

export const useMQTTContext = (): IMQTTContext => useContext<IMQTTContext>(MQTTContext);

export function MQTTContextProvider(props: PropsWithChildren): React.ReactElement {
  const { children } = props;

  const [mqState, setMqState] = useState<MqState>(MqState.IDLE);
  useEffect(() => {
    mqClient.on("mq_state", setMqState);
    return () => {
      mqClient.off("mq_state", setMqState);
    };
  }, [setMqState]);

  const [subscribedJob, setSubscribedJob] = useState<string | undefined>(undefined);
  const [nodesStatus, setNodeStatus] = useState<NodesStatusMap>({});
  const [statusFromNode, setStatusFromNode] = useState<StatusFromNode>();
  const [statusFromNodeArray, setStatusFromNodeArray] = useState<StatusFromNode[]>([]);
  const [jobStatus, setJobStatus] = useState<MQJobStatus>();

  const storeInfoForNodeToArray = (statusFromNode: StatusFromNode) => {
    let isUpdated = false;
    setStatusFromNodeArray((prevStatusArray) => {
      const updatedStatusArray = prevStatusArray.map((status) => {
        if (status.eui === statusFromNode.eui && !isUpdated) {
          isUpdated = true;
          return statusFromNode;
        }
        return status;
      });
      if (!isUpdated) {
        updatedStatusArray.push(statusFromNode);
      }
      return updatedStatusArray;
    });
  };

  useEffect(() => {
    mqClient.on(MQEvents.NODE_STATUS, ({ topic, data: nodeStatus }: MQEmitData<NodeStatus>) => {
      if (checkJobTopic(topic, subscribedJob)) {
        setNodeStatus((map) => {
          const copy = { ...map };
          copy[nodeStatus.node] = nodeStatus;
          return copy;
        });
      }
    });
  }, [setNodeStatus, subscribedJob]);

  useEffect(() => {
    mqClient.on(MQEvents.JOB_STATUS, (data: MQJobStatus) => {
      setJobStatus(data);
    });
  }, [setJobStatus]);

  useEffect(() => {
    let topic: string;
    if (subscribedJob) {
      const jobEui = "/j" + subscribedJob.split("/j")[1];
      topic = MQEvents.STATUS_UPDATE_FROM_NODE + "/1" + `${jobEui}`;
      mqClient._subscribe({ topic, qos: 2 });
      mqClient.on(MQEvents.STATUS_UPDATE_FROM_NODE, ({ data: statusFromNode }: MQEmitData<StatusFromNode>) => {
        setStatusFromNode(statusFromNode);
        storeInfoForNodeToArray(statusFromNode);
      });
    }
    return () => {
      if (topic) {
        mqClient._unsubscribe({ topic, qos: 2 });
      }
    };
  }, [subscribedJob]);

  const subscribeToJob = useCallback(
    (jobEUI: string | undefined) => {
      if (subscribedJob !== jobEUI) {
        setNodeStatus({});
      }
      setSubscribedJob(jobEUI);
    },
    [setSubscribedJob, setNodeStatus, subscribedJob]
  );

  return (
    <MQTTContext.Provider
      value={{
        nodesStatus,
        statusFromNode,
        statusFromNodeArray,
        mqState,
        jobStatus,
        subscribeToJob,
        setStatusFromNode,
        setStatusFromNodeArray,
      }}
    >
      {children}
    </MQTTContext.Provider>
  );
}
