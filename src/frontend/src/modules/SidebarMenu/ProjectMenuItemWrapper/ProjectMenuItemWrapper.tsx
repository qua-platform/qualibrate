import React, { ReactElement } from "react";

interface Props {
  dataTestId: string;
  title: string;
  isDisabled: boolean;
  classNames: string;
  icon: ReactElement;
  onClickHandler: () => void;
}

const ProjectMenuItemWrapper = ({ dataTestId, icon, isDisabled, classNames, title, onClickHandler }: Props) => {
  return (
    <div data-testid={dataTestId} className={classNames} onClick={!isDisabled ? onClickHandler : undefined}>
      {icon}
      <span>{title}</span>
    </div>
  );
};

export default ProjectMenuItemWrapper;