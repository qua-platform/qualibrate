import styles from "./Project.module.scss";
import { NEW_PROJECT_BUTTON_VISIBLE } from "../../dev.config";
import { ACTIVE_TEXT } from "../../utils/colors";
import { AddIcon } from "../../ui-lib/Icons/AddIcon";
import BlueButton from "../../ui-lib/components/Button/BlueButton";
import { IconType } from "../../common/interfaces/InputProps";
import { SearchIcon } from "../../ui-lib/Icons/SearchIcon";
import React, { useCallback, useEffect, useState } from "react";
import ProjectList from "./components/ProjectList";
import { useProjectContext } from "./context/ProjectContext";
import cyKeys from "../../utils/cyKeys";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import { ProjectDTO } from "./ProjectDTO";
import InputField from "../../common/ui-components/common/Input/InputField";
import { useNodesContext } from "../Nodes/context/NodesContext";
import LoaderPage from "../../ui-lib/loader/LoaderPage";
import { useGraphContext } from "../GraphLibrary/context/GraphContext";
import { useSnapshotsContext } from "../Snapshots/context/SnapshotsContext";
import LoadingBar from "../../ui-lib/loader/LoadingBar";
import { NoItemsIcon } from "../../ui-lib/Icons/NoItemsIcon";

const Project = () => {
  const { openTab } = useFlexLayoutContext();
  const { allProjects, activeProject, handleSelectActiveProject, isScanningProjects } = useProjectContext();
  const { fetchAllNodes } = useNodesContext();
  const { fetchAllCalibrationGraphs } = useGraphContext();
  const { reset, setReset, setSelectedSnapshotId, setAllSnapshots, setJsonData, setResult, setDiffData } = useSnapshotsContext();
  const [listedProjects, setListedProjects] = useState<ProjectDTO[]>(allProjects);
  const [selectedProject, setSelectedProject] = useState<ProjectDTO | undefined>(undefined);

  useEffect(() => {
    if (activeProject) {
      fetchAllNodes();
    }
  }, [activeProject]);

  useEffect(() => {
    setListedProjects(allProjects);
  }, [allProjects, setListedProjects]);

  const handleSubmit = useCallback(() => {
    if (!selectedProject) return;

    handleSelectActiveProject(selectedProject);
    setSelectedSnapshotId(undefined);
    setJsonData(undefined);
    setResult(undefined);
    setDiffData(undefined);
    fetchAllCalibrationGraphs(false);
    setReset(true);

    openTab("nodes");
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
        <div className={styles.projectPageSubtitleText}>Please select a Project</div>
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
      {!isScanningProjects && listedProjects?.length > 0 && (
        <div className={styles.pageActions}>
          <BlueButton
            onClick={handleSubmit}
            className={styles.actionButton}
            disabled={selectedProject === undefined}
            data-cy={cyKeys.projects.LETS_START_BUTTON}
            isBig
          >
            Let’s Start
          </BlueButton>

          {NEW_PROJECT_BUTTON_VISIBLE && (
            <BlueButton isSecondary className={styles.actionButton}>
              <AddIcon height={12} color={ACTIVE_TEXT} />
              New project
            </BlueButton>
          )}
        </div>
      )}
    </>
  );
};

export default Project;
