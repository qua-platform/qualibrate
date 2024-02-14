import React, { useState } from "react";
import noop from "../DEPRECATED_common/helpers";

const yesterdayDay = new Date(new Date().setDate(new Date().getDate() - 1));

interface ApiContextProps {
  dateRange: { startDate: Date; endDate: Date };
  setDateRange: (dates: { startDate: Date; endDate: Date }) => void;
}

const ApiContext = React.createContext<ApiContextProps>({
  dateRange: { startDate: new Date(), endDate: yesterdayDay },
  setDateRange: noop,
});

interface ApiContextProviderProps {
  children: React.ReactNode;
}

export function ApiContextProvider(props: ApiContextProviderProps): React.ReactElement {
  const { children } = props;

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    endDate: new Date(),
  });

  return (
    <ApiContext.Provider
      value={{
        dateRange,
        setDateRange,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

// export default ApiContext;
