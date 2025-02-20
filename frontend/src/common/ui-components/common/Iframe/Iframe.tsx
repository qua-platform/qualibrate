import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import styles from "./Iframe.module.scss";

interface IframeProps {
  targetUrl: string;
}

const Iframe: React.FC<IframeProps> = ({ targetUrl }: IframeProps) => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkURL = async () => {
      try {
        const response = await fetch(targetUrl, { method: "HEAD" });
        setIsAvailable(response.ok);
      } catch (error) {
        setIsAvailable(false);
      }
    };

    checkURL();
  }, [targetUrl]);

  if (isAvailable === null) {
    return <CircularProgress size="2rem" />;
  }

  if (!isAvailable) {
    return <div className={styles.notLoaded} />;
  }

  return <iframe className={styles.iframe} src={targetUrl} title="Embedded Page" />;
};

export default Iframe;
