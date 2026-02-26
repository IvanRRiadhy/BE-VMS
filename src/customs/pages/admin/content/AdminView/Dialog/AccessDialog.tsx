import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Button,
  MenuItem,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

type AccessDialogProps = {
  open: boolean;
  onClose: () => void;
  containerRef?: any;

  accessData: any[];
  selectedVisitors: string[];

  allowedActions: string[];

  selectedAccessIds: string[];
  setSelectedAccessIds: (ids: string[]) => void;

  selectedActionAccess: string;
  setSelectedActionAccess: (val: string) => void;

  handleAccessAction: (row: any, action: 'grant' | 'revoke' | 'block') => Promise<void>;

  setSnackbarOpen: (v: boolean) => void;
  setSnackbarMsg: (v: string) => void;
  setSnackbarType: (v: 'info' | 'success' | 'error') => void;
};

export default function AccessDialog({
  open,
  onClose,
  containerRef,
  accessData,
  selectedVisitors,
  allowedActions,
  selectedAccessIds,
  setSelectedAccessIds,
  selectedActionAccess,
  setSelectedActionAccess,
  handleAccessAction,
  setSnackbarOpen,
  setSnackbarMsg,
  setSnackbarType,
}: AccessDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" container={containerRef}>
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

      <DialogContent dividers>
        <DynamicTable
          data={accessData.map(({ trx_visitor_id, visitors, ...rest }) => rest)}
          isHaveChecked
          isHaveHeaderTitle
          titleHeader="Access"
          overflowX="auto"
          isHaveAccess
          isNoActionTableHead
          onAccessAction={handleAccessAction as any}
          onCheckedChange={(checkedRows) => {
            const ids = checkedRows.map((r: any) => r.access_control_id);
            setSelectedAccessIds(ids);
          }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <CustomSelect
            sx={{ width: '30%', p: 0, mt: 2, backgroundColor: 'white' }}
            value={selectedActionAccess}
            onChange={(e: any) => setSelectedActionAccess(e.target.value)}
            displayEmpty
            disabled={!selectedAccessIds.length}
          >
            <MenuItem value="">Select Action</MenuItem>
            <MenuItem value="grant" disabled={!allowedActions.includes('Grant')}>
              Grant
            </MenuItem>
            <MenuItem value="revoke" disabled={!allowedActions.includes('Revoke')}>
              Revoke
            </MenuItem>
            <MenuItem value="block" disabled={!allowedActions.includes('Block')}>
              Block
            </MenuItem>
          </CustomSelect>

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            disabled={!selectedActionAccess || allowedActions.length === 0}
            onClick={async () => {
              if (!selectedAccessIds.length || !selectedActionAccess) {
                setSnackbarMsg('Please select rows and an action first.');
                setSnackbarType('info');
                setSnackbarOpen(true);
                return;
              }

              if (
                !allowedActions.includes(
                  selectedActionAccess.charAt(0).toUpperCase() + selectedActionAccess.slice(1),
                )
              ) {
                setSnackbarMsg(
                  `Action "${selectedActionAccess}" is not allowed for selected access.`,
                );
                setSnackbarType('info');
                setSnackbarOpen(true);
                return;
              }

              for (const id of selectedAccessIds) {
                const row = accessData.find(
                  (r) =>
                    r.access_control_id?.toLowerCase() === id.toLowerCase() &&
                    selectedVisitors.some(
                      (v) =>
                        v.toLowerCase() === r.trx_visitor_id?.toLowerCase() ||
                        v.toLowerCase() === r.trxVisitorId?.toLowerCase(),
                    ),
                );

                if (!row) continue;

                await handleAccessAction(row, selectedActionAccess as any);
              }

              setSelectedActionAccess('');
            }}
          >
            Apply
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
