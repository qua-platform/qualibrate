import React from "react";

export interface NavItemProps {
  icon?: React.ReactElement;
  name: React.ReactNode;
  link?: string;
  onClick?: () => void;
  active?: boolean;
  resultsNumber?: number | null;
}
