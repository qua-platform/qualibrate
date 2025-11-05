import React, { useCallback } from "react";
import ProjectCheckIcon from "../../../ui-lib/Icons/ProjectCheckIcon";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../Project.module.scss";
import { ProjectDTO } from "../ProjectDTO";
import BlueButton from "../../../ui-lib/components/Button/BlueButton";
import cyKeys from "../../../utils/cyKeys";
import { useSnapshotsContext } from "../../Snapshots/context/SnapshotsContext";
import { NODES_KEY } from "../../../routing/ModulesRegistry";
import { useRootDispatch } from "../../../stores";
import { selectActiveProject } from "../../../stores/ProjectStore/actions";
import { setActivePage } from "../../../stores/NavigationStore/actions";

interface ProjectActionsProps {
  isCurrentProject: boolean;
  projectName: string;
  selectedProject: ProjectDTO | undefined;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ isCurrentProject, projectName, selectedProject }) => {
  const dispatch = useRootDispatch();
  const { reset, setReset, setSelectedSnapshotId, setAllSnapshots, setJsonData, setResult, setDiffData } = useSnapshotsContext();

  const handleSubmit = useCallback(() => {
    if (!selectedProject) return;

    dispatch(selectActiveProject(selectedProject));
    setSelectedSnapshotId(undefined);
    setJsonData(undefined);
    setResult(undefined);
    setDiffData(undefined);
    setReset(true);

    dispatch(setActivePage(NODES_KEY));
  }, [
    selectedProject,
    dispatch,
    setActivePage,
    setAllSnapshots,
    setSelectedSnapshotId,
    setJsonData,
    setResult,
    setDiffData,
    setReset,
    reset,
  ]);
  return (
    <div className={styles.pageActions}>
      {selectedProject?.name === projectName && (
        <BlueButton
          onClick={handleSubmit}
          className={styles.actionButton}
          disabled={selectedProject === undefined}
          data-cy={cyKeys.projects.LETS_START_BUTTON}
          data-testid={"lets-start-button-" + projectName}
          isBig
        >
          Let’s Start
        </BlueButton>
      )}
      {isCurrentProject && <ProjectCheckIcon />}
    </div>
  );
};

export default ProjectActions;
