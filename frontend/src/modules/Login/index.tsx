import React, { useCallback, useEffect, useState } from "react";
import styles from "../Login/Login.module.scss";
import InputField from "../../DEPRECATED_components/common/Input/InputField";
import BlueButton from "../../ui-lib/components/Button/BlueButton";
import QUAlibrateLogoIcon from "../../ui-lib/Icons/QUAlibrateLogoIcon";
import welcomeWaves from "./welcomeWaves.png";
import { useAuthContext } from "./context/AuthContext";

export const Login = () => {
  const [password, setPassword] = useState("");
  const { login, authError } = useAuthContext();

  const validate = (value: string) => {
    if (value.length < 8) {
      return false;
    }
  };

  useEffect(() => {
    login("");
  }, []);

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
