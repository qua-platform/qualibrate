import styles from "./styles/ProjectMenuItem.module.scss";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { classNames } from "../../utils";
import { useSelector } from "react-redux";
import { deleteProject, getActiveProject, getAllProjects, ProjectDTO, selectActiveProject } from "../../stores/ProjectStore";
import { useRootDispatch } from "../../stores";
import { fetchAllNodes } from "../../stores/NodesStore";
import { fetchAllCalibrationGraphs } from "../../stores/GraphStores/GraphLibrary";
import { stringToHexColor } from "../Data/components/ExecutionCard/components/TagsList/helpers";
import AddEditProjectModal from "./AddEditProjectModal/AddEditProjectModal";
import useClickOutside from "../../utils/hooks/useClickOutside";
import DeleteProjectModal from "./DeleteProjectModal";
import GlobalThemeContext, { GlobalThemeContextState } from "../themeModule/GlobalThemeContext";
import { DeleteProjectIcon, EditProjectIcon, NewProjectIcon } from "../../components/";
import ProjectList from "./ProjectList";
import ProjectMenuItemWrapper from "./ProjectMenuItemWrapper";
import { removeProject } from "../../stores/ProjectStore/actions";
import { clearData, fetchGitgraphSnapshots } from "../../stores/SnapshotsStore";
import { setActivePage } from "../../stores/NavigationStore";
import { NODES_KEY } from "../AppRoutes";

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
        dispatch(removeProject(activeProject));

        const demoProject = allProjects.find((p) => p.name === "demo_project");

        if (demoProject) {
          handleSetActiveProject(demoProject);
        }
      }
      setIsDeleteModalVisible(false);
    }
  };

  return (
    <>
      <div className={styles.currentProject} onClick={toggleProjectMenu}>
        <div className={styles.currentProjectName}>
          <div className={styles.projectNameText}>
            <span className={styles.projectInitial} style={{ backgroundColor: stringToHexColor(activeProject?.name ?? "") }}>
              {activeProject?.name.toUpperCase().slice(0, 1)}
            </span>
            <span>{activeProject?.name}</span>
          </div>
          <span className={styles.menuIcon}>⋯</span>
        </div>

        {/* Project Dropdown Menu */}
        {showDropdown && (
          <div ref={ref} className={classNames(styles.projectMenu)}>
            {/* Projects List */}
            <ProjectList />

            {/* Actions */}
            <div className={styles.projectMenuSection}>
              <ProjectMenuItemWrapper
                title={"New"}
                isDisabled={false}
                classNames={styles.projectMenuItem}
                icon={<NewProjectIcon />}
                onClickHandler={openCreateModal}
              />
              <ProjectMenuItemWrapper
                title={"Edit"}
                isDisabled={actionDisabled}
                classNames={classNames(styles.projectMenuItem, actionDisabled && styles.disabled)}
                icon={<EditProjectIcon />}
                onClickHandler={editCurrentProject}
              />
              <ProjectMenuItemWrapper
                title={"Delete"}
                isDisabled={actionDisabled}
                classNames={classNames(styles.projectMenuItem, styles.danger, actionDisabled && styles.disabled)}
                icon={<DeleteProjectIcon />}
                onClickHandler={openDeleteProjectModal}
              />
            </div>
          </div>
        )}
      </div>
      {isAddEditModalVisible && (
        <AddEditProjectModal
          isVisible={isAddEditModalVisible}
          project={activeProject}
          mode={modalMode}
          handleOnClose={handleOnCloseAddEditModal}
          handleOnConfirm={handleOnConfirmAddEditModal}
        />
      )}
      {isDeleteModalVisible && (
        <DeleteProjectModal
          isVisible={isDeleteModalVisible}
          projectName={activeProject?.name}
          handleOnClose={handleOnCloseDeleteModal}
          handleOnConfirm={handleOnConfirmDeleteModal}
        />
      )}
    </>
  );
};
export default ProjectMenuItem;