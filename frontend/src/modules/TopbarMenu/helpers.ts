export const formatTime = (sec: number | null): string => {
  if (sec === null) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s`;
};

export const formatDate = (date?: string | Date | null): string => {
  if (!date) return "—";

  const d = typeof date === "string" ? new Date(date) : date;

  return (
    d.toLocaleDateString("en-GB") +
    " " +
    d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  );
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getWrapperClass = (status: string, styles: { [key: string]: string }): string => {
  if (status === "running") return styles.running;
  if (status === "finished") return styles.finished;
  if (status === "error") return styles.error;
  return styles.pending;
};

export const getStatusClass = (status: string, styles: { [key: string]: string }): string => {
  if (status === "running") return styles.statusRunning;
  if (status === "finished") return styles.statusFinished;
  if (status === "error") return styles.statusError;
  return styles.statusPending;
};
