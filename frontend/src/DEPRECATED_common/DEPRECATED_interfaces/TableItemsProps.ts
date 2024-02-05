import React from "react";
import { TableItemActions } from "./TableItemActions";

export interface TableItemProps extends TableItemActions {
  rowIcon?: React.ReactElement;
  rowIconType?: number;
  rowName: string;
  rowValue: string | number;
}
