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
import { useEffect, useState } from 'react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { getVisitorDocuments } from 'src/customs/api/models/Admin/SwapCard';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

type QrMode = 'manual' | 'scan';

interface SwipeCardDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (value: string, type: string) => void;
  invitationId: any;
  loading?: any;
}

const SwipeCardDialog = ({
  open,
  onClose,
  onSubmit,
  invitationId,
  loading,
}: SwipeCardDialogProps) => {
  const [qrMode, setQrMode] = useState<QrMode>('manual');
  const [qrValue, setQrValue] = useState('');
  const [qrType, setQrType] = useState('nik');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [visitorDocuments, setVisitorDocuments] = useState<any[]>([]);
  const { token } = useSession();

  useEffect(() => {
    if (!open) {
      setQrValue('');
      setQrType('');
      setQrMode('manual');
      setHasDecoded(false);
    }
  }, [open]);

  useEffect(() => {
    if (!invitationId) return;
    const fetchData = async () => {
      const res = await getVisitorDocuments(token as string, invitationId);
      setVisitorDocuments(res?.collection ?? []);
    };
    fetchData();
  }, [invitationId]);

  const handleSubmit = () => {
    loading(true);
    try {
      if (!qrValue) {
        showSwal('error', 'Please input value number');
        return;
      }

      if (!qrType) {
        showSwal('error', 'Please select type');
        return;
      }

      onSubmit?.(qrValue, qrType);
      setQrValue('');
      setHasDecoded(false);
      onClose();
    } catch (error) {
      console.error(error);
      showSwal('error', 'Failed to swipe card');
    } finally {
      setTimeout(() => loading(false), 500);
    }
  };

  const qrTypeLabelMap: Record<string, string> = {
    NIK: 'NIK',
    KTP: 'No KTP',
    Passport: 'Passport Number',
    DriverLicense: 'Driver License',
    CardAccess: 'Card Access',
    Face: 'Face ID',
    Nda: 'NDA',
    Other: 'Other',
  };

  const typeDocument = [
    { value: 'NIK', label: 'NIK' },
    { value: 'KTP', label: 'KTP' },
    { value: 'Passport', label: 'Passport' },
    { value: 'DriverLicense', label: 'Driver License' },
    { value: 'CardAccess', label: 'Card Access' },
    { value: 'Face', label: 'Face ID' },
    { value: 'Nda', label: 'NDA' },
    { value: 'Other', label: 'Other' },
  ];

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

            {/* <Tooltip
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
            </Tooltip> */}
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
                disabled={visitorDocuments.length === 0}
              >
                {visitorDocuments.length === 0 ? (
                  <MenuItem value="" disabled>
                    No document available
                  </MenuItem>
                ) : (
                  visitorDocuments.map((doc) => (
                    <MenuItem key={doc.id} value={doc.identity_type}>
                      {doc.identity_type ?? doc.identity_type}
                    </MenuItem>
                  ))
                )}
              </CustomSelect>
              {/* <CustomSelect
                fullWidth
                size="medium"
                value={qrType}
                onChange={(e: any) => setQrType(e.target.value)}
                sx={{ mb: 2 }}
              >
                {typeDocument.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </CustomSelect> */}

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
          {qrMode === 'scan' && (
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
                disabled={visitorDocuments.length === 0}
              >
                {visitorDocuments.length === 0 ? (
                  <MenuItem value="" disabled>
                    No document available
                  </MenuItem>
                ) : (
                  visitorDocuments.map((doc) => (
                    <MenuItem key={doc.id} value={doc.identity_type}>
                      {doc.identity_type ?? doc.identity_type}
                    </MenuItem>
                  ))
                )}
              </CustomSelect>

              <Typography variant="body1" mb={1} fontWeight={'500'} textTransform={'capitalize'}>
                {qrTypeLabelMap[qrType] ?? 'Value'}
              </Typography>

              {/* <Box display="flex" gap={0.5} alignItems="center">
                <TextField
                  fullWidth
                  size="small"
                  value={qrValue}
                  onChange={(e) => setQrValue(e.target.value)}
                />
                <IconButton onClick={() => {}} sx={{ p: 0 }}>
                  <IconCircleCheck color="green" size={35} />
                </IconButton>
              </Box> */}
            </>
          )}
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
