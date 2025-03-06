import React from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";

const TitleBarMenu: React.FunctionComponent = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  // const { values } = useTitleBarContextProvider();
  return (
    <>
      <div className={styles.wrapper} data-testid="title-wrapper">
        <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
        {/*{(values.menuCards ?? []).map((card, index) => {*/}
        {/*  return <TitleBarMenuCard key={`${card}_${index}`} card={card} />;*/}
        {/*})}*/}
        {topBarAdditionalComponents ? topBarAdditionalComponents[activeTab ?? ""] : undefined}
        <div className={styles.menuCardsWrapper}>
          {/*<TitleBarMenuCard*/}
          {/*  key={`${"card"}_${"index"}`}*/}
          {/*  card={{ label: "Active Graph", value: "Single-qubit tuneup", spinnerIconText: "Running 3/4", dot: true, id: "#416 vivera" }}*/}
          {/*/>*/}
          {/*<TitleBarMenuCard*/}
          {/*  key={`${"card"}_${"index"}`}*/}
          {/*  card={{ label: "Active Graph", value: "Single-qubit tuneup", spinnerIconText: "Running 3/4", dot: true, id: "#416 vivera" }}*/}
          {/*/>*/}
        </div>
      </div>
    </>
  );
};

export default TitleBarMenu;
