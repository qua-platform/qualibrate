import React, { useCallback } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Project.module.scss";
import { ProjectDTO, selectActiveProject } from "../../../../stores/ProjectStore";
import { BlueButton, ProjectCheckIcon } from "../../../../components";
import cyKeys from "../../../../utils/cyKeys";
import { NODES_KEY } from "../../../AppRoutes";
import { useRootDispatch } from "../../../../stores";
import { setActivePage } from "../../../../stores/NavigationStore";
import { clearData, fetchGitgraphSnapshots } from "../../../../stores/SnapshotsStore";

interface ProjectActionsProps {
  isCurrentProject: boolean;
  projectName: string;
  selectedProject: ProjectDTO | undefined;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ isCurrentProject, projectName, selectedProject }) => {
  const dispatch = useRootDispatch();

  const handleSubmit = useCallback(() => {
    if (!selectedProject) return;

    dispatch(selectActiveProject(selectedProject));
    dispatch(clearData());
    dispatch(fetchGitgraphSnapshots(true));
    dispatch(setActivePage(NODES_KEY));
  }, [ selectedProject ]);

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
