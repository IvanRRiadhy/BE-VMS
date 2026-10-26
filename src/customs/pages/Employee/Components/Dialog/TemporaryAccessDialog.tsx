import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QRCode from 'react-qr-code';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface TemporaryAccessDialogProps {
  open: boolean;
  onClose: () => void;
  visitorDetail: any;
  qrRef: React.RefObject<HTMLDivElement>;
  handleDownloadQr: () => void;
  formatDateTime: (date: string) => string;
}

export default function TemporaryAccessDialog({
  open,
  onClose,
  visitorDetail,
  qrRef,
  handleDownloadQr,
  formatDateTime,
}: TemporaryAccessDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Temporary Access
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box ref={qrRef}>
          <QRCode
            size={256}
            value={visitorDetail?.visitor_number}
            viewBox="0 0 256 256"
            style={{
              display: 'block',
              margin: '0 auto',
              width: '250px',
              height: '250px',
              backgroundColor: '#fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            }}
          />

          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <CustomFormLabel sx={{ mt: 2, textAlign: 'center' }}>
              Scan this QR code to access
            </CustomFormLabel>

            <Button variant="contained" onClick={handleDownloadQr}>
              Download QR
            </Button>
          </Box>

          <Divider sx={{ mt: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mt: 1,
                  color: 'text.secondary',
                }}
              >
                Period
              </Typography>

              <CustomFormLabel
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                }}
              >
                {formatDateTime(visitorDetail?.visitor_period_start)} -{' '}
                {formatDateTime(visitorDetail?.visitor_period_end)}
              </CustomFormLabel>
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  mt: 1,
                  color: 'text.secondary',
                }}
              >
                Vehicle Plate Number
              </Typography>

              <CustomFormLabel
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                }}
              >
                {visitorDetail?.vehicle_plate_number || '-'}
              </CustomFormLabel>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
