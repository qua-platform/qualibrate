import React, { useCallback } from "react";
import ProjectCheckIcon from "../../../ui-lib/Icons/ProjectCheckIcon";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../Project.module.scss";
import { ProjectDTO } from "../ProjectDTO";
import BlueButton from "../../../ui-lib/components/Button/BlueButton";
import cyKeys from "../../../utils/cyKeys";
import { useFlexLayoutContext } from "../../../routing/flexLayout/FlexLayoutContext";
import { useProjectContext } from "../context/ProjectContext";
import { useSnapshotsContext } from "../../Snapshots/context/SnapshotsContext";
import { NODES_KEY } from "../../../routing/ModulesRegistry";

interface ProjectActionsProps {
  isCurrentProject: boolean;
  projectName: string;
  selectedProject: ProjectDTO | undefined;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ isCurrentProject, projectName, selectedProject }) => {
  const { openTab } = useFlexLayoutContext();
  const { handleSelectActiveProject } = useProjectContext();
  const { reset, setReset, setSelectedSnapshotId, setAllSnapshots, setJsonData, setResult, setDiffData } = useSnapshotsContext();

  const handleSubmit = useCallback(() => {
    if (!selectedProject) return;

    handleSelectActiveProject(selectedProject);
    setSelectedSnapshotId(undefined);
    setJsonData(undefined);
    setResult(undefined);
    setDiffData(undefined);
    setReset(true);

    openTab(NODES_KEY);
  }, [
    selectedProject,
    handleSelectActiveProject,
    openTab,
    setAllSnapshots,
    setSelectedSnapshotId,
    setJsonData,
    setResult,
    setDiffData,
    setReset,
    reset,
  ]);
  return (
    <div>
      <div>{isCurrentProject && <ProjectCheckIcon />}</div>
      <div className={styles.pageActions}>
        {selectedProject?.name === projectName && !isCurrentProject && (
          <BlueButton
            onClick={handleSubmit}
            className={styles.actionButton}
            disabled={selectedProject === undefined}
            data-cy={cyKeys.projects.LETS_START_BUTTON}
            isBig
          >
            Let’s Start
          </BlueButton>
        )}
      </div>
    </div>
  );
};

export default ProjectActions;
