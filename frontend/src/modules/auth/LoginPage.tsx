import React, { useCallback, useEffect, useState } from "react";

import BlueButton from "../../ui-lib/components/Button/BlueButton";
import InputField from "../../DEPRECATED_components/common/Input/InputField";
import cyKeys from "../../utils/cyKeys";
import styles from "./LoginPage.module.scss";
import { useAuthContext } from "./AuthContext";
import useLoginValidation from "./useLoginValidator";
import welcomeWaves from "./welcomeWaves.png";
import QUAlibrateLogoIcon from "../../ui-lib/Icons/QUAlibrateLogoIcon";

export default function LoginPage(): React.ReactElement {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [response, validate, setShowError] = useLoginValidation();

  useEffect(() => {
    validate({ username, password });
  }, [username, password]);

  const { login, authError } = useAuthContext();
  const handleLogin = useCallback(() => {
    setShowError(true);

    if (response.isOk) {
      login({ username, password });
    }
  }, [username, password, response]);

  const handleLoginByEnter = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        handleLogin();
      }
    },
    [handleLogin]
  );

  const inputDefaultProps = { onKeyUp: handleLoginByEnter };

  return (
    <div data-cy={cyKeys.LOGIN_PAGE} className={styles.content}>
      <WelcomeInfo />
      <div className={styles.rightPart}>
        <div className={styles.version}>Version {process.env.REACT_APP_VERSION ?? "0.0.1"}</div>
        <div className={styles.form} onKeyUp={handleLoginByEnter}>
          <div className={styles.title}>Login</div>
          <form style={{ width: "100%" }}>
            <InputField
              inputClassName={styles.input}
              className={styles.inputWrapper}
              onChange={setUsername}
              label={"Username"}
              value={username}
              error={response.errors["username"]}
              data-cy={cyKeys.login.USERNAME}
              placeholder={""}
              {...inputDefaultProps}
            />
            <InputField
              inputClassName={styles.input}
              className={styles.inputWrapper}
              onChange={setPassword}
              typeOfField="password"
              label={"Password"}
              error={response.errors["password"]}
              value={password}
              data-cy={cyKeys.login.PASSWORD}
              placeholder={""}
              {...inputDefaultProps}
            />
          </form>
          <BlueButton
            className={styles.loginButton}
            onClick={handleLogin}
            disabled={!username || !password}
            data-cy={cyKeys.login.SUBMIT}
            {...inputDefaultProps}
            isBig
          >
            Log In
          </BlueButton>
          <div className={styles.errorMsg}>{authError}</div>
        </div>
        <div />
      </div>
    </div>
  );
}

function WelcomeInfo(): React.ReactElement {
  return (
    <div className={styles.welcomeInfo}>
      <img src={welcomeWaves} alt={""} className={styles.wave} />
      <div className={styles.welcomeContent}>
        <QUAlibrateLogoIcon />
        <div>Welcome to QUAlibrate!</div>
      </div>
    </div>
  );
}
