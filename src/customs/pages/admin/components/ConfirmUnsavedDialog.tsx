import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
  // onContinue: () => void;
  title?: string;
  message?: string;
};

const ConfirmUnsavedDialog: React.FC<Props> = ({
  open,
  onClose,
  onDiscard,
  // onContinue,
  title = 'Unsaved Changes',
  message = 'You have unsaved changes. Are you sure you want to discard them and continue?',
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>{message}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onDiscard} variant="contained" color="primary">
          Yes, Discard and Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmUnsavedDialog;
