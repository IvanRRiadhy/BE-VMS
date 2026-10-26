import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';



interface InputInvitationCodeDialogProps {
  open: boolean;
  invitationCode: string;

  onClose: () => void;
  onChangeInvitationCode: (value: string) => void;
  onSubmit: () => void;
}

export default function InputInvitationCodeDialog({
  open,
  invitationCode,
  onClose,
  onChangeInvitationCode,
  onSubmit,
}: InputInvitationCodeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Input Invitation Code
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
      </DialogTitle>

      <DialogContent dividers>
        <CustomFormLabel sx={{ mt: 0 }}>Invitation Code</CustomFormLabel>

        <CustomTextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Enter your invitation code"
          value={invitationCode}
          onChange={(e: any) => onChangeInvitationCode(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
