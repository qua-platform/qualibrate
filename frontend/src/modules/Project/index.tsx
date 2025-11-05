import { IconType } from "../../common/interfaces/InputProps";
import { SearchIcon } from "../../ui-lib/Icons/SearchIcon";
import React, { useCallback, useEffect, useState } from "react";
import ProjectList from "./components/ProjectList";
import { ProjectDTO } from "./ProjectDTO";
import InputField from "../../common/ui-components/common/Input/InputField";
import { useNodesContext } from "../Nodes/context/NodesContext";
import LoaderPage from "../../ui-lib/loader/LoaderPage";
import LoadingBar from "../../ui-lib/loader/LoadingBar";
import { NoItemsIcon } from "../../ui-lib/Icons/NoItemsIcon";
import ProjectTitleBar from "../TopbarMenu/ProjectTitleBar";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Project.module.scss";
import { useSelector } from "react-redux";
import { getActiveProject, getAllProjects, getIsScanningProjects } from "../../stores/ProjectStore/selectors";
import { fetchAllCalibrationGraphs } from "../../stores/GraphStores/GraphLibrary/actions";
import { useRootDispatch } from "../../stores";
import { setWorkflowGraphElements } from "../../stores/GraphStores/GraphCommon/actions";

const Project = () => {
  const dispatch = useRootDispatch();
  const allProjects = useSelector(getAllProjects);
  const activeProject = useSelector(getActiveProject);
  const isScanningProjects = useSelector(getIsScanningProjects);
  const { fetchAllNodes } = useNodesContext();
  const [listedProjects, setListedProjects] = useState<ProjectDTO[]>(allProjects);
  const [selectedProject, setSelectedProject] = useState<ProjectDTO | undefined>(undefined);

  useEffect(() => {
    setSelectedProject(activeProject ?? undefined);
  }, [activeProject]);

  useEffect(() => {
    if (activeProject) {
      dispatch(setWorkflowGraphElements(undefined));
      fetchAllNodes();
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
