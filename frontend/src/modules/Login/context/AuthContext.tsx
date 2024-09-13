import React, { PropsWithChildren, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../api/AuthApi";
import { HOME_URL } from "../../../common/modules";
import { OFFLINE_MODE } from "../../../dev.config";

interface IAuthContext {
  login: (password: string) => void;
  isAuthorized: boolean;
  authError: string | undefined;
}

const AuthContext = React.createContext<IAuthContext | null>(null);

export const useAuthContext = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export function AuthContextProvider(props: PropsWithChildren<ReactNode>): React.ReactElement {
  const { children } = props;
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const getCookieStartingWith = (prefix: string) => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      if (cookie.startsWith(prefix)) {
        return cookie;
      }
    }
    return null;
  };

  const checkIfThereIsCookie = () => {
    const cookiePrefix = "Qualibrate-Token=";
    const token = getCookieStartingWith(cookiePrefix);
    console.log("cookie", token);
    return token !== null;
  };
  useEffect(() => {
    if (checkIfThereIsCookie()) {
      setIsAuthorized(true);
      navigate(HOME_URL);
    }
  }, []);

  const login = useCallback(
    async (password: string) => {
      const { isOk } = await AuthApi.login(password);

      const authIsOk = OFFLINE_MODE || isOk;

      setIsAuthorized(authIsOk);
      setAuthError(authIsOk ? undefined : "Failed to authorize");
      if (authIsOk) {
        navigate(HOME_URL);
      }
    },
    [setIsAuthorized]
  );

  return (
    <AuthContext.Provider
      value={{
        login,
        isAuthorized,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
