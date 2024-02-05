import { GeneralPage, UsersPage } from "./AdminPages";

import InterfaceContext from "../DEPRECATED_context/InterfaceContext";
import MainLayout from "../ui-lib/layouts/MainLayout";
import { NavigatedPanel } from "../DEPRECATED_common/DEPRECATED_interfaces/NavigatedPanels";
import PageName from "../DEPRECATED_components/common/Page/PageName";
import { PopupTypes } from "../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import styles from "./styles/AdminPage.module.scss";
import { useContext } from "react";
import UseNavigatedPanels from "../DEPRECATED_hooks/UseNavigatedPanels";
import BlueButton from "../ui-lib/components/Button/BlueButton";

const AdminPanelPage = () => {
  const {
    actions: { openPopup, getActivePopup },
  } = useContext(InterfaceContext);

  const AddUserButton = <BlueButton onClick={() => openPopup(PopupTypes.ADD_USER)}>Add user</BlueButton>;

  const adminPages: NavigatedPanel[] = [
    {
      nav: { name: "General" },
      panel: <GeneralPage />,
    },
    {
      nav: { name: "Users" },
      panel: <UsersPage />,
      actions: [AddUserButton],
    },
    // {
    //   nav: { name: "Projects" },
    //   panel: <ProjectsPage />,
    // },
    // {
    //   nav: { name: "Runtimes" },
    //   panel: <RuntimesPages />,
    // },
  ];
  const [Navigation, CurrentPage] = UseNavigatedPanels(adminPages, styles.adminNavigationPanels, true);

  return (
    <MainLayout className={styles.layout}>
      <PageName>Admin panel</PageName>
      {Navigation}
      <div className={styles.content}>{CurrentPage}</div>
      {getActivePopup()}
    </MainLayout>
  );
};

export default AdminPanelPage;
