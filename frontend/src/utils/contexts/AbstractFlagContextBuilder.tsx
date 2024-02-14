import React, { Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from "react";

type FlagContextProps = [show: boolean, setShow: Dispatch<SetStateAction<boolean>>];

export default function createFlagContext(): [() => FlagContextProps, (props: PropsWithChildren) => React.ReactElement] {
  const FlagContext = React.createContext<FlagContextProps | any>(null);
  const useFlagContext = (): FlagContextProps => useContext<FlagContextProps>(FlagContext);
  return [
    useFlagContext,
    (props: PropsWithChildren) => {
      const { children } = props;
      const [show, setShow] = useState(false);
      return <FlagContext.Provider value={[show, setShow]}>{children}</FlagContext.Provider>;
    },
  ];
}
