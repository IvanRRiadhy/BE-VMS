import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Autocomplete,
  TextField,
} from '@mui/material';
import { IconSend, IconX } from '@tabler/icons-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
}

const SendEmailDialog = ({ open, onClose, onSend }: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Send Invitation Link</DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Typography variant="h6" color="primary">
          Send Via Email
        </Typography>

        <Typography mb={2}>
          Please enter a valid email address of the recipient to send the invitation link via email
        </Typography>

        <Autocomplete
          multiple
          options={[]}
          renderInput={(params) => <TextField {...params} label="Email" />}
        />
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="primary" startIcon={<IconSend />} onClick={onSend}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendEmailDialog;
