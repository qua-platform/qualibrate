import React from "react";

import styles from "./ExperimentHeader.module.scss";
import { useExperimentModulesContext } from "../context/ExperimentModulesContext";
import { PanelsEnum } from "../types";
import PageHeader from "../../../ui-lib/components/headers/PageHeader/PageHeader";
import { useGraphContext } from "../GraphModule/utils/GraphContext";
import TabsSwitch from "../../../ui-lib/components/TabsSwitch/TabsSwitch";
import { CodeIcon } from "../../../ui-lib/Icons/CodeIcon";
import cyKeys from "../../../utils/cyKeys";
import { WorkflowIcon } from "../../../ui-lib/Icons/WorkflowIcon";
import { DotsIcon } from "../../../ui-lib/Icons/DotsIcon";
import { SYSTEM_PANEL_VISIBLE } from "../../../dev.config";
import JobWorkflowLabel from "./JobWorkflowLabel";
import RunButton from "./RunButton";

interface Props {
  onChangeModule: (moduleId: PanelsEnum) => void;
  minify: boolean;
}

const tabs = [
  {
    icon: CodeIcon,
    text: "Code",
    value: PanelsEnum.CODE,
    dataCy: cyKeys.experiment.WORKFLOW_CODE_BUTTON,
  },
  {
    icon: WorkflowIcon,
    text: "Workflow",
    value: PanelsEnum.WORKFLOW,
    dataCy: cyKeys.experiment.WORKFLOW_VIEW_BUTTON,
  },
  {
    icon: DotsIcon,
    text: "System",
    value: PanelsEnum.SYSTEM,
    // isHidden: !SYSTEM_PANEL_VISIBLE,
    dataCy: cyKeys.experiment.WORKFLOW_SYSTEM_BUTTON,
  },
];
const ExperimentHeader = ({ onChangeModule }: Props) => {
  const { activePanel } = useExperimentModulesContext();
  const { graphData } = useGraphContext();

  const subMenu = graphData?.description ?? "";

  return (
    <PageHeader title={graphData?.name || ""} subTitle={subMenu} withBorder>
      <div className={styles.headerInfo}>
        <JobWorkflowLabel />

        <TabsSwitch tabs={tabs} onSelect={(key) => onChangeModule(key as PanelsEnum)} minify={true} selected={activePanel} />
        <RunButton />
      </div>
    </PageHeader>
  );
};

export default ExperimentHeader;
