import React, { useCallback } from "react";
import { getActiveProject, getAllProjects, ProjectDTO, selectActiveProject } from "../../../stores/ProjectStore";
import styles from "./ProjectList.module.scss";
import { classNames, stringToHexColor } from "../../../utils";
import { useSelector } from "react-redux";
import { useRootDispatch } from "../../../stores";
import { clearData, fetchGitgraphSnapshots } from "../../../stores/SnapshotsStore";
import { setActivePage } from "../../../stores/NavigationStore";
import { NODES_KEY } from "../../AppRoutes";
import { fetchAllCalibrationGraphs } from "../../../stores/GraphStores/GraphLibrary";
import { fetchAllNodes } from "../../../stores/NodesStore";

const ProjectList = () => {
  const dispatch = useRootDispatch();
  const allProjects = useSelector(getAllProjects);
  const activeProject = useSelector(getActiveProject);

  const handleSetActiveProject = useCallback((selectedProject: ProjectDTO) => {
    dispatch(selectActiveProject(selectedProject));
    dispatch(clearData());
    dispatch(fetchGitgraphSnapshots(true));
    dispatch(fetchAllNodes());
    dispatch(fetchAllCalibrationGraphs());
    dispatch(setActivePage(NODES_KEY));
  }, []);

  return (
    <div className={styles.projectMenuSection}>
      {allProjects.map((project) => (
        <div
          key={project.name}
          className={classNames(styles.projectListItem, activeProject?.name === project.name && styles.selected)}
          onClick={() => handleSetActiveProject(project)}
        >
          <span className={styles.projectInitial} style={{ backgroundColor: stringToHexColor(project.name ?? "") }}>
            {project.name.toUpperCase().slice(0, 1)}
          </span>
          <span>{project.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;