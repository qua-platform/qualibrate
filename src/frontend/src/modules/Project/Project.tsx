import React, { useCallback, useEffect, useState } from "react";
import ProjectList from "./components/ProjectList/ProjectList";
import { ProjectDTO, getActiveProject, getAllProjects, getIsScanningProjects } from "../../stores/ProjectStore";
import { IconType, SearchIcon, InputField, LoaderPage, LoadingBar, NoItemsIcon } from "../../components";
import ProjectTitleBar from "./components/ProjectTitleBar/ProjectTitleBar";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Project.module.scss";
import { useSelector } from "react-redux";
import { fetchAllCalibrationGraphs } from "../../stores/GraphStores/GraphLibrary";
import { useRootDispatch } from "../../stores";
import { fetchAllNodes } from "../../stores/NodesStore";

const Project = () => {
  const dispatch = useRootDispatch();
  const allProjects = useSelector(getAllProjects);
  const activeProject = useSelector(getActiveProject);
  const isScanningProjects = useSelector(getIsScanningProjects);
  const [listedProjects, setListedProjects] = useState<ProjectDTO[]>(allProjects);
  const [selectedProject, setSelectedProject] = useState<ProjectDTO | undefined>(undefined);

  useEffect(() => {
    setSelectedProject(activeProject ?? undefined);
  }, [activeProject]);

  useEffect(() => {
    if (activeProject) {
      dispatch(fetchAllNodes());
      dispatch(fetchAllCalibrationGraphs());
    }
  }, [activeProject]);

  useEffect(() => {
    setListedProjects(allProjects);
  }, [allProjects, setListedProjects]);

  const handleSearchChange = useCallback(
    (searchTerm: string) => {
      setListedProjects(allProjects.filter((p) => p.name.startsWith(searchTerm)));
    },
    [allProjects]
  );

  if (isScanningProjects) {
    return <LoaderPage />;
  }

  return (
    <>
      <div className={styles.projectPageWrapper}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>Please select a Project</div>
          <ProjectTitleBar />
        </div>
        <InputField
          name={"search"}
          iconType={IconType.INNER}
          placeholder="Project Name"
          className={styles.searchProjectField}
          onChange={handleSearchChange}
          icon={<SearchIcon height={18} width={18} />}
        />
      </div>
      <ProjectList projects={listedProjects} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
      {isScanningProjects && listedProjects?.length === 0 && (
        <div className={styles.splashNoProject}>
          <LoadingBar icon={<NoItemsIcon height={204} width={200} />} text="No projects found" />
        </div>
      )}
    </>
  );
};

export default Project;
