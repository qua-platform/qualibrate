import React from "react";
import InputField from "./InputField";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Input.module.scss";

interface Props {
  id: string;
  label: string;
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
}

const ProjectFormField: React.FC<Props> = ({ id, label, placeholder, value, onChange, type = "text", error }) => {
  return (
    <>
      <label htmlFor={id} className={error ? styles.error : undefined}>
        {label}
      </label>
      <InputField id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} error={error} />
    </>
  );
};

export default ProjectFormField;


