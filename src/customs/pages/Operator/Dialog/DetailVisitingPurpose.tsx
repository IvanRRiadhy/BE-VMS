import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import React from 'react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const DetailVisitingPurpose = ({ open, onClose, data, purposeName }: any) => {
  return (
    <div>
      <Dialog open={open} onClose={onClose} fullWidth   maxWidth={false}
            PaperProps={{
              sx: {
                width: '100vw',
              },
            }}>
        <DialogTitle>{purposeName?.name}</DialogTitle>

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
          <DynamicTable data={data} isHaveChecked isNoActionTableHead  isHaveSearch/>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetailVisitingPurpose;
