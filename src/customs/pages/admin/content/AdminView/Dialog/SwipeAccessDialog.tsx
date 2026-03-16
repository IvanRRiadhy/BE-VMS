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
import { createGiveAccessOperator, createMultipleGrantAccess } from 'src/customs/api/operator';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

interface AccessItem {
  id: string;
  access_control_name: string;
}

interface SwipeAccessDialogProps {
  open: boolean;
  onClose: () => void;
  payload: any;
  data: any[];
  onSubmit?: (payload: { value: string; type: string; access: string[] }) => void;
  invitationId?: string;
  setLoadingAccess?: any;
  visitor: any;
  onSuccessRefresh?: () => Promise<void>;
}

interface SwipePayload {
  card_number: string;
  trx_visitor_id: string;
  description: string;
  is_swapcard: boolean;
  swap_type: string;
}

const SwipeAccessDialog = ({
  open,
  onClose,
  payload,
  data,
  onSubmit,
  invitationId,
  visitor,
  onSuccessRefresh,
  setLoadingAccess,
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

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? data.map((d) => d.id) : []);
  };

  const isSingleVisitor = payload?.length === 1;

  const handleToggle = (id: string) => {
    if (isSingleVisitor) {
      setSelectedIds([id]);
    } else {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
    }
  };

  const handleSubmit = async () => {
    if (!payload || payload.length === 0) return;

    if (selectedIds.length === 0) {
      showSwal('warning', 'Please select at least one site.');
      return;
    }
    const siteId = selectedIds[0];
    const site = data.find((d) => d.id === siteId);

    const payloads = {
      data: payload.map((p: any) => ({
        ...p,
        swap_card_in: site.id,
        swap_card_in_name: site.name,
      })),
    };
    console.log('📤 GIVE ACCESS PAYLOAD', payloads);
    setLoadingAccess(true);
    try {
      await createMultipleGrantAccess(token as string, payloads);
      showSwal('success', 'Successfully granted access');
      if (onSuccessRefresh) {
        await onSuccessRefresh();
      }
      onClose();
    } catch (err: any) {
      showSwal('error', err?.msg || err?.message || 'Failed to update access');
    } finally {
      setLoadingAccess(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Select Site </DialogTitle>

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
          {!isSingleVisitor && (
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
          )}
          {data.map((item) => (
            <FormControlLabel
              key={item.id}
              control={
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggle(item.id)}
                />
              }
              label={item.name}
            />
          ))}
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Box mb={0} sx={{ display: 'flex', gap: '5px' }}>
          {/* <CustomTextField
            select
            fullWidth
            size="small"
            label="Action"
            sx={{ width: '200px'}}
            value={action}
            onChange={(e) => setAction(Number(e.target.value) as 1 | 2)}
          >
            <MenuItem value={1}>Grant</MenuItem>
            <MenuItem value={2}>Revoke</MenuItem>
          </CustomTextField> */}
          <Button
            fullWidth
            variant="contained"
            disabled={selectedIds.length === 0}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>

        {/* <Button
          fullWidth
          variant="contained"
          // disabled={selectedIds.length === 0}
          // onClick={handleSubmit}
          onClick={onClose}
        >
          Done
        </Button> */}
      </DialogActions>
    </Dialog>
  );
};

export default SwipeAccessDialog;
