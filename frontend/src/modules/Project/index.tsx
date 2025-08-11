import styles from "./Project.module.scss";
import { NEW_PROJECT_BUTTON_VISIBLE } from "../../dev.config";
import { ACTIVE_TEXT } from "../../utils/colors";
import { AddIcon } from "../../ui-lib/Icons/AddIcon";
import BlueButton from "../../ui-lib/components/Button/BlueButton";
import { IconType } from "../../common/interfaces/InputProps";
import { SearchIcon } from "../../ui-lib/Icons/SearchIcon";
import React, { useEffect, useState } from "react";
import ProjectList from "./components/ProjectList";
import { useProjectContext } from "./context/ProjectContext";
import cyKeys from "../../utils/cyKeys";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import LoaderPage from "../../ui-lib/loader/LoaderPage";
import { ProjectDTO } from "./ProjectDTO";
import PageName from "../../common/ui-components/common/Page/PageName";
import PageSection from "../../common/ui-components/common/Page/PageSection";
import InputField from "../../common/ui-components/common/Input/InputField";

const Project = () => {
  const { openTab } = useFlexLayoutContext();
  const { allProjects, activeProject, selectedProject, selectActiveProject, setSelectedProject } = useProjectContext();
  const [listedProjects, setListedProjects] = useState<ProjectDTO[] | undefined>(allProjects);

  useEffect(() => {
    setListedProjects(allProjects);
  }, [allProjects, setListedProjects]);

  const handleSubmit = () => {
    const fallbackProject = allProjects.length > 0 ? allProjects[0] : undefined;
    const projectToSelect = selectedProject || fallbackProject;

    if (!projectToSelect) return;

    selectActiveProject(projectToSelect);
    openTab("data");
  };

  if (!activeProject) {
    return <LoaderPage />;
  }

  const heading: string = activeProject ? `Currently active project is ${activeProject}` : "Welcome to QUAlibrate";

  return (
    <>
      <div className={styles.projectPageLayout}>
        <PageName>{heading}</PageName>
        <div className={styles.pageWrapper}>
          <PageSection sectionName="Please select a Project">
            <InputField
              iconType={IconType.INNER}
              placeholder="Project Name"
              className={styles.searchProjectField}
              onChange={(f) => setListedProjects(allProjects.filter((p) => p.name.startsWith(f)))}
              icon={<SearchIcon height={18} width={18} />}
            />
            {listedProjects && (
              <ProjectList projects={listedProjects} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
            )}
          </PageSection>
        </div>
      </div>
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
    </>
  );
};

export default Project;
