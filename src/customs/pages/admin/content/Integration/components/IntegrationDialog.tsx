import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormIntegration from '../FormIntegration';
import { CreateIntegrationRequestSchema } from 'src/customs/api/models/Admin/Integration';
import ConfirmUnsavedDialog from '../../../components/ConfirmUnsavedDialog';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingId?: string;
  initialData: any;
};

const IntegrationDialog = ({ open, onClose, onSuccess, editingId, initialData }: Props) => {
  const [formData, setFormData] = useState(
    CreateIntegrationRequestSchema.parse({
      name: '',
      brand_name: '',
      brand_type: 0,
      integration_type: 0,
      api_type_auth: '',
    }),
  );

  useEffect(() => {
    if (open) {
      setFormData(initialData);
    }
  }, [open, initialData]);

  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleRequestClose = () => {
    if (isDirty) {
      setConfirmDialogOpen(true);
      return;
    }
    onClose();
  };

  const handleDiscard = () => {
    setIsDirty(false);
    setConfirmDialogOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleRequestClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 3 }}>
          {editingId ? 'Edit Integration' : 'Add Integration'}
          <IconButton
            aria-label="close"
            onClick={handleRequestClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          <FormIntegration
            formData={formData}
            setFormData={(data) => {
              setFormData(data);
              setIsDirty(true);
            }}
            editingId={editingId}
            onSuccess={() => {
              onSuccess();
            }}
          />
        </DialogContent>
      </Dialog>
      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onDiscard={handleDiscard}
      />
    </>
  );
};

export default React.memo(IntegrationDialog);
