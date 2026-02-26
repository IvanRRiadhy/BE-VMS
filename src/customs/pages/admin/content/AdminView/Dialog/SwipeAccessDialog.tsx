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
  TextField,
  MenuItem,
} from '@mui/material';
import { Box } from '@mui/system';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { createGiveAccessOperator } from 'src/customs/api/operator';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

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
  onSubmit?: (payload: { value: string; type: string; access: string[] }) => void;
  invitationId?: string;
  visitor: any;
}

interface AccessItem {
  access_control_id: string;
  access_control_name: string;
}

const SwipeAccessDialog = ({
  open,
  onClose,
  payload,
  data,
  onSubmit,
  invitationId,
  visitor,
}: SwipeAccessDialogProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { token } = useSession();

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
    }
  }, [open]);

  const allChecked = data.length > 0 && selectedIds.length === data.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < data.length;
  const [action, setAction] = useState<1 | 2>(1);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? data.map((d) => d.id) : []);
  };

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    // if (!payload) return;

    if (selectedIds.length === 0) {
      showSwal('warning', 'Please select at least one access.');
      return;
    }

    const data_access = selectedIds.map((accessControlId) => ({
      access_control_id: accessControlId,
      action,
      // card_number: payload.value,
      trx_visitor_id: visitor.id,
    }));

    const payloads = { data_access };

    console.log('📤 GIVE ACCESS PAYLOAD', payloads);

    try {
      await createGiveAccessOperator(token as string, payloads);

      showSwal(
        'success',
        action === 1 ? 'Access granted successfully!' : 'Access revoked successfully!',
      );

      // onClose();
    } catch (err: any) {
      showSwal('error', err?.msg || err?.message || 'Failed to update access');
    }
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
          <FormControlLabel
            control={
              <Checkbox
                checked={allChecked}
                indeterminate={indeterminate}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label="Select All"
          />
          {data.map((item) => (
            <FormControlLabel
              key={item.access_control_id}
              control={
                <Checkbox
                  checked={selectedIds.includes(item.access_control_id)}
                  onChange={() => handleToggle(item.access_control_id)}
                />
              }
              label={item.access_control_name}
            />
          ))}
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Box px={2} mb={0}>
          <TextField
            select
            fullWidth
            size="small"
            label="Action"
            value={action}
            onChange={(e) => setAction(Number(e.target.value) as 1 | 2)}
          >
            <MenuItem value={1}>Grant</MenuItem>
            <MenuItem value={2}>Revoke</MenuItem>
          </TextField>
        </Box>
        <Button
          fullWidth
          variant="contained"
          disabled={selectedIds.length === 0}
          onClick={handleSubmit}
        >
          Apply
        </Button>
        <Button
          fullWidth
          variant="contained"
          // disabled={selectedIds.length === 0}
          // onClick={handleSubmit}
          onClick={onClose}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SwipeAccessDialog;
