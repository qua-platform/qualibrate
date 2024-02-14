import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
// import { BurgerMenuIcon } from "../../ui-lib/Icons/BurgerMenuIcon";
// import ExperimentsList from "./components/JobsList";
import { DataViewContextProvider } from "./context/DataViewContext";
// import HDF5Explorer from "./HDF5Explorer";
import styles from "./Data.module.scss";
// import { ACCENT_COLOR_LIGHT, SECONDARY_BLUE_BUTTON } from "../../utils/colors";
import cyKeys from "../../utils/cyKeys";
import useModuleStyle from "../../ui-lib/hooks/useModuleStyle";
import { classNames } from "../../utils/classnames";
// import PageHeader from "../../ui-lib/components/headers/PageHeader/PageHeader";
// import DropdownSelect from "../../ui-lib/components/Button/DropdownSelect";
// import { DATA_VIS_VIEWS, DataVizView } from "./consts";
// import PlotlyDash from "./plotlyDash";
// import DataView from "./DataView";
import { Gitgraph } from "@gitgraph/react";
// @ts-ignore
// import { JsonEditor as Editor } from "jsoneditor-react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

// import "jsoneditor-react/es/editor.min.css";
import { DataViewApi } from "./api/DataViewApi";

// const menuAction = <DropDownButton label="View with HDF5 Explorer" />;
// const Data = () => {
//   const { selectedJob } = useDataViewContext();
//   // const { selectedJob, selectedView, changeView } = useDataViewContext();
//   const [showJobsList, setShowJobsList] = useState<boolean>(!selectedJob);
//   const [ref] = useModuleStyle<HTMLDivElement>();
//
//   return (
//     <div ref={ref} className={styles.wrapper}>
//       {/*<PageHeader*/}
//       {/*  preComponent={*/}
//       {/*    <button onClick={() => setShowJobsList((s) => !s)}>*/}
//       {/*      <BurgerMenuIcon color={showJobsList ? SECONDARY_BLUE_BUTTON : ACCENT_COLOR_LIGHT} data-cy={cyKeys.data.MENU_BUTTON} />*/}
//       {/*    </button>*/}
//       {/*  }*/}
//       {/*  title="Job results"*/}
//       {/*  subTitle={selectedJob?.eui?.path || "Select the job"}*/}
//       {/*>*/}
//       {/*  <DropdownSelect*/}
//       {/*    list={DATA_VIS_VIEWS}*/}
//       {/*    onChange={({ key }) => changeView(key as DataVizView)}*/}
//       {/*    selected={DATA_VIS_VIEWS.find((v) => v.key === selectedView)}*/}
//       {/*  />*/}
//       {/*</PageHeader>*/}
//       <div className={classNames(styles.explorer)}>
//         {/*{showJobsList && (*/}
//         <div className={classNames(styles.data)}>
//           <div className={styles.listWrapper} data-cy={cyKeys.data.EXPERIMENT_LIST}>
//             aaaa
//           </div>
//           {/*<ExperimentsList />*/}
//         </div>
//         {/*)}*/}
//         <div className={styles.viewer}>{/*<DataVizContent />*/}</div>
//       </div>
//     </div>
//   );
// };

const TimelineGraph = ({ setJsonData }: { setJsonData: Dispatch<SetStateAction<{}>> }) => {
  const [allSnapshots, setAllSnapshots] = useState<any>([]);
  useEffect(() => {
    const res = DataViewApi.fetchAllSnapshots().then((promise: any) => {
      setAllSnapshots(promise.result.data);
    });
  }, []);
  return (
    <div className={styles.timelineGraphWrapper}>
      {allSnapshots?.length > 0 && (
        <Gitgraph>
          {(gitgraph) => {
            const mainBranch = gitgraph.branch("main");

            allSnapshots.forEach((snapshot: any) => {
              const snapshotId = snapshot?.id.toString();
              mainBranch.commit({
                hash: snapshotId,
                author: "",
                subject: snapshot.metadata.name,
                onClick: () => {
                  DataViewApi.fetchSnapshot(snapshotId).then((promise: any) => {
                    console.log(promise?.result?.data);

                    setJsonData(promise?.result?.data);
                  });
                },
              });
            });
          }}
        </Gitgraph>
      )}
    </div>
  );
};

const JSONEditor = ({ jsonData }: { jsonData: any }) => {
  return (
    <div style={{ color: "white" }}>
      <JsonView src={jsonData} onChange={(updatedJson: any) => console.log(updatedJson)} />
    </div>
  );
};

const DataGUAlibrate = () => {
  const [ref] = useModuleStyle<HTMLDivElement>();
  const [jsonData, setJsonData] = useState({});
  return (
    <div ref={ref} className={styles.wrapper}>
      <div className={classNames(styles.explorer)}>
        <div className={classNames(styles.data)}>
          <div className={styles.listWrapper} data-cy={cyKeys.data.EXPERIMENT_LIST}></div>
          <TimelineGraph setJsonData={setJsonData} />
        </div>
        <div className={styles.viewer}>
          {/*<DataView />*/}
          <JSONEditor jsonData={jsonData} />
        </div>
      </div>
    </div>
  );
};

// function DataVizContent() {
//   const { selectedView } = useDataViewContext();
//   switch (selectedView) {
//     case DataVizView.HDF5:
//       return <HDF5Explorer />;
//     case DataVizView.Dash:
//       return <PlotlyDash />;
//     case DataVizView.Data:
//       return <DataView />;
//     default:
//       return <div>No view found</div>;
//   }
// }

export default () => (
  <DataViewContextProvider>
    <DataGUAlibrate />
  </DataViewContextProvider>
);
