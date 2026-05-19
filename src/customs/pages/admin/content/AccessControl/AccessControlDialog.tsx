import { Dialog, DialogTitle, DialogContent, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import FormAccessControl from './FormAccessControl';

interface AccessControlDialogProps {
  open: boolean;
  edittingId: string;

  onClose: () => void;
  onSuccess: () => void;

  hasUnsaved: () => boolean;
  setConfirmDialogOpen: (open: boolean) => void;
}

export default function AccessControlDialog({
  open,
  edittingId,
  onClose,
  onSuccess,
  hasUnsaved,
  setConfirmDialogOpen,
}: AccessControlDialogProps) {
  const handleClose = () => {
    if (hasUnsaved()) {
      setConfirmDialogOpen(true);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
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
        <FormAccessControl onSuccess={onSuccess} editingId={edittingId} />
      </DialogContent>
    </Dialog>
  );
}
