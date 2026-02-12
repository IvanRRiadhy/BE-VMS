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
  onSubmit?: (
    value: string,
    type: string,
    visitor: any,
    isLastVisitor: any,
    currentVisitorIndex: any,
  ) => void;
  invitationId: any;
  loading?: any;
  visitors?: any;
  currentVisitorIndex: number;
  setCurrentVisitorIndex: (v: any) => void;
}

const SwipeCardDialog = ({
  open,
  onClose,
  onSubmit,
  invitationId,
  loading,
  visitors,
  currentVisitorIndex,
  setCurrentVisitorIndex,
}: SwipeCardDialogProps) => {
  const [qrMode, setQrMode] = useState<QrMode>('manual');
  const [qrValue, setQrValue] = useState('');
  const [qrType, setQrType] = useState('nik');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [visitorDocuments, setVisitorDocuments] = useState<any[]>([]);
  const { token } = useSession();
  // const [currentVisitorIndex, setCurrentVisitorIndex] = useState(0);

  const currentVisitor = visitors[currentVisitorIndex];

  useEffect(() => {
    if (!open) {
      // setCurrentVisitorIndex(0);
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

  // const handleSubmit = () => {
  //   loading(true);
  //   try {
  //     if (!qrValue) {
  //       showSwal('error', 'Please input value number');
  //       return;
  //     }

  //     if (!qrType) {
  //       showSwal('error', 'Please select type');
  //       return;
  //     }

  //     onSubmit?.(qrValue, qrType);
  //     setQrValue('');
  //     setHasDecoded(false);
  //     onClose();
  //   } catch (error) {
  //     console.error(error);
  //     showSwal('error', 'Failed to swipe card');
  //   } finally {
  //     setTimeout(() => loading(false), 500);
  //   }
  // };

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
      const isLastVisitor = currentVisitorIndex === visitors.length - 1;
      onSubmit?.(qrValue, qrType, currentVisitor, isLastVisitor, currentVisitorIndex);

      // if (!isLastVisitor) {
      //   setCurrentVisitorIndex((prev:any) => prev + 1);
      //   setQrValue('');
      //   setHasDecoded(false);
      //   return;
      // }

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
          {/* ⭐ VISITOR HEADER */}
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Visitor {currentVisitorIndex + 1} / {visitors?.length || 1}
            </Typography>

            <Typography fontWeight={600} fontSize={16}>
              {currentVisitor?.name ?? '-'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* MODE SWITCH */}
          <Box display="flex" gap={1} mb={2}>
            <Tooltip title="Enter manually" arrow>
              <Button
                variant={qrMode === 'manual' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setQrMode('manual')}
              >
                Manual
              </Button>
            </Tooltip>
          </Box>

          {/* ================= FORM ================= */}

          {qrMode === 'manual' && (
            <DialogContent sx={{ p: '0 !important' }}>
              {/* TYPE */}
              <Typography fontWeight={500} mb={0.5}>
                Type
              </Typography>

              <CustomSelect
                fullWidth
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
                      {doc.identity_type}
                    </MenuItem>
                  ))
                )}
              </CustomSelect>

              {/* VALUE */}
              <Typography fontWeight={500} mb={0.5}>
                {qrTypeLabelMap[qrType] ?? 'Value'}
              </Typography>

              <TextField
                fullWidth
                size="small"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
              />
            </DialogContent>
          )}
        </DialogContent>

        <DialogActions>
          <Button fullWidth variant="contained" onClick={handleSubmit}>
            {currentVisitorIndex === (visitors?.length || 1) - 1 ? 'Finish Swipe' : 'Swipe & Next'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SwipeCardDialog;
