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
  MenuItem,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState, useRef } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';

import { IconTrash } from '@tabler/icons-react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import {
  CreateAccessControlRequest,
  CreateAccessControlRequestSchema,
} from 'src/customs/api/models/AccessControl';
import {
  createAccessControl,
  getAllBrand,
  getAllIntegration,
  updateAccessControl,
} from 'src/customs/api/admin';
import { AccessControlType } from 'src/customs/api/models/AccessControl';
import { Item as BrandItem } from 'src/customs/api/models/Brand';
import { Item as IntegrationItem } from 'src/customs/api/models/Integration';

interface FormAccessControlProps {
  formData: CreateAccessControlRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateAccessControlRequest>>;
  editingId?: string;
  onSuccess?: () => void;
}

const FormAccessControl = ({
  formData,
  setFormData,
  editingId,
  onSuccess,
}: FormAccessControlProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const { token } = useSession();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>,
  ) => {
    const name = (e.target as HTMLInputElement).name || (e.target as HTMLInputElement).id;
    const value = (e.target as HTMLInputElement).value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const [brandList, setBrandList] = useState<BrandItem[]>([]);
  const [integrationList, setIntegrationList] = useState<IntegrationItem[]>([]);
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const brandRes = await getAllBrand(token);
      const integrationRes = await getAllIntegration(token);
      setBrandList(brandRes?.collection ?? []);
      setIntegrationList(integrationRes?.collection ?? []);
    };
    fetchData();
  }, [token]);
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
      const data: CreateAccessControlRequest = CreateAccessControlRequestSchema.parse(formData);
      console.log('Setting Data: ', data);
      if (editingId && editingId !== '') {
        await updateAccessControl(editingId, data, token);
        setAlertMessage('Access Control successfully updated!');
      } else {
        await createAccessControl(data, token);
        setAlertMessage('Access Control successfully created!');
      }
      localStorage.removeItem('unsavedIntegrationData');
      setAlertType('success');

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
      setLoading(false);
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
          <Grid size={12} sx={{ mt: -3 }}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ my: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              Access Control Details
            </Typography>
            <CustomFormLabel htmlFor="access_control_name">Access Control Name</CustomFormLabel>
            <CustomTextField
              id="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name || ''}
              fullWidth
              required
            />
            <CustomFormLabel htmlFor="description">Description</CustomFormLabel>
            <CustomTextField
              id="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description || ''}
              fullWidth
              required
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <CustomFormLabel htmlFor="channel">Channel</CustomFormLabel>
                <CustomTextField
                  id="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  error={!!errors.channel}
                  helperText={errors.channel || ''}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={6}>
                <CustomFormLabel htmlFor="door-id">Door Id</CustomFormLabel>
                <CustomTextField
                  id="door_id"
                  value={formData.door_id}
                  onChange={handleChange}
                  error={!!errors.door_id}
                  helperText={errors.door_id || ''}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ my: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              Access Control Settings
            </Typography>
            <CustomFormLabel htmlFor="brand-name">Brand Name</CustomFormLabel>
            <CustomSelect
              id="brand_id"
              name="brand_id"
              value={formData.brand_id}
              onChange={handleChange}
              error={!!errors.brand_name}
              helperText={errors.brand_name || ''}
              fullWidth
              required
            >
              {brandList.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </CustomSelect>
            <CustomFormLabel htmlFor="integration-name">Integration Name</CustomFormLabel>
            <CustomSelect
              id="integration_id"
              name="integration_id"
              value={formData.integration_id}
              onChange={handleChange}
              error={!!errors.integration_name}
              helperText={errors.integration_name || ''}
              fullWidth
              required
            >
              {integrationList.map((integration) => (
                <MenuItem key={integration.id} value={integration.id}>
                  {integration.name}
                </MenuItem>
              ))}
            </CustomSelect>
            <CustomFormLabel htmlFor="access_control_type">Access Control type</CustomFormLabel>
            <CustomSelect
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={!!errors.type}
              helperText={errors.type || ''}
              fullWidth
              required
            >
              {Object.entries(AccessControlType)
                .filter(([k, v]) => isNaN(Number(k)))
                .map(([key, value]) => (
                  <MenuItem key={value} value={value}>
                    {formatEnumLabel(key)}
                  </MenuItem>
                ))}
            </CustomSelect>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button color="primary" variant="contained" type="submit" disabled={loading} size="large">
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </form>
    </>
  );
};

export default FormAccessControl;
