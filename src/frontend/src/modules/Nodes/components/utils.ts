import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getRunStatusNodeRunStart } from "../../../stores/WebSocketStore";

export const formatTimeAgo = (isoString: string) => {
  if (!isoString) return "";

  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // For older dates, show absolute date
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const useLastRunTimeAgo = () => {
  const [timeAgo, setTimeAgo] = useState<string | undefined>(undefined);
  const runStatusNodeRunStart = useSelector(getRunStatusNodeRunStart);

  useEffect(() => {
    if (runStatusNodeRunStart) {
      setTimeAgo(formatTimeAgo(runStatusNodeRunStart));
      const interval = setInterval(() => setTimeAgo(formatTimeAgo(runStatusNodeRunStart)), 60000);

      return () => clearInterval(interval);
    } else {
      setTimeAgo(undefined);
    }
  }, [runStatusNodeRunStart]);

  return timeAgo;
};