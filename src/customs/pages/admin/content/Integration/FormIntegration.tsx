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
import {
  ApiTypeAuth,
  BrandType,
  CreateIntegrationRequest,
  CreateIntegrationRequestSchema,
  IntegrationType,
} from 'src/customs/api/models/Admin/Integration';
import { createIntegration, updateIntegration } from 'src/customs/api/admin';
import { showSwal } from 'src/customs/components/alerts/alerts';

interface FormIntegrationProps {
  formData: CreateIntegrationRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateIntegrationRequest>>;
  onSuccess?: () => void;
  editingId?: string;
}

const FormIntegration = ({ formData, setFormData, onSuccess, editingId }: FormIntegrationProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { token } = useSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const ApiTypeAuthMap: Record<string, number> = {
    Basic: 0,
    Bearer: 1,
    Apikey: 2,
    Bacnet: 4,
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (!token) {
        return;
      }
      const data: CreateIntegrationRequest = CreateIntegrationRequestSchema.parse(formData);
      const payload: any = {
        ...data,
        api_type_auth: ApiTypeAuthMap[data.api_type_auth],
      };
      // console.log('data', data);
      if (editingId && editingId !== '') {
        await updateIntegration(editingId, payload, token);
      } else {
        await createIntegration(payload, token);
      }

      localStorage.removeItem('unsavedIntegrationData');

      showSwal(
        'success',
        editingId ? 'Integration successfully updated!' : 'Integration successfully created!',
      );
      onSuccess?.();
    } catch (error: any) {
      if (Array.isArray(error?.collection)) {
        const messages = error.collection.map((e: any) => e.message).join('\n');
        showSwal('error', messages);
        return;
      }
      if (Array.isArray(error?.response?.data?.collection)) {
        const messages = error.response.data.collection.map((e: any) => e.message).join('\n');

        showSwal('error', messages);
        return;
      }

      showSwal('error', error?.msg || error?.message || 'Failed to submit data.');
    } finally {
      setLoading(false);
    }
  };

  function formatEnumLabel(label: string) {
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
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
            <CustomFormLabel htmlFor="integration_type">Integration Type</CustomFormLabel>
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
              {/* API Type : {formatEnumLabel(ApiTypeAuth[formData.api_type_auth])} */}
              API TYPE : {formData.api_type_auth}
            </Typography>
            <CustomFormLabel htmlFor="api_url">API URL</CustomFormLabel>
            <CustomTextField
              id="api_url"
              value={formData.api_url}
              onChange={handleChange}
              error={Boolean(errors.api_url)}
              helperText={errors.api_url || ''}
              fullWidth
            />
            {formData.api_type_auth === 'Basic' && (
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
            {(formData.api_type_auth === 'Bearer' || formData.api_type_auth === 'Apikey') && (
              <>
                <CustomFormLabel htmlFor="api_key_field">API Key Field</CustomFormLabel>
                <CustomTextField
                  id="api_key_field"
                  value={formData.api_key_field}
                  error={Boolean(errors.api_key_field)}
                  helperText={errors.api_key_field || ''}
                  onChange={handleChange}
                  fullWidth
                  // disabled
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
            {loading ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </Box>
      </form>
      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: 'primary.main',
            zIndex: (t) => (t.zIndex.snackbar ?? 1400) - 1,
          }}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </>
  );
};

export default FormIntegration;
