import * as FlexLayout from "flexlayout-react";
import "flexlayout-react/style/light.css";

import React, { useEffect } from "react";
import { flexClassNameMapper, flexLayoutFactory } from "../routing/flexLayout/FlexLayoutFactory";

import MainLayout from "../ui-lib/layouts/MainLayout";
import { useFlexLayoutContext } from "../routing/flexLayout/FlexLayoutContext";

const MainModularPage = () => {
  const { model, checkIsEmpty, flexLayoutListener } = useFlexLayoutContext();

  useEffect(checkIsEmpty, []);
  return (
    <MainLayout>
      <FlexLayout.Layout
        factory={flexLayoutFactory}
        classNameMapper={flexClassNameMapper}
        onModelChange={checkIsEmpty}
        model={model}
        onAction={flexLayoutListener as any}
      />
    </MainLayout>
  );
};

export default MainModularPage;
