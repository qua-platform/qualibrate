import React, { PropsWithChildren, useCallback, useContext, useState } from "react";

import { AuthApi } from "./AuthApi";
import {  HOME_URL } from "../../DEPRECATED_common/modules";
import { useNavigate } from "react-router-dom";
import { OFFLINE_MODE } from "../../dev.config";
import { LoginData, UserInfo } from "./types";

interface IAuthContext {
  login: (data: LoginData) => void;
  logout: () => void;
  isAuthorized: boolean;
  isVerifying: boolean;
  authError: string | undefined;
  userInfo?: UserInfo;
}

const AuthContext = React.createContext<IAuthContext | any>(null);

export const useAuthContext = (): IAuthContext => useContext<IAuthContext>(AuthContext);

export function AuthContextProvider(props: PropsWithChildren<void>): React.ReactElement {
  const { children } = props;
  // const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | undefined>(undefined);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const navigate = useNavigate();

  // const verify = useCallback(async () => {
  //   const { isOk } = await AuthApi.verify();
  //
  //   setIsAuthorized(isOk);
  //   setIsVerifying(false);
  // }, [setIsAuthorized, setIsVerifying]);

  // useEffect(() => {
  //   verify();
  // }, []);

  // useEffect(() => {
  //   if (isAuthorized) {
  //     getUserInfo();
  //   }
  // }, [isAuthorized]);

  const login = useCallback(
    async (data: LoginData) => {
      const { isOk } = await AuthApi.login(data);

      const authIsOk = OFFLINE_MODE || isOk;

      setIsAuthorized(authIsOk);
      setAuthError(authIsOk ? undefined : "Failed to authorize");
      if (authIsOk) {
        navigate(HOME_URL);
      }
    },
    [setIsAuthorized]
  );

  const logout = useCallback(async () => {
    await AuthApi.logout();
    setIsAuthorized(false);
  }, [setIsAuthorized]);

  // const getUserInfo = useCallback(async () => {
  //   const res = await AuthApi.getUserInfo();
  //   setUserInfo(res.isOk ? res.result : undefined);
  // }, [setUserInfo]);

  return (
    <AuthContext.Provider
      value={{
        login,
        isAuthorized,
        authError,
        logout,
        // isVerifying,
        userInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
