import * as FlexLayout from "flexlayout-react";
import "flexlayout-react/style/light.css";
import React, { useEffect } from "react";
import { flexClassNameMapper, flexLayoutFactory } from "../routing/flexLayout/FlexLayoutFactory";
import MainLayout from "../ui-lib/layouts/MainLayout";
import { useFlexLayoutContext } from "../routing/flexLayout/FlexLayoutContext";
import { useAuthContext } from "../modules/Login/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LOGIN_URL } from "../common/modules";

const MainModularPage = () => {
  const { model, checkIsEmpty, flexLayoutListener, openTab } = useFlexLayoutContext();
  const { isAuthorized } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigate(LOGIN_URL);
    } else {
      openTab("graph-status");
      // openTab("nodes");
    }
  }, [isAuthorized]);

  useEffect(checkIsEmpty, []);
  return (
    <MainLayout>
      <FlexLayout.Layout
        factory={flexLayoutFactory}
        classNameMapper={flexClassNameMapper}
        onModelChange={checkIsEmpty}
        model={model}
        onAction={flexLayoutListener}
      />
    </MainLayout>
  );
};

export default MainModularPage;
