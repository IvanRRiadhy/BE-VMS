import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
  Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { Box } from '@mui/system';

interface VehicleDialogProps {
  open: boolean;
  onClose: () => void;
  data: any[];
  container?: HTMLElement | null;
}

const VehicleDialog: React.FC<VehicleDialogProps> = ({
  open,
  onClose,
  data,
  container = undefined,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      container={container ?? undefined}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle sx={{ position: 'relative' }}>
        Vehicle List Daily
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
        <DynamicTable data={data} isHaveSearch={true} />
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Sum: 3</Typography>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleDialog;
