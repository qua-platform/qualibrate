import { ExperimentModulesContextProvider, useExperimentModulesContext } from "./context/ExperimentModulesContext";
import React from "react";
import { withContexts } from "../../ui-lib/hooks/withContexts";
import GraphContextContainer, { useGraphContext } from "./GraphModule/utils/GraphContext";
import styles from "./ExperimentPage.module.scss";
import ExperimentHeader from "./header/ExperimentHeader";
import useModuleStyle from "../../ui-lib/hooks/useModuleStyle";
import GraphModule from "./GraphModule";
import { PanelsEnum } from "./types";
import CodeModule from "./CodeModule";
import SystemModule from "./SystemModule/SystemModule";
import { useOnProjectUpdate } from "../ActiveProject/utils";

const ExperimentPage = () => {
  const { setActivePanel, activePanel } = useExperimentModulesContext();
  const { loadGraph } = useGraphContext();
  useOnProjectUpdate(loadGraph);
  const [ref, , minify] = useModuleStyle<HTMLDivElement>();

  return (
    <div ref={ref} className={styles.container}>
      <ExperimentHeader minify={minify} onChangeModule={(id) => setActivePanel(id)} />
      <div className={styles.viewer}>
        <GraphModule active={activePanel === PanelsEnum.WORKFLOW} />
        <CodeModule active={activePanel === PanelsEnum.CODE} />
        <SystemModule active={activePanel === PanelsEnum.SYSTEM} />
      </div>
    </div>
  );
};

export default withContexts<void>(ExperimentPage, [ExperimentModulesContextProvider, GraphContextContainer]);
