import React, { useState } from "react";

import Table from "../../../../../DEPRECATED_components/common/Table";
import { TableItemProps } from "../../../../../DEPRECATED_common/DEPRECATED_interfaces/TableItemsProps";
import cyKeys from "../../../../../utils/cyKeys";
import { useNodeInfoContext } from "../../utils/NodeInfoContext";
import ContentBox from "../common/ContentBox";
import { useMQTTContext } from "../../../../MQTT/MQTTContext";

const Statistics = () => {
  const { nodeInfo, selectedNode } = useNodeInfoContext();
  const { nodesStatus } = useMQTTContext();

  const tableItems: TableItemProps[] = [
    {
      rowName: "Command",
      rowValue: nodeInfo?.command || "",
    },
    {
      rowName: "Executable",
      rowValue: nodeInfo?.bin || "",
    },
    {
      rowName: "CPU (%)",
      rowValue: (nodesStatus[selectedNode?.ident || ""] as any)?.resources?.cpu,
    },
    {
      rowName: "Memory (MB)",
      rowValue: Math.round(((nodesStatus[selectedNode?.ident || ""] as any)?.resources?.ram || 0) * 1000) / 1000,
    },
  ];

  return (
    <ContentBox data-cy={cyKeys.experiment.STATISTICS_PANEL}>
      <Table items={tableItems} data-cy={cyKeys.experiment.STATISTICS_PANEL} />
    </ContentBox>
  );
};

export default Statistics;
