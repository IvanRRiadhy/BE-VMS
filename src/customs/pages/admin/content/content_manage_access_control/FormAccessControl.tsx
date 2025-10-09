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
  Item,
  UpdateAccessControlRequest,
  UpdateAccessControlRequestSchema,
} from 'src/customs/api/models/AccessControl';
import {
  createAccessControl,
  getAccessControlById,
  getAccessControlsById,
  getAllAccessControlPagination,
  getAllBrand,
  getAllIntegration,
  updateAccessControl,
} from 'src/customs/api/admin';
import { AccessControlType } from 'src/customs/api/models/AccessControl';
import { Item as BrandItem } from 'src/customs/api/models/Brand';
import { Item as Integrationitem } from 'src/customs/api/models/Integration';
import { showSuccessAlert } from 'src/customs/components/alerts/alerts';
type AccessControlFormData = {
  brand_id: string;
  integration_id: string;
  brand_name: string;
  integration_name?: string;
  type: number;
  name: string;
  description?: string;
  channel: string;
  door_id: string;
  raw: string;
  id?: string; // hanya untuk update
};

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

  // 1️⃣ Ambil list brand & integration sekali saat token ada
  useEffect(() => {
    if (!token) return;

    const fetchList = async () => {
      const [brandRes, integrationRes] = await Promise.all([
        getAllBrand(token),
        getAllIntegration(token),
      ]);
      setBrandList(brandRes?.collection ?? []);
      setIntegrationList(integrationRes?.collection ?? []);
    };

    fetchList();
  }, [token]);

  // 2️⃣ Ambil detail access kalau sedang mode edit
  useEffect(() => {
    if (!token || !editingId) return;

    const fetchDetail = async () => {
      const accessRes = await getAccessControlsById(editingId, token);
      const target = accessRes?.collection as Item | undefined;
      if (target) {
        console.log('Target for editing:', target);
        setFormData({
          brand_id: target.brand_id ?? '',
          integration_id: target.integration_id ?? '',
          type: Number(target.type),
          name: target.name,
          description: target.description ?? '',
          channel: target.channel,
          door_id: target.door_id,
          raw: target.raw,
          integration_name: target.integration_name,
          brand_name: target.brand_name,
        });
      }
    };

    fetchDetail();
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

      const dataUpdate: UpdateAccessControlRequest = UpdateAccessControlRequestSchema.parse({
        brand_id: formData.brand_id,
        integration_id: formData.integration_id,
        type: formData.type,
        name: formData.name,
        description: formData.description,
        channel: formData.channel,
        door_id: formData.door_id,
        raw: formData.raw,
      });
      console.log('Data being sent to API:', dataUpdate);

      console.log('Setting Data: ', data);
      if (editingId) {
        await updateAccessControl(editingId, dataUpdate, token);
        console.log('Form Data : ', formData);
        showSuccessAlert('Updated!', 'Access control successfully updated!');
      } else {
        console.log('Create Mode');
        await createAccessControl(data, token);
        // setAlertMessage(
        //   editingId ? 'Custom field successfully updated!' : 'Custom field successfully created!',
        // );
        showSuccessAlert('Created!', 'Access control successfully created!');
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

            <CustomSelect
              id="brand_id"
              name="brand_id"
              value={formData.brand_id || ''}
              onChange={handleChange}
              error={!!errors.brand_id}
              helperText={errors.brand_id || ''}
              fullWidth
            >
              <MenuItem value="" disabled>
                Select Brand
              </MenuItem>
              {brandList.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </CustomSelect>

            <CustomFormLabel htmlFor="integration-name">Integration Name</CustomFormLabel>
            <CustomSelect
              id="integration_id"
              name="integration_id"
              value={formData.integration_id || ''}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" disabled>
                Select Integration
              </MenuItem>
              {integrationList.map((integration) => (
                <MenuItem key={integration.id} value={integration.id}>
                  {integration.name}
                </MenuItem>
              ))}
            </CustomSelect>
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
