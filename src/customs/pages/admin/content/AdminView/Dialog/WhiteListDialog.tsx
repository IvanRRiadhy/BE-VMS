import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

interface WhiteListDialogProps {
  open: boolean;
  onClose: () => void;
  data: any[];
  container?: HTMLElement | null;
}

const WhiteListDialog: React.FC<WhiteListDialogProps> = ({
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
        Whitelist
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
    </Dialog>
  );
};

export default WhiteListDialog;
