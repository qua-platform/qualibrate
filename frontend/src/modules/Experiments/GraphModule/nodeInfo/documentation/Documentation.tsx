import React from "react";
import DocumentationTable from "./DocumentationTable";
import Header from "../../../../../ui-lib/components/headers/Header";
import cyKeys from "../../../../../utils/cyKeys";
import { useNodeInfoContext } from "../../utils/NodeInfoContext";
import ContentBox from "../common/ContentBox";

const Documentation = () => {
  const { selectedNode, nodeInfo } = useNodeInfoContext();

  return (
    <ContentBox data-cy={cyKeys.experiment.DOCUMENTATION_PANEL}>
      <Header title={selectedNode?.id} subTitle={nodeInfo?.description} withBtmMargin />
      <DocumentationTable />
    </ContentBox>
  );
};

export default React.memo(Documentation);
