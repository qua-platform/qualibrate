import styles from "./Project.module.scss";
import BlueButton from "../../ui-lib/components/Button/BlueButton";
import { IconType } from "../../common/interfaces/InputProps";
import { SearchIcon } from "../../ui-lib/Icons/SearchIcon";
import React, { useEffect, useState } from "react";
import ProjectList from "./components/ProjectList";
import { ProjectContextProvider, useProjectContext } from "./context/ProjectContext";
import cyKeys from "../../utils/cyKeys";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import LoaderPage from "../../ui-lib/loader/LoaderPage";
import { ProjectDTO } from "./ProjectDTO";
import PageName from "../../common/ui-components/common/Page/PageName";
import PageSection from "../../common/ui-components/common/Page/PageSection";
import InputField from "../../common/ui-components/common/Input/InputField";

const Project = () => {
  const { openTab } = useFlexLayoutContext();
  const { allProjects, activeProject, selectActiveProject } = useProjectContext();
  const [listedProjects, setListedProjects] = useState<ProjectDTO[] | undefined>(allProjects);
  const [selectedProject, setSelectedProject] = useState<ProjectDTO | undefined>(undefined);

  useEffect(() => {
    setListedProjects(allProjects);
  }, [allProjects, setListedProjects]);

  const handleSubmit = () => {
    selectActiveProject(selectedProject!);
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
          Let's Start
        </BlueButton>
      </div>
    </>
  );
};

export default () => (
  <ProjectContextProvider>
    <Project />
  </ProjectContextProvider>
);
