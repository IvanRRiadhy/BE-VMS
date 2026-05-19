import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface NewSectionDialogProps {
  open: boolean;
  value: string;
  onClose: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const NewSectionDialog = ({ open, value, onClose, onChange, onSubmit }: NewSectionDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        New Section Page
        <IconButton
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
          onClick={onClose}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <CustomTextField
          autoFocus
          margin="dense"
          placeholder="Enter Section Name"
          type="text"
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} color="primary" variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewSectionDialog;
