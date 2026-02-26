import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import React from 'react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const DetailVisitingPurpose = ({ open, onClose, data }: any) => {

  
  return (
    <div>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>{data?.name}</DialogTitle>
        {/* close button */}
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
          <DynamicTable data={[]} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetailVisitingPurpose;
