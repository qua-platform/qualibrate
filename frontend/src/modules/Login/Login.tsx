import React, { useCallback, useEffect, useState } from "react";
import styles from "../Login/Login.module.scss";
import { BlueButton, QUAlibrateLogoIcon, InputField } from "../../components";
import welcomeWaves from "./welcomeWaves.png";
import { useLogin } from "../../stores/AuthStore";
import { useSelector } from "react-redux";
import { getAuthError } from "../../stores/AuthStore";

export const Login = () => {
  const [password, setPassword] = useState("");
  const login = useLogin();
  const authError = useSelector(getAuthError);

  const validate = (value: string) => {
    if (value.length < 8) {
      return false;
    }
  };

  useEffect(() => {
    validate(password);
  }, [password]);

  const handleLogin = useCallback(() => {
    login(password);
  }, [password]);

  const handleLoginByEnter = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  const inputDefaultProps = { onKeyUp: handleLoginByEnter };

  return (
    <div className={styles.content}>
      <WelcomeInfo />
      <div className={styles.rightPart}>
        <div className={styles.version}></div>
        <div className={styles.form} onKeyUp={handleLoginByEnter}>
          <div className={styles.title}>Login</div>
          <InputField
            inputClassName={styles.input}
            className={styles.inputWrapper}
            onChange={setPassword}
            type="password"
            label={"Password"}
            value={password}
            placeholder={""}
            {...inputDefaultProps}
          />
          <BlueButton className={styles.loginButton} onClick={handleLogin} {...inputDefaultProps} isBig>
            Log In
          </BlueButton>
          <div className={styles.errorMsg}>{authError}</div>
        </div>
        <div />
      </div>
    </div>
  );
};

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
