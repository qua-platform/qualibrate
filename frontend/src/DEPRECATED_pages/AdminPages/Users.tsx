import React, { useContext, useEffect, useState } from "react";
import User from "../../DEPRECATED_components/Users/User";
import styles from "../styles/ProjectsPage.module.scss";
import UserContext, { UserDTO } from "../../DEPRECATED_context/UserContext";
import { useProjectsContext } from "../../modules/WelcomePage/utils/ProjectsContext";
import SelectorList from "../../DEPRECATED_components/SelectorList";
// import { ProjectDTO } from "../../DEPRECATED_common/DEPRECATED_dtos/project/project.dto";
import Project from "../../modules/WelcomePage/components/Project";

const Users = () => {
  const { getUsers, users } = useContext(UserContext);
  const { userProjects, allProjects, fetchUserProjects } = useProjectsContext();
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  // const [projectDifferance, setProjectDifference] = useState<ProjectDTO[] | []>([]);

  useEffect(() => {
    getUsers();
  }, []);

  const Actions: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | undefined = [];
  // <DEPRECATEDButton icon={<EditIcon />} type={ButtonTypes.PLAIN} />, // TODO For now we don't have it
  // <DEPRECATEDButton icon={<DeleteFilledIcon />} type={ButtonTypes.PLAIN} />, // TODO We don't have this functionality
  // ];
  const calculateDropDownListOfProjects = () => {
    return allProjects?.filter((p1) => !userProjects?.some((p2) => p1?.id === p2?.id));
  };

  const handleOnClick = (user: UserDTO) => {
    setSelectedUser(user);
    fetchUserProjects(user.username);
    // setProjectDifference(calculateDropDownListOfProjects());
  };

  return (
    <div className={styles.projectsPage}>
      <div className={styles.projects}>
        {users?.map((user) => {
          return (
            <User
              key={user.username}
              isSelected={selectedUser?.username === user.username}
              name={user.name}
              surname={user.surname}
              onClick={() => handleOnClick(user)}
            />
          );
        })}
      </div>
      {selectedUser && (
        <div className={styles.projectUsers}>
          <SelectorList
            customField={selectedUser.username}
            customArray={allProjects}
            items={userProjects.map((project) => {
              return { title: project.name, component: <Project name={project.name} /> };
            })}
            listItems={allProjects
              ?.filter((p1) => !userProjects?.some((p2) => p1?.id === p2?.id))
              .map((project) => {
                return { title: project.name, component: <Project name={project.name} /> };
              })}
            listLabel="Used in projects"
            listHeader={`${selectedUser?.name} ${selectedUser.surname ?? ""} ${selectedUser.username ? "(" : ""}${
              selectedUser.username ?? ""
            }${selectedUser.username ? ")" : ""}`}
            placeholder="Select project to add"
            actions={Actions}
          />
        </div>
      )}
    </div>
  );
};

export default Users;
