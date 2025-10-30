import { useNavigate } from "react-router-dom";
import { useRootDispatch } from "..";
import { AuthApi } from "../../modules/Login/api/AuthApi";
import { OFFLINE_MODE } from "../../dev.config";
import { setAuthorize, setError, setTriedLoginWithEmptyString } from "./AuthStore";
import { HOME_URL } from "../../common/modules";
import { useEffect } from "react";

const getCookieStartingWith = (prefix: string) => {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      return cookie;
    }
  }
  return null;
};

const checkIfThereIsCookie = () => {
  const cookiePrefix = "Qualibrate-Token=";
  const token = getCookieStartingWith(cookiePrefix);
  return token !== null;
};

export const useLogin = () => {
  const dispatch = useRootDispatch();
  const navigate = useNavigate();

  const login = async (password: string) => {
    const { isOk } = await AuthApi.login(password);
    const authIsOk = OFFLINE_MODE || isOk;

    dispatch(setAuthorize(authIsOk));
    dispatch(setError(authIsOk ? undefined : "Failed to authorize"));
    if (authIsOk) {
      navigate(HOME_URL);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (checkIfThereIsCookie()) {
        dispatch(setAuthorize(true));
        navigate(HOME_URL);
      } else {
        login("").then(() => {
          dispatch(setTriedLoginWithEmptyString());
        });
        if (checkIfThereIsCookie()) {
          setAuthorize(true);
          navigate(HOME_URL);
        }
      }
    };

    initializeAuth();
  }, []);

  return login;
};
