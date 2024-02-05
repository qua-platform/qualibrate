import SettingField from "../../DEPRECATED_components/common/Settings/SettingField";
import InterfaceContext from "../../DEPRECATED_context/InterfaceContext";
import { PopupTypes } from "../../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import styles from "../styles/AdminPage.module.scss";
import { useContext } from "react";

const General = () => {
  const {
    actions: { openPopup },
  } = useContext(InterfaceContext);

  const settingsList = [
    // {
    //   description: "Your organisation name",
    //   value: "Schrodinger’s lab",
    //   valueSize: Size.LARGE,
    //   changeCallback: openPopup.bind({}, PopupTypes.CHANGE_ORGANISATION_NAME),
    // },
    // {
    //   description: "Login background",
    // },
    // {
    //   description: "Export database",
    //   changeButtonName: "Dump",
    // },
    {
      description: "Admin password",
      changeCallback: openPopup.bind({}, PopupTypes.CHANGE_ADMIN_PASSWORD),
    },
    // {
    //   description: "Data store location",
    //   value: "/vsdata/v0",
    //   icon: <DatabaseIcon />,
    //   disableChange: true,
    // },
  ];

  return (
    <div className={styles.settings}>
      {settingsList.map((props, key) => (
        <SettingField {...props} key={key} />
      ))}
    </div>
  );
};

export default General;
