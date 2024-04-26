import React, { useContext, useState } from "react";
import noop from "../../../DEPRECATED_common/helpers";

interface IDataViewContext {
  selectJob: (job: any) => void;
  selectedJob: any;
}

const DataViewContext = React.createContext<IDataViewContext>({
  selectJob: noop,
  selectedJob: undefined,
});

export const useDataViewContext = (): IDataViewContext => useContext<IDataViewContext>(DataViewContext);

interface DataViewContextProviderProps {
  children: React.ReactNode;
}

export function DataViewContextProvider(props: DataViewContextProviderProps): React.ReactElement {
  const [selectedJob, setSelectedJob] = useState<any>();

  const selectJob = (job: any) => {
    setSelectedJob(job);
  };

  return (
    <DataViewContext.Provider
      value={{
        selectJob,
        selectedJob,
      }}
    >
      {props.children}
    </DataViewContext.Provider>
  );
}

export default DataViewContext;
