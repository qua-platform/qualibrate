import React, { PropsWithChildren, useContext, useState } from "react";

type IJobDiffContext = {
  diffIsShown: boolean;
  setDiffIsShown: (v: boolean) => void;
};

const DiffVisibilityContext = React.createContext<IJobDiffContext | any>(null);
export const useDiffVisibilityContext = (): IJobDiffContext => useContext<IJobDiffContext>(DiffVisibilityContext);

export function DiffVisibilityContextContainer(props: PropsWithChildren<any>): React.ReactElement {
  const [diffIsShown, setDiffIsShown] = useState<boolean>(false);

  return <DiffVisibilityContext.Provider value={{ diffIsShown, setDiffIsShown }}>{props.children}</DiffVisibilityContext.Provider>;
}
