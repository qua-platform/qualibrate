import { CODE_URL } from "../../../DEPRECATED_common/modules";
import React, { useMemo } from "react";
import { classNames } from "../../../utils/classnames";
import styles from "./Code.module.scss";
import cyKeys from "../../../utils/cyKeys";
import CodeModuleContextContainer from "./CodeModuleContext";
import { useAuthContext } from "../../auth/AuthContext";
import Loader from "../../../ui-lib/loader/Loader";
import useUrlState, { UrlState } from "./useUrlState";
import { UserInfo } from "../../auth/types";
import LoaderPage from "../../../ui-lib/loader/LoaderPage";

type Props = {
  active?: boolean;
};

const CodeModule = ({ userInfo, active }: { userInfo: UserInfo; active?: boolean }) => {
  const editorUrl: string | undefined = useMemo(() => CODE_URL(userInfo.id), [userInfo.id]);
  const [urlState] = useUrlState(editorUrl);

  if (active && urlState !== UrlState.EXIST) {
    return <LoaderPage text={"The code editor is loading... \n It can take time for the first use."} />;
  }

  return (
    <div className={classNames(styles.codeView, active && styles.moduleActive)} data-cy={cyKeys.experiment.CODE_VIEW}>
      {userInfo && <iframe src={editorUrl} className={styles.code} />}
    </div>
  );
};

export default ({ active }: Props) => {
  const { userInfo } = useAuthContext();
  if (!userInfo) {
    return active ? <Loader /> : null;
  }
  return (
    <CodeModuleContextContainer>
      <CodeModule userInfo={userInfo} active={active} />
    </CodeModuleContextContainer>
  );
};
