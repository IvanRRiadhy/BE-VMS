import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface AccessItem {
  id: string;
  access_control_name: string;
}

interface SwipeAccessDialogProps {
  open: boolean;
  onClose: () => void;
  payload: {
    value: string;
    type: string;
  } | null;
  data: AccessItem[];
  onSubmit?: (payload: {
    value: string;
    type: string;
    access: string[]; 
  }) => void;
}

const SwipeAccessDialog = ({ open, onClose, payload, data, onSubmit }: SwipeAccessDialogProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // reset setiap dialog dibuka
  useEffect(() => {
    if (open) {
      setSelectedIds([]);
    }
  }, [open]);

  const allChecked = data.length > 0 && selectedIds.length === data.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? data.map((d) => d.id) : []);
  };

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    if (!payload) return;

    onSubmit?.({
      value: payload.value,
      type: payload.type,
      access: selectedIds,
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Give Access</DialogTitle>

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

      <DialogContent dividers sx={{ pt: 0 }}>
        <FormGroup>
          {/* SELECT ALL */}
          <FormControlLabel
            sx={{ mb: 0.5 }}
            control={
              <Checkbox
                checked={allChecked}
                indeterminate={indeterminate}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label="Select All"
          />

          {/* ACCESS LIST */}
          {data.map((item) => (
            <FormControlLabel
              key={item.id}
              control={
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggle(item.id)}
                />
              }
              sx={{ color: 'black' }}
              label={item.access_control_name}
            />
          ))}
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button
          fullWidth
          variant="contained"
          disabled={selectedIds.length === 0}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SwipeAccessDialog;
