import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Divider, DialogActions, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getUserById, getUserGroupById } from 'src/customs/api/admin';
import { CreateUserSchema } from 'src/customs/api/models/Admin/User';
import FormUser from '../FormUser';
import FormWizardUserGroup from '../UserGroup/FormWizardUserGroup';
import { CreateUserGroupSchema } from 'src/customs/api/Admin/UserGroup';

interface Props {
  open: boolean;
  onClose: () => void;
  edittingId?: string;
  onSuccess?: () => void;
}

const DialogFormUser: React.FC<Props> = ({ open, onClose, edittingId, onSuccess }) => {
  const { token } = useSession();
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      if (edittingId && token) {
        const response = await getUserGroupById(edittingId, token);
        setFormData({
          ...response.collection,
        });
      } else {
        setFormData(CreateUserGroupSchema.parse({}));
      }
    };

    loadData();
  }, [open, edittingId, token]);

  const [isDirty, setIsDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleRequestClose = () => {
    if (isDirty) {
      setConfirmOpen(true);
      return;
    }

    onClose();
  };
  const handleDiscard = () => {
    setConfirmOpen(false);
    setIsDirty(false);
    localStorage.removeItem('unsavedUserGroupForm');
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleRequestClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 3 }}>
          {edittingId ? 'Edit' : 'Add'} User Group
          <IconButton onClick={handleRequestClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <FormWizardUserGroup
            formData={formData}
            setFormData={setFormData}
            edittingId={edittingId}
            onSuccess={onSuccess}
            onDirtyChange={setIsDirty}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Unsaved Changes
          <IconButton
            onClick={() => setConfirmOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          You have unsaved changes. Do you want to continue editing or discard?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDiscard} variant="contained">
            Yes, Discard Changes and Continue 
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(DialogFormUser);
