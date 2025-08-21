import React from "react";
import InputField from "./InputField";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../../../../modules/Project/CreateNewProjectForm/CreateNewProjectForm.module.scss";

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
}

const ProjectFormField: React.FC<Props> = ({ label, placeholder, value, onChange, type = "text", error }) => {
  return (
    <>
      <label className={error ? styles.error : undefined}>{label}</label>
      <InputField type={type} placeholder={placeholder} value={value} onChange={onChange} error={error} />
    </>
  );
};

export default ProjectFormField;
