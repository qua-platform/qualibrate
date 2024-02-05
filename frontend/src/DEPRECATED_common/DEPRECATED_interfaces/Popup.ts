import { ModuleKey } from "../../routing/ModulesRegistry";
import { Dispatch, SetStateAction } from "react";

export interface Popup {
  id: string;
  component: JSX.Element;
  active?: boolean;
  frameId?: ModuleKey;
}

export type PopupProps<D = any> = {
  selectedFilterType?: string;
  setSelectedFilterType?: Dispatch<SetStateAction<string>>;
  onClose: () => void;
  onSubmit?: (d: D) => void;
};
