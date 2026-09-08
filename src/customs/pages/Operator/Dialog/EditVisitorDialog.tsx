import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  Switch,
  TextField,
  Box,
  FormControlLabel,
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

  const [enabledFields, setEnabledFields] = useState({
    visitor_name: true,
    visitor_email: true,
    visitor_phone: true,
    visitor_identity_id: true,
    visitor_organization_name: true,
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

  const handleToggle = (field: keyof typeof enabledFields) => {
    setEnabledFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = () => {
    onSubmit?.(formData);
  };

  const renderLabel = (label: string, field: keyof typeof enabledFields) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 0.5,
      }}
    >
      <CustomFormLabel sx={{ mb: 0 }}>{label}</CustomFormLabel>

      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={enabledFields[field]}
            onChange={() => handleToggle(field)}
          />
        }
        label=""
        // label={enabledFields[field] ? 'Enabled' : 'Disabled'}
        sx={{
          mr: 0,
          '& .MuiFormControlLabel-label': {
            fontSize: '0.8rem',
            color: 'text.secondary',
          },
        }}
      />
    </Box>
  );

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
          {/* Name */}
          <Grid size={{ xs: 12 }}>
            {renderLabel('Name', 'visitor_name')}

            <TextField
              fullWidth
              variant="outlined"
              value={formData.visitor_name}
              disabled={!enabledFields.visitor_name}
              onChange={(e) => handleChange('visitor_name', e.target.value)}
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12 }}>
            {renderLabel('Email', 'visitor_email')}

            <TextField
              fullWidth
              variant="outlined"
              value={formData.visitor_email}
              disabled={!enabledFields.visitor_email}
              onChange={(e) => handleChange('visitor_email', e.target.value)}
            />
          </Grid>

          {/* Phone */}
          <Grid size={{ xs: 12 }}>
            {renderLabel('Phone', 'visitor_phone')}

            <TextField
              fullWidth
              variant="outlined"
              value={formData.visitor_phone}
              disabled={!enabledFields.visitor_phone}
              onChange={(e) => handleChange('visitor_phone', e.target.value)}
            />
          </Grid>

          {/* Organization */}
          <Grid size={{ xs: 12 }}>
            {renderLabel('Organization', 'visitor_organization_name')}

            <TextField
              fullWidth
              variant="outlined"
              value={formData.visitor_organization_name}
              disabled={!enabledFields.visitor_organization_name}
              onChange={(e) => handleChange('visitor_organization_name', e.target.value)}
            />
          </Grid>

          {/* Citizenship ID */}
          {/* <Grid size={{ xs: 12 }}>
            {renderLabel('Citizenship ID', 'visitor_identity_id')}

            <TextField
              fullWidth
              variant="outlined"
              value={formData.visitor_identity_id}
              disabled={!enabledFields.visitor_identity_id}
              onChange={(e) => handleChange('visitor_identity_id', e.target.value)}
            />
          </Grid> */}
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
