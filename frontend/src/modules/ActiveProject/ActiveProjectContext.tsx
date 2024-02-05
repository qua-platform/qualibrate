import React, { PropsWithChildren, useContext } from "react";
import { AbstractContextProvider } from "../../utils/contexts/AbstractContext";
import { RequestStatus } from "../../types";
import { ProjectDTO } from "../../DEPRECATED_common/DEPRECATED_dtos/project/project.dto";
import { ProjectUserState } from "./types";
import { ActiveProjectApi } from "./ActiveProjectApi";
import withMQTTContext from "../MQTT/utils/withMQTTContext";
import LSManager from "../localStorage/LSManager";

type RequestsState = {
  checkoutStatus?: RequestStatus;
  checkoutWorkflowStatus?: RequestStatus;
  fetchInfoStatus?: RequestStatus;
};
interface ActiveProjectContextState {
  activeProject?: ProjectDTO;
  projectUserState?: ProjectUserState;
}

interface ActiveProjectContextFuncs {
  enterProject: (project?: ProjectDTO) => void;
  fetchProjectState: () => void;
}

type IActiveProjectContextContext = ActiveProjectContextState & ActiveProjectContextFuncs;

export type WithProjectProps = {
  activeProject: ProjectDTO;
  fetchProjectState: () => void;
};
export function withActiveProjectContext(WrappedComponent: React.ComponentType<any>) {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return function Component(props: any): React.ReactElement {
    const { activeProject, fetchProjectState } = useActiveProjectContext();
    return <WrappedComponent activeProject={activeProject} fetchProjectState={fetchProjectState} {...props} />;
  };
}

const ActiveProjectContextContext = React.createContext<IActiveProjectContextContext | any>(null);
export const useActiveProjectContext = (): IActiveProjectContextContext =>
  useContext<IActiveProjectContextContext>(ActiveProjectContextContext);

type Props = PropsWithChildren<{ subscribeToJob: (jobEUI?: string) => void }>;
class ActiveProjectContextContextProvider extends AbstractContextProvider<
  Props,
  ActiveProjectContextState,
  RequestsState,
  ActiveProjectContextFuncs
> {
  Context = ActiveProjectContextContext;
  interval = -1;
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      activeProject: LSManager.activeProject,
    };
  }

  componentDidMount() {
    this.fetchProjectState();
    this.interval = window.setInterval(this.fetchProjectState, 5000);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  enterProject = async (activeProject?: ProjectDTO): Promise<void> => {
    LSManager.activeProject = activeProject;
    this.setState({ activeProject }, this.fetchProjectState);
  };

  fetchProjectState = async () => {
    const { activeProject, projectUserState } = this.state;
    if (!activeProject) {
      return this.setState({ projectUserState: undefined });
    }
    // TODO This was refactor due to constant rerendering
    // const { isOk, result } = await this._fetchWithStatus(
    //   () => ActiveProjectApi.getCurrentState(activeProject?.id || -1),
    //   "fetchInfoStatus"
    // );
    const { isOk, result } = await ActiveProjectApi.getCurrentState(activeProject?.id || -1);
    if (!projectUserState || JSON.stringify(projectUserState) !== JSON.stringify(result)) {
      this.setState({ projectUserState: isOk ? result : undefined });
      this.props.subscribeToJob((isOk && result?.job_eui) || undefined);
    }
  };

  protected funcs = {
    enterProject: this.enterProject,
    fetchProjectState: this.fetchProjectState,
  };
}

export default withMQTTContext(ActiveProjectContextContextProvider);
