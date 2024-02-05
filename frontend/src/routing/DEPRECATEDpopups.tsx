import AddUserPopup from "../DEPRECATED_pages/AdminPages/Popups/AddUserPopup";
import ChangeAdminPasswordPopup from "../DEPRECATED_pages/AdminPages/Popups/ChangeAdminPasswordPopup";
import ChangeOrganisationNamePopup from "../DEPRECATED_pages/AdminPages/Popups/ChangeOrganisationNamePopup";
import DeleteSelectedJobsPopup from "../modules/Jobs/DeleteSelectedJobsPopup";
import { PopupTypes } from "../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import { Popup } from "../DEPRECATED_common/DEPRECATED_interfaces/Popup";

export const registeredPopups: Popup[] = [
  {
    id: PopupTypes.ADD_USER,
    component: <AddUserPopup />,
  },
  {
    id: PopupTypes.DELETE_SELECTED_JOBS,
    component: <DeleteSelectedJobsPopup />,
    active: false,
    frameId: "jobs",
  },
  {
    id: PopupTypes.CHANGE_ADMIN_PASSWORD,
    component: <ChangeAdminPasswordPopup />,
  },
  {
    id: PopupTypes.CHANGE_ORGANISATION_NAME,
    component: <ChangeOrganisationNamePopup />,
  },
];
