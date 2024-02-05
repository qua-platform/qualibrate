import React, { useContext, useState } from "react";

import noop from "../../../DEPRECATED_common/helpers";
import { JobDTO } from "../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import { DataVizView } from "../consts";

interface IDataViewContext {
  selectedView: DataVizView;
  selectJob: (job: JobDTO) => void;
  currentHDF5File: string | null;
  selectedJob: JobDTO | undefined;
  changeView: (newView: DataVizView) => void;
}

const DataViewContext = React.createContext<IDataViewContext>({
  selectJob: noop,
  changeView: noop,
  selectedView: DataVizView.HDF5,
  currentHDF5File: null,
  selectedJob: undefined,
});

export const useDataViewContext = (): IDataViewContext => useContext<IDataViewContext>(DataViewContext);

interface DataViewContextProviderProps {
  children: React.ReactNode;
}

export function DataViewContextProvider(props: DataViewContextProviderProps): React.ReactElement {
  const [selectedView, changeView] = useState<DataVizView>(DataVizView.Data);
  const [selectedJob, setSelectedJob] = useState<JobDTO | undefined>();
  const DEFAULT_PROJECT = "project1";

  const [currentProjectPath] = useState(DEFAULT_PROJECT);

  const [currentHDF5File, setCurrentHDF5File] = useState<string | null>(null);

  const selectJob = (job: JobDTO) => {
    setSelectedJob(job);
    const validatedPath = job.eui?.path.replace("#", currentProjectPath) + ".hdf5";
    setCurrentHDF5File(validatedPath);
  };

  return (
    <DataViewContext.Provider
      value={{
        selectJob,
        currentHDF5File,
        selectedJob,
        selectedView,
        changeView,
      }}
    >
      {props.children}
    </DataViewContext.Provider>
  );
}

export default DataViewContext;
