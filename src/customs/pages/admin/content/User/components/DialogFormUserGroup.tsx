import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getUserById, getUserGroupById } from 'src/customs/api/admin';
import { CreateUserSchema } from 'src/customs/api/models/Admin/User';
import FormUser from '../FormUser';
import FormWizardUserGroup from '../UserGroup/FormWizardUserGroup';
import { CreateUserGroupSchema } from 'src/customs/api/models/Admin/UserGroup';

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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative', padding: 3 }}>
        {edittingId ? 'Edit' : 'Add'} User Group
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
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
        />
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(DialogFormUser);
