import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Tooltip,
  Divider,
  Typography,
  MenuItem,
  TextField,
} from '@mui/material';
import { IconX, IconScan, IconSquareCheck, IconCircleCheck } from '@tabler/icons-react';
import { useState } from 'react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

type QrMode = 'manual' | 'scan';

interface SwipeCardDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (value: string, type: string) => void;
}

const SwipeCardDialog = ({ open, onClose, onSubmit }: SwipeCardDialogProps) => {
  const [qrMode, setQrMode] = useState<QrMode>('manual');
  const [qrValue, setQrValue] = useState('');
  const [qrType, setQrType] = useState('nik');
  const [hasDecoded, setHasDecoded] = useState(false);

  const handleSubmit = () => {
    onSubmit?.(qrValue, qrType);
  };

  const qrTypeLabelMap: Record<string, string> = {
    NIK: 'NIK',
    KTP: 'No KTP',
    Passport: 'Passport Number',
    DriverLicense: 'Driver License Number',
    CardAccess: 'Card Access Number',
    Face: 'Face ID',
    Nda: 'NDA Number',
    Other: 'Reference Number',
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Swipe Card</DialogTitle>

        <IconButton
          aria-label="close"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          onClick={onClose}
        >
          <IconX />
        </IconButton>

        <DialogContent dividers>
          {/* MODE SWITCH */}
          <Box display="flex" gap={1} mb={2}>
            <Tooltip
              title="Enter the value manually"
              arrow
              // slotProps={{
              //   tooltip: { sx: { fontSize: '1rem', padding: '8px 14px' } },
              // }}
            >
              <Button
                variant={qrMode === 'manual' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setQrMode('manual')}
              >
                Manual
              </Button>
            </Tooltip>

            <Tooltip
              title="KTP Scanner"
              arrow
              // slotProps={{
              //   tooltip: { sx: { fontSize: '1rem', padding: '8px 14px' } },
              // }}
            >
              <Button
                variant={qrMode === 'scan' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<IconScan />}
                onClick={() => {
                  setHasDecoded(false);
                  setQrMode('scan');
                }}
              >
                KTP Scanner
              </Button>
            </Tooltip>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* MANUAL MODE */}
          {qrMode === 'manual' && (
            <>
              <Typography variant="body1" mb={1} fontWeight={'500'}>
                Type
              </Typography>

              <CustomSelect
                fullWidth
                size="medium"
                value={qrType}
                onChange={(e: any) => setQrType(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="NIK">NIK</MenuItem>
                <MenuItem value="KTP">KTP</MenuItem>
                <MenuItem value="Passport">Passport</MenuItem>
                <MenuItem value="DriverLicense">Driver License</MenuItem>
                <MenuItem value="CardAccess">Card Access</MenuItem>
                <MenuItem value="Face">Face</MenuItem>
                <MenuItem value="Nda">NDA</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </CustomSelect>

              <Typography variant="body1" mb={1} fontWeight={'500'} textTransform={'capitalize'}>
                {qrTypeLabelMap[qrType] ?? 'Value'}
              </Typography>

              <Box display="flex" gap={0.5} alignItems="center">
                <TextField
                  fullWidth
                  size="small"
                  value={qrValue}
                  onChange={(e) => setQrValue(e.target.value)}
                />
                <IconButton onClick={() => {}} sx={{ p: 0 }}>
                  <IconCircleCheck color="green" size={35} />
                </IconButton>
              </Box>
            </>
          )}

          {/* SCAN MODE */}
          {qrMode === 'scan' && <>{/* nanti taruh camera / scanner di sini */}</>}
        </DialogContent>

        <DialogActions>
          <Button fullWidth variant="contained" onClick={handleSubmit}>
            Swipe
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SwipeCardDialog;
