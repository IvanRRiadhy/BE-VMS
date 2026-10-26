import { Dialog, DialogTitle, DialogContent, IconButton, Tooltip } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import SwiperComponent from 'src/customs/pages/Operator/Components/SwiperComponent';

export default function InfoDialog({ open, onClose, data, container }: any) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" container={container.current}>
      <DialogTitle>Information Guideline</DialogTitle>
      <Tooltip arrow title="Close Dialog" placement="bottom">
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
      </Tooltip>

      <DialogContent dividers sx={{ padding: 2, paddingTop: 1 }}>
        <SwiperComponent images={data} />
      </DialogContent>
    </Dialog>
  );
}
