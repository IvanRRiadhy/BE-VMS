import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  TextField,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface EditVisitorDialogProps {
  open: boolean;
  onClose: () => void;
  visitor?: {
    visitor_name?: string;
    visitor_email?: string;
    visitor_phone?: string;
    visitor_identity_id?: string;
    visitor_organization_name?: string;
  };
  onSubmit?: (data: {
    visitor_name: string;
    visitor_email: string;
    visitor_phone: string;
    visitor_identity_id: string;
    visitor_organization_name: string;
  }) => void;
}

const EditVisitorDialog = ({ open, onClose, visitor, onSubmit }: EditVisitorDialogProps) => {
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    visitor_identity_id: '',
    visitor_organization_name: '',
  });

  useEffect(() => {
    if (visitor) {
      setFormData({
        visitor_name: visitor.visitor_name ?? '',
        visitor_email: visitor.visitor_email ?? '',
        visitor_phone: visitor.visitor_phone ?? '',
        visitor_identity_id: visitor.visitor_identity_id ?? '',
        visitor_organization_name: visitor.visitor_organization_name ?? '',
      });
    }
  }, [visitor]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit?.(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Invitation
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

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel>Name</CustomFormLabel>
            <TextField
              fullWidth
              variant="outlined"
              value={formData.visitor_name}
              onChange={(e) => handleChange('visitor_name', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel>Email</CustomFormLabel>
            <TextField
              fullWidth
              variant="outlined"
              value={formData.visitor_email}
              onChange={(e) => handleChange('visitor_email', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel>Phone</CustomFormLabel>
            <TextField
              fullWidth
              variant="outlined"
              value={formData.visitor_phone}
              onChange={(e) => handleChange('visitor_phone', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel>Organzation</CustomFormLabel>
            <TextField
              fullWidth
              variant="outlined"
              value={formData.visitor_organization_name}
              onChange={(e) => handleChange('visitor_organization_name', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel>Citizenship ID</CustomFormLabel>
            <TextField
              fullWidth
              variant="outlined"
              value={formData.visitor_identity_id}
              onChange={(e) => handleChange('visitor_identity_id', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditVisitorDialog;
