import React from "react";
import { useMQTTContext } from "../MQTTContext";

export default function withMQTTContext(WrappedComponent: React.ComponentType<any>) {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return function Component(props: any): React.ReactElement {
    const { subscribeToJob } = useMQTTContext();
    return <WrappedComponent subscribeToJob={subscribeToJob} {...props} />;
  };
}
