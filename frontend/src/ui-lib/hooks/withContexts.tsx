import React, { ReactElement } from "react";

export function withContexts<T>(WrappedComponent: React.ComponentType<T>, contexts: Array<React.ComponentType<any>>) {
  return (props: T): ReactElement => {
    return contexts.reduce((Comp, Provider) => <Provider>{Comp}</Provider>, <WrappedComponent {...props} />);
  };
}
