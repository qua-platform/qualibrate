import React from "react";
import LoadingBar from "../../../../../ui-lib/loader/LoadingBar";
import Header from "../../../../../ui-lib/components/headers/Header";
import ParametersTable from "../../../components/ExperimentPanels/Tables/ParametersTable";
import cyKeys from "../../../../../utils/cyKeys";
import { useNodeInfoContext } from "../../utils/NodeInfoContext";
import { isOk } from "../../../../../utils/statusHelpers";
import { CopyButton } from "../../../../../ui-lib/components/Button/CopyButton";
import { EditParameterContextContainer, useEditParameterContext } from "./EditParameterContext";
import ReferenceModule from "./parameterEdit/ParameterEditContainer";
import ContentBox from "../common/ContentBox";

const Parameters = () => {
  const { selectedNode, nodeInfo, nodeInfoStatus } = useNodeInfoContext();
  const { currentParameter } = useEditParameterContext();
  return (
    <>
      <ContentBox data-cy={cyKeys.experiment.PARAMETERS_PANEL}>
        <Header title={selectedNode?.id} subTitle={`${nodeInfo?.name}`} withBtmMargin>
          <CopyButton value={`#${selectedNode?.id || ""}`} />
        </Header>
        {isOk(nodeInfoStatus) ? <ParametersTable /> : <LoadingBar text="Loading parameters..." icon={undefined} />}
      </ContentBox>
      {currentParameter !== null && <ReferenceModule />}
    </>
  );
};

export default React.memo(() => (
  <EditParameterContextContainer>
    <Parameters />
  </EditParameterContextContainer>
));
