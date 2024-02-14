import React, { useContext } from "react";
import { ExperimentApi } from "../api/ExperimentApi";

interface CodeModuleState {
  url?: string;
}

interface CodeModuleFuncs {
  fetchCodeUrl: () => void;
  stopPing: () => void;
  startPing: () => void;
  initServer: () => void;
}

type ICodeModuleContext = CodeModuleState & CodeModuleFuncs;

const CodeModuleContext = React.createContext<ICodeModuleContext | any>(null);

// export const useCodeModuleContext = (): ICodeModuleContext => useContext<ICodeModuleContext>(CodeModuleContext);

export default class CodeModuleContextContainer extends React.Component<any, CodeModuleState> {
  private readonly funcs: CodeModuleFuncs;
  private interval?: number;
  constructor(props: Readonly<unknown>) {
    super(props);
    this.state = {};

    this.funcs = {
      fetchCodeUrl: this.fetchCodeUrl,
      stopPing: this.stopPing,
      startPing: this.startPing,
      initServer: this.initServer,
    };
  }

  componentDidMount() {
    this.initServer();
  }
  //
  // componentWillUnmount() {
  //   this.stopPing();
  // }

  stopPing = async (): Promise<void> => {
    window.clearInterval(this.interval);
  };

  startPing = async (): Promise<void> => {
    this.interval = window.setInterval(this.pingServer, 20000);
  };

  private pingServer = async (): Promise<void> => {
    await ExperimentApi.pingCodeServer();
  };

  initServer = async (): Promise<void> => {
    // const res = await ExperimentApi.initCodeServer();
  };

  fetchCodeUrl = async (): Promise<void> => {
    const res = await ExperimentApi.getCodeServerUrl();
    if (res.isOk) {
      this.setState({ url: res.result });
    }
  };

  render(): React.ReactNode {
    return <CodeModuleContext.Provider value={{ ...this.state, ...this.funcs }}>{this.props.children}</CodeModuleContext.Provider>;
  }
}
