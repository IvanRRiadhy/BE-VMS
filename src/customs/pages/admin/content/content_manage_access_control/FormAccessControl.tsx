import {
  Button,
  Grid2 as Grid,
  Alert,
  Typography,
  CircularProgress,
  Autocomplete,
  Button as MuiButton,
  Backdrop,
  MenuItem,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState, useRef } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
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
  updateAccessControl,
} from 'src/customs/api/admin';
import { AccessControlType } from 'src/customs/api/models/AccessControl';
import { Item as BrandItem } from 'src/customs/api/models/Brand';
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
              brand_id: String(target.brand_id),
              integration_id: String(target.integration_id),
              type: Number(target.type),
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
            type: -1,
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
      localStorage.removeItem('unsavedAccessControl');
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
            <CustomFormLabel htmlFor="access_control_name">Name</CustomFormLabel>
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

            <Autocomplete
              id="brand_id"
              options={brandList}
              getOptionLabel={(option) => option.name}
              value={
                brandList.find((brand) => String(brand.id) === String(formData.brand_id)) || null
              }
              onChange={(e, newValue) => {
                handleChange({
                  target: {
                    id: 'brand_id',
                    name: 'brand_id',
                    value: newValue ? String(newValue.id) : '', // konsisten string
                  },
                } as any);
              }}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  label=""
                  required
                  error={!!errors.brand_id}
                  helperText={errors.brand_id || ''}
                  fullWidth
                />
              )}
            />
            <CustomFormLabel htmlFor="integration-name">Integration Name</CustomFormLabel>
            <Autocomplete
              id="integration_id"
              options={integrationList}
              getOptionLabel={(option) => option.name}
              value={
                integrationList.find(
                  (integration) => String(integration.id) === String(formData.integration_id),
                ) || null
              }
              onChange={(e, newValue) => {
                handleChange({
                  target: {
                    id: 'integration_id',
                    name: 'integration_id',
                    value: newValue ? newValue.id : '',
                  },
                } as any);
              }}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  label=""
                  required
                  error={!!errors.integration_id}
                  helperText={errors.integration_id || ''}
                  fullWidth
                />
              )}
            />
            <CustomFormLabel htmlFor="type">Type</CustomFormLabel>
            <CustomSelect
              id="type"
              name="type"
              value={Number(formData.type) ?? ''}
              onChange={handleChange}
              error={!!errors.type}
              helperText={errors.type || ''}
              fullWidth
              required
            >
              <MenuItem value="" disabled>
                Select Type
              </MenuItem>
              {Object.entries(AccessControlType)
                .filter(([k]) => isNaN(Number(k)))
                .map(([key, value]) => (
                  <MenuItem key={value} value={value}>
                    {formatEnumLabel(key)}
                  </MenuItem>
                ))}
            </CustomSelect>
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
            Submit
          </Button>
        </Box>
      </form>
      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1, // di atas drawer & dialog
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default FormAccessControl;
