import React from "react";
import InputField from "./InputField";

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

const ProjectFormField: React.FC<Props> = ({ label, placeholder, value, onChange, type = "text" }) => {
  return (
    <>
      <label>{label}</label>
      <InputField type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </>
  );
};

export default ProjectFormField;
