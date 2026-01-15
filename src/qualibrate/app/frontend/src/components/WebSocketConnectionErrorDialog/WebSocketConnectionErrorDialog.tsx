import React from "react";
import { useSelector } from "react-redux";
import { BasicDialog } from "../BasicDialog/BasicDialog";
import { getConnectionLostSeconds, getShowConnectionErrorDialog } from "../../stores/WebSocketStore";

const WebSocketConnectionErrorDialog = () => {
  const showConnectionErrorDialog = useSelector(getShowConnectionErrorDialog);
  const connectionLostSeconds = useSelector(getConnectionLostSeconds);

  const formatElapsed = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs.toString().padStart(2, "0")}s` : `${secs}s`;
  };

  if (!showConnectionErrorDialog) return <></>;

  return <BasicDialog
    open={showConnectionErrorDialog}
    title={"Connection lost"}
    description={
      <>
        Connection with the server has been lost.
        <br />
        Retrying for {formatElapsed(connectionLostSeconds)}...
      </>
    }
  />;
};

export default WebSocketConnectionErrorDialog;
