import React, { useCallback } from "react";
import ProjectCheckIcon from "../../../ui-lib/Icons/ProjectCheckIcon";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../Project.module.scss";
import { ProjectDTO } from "../ProjectDTO";
import BlueButton from "../../../ui-lib/components/Button/BlueButton";
import cyKeys from "../../../utils/cyKeys";
import { NODES_KEY } from "../../../routing/ModulesRegistry";
import { useRootDispatch } from "../../../stores";
import { selectActiveProject } from "../../../stores/ProjectStore/actions";
import { setActivePage } from "../../../stores/NavigationStore/actions";
import { useSelector } from "react-redux";
import { getReset } from "../../../stores/SnapshotsStore/selectors";
import { setDiffData, setJsonData, setReset, setResult, setSelectedSnapshotId } from "../../../stores/SnapshotsStore/actions";

interface ProjectActionsProps {
  isCurrentProject: boolean;
  projectName: string;
  selectedProject: ProjectDTO | undefined;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ isCurrentProject, projectName, selectedProject }) => {
  const dispatch = useRootDispatch();
  const reset = useSelector(getReset);

  const handleSubmit = useCallback(() => {
    if (!selectedProject) return;

    dispatch(selectActiveProject(selectedProject));
    dispatch(setSelectedSnapshotId(undefined));
    dispatch(setJsonData(undefined));
    dispatch(setResult(undefined));
    dispatch(setDiffData(undefined));
    dispatch(setReset(true));

    dispatch(setActivePage(NODES_KEY));
  }, [ selectedProject, reset ]);
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
