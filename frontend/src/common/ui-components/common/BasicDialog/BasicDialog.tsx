import React, { ReactElement, ReactNode } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface BasicDialogProps {
  open: boolean;
  title: string;
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
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
        {buttons && <DialogActions>{buttons.map((button) => button)}</DialogActions>}
      </Dialog>
    </div>
  );
};
