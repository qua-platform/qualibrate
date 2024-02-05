import React, { PropsWithChildren } from "react";
import { Res } from "../../DEPRECATED_common/DEPRECATED_interfaces/Api";
import { setError, setOk, setPending } from "../statusHelpers";
import { WithProjectProps } from "../../modules/ActiveProject/ActiveProjectContext";

export type AProps = PropsWithChildren<WithProjectProps>;
export abstract class AbstractContextWithProjectProvider<
  Props,
  State extends object,
  RequestsState,
  Funcs extends { [key: string]: any }
> extends React.Component<AProps & Props, State & RequestsState> {
  protected abstract funcs: Funcs;
  abstract readonly Context: React.Context<any>;
  private timeout: number | undefined;

  constructor(props: Readonly<AProps & Props>) {
    super(props);
  }

  protected _fetchWithStatus = async <D,>(
    fn: (args: { project_id: number }) => Promise<Res<D>>,
    status: keyof RequestsState
  ): Promise<Res<D>> => {
    const { activeProject } = this.props;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.setState({ [status]: setPending() });
    const { result, error, isOk } = await fn({
      project_id: activeProject?.id || -1,
    });
    if (!isOk) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.setState({ [status]: setError(error) });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.setState({ [status]: setOk() });
    }

    return { result, error, isOk };
  };

  render(): React.ReactNode {
    return <this.Context.Provider value={{ ...this.state, ...this.funcs }}>{this.props.children}</this.Context.Provider>;
  }
}
