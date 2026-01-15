import { useNavigate } from "react-router-dom";
import { useRootDispatch } from "..";
import { AuthApi } from "./api/AuthApi";
import { setAuthorize, setError, setTriedLoginWithEmptyString } from "./actions";
import { HOME_URL } from "../../utils/api/apiRoutes";
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

    dispatch(setAuthorize(isOk));
    dispatch(setError(isOk ? undefined : "Failed to authorize"));
    if (isOk) {
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
          dispatch(setAuthorize(true));
          navigate(HOME_URL);
        }
      }
    };

    initializeAuth();
  }, []);

  return login;
};
