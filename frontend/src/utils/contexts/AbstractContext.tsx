import React, { PropsWithChildren } from "react";
// import { Res } from "../../DEPRECATED_common/DEPRECATED_interfaces/Api";
// import { setError, setOk, setPending } from "../statusHelpers";

export abstract class AbstractContextProvider<
  Props extends PropsWithChildren,
  State extends object,
  RequestsState,
  Funcs extends { [key: string]: any }
> extends React.Component<Props, State & RequestsState> {
  protected abstract funcs: Funcs;
  abstract readonly Context: React.Context<any>;
  // private timeout: number | undefined;

  protected constructor(props: Readonly<Props>) {
    super(props);
  }

  // protected _fetchWithStatus = async <D,>(fn: () => Promise<Res<D>>, status: keyof RequestsState): Promise<Res<D>> => {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   this.setState({ [status]: setPending() });
  //   const { result, error, isOk } = await fn();
  //   if (!isOk) {
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     this.setState({ [status]: setError(error) });
  //   } else {
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     this.setState({ [status]: setOk() });
  //   }
  //
  //   return { result, error, isOk };
  // };

  render(): React.ReactNode {
    return <this.Context.Provider value={{ ...this.state, ...this.funcs }}>{this.props.children}</this.Context.Provider>;
  }
}
