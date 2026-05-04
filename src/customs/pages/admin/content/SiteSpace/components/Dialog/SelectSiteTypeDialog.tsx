import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Autocomplete,
  TextField,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

type OptionType = {
  label: string;
  value: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  options: OptionType[];
  value: number | null;
  onChange: (value: number | null) => void;
  onNext: (value: number) => void;
  showError: any;
};

const SelectSiteTypeDialog: React.FC<Props> = ({
  open,
  onClose,
  options,
  value,
  onChange,
  onNext,
  showError,
}) => {
  const selectedOption = options.find((o) => o.value === value) || null;

  const handleNext = () => {
    if (value === null) {
      showError('error', 'Please select a type first');
      return;
    }
    onNext(value);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Select Type Site
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 10, top: 10 }}>
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Autocomplete
          fullWidth
          options={options}
          value={selectedOption}
          onChange={(_, newValue) => {
            onChange(newValue?.value ?? null);
          }}
          renderInput={(params) => <TextField {...params} placeholder="Select site type..." />}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleNext} variant="contained" disabled={options.length === 0}>
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectSiteTypeDialog;
