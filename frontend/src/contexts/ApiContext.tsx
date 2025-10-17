import React, { PropsWithChildren, ReactElement, useState } from "react";
import noop from "../common/helpers";

const yesterdayDay = new Date(new Date().setDate(new Date().getDate() - 1));

interface ApiContextProps {
  dateRange: { startDate: Date; endDate: Date };
  setDateRange: (dates: { startDate: Date; endDate: Date }) => void;
}

const ApiContext = React.createContext<ApiContextProps>({
  dateRange: { startDate: new Date(), endDate: yesterdayDay },
  setDateRange: noop,
});

export const useApiContext = () => React.useContext(ApiContext);

export function ApiContextProvider({ children }: PropsWithChildren): ReactElement {

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
