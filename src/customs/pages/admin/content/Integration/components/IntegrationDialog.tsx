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

  // set ulang saat buka dialog / edit
  useEffect(() => {
    if (open) {
      setFormData(initialData);
    }
  }, [open, initialData]);

  const DRAFT_KEY = 'unsavedIntegrationData';

  useEffect(() => {
    if (!open) return;

    const draft = getDraft();

    if (draft) {
      setFormData(draft);
    } else {
      setFormData(initialData);
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }, 500);

    return () => clearTimeout(timeout);
  }, [formData, open]);

  const getDraft = () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleRequestClose = () => {
    if (isDirty) {
      setConfirmDialogOpen(true);
      return;
    }
    localStorage.removeItem(DRAFT_KEY);
    onClose();
  };
  //   const handleContinueEditing = () => {
  //     const draft = getDraft();

  //     if (draft) {
  //       setFormDataAddIntegration(draft);
  //       setIsDirty(true);
  //     }

  //     setConfirmDialogOpen(false);
  //     setOpenFormAddIntegration(true);
  //   };

  //   const handleDiscard = () => {
  //     setAllowAutoSave(false);

  //     localStorage.removeItem(DRAFT_KEY);

  //     setFormDataAddIntegration(
  //       CreateIntegrationRequestSchema.parse({
  //         name: '',
  //         brand_name: '',
  //         brand_type: 0,
  //         integration_type: 0,
  //         api_type_auth: '',
  //       }),
  //     );

  //     setIsDirty(false);
  //     setConfirmDialogOpen(false);
  //     setOpenFormAddIntegration(false);

  //     setTimeout(() => setAllowAutoSave(true), 0);
  //   };

  const handleContinueEditing = () => {
    setConfirmDialogOpen(false);
  };

  const handleDiscard = () => {
    localStorage.removeItem(DRAFT_KEY);
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
              localStorage.removeItem(DRAFT_KEY);
              onSuccess();
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Unsaved Changes
          <IconButton
            aria-label="close"
            onClick={() => setConfirmDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          You have unsaved changes. Do you want to discard them?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>

          <Button onClick={handleDiscard} color="primary" variant="contained">
            Yes, Discard Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(IntegrationDialog);
