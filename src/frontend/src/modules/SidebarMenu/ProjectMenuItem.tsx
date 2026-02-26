import styles from "./styles/ProjectMenuItem.module.scss";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { classNames } from "../../utils/classnames";
import { useSelector } from "react-redux";
import { getActiveProject, getAllProjects, ProjectDTO, selectActiveProject } from "../../stores/ProjectStore";
import { useRootDispatch } from "../../stores";
import { fetchAllNodes } from "../../stores/NodesStore";
import { fetchAllCalibrationGraphs } from "../../stores/GraphStores/GraphLibrary";
import { clearData, fetchGitgraphSnapshots } from "../../stores/SnapshotsStore";
import { setActivePage } from "../../stores/NavigationStore";
import { NODES_KEY } from "../AppRoutes";
import { stringToHexColor } from "../Data/components/ExecutionCard/components/TagsList/helpers";
import AddEditProjectModal from "./AddEditProjectModal/AddEditProjectModal";
import useClickOutside from "../../utils/hooks/useClickOutside";
import DeleteProjectModal from "./DeleteProjectModal/DeleteProjectModal";
import GlobalThemeContext, { GlobalThemeContextState } from "../themeModule/GlobalThemeContext";
import { deleteProject } from "../../stores/ProjectStore/utils";

const ProjectMenuItem = () => {
  const { setMinifySideMenu } = useContext(GlobalThemeContext) as GlobalThemeContextState;
  const dispatch = useRootDispatch();
  const allProjects = useSelector(getAllProjects);
  const activeProject = useSelector(getActiveProject);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");
  const ref = useClickOutside(() => setShowDropdown(false));
  const actionDisabled = activeProject?.name === "demo_project";

  useEffect(() => {
    if (activeProject) {
      dispatch(fetchAllNodes());
      dispatch(fetchAllCalibrationGraphs());
    }
  }, [activeProject]);

  const handleSetActiveProject = useCallback((selectedProject: ProjectDTO) => {
    dispatch(selectActiveProject(selectedProject));
    dispatch(clearData());
    dispatch(fetchGitgraphSnapshots(true));
    dispatch(setActivePage(NODES_KEY));
  }, []);

  const toggleProjectMenu = () => {
    setMinifySideMenu(false);
    setShowDropdown(!showDropdown);
  };
  const openCreateModal = () => {
    setModalMode("add");
    setIsAddEditModalVisible(true);
  };
  const editCurrentProject = () => {
    setModalMode("edit");
    setIsAddEditModalVisible(true);
  };
  const openDeleteProjectModal = () => {
    setIsDeleteModalVisible(true);
  };
  const handleOnCloseAddEditModal = () => setIsAddEditModalVisible(false);
  const handleOnConfirmAddEditModal = () => setIsAddEditModalVisible(false);

  const handleOnCloseDeleteModal = () => setIsDeleteModalVisible(false);

  const handleOnConfirmDeleteModal = async () => {
    if (activeProject?.name) {
      const response = await deleteProject(activeProject?.name);
      if (response?.isOk && response?.result?.status) {
        setIsDeleteModalVisible(false);
      }
    }
  };

  return (
    <>
      <div className={styles.currentProject} onClick={toggleProjectMenu}>
        <div className={styles.currentProjectName}>
          <div className={styles.projectNameText}>
            <span className={styles.projectInitial} style={{ backgroundColor: stringToHexColor(activeProject?.name ?? "") }}>
              {activeProject?.name.toLowerCase().slice(0, 1)}
            </span>
            <span>{activeProject?.name}</span>
          </div>
          <span className={styles.menuIcon}>⋯</span>
        </div>

        {/* Project Dropdown Menu */}
        {showDropdown && (
          <div ref={ref} className={classNames(styles.projectMenu)}>
            {/* Projects List */}
            <div className={styles.projectMenuSection}>
              {allProjects.map((project) => (
                <div
                  key={project.name}
                  className={classNames(styles.projectListItem, activeProject?.name === project.name && styles.selected)}
                  onClick={() => handleSetActiveProject(project)}
                >
                  <span className={styles.projectInitial} style={{ backgroundColor: stringToHexColor(project.name ?? "") }}>
                    {project.name.toLowerCase().slice(0, 1)}
                  </span>
                  <span>{project.name}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className={styles.projectMenuSection}>
              <div className={styles.projectMenuItem} onClick={openCreateModal}>
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
                </svg>
                <span>New</span>
              </div>

              <div className={classNames(styles.projectMenuItem, actionDisabled && styles.disabled)} onClick={editCurrentProject}>
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
                </svg>
                <span>Edit</span>
              </div>

              <div
                className={classNames(styles.projectMenuItem, styles.danger, actionDisabled && styles.disabled)}
                onClick={openDeleteProjectModal}
              >
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
                </svg>
                <span>Delete</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <AddEditProjectModal
        isVisible={isAddEditModalVisible}
        project={activeProject}
        mode={modalMode}
        handleOnClose={handleOnCloseAddEditModal}
        handleOnConfirm={handleOnConfirmAddEditModal}
      />
      <DeleteProjectModal
        isVisible={isDeleteModalVisible}
        projectName={activeProject?.name}
        handleOnClose={handleOnCloseDeleteModal}
        handleOnConfirm={handleOnConfirmDeleteModal}
      />
    </>
  );
};
export default ProjectMenuItem;