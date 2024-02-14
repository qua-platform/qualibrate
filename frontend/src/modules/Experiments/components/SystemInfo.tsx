// import React, { useContext } from "react";
//
// import CurrentJobInfo from "./SystemPanels/CurrentJobInfo";
// import HidePanel from "../../../DEPRECATED_components/common/HidePanel";
// import InterfaceContext from "../../../DEPRECATED_context/InterfaceContext";
// import Header from "../../../ui-lib/components/headers/Header";
// import PreviousJobsInfo from "./SystemPanels/PreviousJobsInfo";
// import styles from "./styles/SystemInfo.module.scss";
//
// const SystemInfo = (): React.ReactElement => {
//   const {
//     actions: { toggleSystemInfoVisibility },
//   } = useContext(InterfaceContext);
//
//   return (
//     <div className={styles.systemInfo}>
//       <Header title="Q 1, 2, 4" />
//       <CurrentJobInfo />
//       <PreviousJobsInfo />
//       <HidePanel callback={toggleSystemInfoVisibility} />
//     </div>
//   );
// };
//
// export default SystemInfo;
