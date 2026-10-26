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
  Chip,
} from '@mui/material';
import { IconSend, IconX } from '@tabler/icons-react';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSend: (emails: string[]) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SendEmailDialog = ({ open, onClose, onSend }: Props) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    let finalEmails = [...emails];

    if (inputValue.trim() !== '') {
      finalEmails.push(inputValue.trim());
    }

    if (finalEmails.length === 0) {
      setError('Please enter at least one email address');
      return;
    }

    const invalid = finalEmails.find((email) => !emailRegex.test(email));

    if (invalid) {
      setError(`Invalid email format: ${invalid}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onSend(finalEmails);

      setEmails([]);
      setInputValue('');
    } catch (err) {
      setError('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        }}
      >
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Typography variant="h6" color="primary">
          Send Via Email
        </Typography>

        <Typography mb={2}>Please enter a valid email address of the recipient.</Typography>

        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={emails}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
          }}
          onChange={(_, value) => {
            setEmails(value);
            setError(null);
          }}
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Email"
              placeholder="Type email and press Enter"
              error={!!error}
              helperText={error}
            />
          )}
        />
      </DialogContent>

      <DialogActions>
        <Button variant="contained" startIcon={<IconSend />} onClick={handleSend}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendEmailDialog;
