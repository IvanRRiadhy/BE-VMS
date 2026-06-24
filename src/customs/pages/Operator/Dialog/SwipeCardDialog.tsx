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
  Select,
} from '@mui/material';
import { IconX, IconScan, IconSquareCheck, IconCircleCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { getVisitorDocuments } from 'src/customs/api/Admin/SwapCard';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

type QrMode = 'manual' | 'scan';
type DocumentType = 'CardAccess' | 'Other';

interface SwipeCardDialogInitialValues {
  documentType: DocumentType;
  value: string;
}
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
  initialValues: any;
}

type FormValue = {
  value: string;
  type: string;
};

const SwipeCardDialog = ({
  open,
  onClose,
  onSubmit,
  invitationId,
  loading,
  visitors,
  currentVisitorIndex,
  setCurrentVisitorIndex,
  initialValues,
}: SwipeCardDialogProps) => {
  const [documentType, setDocumentType] = useState<DocumentType>('Other');
  const [value, setValue] = useState('');
  const [qrMode, setQrMode] = useState<QrMode>('manual');
  // const [qrValue, setQrValue] = useState('');
  // const [qrType, setQrType] = useState('nik');
  const [formValues, setFormValues] = useState<FormValue[]>([]);
  const currentForm = formValues[currentVisitorIndex] || {
    value: '',
    type: '',
  };
  const [hasDecoded, setHasDecoded] = useState(false);

  const currentVisitor = visitors[currentVisitorIndex];

  useEffect(() => {
    if (!open) {
      // setCurrentVisitorIndex(0);
      // setQrValue('');
      // setQrType('');

      // setFormValues(
      //   visitors.map(() => ({
      //     value: '',
      //     type: '',
      //   })),
      // );
      setQrMode('manual');
      setHasDecoded(false);
    }
  }, [open]);

  useEffect(() => {
    if (!visitors?.length) return;

    setFormValues(
      visitors.map(() => ({
        value: '',
        type: '',
      })),
    );
  }, [visitors]);

  const handleSubmit = () => {
    loading(true);

    try {
      // if (!qrValue) {
      //   showSwal('error', 'Please input value number');
      //   return;
      // }

      // if (!qrType) {
      //   showSwal('error', 'Please select type');
      //   return;
      // }
      // const isLastVisitor = currentVisitorIndex === visitors.length - 1;
      // onSubmit?.(qrValue, qrType, currentVisitor, isLastVisitor, currentVisitorIndex);

      // onClose();
      const isLastVisitor = currentVisitorIndex === (visitors?.length || 1) - 1;

      const visitor = visitors[currentVisitorIndex];

      // onSubmit?.(qrValue, qrType, visitor, isLastVisitor, currentVisitorIndex);

      const { value, type } = formValues[currentVisitorIndex];

      onSubmit?.(value, type, visitor, isLastVisitor, currentVisitorIndex);

      if (!isLastVisitor) {
        setCurrentVisitorIndex((prev: any) => prev + 1);
      } else {
        onClose();
      }
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

  const handleChange = (index: number, field: keyof FormValue, val: string) => {
    setFormValues((prev) => {
      const updated = [...prev];

      if (!updated[index]) {
        updated[index] = { value: '', type: '' };
      }

      updated[index] = {
        ...updated[index],
        [field]: val,
      };

      return updated;
    });
  };

useEffect(() => {
  if (!open) return;

  const visitor = visitors?.[currentVisitorIndex];

  const currentUsed = (visitor?.card ?? []).find((c: any) => c.current_used === true);

  handleChange(currentVisitorIndex, 'type', initialValues?.documentType || 'CardAccess');

  handleChange(currentVisitorIndex, 'value', currentUsed?.card_number ?? '');
}, [open, currentVisitorIndex, visitors]);

const isDocumentTypeLocked = initialValues?.isDocumentTypeLocked === true;

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

          {qrMode === 'manual' && (
            <DialogContent sx={{ p: '0 !important' }}>
              {/* TYPE */}
              <Typography fontWeight={500} mb={0.5}>
                Type
              </Typography>
              <Select
                fullWidth
                value={currentForm.type}
                onChange={(e: any) =>
                  handleChange(currentVisitorIndex, 'type', e.target.value as string)
                }
                sx={{ mb: 2 }}
                disabled={typeDocument.length === 0 || isDocumentTypeLocked}
              >
                {typeDocument.length === 0 ? (
                  <MenuItem value="" disabled>
                    No document available
                  </MenuItem>
                ) : (
                  typeDocument.map((doc) => (
                    <MenuItem key={doc.value} value={doc.value}>
                      {doc.label}
                    </MenuItem>
                  ))
                )}
              </Select>
              {/* VALUE */}
              <Typography fontWeight={500} mb={0.5}>
                {/* {qrTypeLabelMap[qrType] ?? 'Value'} */}
                {qrTypeLabelMap[currentForm.type] ?? 'Value'}
              </Typography>

              <TextField
                fullWidth
                size="small"
                // value={qrValue}
                // onChange={(e) => setQrValue(e.target.value)}
                value={currentForm.value}
                onChange={(e) => handleChange(currentVisitorIndex, 'value', e.target.value)}
              />
            </DialogContent>
          )}
        </DialogContent>

        <DialogActions>
          <Button fullWidth variant="contained" onClick={handleSubmit}>
            {currentVisitorIndex === (visitors?.length || 1) - 1 ? 'Swipe' : 'Swipe & Next'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SwipeCardDialog;
