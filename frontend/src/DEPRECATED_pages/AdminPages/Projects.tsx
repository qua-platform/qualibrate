import DEPRECATEDButton from "../../DEPRECATED_components/DEPRECATED_Buttons/ButtonWrapper";
import { ButtonTypes } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import { DeleteFilledIcon } from "../../ui-lib/Icons/DeleteFilledIcon";
import { EditIcon } from "../../ui-lib/Icons/EditIcon";
import Project from "../../modules/WelcomePage/components/Project";
import React from "react";
import SelectorList from "../../DEPRECATED_components/SelectorList";
import User from "../../DEPRECATED_components/Users/User";
import styles from "../styles/ProjectsPage.module.scss";

const Projects = () => {
  const UserList = [
    {
      title: "Angus MacGyver",
      component: <User onClick={() => {}} name={""} />,
    },
    {
      title: "Angus MacGyver",
      component: <User onClick={() => {}} name={""} />,
    },
    {
      title: "Angus MacGyver",
      component: <User onClick={() => {}} name={""} />,
    },
  ];

  const ProjectList = [<Project />, <Project />, <Project />, <Project />, <Project />, <Project />, <Project />];

  const Actions = [
    <DEPRECATEDButton icon={<EditIcon />} type={ButtonTypes.PLAIN} />,
    <DEPRECATEDButton icon={<DeleteFilledIcon />} type={ButtonTypes.PLAIN} />,
  ];

  return (
    <div className={styles.projectsPage}>
      <div className={styles.projects}>{ProjectList}</div>
      <div className={styles.projectUsers}>
        <SelectorList items={UserList} listLabel="Contributors" listHeader="Project 1" placeholder="Select user to add" actions={Actions} />
      </div>
    </div>
  );
};

export default Projects;
