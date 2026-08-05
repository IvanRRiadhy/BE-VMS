import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
  // onContinue: () => void;
  title?: string;
  message?: string;
};

const ConfirmUnsavedDialog: React.FC<Props> = ({
  open,
  onClose,
  onDiscard,
  // onContinue,
  title,
  message,
}) => {
  const { t } = useTranslation();
  const dialogTitle = title ?? t('unsavedChangesTitle');
  const dialogMessage = message ?? t('unsavedChangesMessage');
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {dialogTitle}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers> {dialogMessage}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={onDiscard} variant="contained" color="primary">
          {t('discardAndContinue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmUnsavedDialog;
