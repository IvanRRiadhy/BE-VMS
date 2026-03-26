import {
  Button,
  Grid2 as Grid,
  Typography,
  CircularProgress,
  Backdrop,
  MenuItem,
  FormControl,
  Select,
  FormHelperText,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { useSession } from 'src/customs/contexts/SessionContext';

import {
  CreateAccessControlRequestSchema,
  UpdateAccessControlRequestSchema,
} from 'src/customs/api/models/Admin/AccessControl';

import {
  createAccessControl,
  getAccessControlsById,
  getAllBrand,
  getAllIntegration,
  updateAccessControl,
} from 'src/customs/api/admin';

import { AccessControlType } from 'src/customs/api/models/Admin/AccessControl';
import { showSwal } from 'src/customs/components/alerts/alerts';

// RHF
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type FormType = z.infer<typeof CreateAccessControlRequestSchema>;

interface Props {
  editingId?: string;
  onSuccess?: () => void;
}

const FormAccessControl = ({ editingId, onSuccess }: Props) => {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [brandList, setBrandList] = useState<any[]>([]);
  const [integrationList, setIntegrationList] = useState<any[]>([]);
  const typeMap: Record<string, number> = {
    Access: 0,
    Group: 1,
  };
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(CreateAccessControlRequestSchema),
    defaultValues: {
      brand_id: '',
      brand_name: '',
      type: 0,
      name: '',
      description: '',
      channel: '',
      door_id: '',
      raw: '{}',
      integration_id: '',
      integration_name: '',
    },
  });

  // fetch dropdown
  useEffect(() => {
    if (!token) return;

    (async () => {
      const [brandRes, integrationRes] = await Promise.all([
        getAllBrand(token),
        getAllIntegration(token),
      ]);
      setBrandList(brandRes?.collection ?? []);
      setIntegrationList(integrationRes?.collection ?? []);
    })();
  }, [token]);

  // load edit data
  useEffect(() => {
    if (!token || !editingId) return;

    (async () => {
      const res = await getAccessControlsById(editingId, token);
      const d = res?.collection;

      if (d) {
        reset({
          brand_id: d.brand_id ?? '',
          integration_id: d.integration_id ?? '',
          type: typeMap[d.type] ?? 0,
          name: d.name,
          description: d.description ?? '',
          channel: d.channel,
          door_id: d.door_id,
          raw: d.raw,
          integration_name: d.integration_name,
          brand_name: d.brand_name,
        });
      }
    })();
  }, [editingId, token]);

  const onSubmit = async (data: FormType) => {
    setLoading(true);
    try {
      if (!token) return;

      if (editingId) {
        const payload = UpdateAccessControlRequestSchema.parse(data);
        await updateAccessControl(editingId, payload, token);
      } else {
        await createAccessControl(data, token);
      }

      showSwal(
        'success',
        editingId ? 'Updated successfully Access Control' : 'Created successfully Access Control',
      );
      onSuccess?.();
    } catch {
      showSwal('error', 'Something went wrong');
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ my: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              Access Control Details
            </Typography>

            <CustomFormLabel required>Name</CustomFormLabel>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ width: '100%' }}
                />
              )}
            />

            <CustomFormLabel>Description</CustomFormLabel>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <CustomTextField {...field} sx={{ width: '100%' }} />}
            />

            <CustomFormLabel>Channel</CustomFormLabel>
            <Controller
              name="channel"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  error={!!errors.channel}
                  helperText={errors.channel?.message}
                  sx={{ width: '100%' }}
                />
              )}
            />

            <CustomFormLabel>Door Id</CustomFormLabel>
            <Controller
              name="door_id"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  error={!!errors.door_id}
                  helperText={errors.door_id?.message}
                  sx={{ width: '100%' }}
                />
              )}
            />
          </Grid>

          {/* RIGHT */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ my: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
              Access Control Settings
            </Typography>
            <CustomFormLabel>Brand</CustomFormLabel>
            <Controller
              name="brand_id"
              control={control}
              render={({ field }) => (
                <CustomSelect {...field} error={!!errors.brand_id} sx={{ width: '100%' }}>
                  <MenuItem value="">Select Brand</MenuItem>
                  {brandList.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </CustomSelect>
              )}
            />

            {/* INTEGRATION */}
            <CustomFormLabel required>Integration</CustomFormLabel>
            <Controller
              name="integration_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.integration_id}>
                  <Select {...field}>
                    <MenuItem value="">Select Integration</MenuItem>
                    {integrationList.map((i) => (
                      <MenuItem key={i.id} value={i.id}>
                        {i.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText sx={{ marginLeft: '0 !important' }}>
                    {errors.integration_id?.message}
                  </FormHelperText>
                </FormControl>
              )}
            />

            {/* TYPE */}
            <CustomFormLabel>Type</CustomFormLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={String(field.value ?? '')}
                  onChange={(e: any) => field.onChange(Number(e.target.value))}
                  error={!!errors.type}
                  sx={{ width: '100%' }}
                >
                  <MenuItem value="">Select Type</MenuItem>
                  {Object.entries(AccessControlType)
                    .filter(([k]) => isNaN(Number(k)))
                    .map(([key, value]) => (
                      <MenuItem key={value} value={String(value)}>
                        {formatEnumLabel(key)}
                      </MenuItem>
                    ))}
                </CustomSelect>
              )}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </Box>
      </form>

      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  );
};

export default FormAccessControl;
