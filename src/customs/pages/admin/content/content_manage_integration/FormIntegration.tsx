import {
  Button,
  Grid2 as Grid,
  Alert,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
  Paper,
  Button as MuiButton,
  Backdrop,
  Portal,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState, useRef } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';

import { IconTrash } from '@tabler/icons-react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import {
  ApiTypeAuth,
  BrandType,
  CreateIntegrationRequest,
  CreateIntegrationRequestSchema,
  IntegrationType,
} from 'src/customs/api/models/Admin/Integration';
import { createIntegration, updateIntegration } from 'src/customs/api/admin';

interface FormIntegrationProps {
  formData: CreateIntegrationRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateIntegrationRequest>>;
  onSuccess?: () => void;
  editingId?: string;
}

const FormIntegration = ({ formData, setFormData, onSuccess, editingId }: FormIntegrationProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const { token } = useSession();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  const handleOnSubmit = async (e: React.FormEvent) => {
    console.log('Submitting form with data:', formData);
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (!token) {
        setAlertType('error');
        setAlertMessage('Something went wrong. Please try again later.');

        setTimeout(() => {
          setAlertType('info');
          setAlertMessage('Complete the following data properly and correctly');
        }, 3000);
        return;
      }
      const data: CreateIntegrationRequest = CreateIntegrationRequestSchema.parse(formData);
      if (editingId && editingId !== '') {
        await updateIntegration(editingId, data, token);
      } else {
        await createIntegration(data, token);
      }

      localStorage.removeItem('unsavedIntegrationData');
      setAlertType('success');
      setAlertMessage('Site successfully created!');
      setTimeout(() => {
        onSuccess?.();
      }, 900);
    } catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors);
      }
      setAlertType('error');
      setAlertMessage('Something went wrong. Please try again later.');
      setTimeout(() => {
        setAlertType('info');
        setAlertMessage('Complete the following data properly and correctly');
      }, 3000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  };
  function formatEnumLabel(label: string) {
    // Insert a space before all caps and capitalize the first letter
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid>
          <Grid size={6}>
            <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              Integration Details
            </Typography>
            <CustomFormLabel htmlFor="name">Integration Name</CustomFormLabel>
            <CustomTextField id="name" value={formData.name} onChange={handleChange} fullWidth />
            <CustomFormLabel htmlFor="brand_name">Brand Name</CustomFormLabel>
            <CustomTextField
              id="brand_name"
              value={formData.brand_name}
              onChange={handleChange}
              fullWidth
              disabled
            />
            <CustomFormLabel htmlFor="brand_type">Brand Type</CustomFormLabel>
            <CustomTextField
              id="brand_type"
              value={formatEnumLabel(BrandType[formData.brand_type])}
              onChange={handleChange}
              fullWidth
              disabled
            />
            <CustomFormLabel htmlFor="integration_type">Integration Type :</CustomFormLabel>
            <CustomTextField
              id="integration_type"
              value={formatEnumLabel(IntegrationType[formData.integration_type])}
              onChange={handleChange}
              fullWidth
              disabled
            />
          </Grid>
          <Grid size={6}>
            <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              API Type : {formatEnumLabel(ApiTypeAuth[formData.api_type_auth])}
            </Typography>
            <CustomFormLabel htmlFor="api_url">API URL :</CustomFormLabel>
            <CustomTextField
              id="api_url"
              value={formData.api_url}
              onChange={handleChange}
              error={Boolean(errors.api_url)}
              helperText={errors.api_url || ''}
              fullWidth
            />
            {/* Show Auth Username/Password only for Basic (0) */}
            {formData.api_type_auth === 0 && (
              <>
                <CustomFormLabel htmlFor="api_auth_username">API Auth Username</CustomFormLabel>
                <CustomTextField
                  id="api_auth_username"
                  value={formData.api_auth_username}
                  error={Boolean(errors.api_auth_username)}
                  helperText={errors.api_auth_username || ''}
                  onChange={handleChange}
                  fullWidth
                />
                <CustomFormLabel htmlFor="api_auth_password">API Auth Password</CustomFormLabel>
                <CustomTextField
                  id="api_auth_passwd"
                  type="password"
                  value={formData.api_auth_passwd}
                  error={Boolean(errors.api_auth_passwd)}
                  helperText={errors.api_auth_passwd || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </>
            )}
            {(formData.api_type_auth === 1 || formData.api_type_auth === 2) && (
              <>
                <CustomFormLabel htmlFor="api_key_field">API Key Field</CustomFormLabel>
                <CustomTextField
                  id="api_key_field"
                  value={formData.api_key_field}
                  error={Boolean(errors.api_key_field)}
                  helperText={errors.api_key_field || ''}
                  onChange={handleChange}
                  fullWidth
                  disabled
                />
                <CustomFormLabel htmlFor="api_key_value">API Key Value</CustomFormLabel>
                <CustomTextField
                  id="api_key_value"
                  value={formData.api_key_value}
                  error={Boolean(errors.api_key_value)}
                  helperText={errors.api_key_value || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </>
            )}
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading}
            size="medium"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </form>
      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: (t) => (t.zIndex.snackbar ?? 1400) - 1, // di atas modal (1300), di bawah snackbar (1400)
          }}
        >
          <CircularProgress />
        </Backdrop>
      </Portal>
    </>
  );
};

export default FormIntegration;
