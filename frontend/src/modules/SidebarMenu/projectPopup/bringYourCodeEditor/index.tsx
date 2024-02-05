import React from "react";

import Dialog from "../../../../ui-lib/components/dialogs/Dialog";
import VSCodeInstruction from "./VSCodeInstruction";
import JetBrainsInstruction from "./JetBrainsInstruction";
import { PopupProps } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/Popup";

const BringYourCodeEditor: React.FunctionComponent<PopupProps> = ({ onClose }) => {
  return (
    <Dialog onClose={onClose} title={"Bring-your-code-editor"}>
      <VSCodeInstruction />
      <JetBrainsInstruction />
    </Dialog>
  );
};

export default BringYourCodeEditor;
