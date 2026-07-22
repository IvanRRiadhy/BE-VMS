import {
  Button,
  Grid2 as Grid,
  Typography,
  CircularProgress,
  Backdrop,
  MenuItem,
  FormControl,
  Select,
  Box,
  FormHelperText,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import {
  CreateAccessControlRequestSchema,
  UpdateAccessControlRequestSchema,
} from 'src/customs/api/models/Admin/AccessControl';

import {
  getAccessControlsById,
  getAllIntegration,
} from 'src/customs/api/admin';

import { AccessControlType } from 'src/customs/api/models/Admin/AccessControl';
import { showSwal } from 'src/customs/components/alerts/alerts';

// RHF
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAccessControlMutation } from 'src/hooks/AccessControl/useAccessControlMutation';
import { useTranslation } from 'react-i18next';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';

type FormType = z.infer<typeof CreateAccessControlRequestSchema>;

interface Props {
  editingId?: string;
  onSuccess?: () => void;
  onDirty?: (dirty: boolean) => void;
}

const FormAccessControl = ({ editingId, onSuccess, onDirty }: Props) => {
  const [loading, setLoading] = useState(false);
  // const [brandList, setBrandList] = useState<any[]>([]);
  const [integrationList, setIntegrationList] = useState<any[]>([]);
  const { t } = useTranslation();

  const typeMap: Record<string, number> = {
    Access: 0,
    Group: 1,
  };
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormType>({
    resolver: zodResolver(CreateAccessControlRequestSchema),
    defaultValues: {
      // brand_id: '',
      // brand_name: '',
      type: 0,
      name: '',
      description: '',
      channel: '',
      door_id: '',
      raw: '{}',
      integration_id: '',
    },
  });

  useEffect(() => {
    onDirty?.(isDirty);
  }, [isDirty, onDirty]);

  useEffect(() => {
    (async () => {
      const [integrationRes] = await Promise.allSettled([
        getAllIntegration(),
      ])
      if (integrationRes.status === 'fulfilled')
        setIntegrationList(integrationRes.value?.collection ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!editingId) return;

    (async () => {
      const res = await getAccessControlsById(editingId);
      const d = res?.collection;

      if (d) {
        reset({
          // brand_id: d.brand_id ?? '',
          integration_id: d.integration_id ?? '',
          type: typeMap[d.type] ?? 0,
          name: d.name,
          description: d.description ?? '',
          channel: d.channel,
          door_id: d.door_id,
          raw: d.raw,
          // brand_name: d.brand_name,
        });
      }
    })();
  }, [editingId, reset]);

  const { createMutation, updateMutation } = useAccessControlMutation();

  const onSubmit = async (data: FormType) => {
    setLoading(true);
    try {
      if (editingId) {
        const payload = UpdateAccessControlRequestSchema.parse({
          ...data,
        });
        await updateMutation.mutateAsync({ id: editingId, data: payload });
      } else {
        const payload = CreateAccessControlRequestSchema.parse({
          ...data,
        });
        await createMutation.mutateAsync(payload);
      }

      reset(data);
      onDirty?.(false);
      showSwal(
        'success',
        editingId ? t("updatedSuccess", { name: 'Access Control' }) : t("createdSuccess", { name: 'Access Control' }),
      );
      onSuccess?.();
    } catch (err: any) {
      showSwal(
        'error',
        err?.message ?? err?.response?.data?.message ?? 'Failed to create Access Control.',
      );
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

            {/* INTEGRATION */}
            <CustomFormLabel required>Integration</CustomFormLabel>
            <Controller
              name="integration_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.integration_id}>
                  <Select
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const id = e.target.value;
                      field.onChange(id);
                      const selected = integrationList.find((x) => x.id === id);
                      // setValue('integration_name', selected?.name ?? '');
                    }}
                  >
                    <MenuItem value="">Select Integration</MenuItem>

                    {integrationList.map((i) => (
                      <MenuItem key={i.id} value={i.id}>
                        {i.name}
                      </MenuItem>
                    ))}
                  </Select>

                  <FormHelperText>{errors.integration_id?.message}</FormHelperText>
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
            Submit
          </Button>
        </Box>
      </form>

      <GlobalBackdropLoading open={loading} />
    </>
  );
};

export default FormAccessControl;
