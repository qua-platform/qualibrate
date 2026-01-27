import React, { ReactElement, ReactNode } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export interface BasicDialogProps {
  open: boolean;
  title?: string;
  description: ReactNode;
  onClose?: () => void;
  buttons?: ReactElement[];
}

export const BasicDialog: React.FC<BasicDialogProps> = ({ open, title, description, onClose, buttons }) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog data-test-id open={open} onClose={handleClose}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        <DialogContentText data-testid={"dialog-content-text"}>{description}</DialogContentText>
      </DialogContent>
      {buttons && <DialogActions>{buttons.map((button) => button)}</DialogActions>}
    </Dialog>
  );
};
