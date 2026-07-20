import {
  // Button,
  Grid2 as Grid,
  Typography,
  CircularProgress,
  Button,
  Backdrop,
  Portal,
  Divider,
  InputAdornment,
  IconButton,
  Box
} from '@mui/material';
import React, { useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import {
  ApiTypeAuth,
  BrandType,
  CreateIntegrationRequest,
  CreateIntegrationRequestSchema,
  IntegrationType,
} from 'src/customs/api/models/Admin/Integration';
import { createIntegration, updateIntegration } from 'src/customs/api/admin';
import { showSwal } from 'src/customs/components/alerts/alerts';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface FormIntegrationProps {
  formData: CreateIntegrationRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateIntegrationRequest>>;
  onSuccess?: () => void;
  editingId?: string;
}

const FormIntegration = ({ formData, setFormData, onSuccess, editingId }: FormIntegrationProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
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

      const data: CreateIntegrationRequest = CreateIntegrationRequestSchema.parse(formData);
      const payload: any = {
        ...data,
        api_type_auth: ApiTypeAuthMap[data.api_type_auth],
      };
      console.log("payload", payload);

      if (editingId && editingId !== '') {
        await updateIntegration(editingId, payload);
      } else {
        await createIntegration(payload);
      }

      showSwal(
        'success',
        editingId ? t("updatedSuccess", { name: 'Integration' }) : t("createdSuccess", { name: 'Integration' }),
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
                  type={showPassword ? 'text' : 'password'}
                  value={formData.api_auth_passwd}
                  error={Boolean(errors.api_auth_passwd)}
                  helperText={errors.api_auth_passwd || ''}
                  onChange={handleChange}
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? (
                              <IconEyeOff size={20} />
                            ) : (
                              <IconEye size={20} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
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
            {formData.brand_type === BrandType.CameraAnalytics && (<>
              <CustomFormLabel htmlFor="ipsotek_url_dashboard_incident">Ipsotek URL</CustomFormLabel>
              <CustomTextField
                id="ipsotek_url_dashboard_incident"
                value={formData.ipsotek_url_dashboard_incident}
                error={Boolean(errors.ipsotek_url_dashboard_incident)}
                helperText={errors.ipsotek_url_dashboard_incident || ''}
                onChange={handleChange}
                fullWidth
              /></>
            )}
          </Grid>
        </Grid>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading}
            size="medium"
          >
            Submit
          </Button>
        </Box>
      </form>
      <GlobalBackdropLoading open={loading} />
    </>
  );
};

export default FormIntegration;
