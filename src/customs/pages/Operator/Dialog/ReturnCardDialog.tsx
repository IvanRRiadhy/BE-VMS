import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface ReturnCardDialogProps {
  open: boolean;
  value: string;
  loading?: boolean;
  onClose: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const ReturnCardDialog = ({
  open,
  value,
  loading = false,
  onClose,
  onChange,
  onSubmit,
}: ReturnCardDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {t('card.returnCard')}
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
        <CustomFormLabel sx={{ mt: 0 }}>{t('card.number')}</CustomFormLabel>
        <TextField
          fullWidth
          label=""
          placeholder={t('card.inputCardNumber')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnCardDialog;
