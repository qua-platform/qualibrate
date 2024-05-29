import { ModuleKey } from "../../routing/ModulesRegistry";
import { ReactElement } from "react";

export interface Popup {
  id: string;
  component: ReactElement | null;
  active?: boolean;
  frameId?: ModuleKey;
}
