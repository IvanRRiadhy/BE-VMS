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
  UpdateAccessControlRequest,
  UpdateAccessControlRequestSchema,
} from 'src/customs/api/models/AccessControl';
import {
  createAccessControl,
  getAllAccessControlPagination,
  getAllBrand,
  getAllIntegration,
  getAvailableIntegration,
  updateAccessControl,
} from 'src/customs/api/admin';
import { AccessControlType } from 'src/customs/api/models/AccessControl';
import { Item as BrandItem } from 'src/customs/api/models/Brand';
import { AvailableItem as AvailableItem } from 'src/customs/api/models/Integration';
import { Item as Integrationitem } from 'src/customs/api/models/Integration';
type AccessControlFormData = {
  brand_id: string;
  integration_id: string;
  type: number;
  name: string;
  description: string;
  channel: string;
  door_id: string;
  raw: string;
  id?: string; // hanya untuk update
};

interface FormAccessControlProps {
  formData: CreateAccessControlRequest;
  setFormData: React.Dispatch<React.SetStateAction<AccessControlFormData>>;
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
    e: React.ChangeEvent<HTMLInputElement | { id?: string; name?: string; value: unknown }>,
  ) => {
    const id = (e.target as any).id || (e.target as any).name;
    const value = e.target.value;

    if (id) {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };
  const [accessList, setAccessList] = useState<CreateAccessControlRequest[]>([]);
  const [brandList, setBrandList] = useState<BrandItem[]>([]);
  const [integrationList, setIntegrationList] = useState<Integrationitem[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const brandRes = await getAllBrand(token);
        const integrationRes = await getAllIntegration(token);
        const accessRes = await getAllAccessControlPagination(token, 0, 99, 'id', '');

        // Set semua list
        setBrandList(brandRes?.collection ?? []);
        setIntegrationList(integrationRes?.collection ?? []);

        // Mode Edit: Isi formData
        if (editingId) {
          const target = accessRes?.collection.find((item) => item.id === editingId);
          if (target) {
            setFormData({
              brand_id: target.brand_id,
              integration_id: target.integration_id,
              type: target.type,
              name: target.name,
              description: target.description,
              channel: target.channel,
              door_id: target.door_id,
              raw: target.raw,
            });
          }
        } else {
          // Mode Create: Kosongkan formData
          setFormData({
            brand_id: '',
            integration_id: '',
            type: 0,
            name: '',
            description: '',
            channel: '',
            door_id: '',
            raw: '{}',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token, editingId]);

  const handleOnSubmit = async (e: React.FormEvent) => {
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
      const dataUpdate: UpdateAccessControlRequest =
        UpdateAccessControlRequestSchema.parse(formData);
      console.log('Setting Data: ', data);
      if (editingId && editingId !== '') {
        console.log('Update Mode');
        await updateAccessControl(editingId, dataUpdate, token);
        console.log('Form Data : ', formData);
        setAlertMessage('Access Control successfully updated!');
      } else {
        console.log('Create Mode');
        await createAccessControl(data, token);
        setAlertMessage(
          editingId ? 'Custom field successfully updated!' : 'Custom field successfully created!',
        );
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
      setTimeout(() => {
        setLoading(false);
      }, 800);
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
              value={formData.brand_id || ''}
              onChange={handleChange}
              error={!!errors.brand_id}
              helperText={errors.brand_id || ''}
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
              error={!!errors.integration_id}
              helperText={errors.integration_id || ''}
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
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </>
  );
};

export default FormAccessControl;
