import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import SwiperComponent from 'src/customs/pages/Operator/Components/SwiperComponent';

export default function InfoDialog({ open, onClose, data, container }: any) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" container={container.current}>
      <DialogTitle>Information Guideline</DialogTitle>

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
        <SwiperComponent images={data} />
      </DialogContent>
    </Dialog>
  );
}
