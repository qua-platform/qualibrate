import React, { ReactElement } from "react";

interface Props {
  title: string;
  isDisabled: boolean;
  classNames: string;
  icon: ReactElement;
  onClickHandler: () => void;
}

const ProjectMenuItemWrapper = ({ icon, isDisabled, classNames, title, onClickHandler }: Props) => {
  return (
    <div className={classNames} onClick={!isDisabled ? onClickHandler : undefined}>
      {icon}
      <span>{title}</span>
    </div>
  );
};

export default ProjectMenuItemWrapper;