import React, { useCallback, useState } from "react";
import { IconProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import RunJobPopup from "../components/RunJobPopup";
import { useJobActionsContext } from "../../Jobs/context/JobActionsContext";

const RunButton: React.FC = () => {
  const { runJob } = useJobActionsContext();
  const [showPopup, setShowPopup] = useState(false);
  const handleSubmit = useCallback(
    (data: { description: string }) => {
      runJob(data);
      setShowPopup(false);
    },
    [runJob, setShowPopup]
  );

  const handleClick = useCallback(() => {
    setShowPopup(true);
  }, [setShowPopup]);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={handleClick}>
        <RunIcon />
      </button>
      {showPopup && (
        <RunJobPopup
          onSubmit={handleSubmit}
          onClose={() => {
            setShowPopup(false);
          }}
        />
      )}
    </div>
  );
};

const RunIcon: React.FC<IconProps & { isStop?: boolean }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.width || 28} height={props.height || 28} fill="none" viewBox="0 0 40 40">
    <path
      fill={props.isStop ? "#A71942" : "var(--blue-button)"}
      fillRule="evenodd"
      d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0z"
      clipRule="evenodd"
    />
    {props.isStop ? (
      <rect width="14.737" height="14.737" x="12.632" y="12.632" fill="#fff" rx="2" />
    ) : (
      <path fill="#fff" d="M29.5 19.134a1 1 0 010 1.732L16 28.66a1 1 0 01-1.5-.866V12.206a1 1 0 011.5-.866l13.5 7.794z" />
    )}
  </svg>
);
export default RunButton;
