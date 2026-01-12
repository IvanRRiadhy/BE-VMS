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
  FormControl,
  Select,
  FormHelperText,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState, useRef } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { SelectChangeEvent } from '@mui/material';
import {
  CreateAccessControlRequest,
  CreateAccessControlRequestSchema,
  Item,
  UpdateAccessControlRequest,
  UpdateAccessControlRequestSchema,
} from 'src/customs/api/models/Admin/AccessControl';
import {
  createAccessControl,
  getAccessControlById,
  getAccessControlsById,
  getAllAccessControlPagination,
  getAllBrand,
  getAllIntegration,
  updateAccessControl,
} from 'src/customs/api/admin';
import { AccessControlType } from 'src/customs/api/models/Admin/AccessControl';
import { Item as BrandItem } from 'src/customs/api/models/Admin/Brand';
import { Item as Integrationitem } from 'src/customs/api/models/Admin/Integration';
import { showSuccessAlert, showSwal } from 'src/customs/components/alerts/alerts';
import { ZodError } from 'zod';
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent,
  ) => {
    const target = e.target as HTMLInputElement;
    const id = target.name || target.id;
    const value = target.value;

    if (!id) return;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };
  const [brandList, setBrandList] = useState<BrandItem[]>([]);
  const [integrationList, setIntegrationList] = useState<Integrationitem[]>([]);

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

  function mapZodErrors(err: ZodError) {
    const fieldErrors: Record<string, string> = {};
    err.errors.forEach((e) => {
      const field = e.path[0];
      if (field) {
        fieldErrors[field.toString()] = e.message;
      }
    });
    return fieldErrors;
  }

  useEffect(() => {
    if (!token || !editingId) return;

    const fetchDetail = async () => {
      const accessRes = await getAccessControlsById(editingId, token);
      const target = accessRes?.collection as Item | undefined;
      if (target) {
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
      // console.log('Data being sent to API:', dataUpdate);

      // console.log('Setting Data: ', data);
      if (editingId) {
        await updateAccessControl(editingId, dataUpdate, token);
        console.log('Form Data : ', formData);
      } else {
        // console.log('Create Mode');
        await createAccessControl(data, token);
      }
      localStorage.removeItem('unsavedAccessControl');
      // setAlertType('success');

      setTimeout(() => {
        onSuccess?.();
      }, 900);
    } catch (err: any) {
      if (err instanceof ZodError) {
        setErrors(mapZodErrors(err));
        return;
      }

      showSwal('error', 'Something went wrong. Please try again later.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800);
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
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ my: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              Access Control Details
            </Typography>
            <CustomFormLabel htmlFor="access_control_name" required sx={{ mt: 2 }}>
              Name
            </CustomFormLabel>
            <CustomTextField
              id="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name || ''}
              fullWidth
            />
            <CustomFormLabel htmlFor="description" sx={{ mt: 2 }}>
              Description
            </CustomFormLabel>
            <CustomTextField
              id="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <CustomFormLabel htmlFor="channel" sx={{ mt: 2 }}>
                  Channel
                </CustomFormLabel>
                <CustomTextField
                  id="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  error={!!errors.channel}
                  helperText={errors.channel || ''}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <CustomFormLabel htmlFor="door-id" sx={{ mt: 2 }}>
                  Door Id
                </CustomFormLabel>
                <CustomTextField
                  id="door_id"
                  value={formData.door_id}
                  onChange={handleChange}
                  error={!!errors.door_id}
                  helperText={errors.door_id || ''}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ my: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              Access Control Settings
            </Typography>
            <CustomFormLabel htmlFor="brand-name" sx={{ mt: 2 }}>
              Brand Name
            </CustomFormLabel>

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

            <CustomFormLabel htmlFor="integration-name" required sx={{ mt: 2 }}>
              Integration Name
            </CustomFormLabel>
            <FormControl fullWidth error={!!errors.integration_id}>
              <Select
                id="integration_id"
                name="integration_id"
                value={formData.integration_id || ''}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Integration
                </MenuItem>
                {integrationList.map((integration) => (
                  <MenuItem key={integration.id} value={integration.id}>
                    {integration.name}
                  </MenuItem>
                ))}
              </Select>

              {errors.integration_id && (
                <FormHelperText sx={{ marginLeft: 0 }}>{errors.integration_id}</FormHelperText>
              )}
            </FormControl>
            <CustomFormLabel htmlFor="type" sx={{ mt: 2 }}>
              Type
            </CustomFormLabel>
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
            {loading ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </Box>
      </form>
      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: 99999,
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </>
  );
};

export default FormAccessControl;
