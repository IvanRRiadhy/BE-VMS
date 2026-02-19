import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getUserById } from 'src/customs/api/admin';
import { CreateUserSchema } from 'src/customs/api/models/Admin/User';
import FormUser from '../FormUser';

interface Props {
  open: boolean;
  onClose: () => void;
  edittingId?: string;
  onSuccess?: () => void;
  organizationRes: any[];
}

const DialogFormUser: React.FC<Props> = ({
  open,
  onClose,
  edittingId,
  onSuccess,
  organizationRes,
}) => {
  const { token } = useSession();
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      if (edittingId && token) {
        const response = await getUserById(edittingId, token);
        setFormData({
          ...response.collection,
          group_id: response.collection?.group_id?.toUpperCase(),
        });
      } else {
        setFormData(CreateUserSchema.parse({}));
      }
    };

    loadData();
  }, [open, edittingId, token]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative', padding: 3 }}>
        {edittingId ? 'Edit' : 'Add'} User
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <FormUser
          formData={formData}
          setFormData={setFormData}
          edittingId={edittingId}
          onSuccess={onSuccess}
          organizationRes={organizationRes}
        />
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(DialogFormUser);
