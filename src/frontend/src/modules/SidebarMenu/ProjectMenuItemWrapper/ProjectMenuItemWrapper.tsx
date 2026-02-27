import React, { ReactElement } from "react";

interface Props {
  title: string;
  classNames: string;
  icon: ReactElement;
  onClickHandler: () => void;
}

const ProjectMenuItemWrapper = ({ icon, classNames, title, onClickHandler }: Props) => {
  return (
    <div className={classNames} onClick={onClickHandler}>
      {icon}
      <span>{title}</span>
    </div>
  );
};

export default ProjectMenuItemWrapper;