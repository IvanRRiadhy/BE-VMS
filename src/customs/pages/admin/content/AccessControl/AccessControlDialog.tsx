import { Dialog, DialogTitle, DialogContent, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import FormAccessControl from './FormAccessControl';

interface AccessControlDialogProps {
  open: boolean;
  edittingId: string;
  onClose: () => void;
  onSuccess: () => void;
  setConfirmDialogOpen: (open: boolean) => void;
  isDirty?: boolean;
  onDirty?: (dirty: boolean) => void;
}

export default function AccessControlDialog({
  open,
  edittingId,
  onClose,
  onSuccess,
  setConfirmDialogOpen,
  isDirty,
  onDirty,
}: AccessControlDialogProps) {
const handleClose = () => {
  if (isDirty) {
    setConfirmDialogOpen(true);
    return;
  }

  onDirty?.(false);
  onClose();
};

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" keepMounted={false}>
      <DialogTitle
        sx={{
          position: 'relative',
          padding: 2,
        }}
      >
        {edittingId ? 'Edit' : 'Add'} Access Control
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 6,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <FormAccessControl onSuccess={onSuccess} editingId={edittingId} onDirty={onDirty} />
      </DialogContent>
    </Dialog>
  );
}
