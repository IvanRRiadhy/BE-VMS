import { Button, CircularProgress, Autocomplete, Backdrop, Switch } from '@mui/material';
import { Box } from '@mui/system';
import React, { use, useEffect, useMemo, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import {
  CreateDistrictRequest,
  CreateDistrictSubmitSchema,
} from 'src/customs/api/models/Admin/District';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

// RHF
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVisitorEmployees } from 'src/hooks/useVisitorEmployees';
import { useDistrictMutation } from 'src/hooks/District/useDistrictMutation';

type Mode = 'create' | 'edit' | 'batch';

interface FormAddDistrictProps {
  mode: Mode;
  data?: any;
  selectedRows?: any[];
  enabledFields?: any;
  setEnabledFields?: any;
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const FormAddDistrict: React.FC<FormAddDistrictProps> = ({
  mode,
  data,
  selectedRows = [],
  enabledFields,
  setEnabledFields,
  onSuccess,
  onDirtyChange,
}) => {
  const { allVisitorEmployee } = useVisitorEmployees();
  const schema =
    mode === 'batch' ? CreateDistrictSubmitSchema.partial() : CreateDistrictSubmitSchema;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<CreateDistrictRequest>({
    resolver: zodResolver(schema as any),
    shouldUnregister: true,
    defaultValues: {
      name: '',
      code: '',
      host: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && data) {
      reset({
        name: data.name || '',
        code: data.code || '',
        host: String(data.host || ''),
      });
    }

    if (mode === 'create') {
      reset({
        name: '',
        code: '',
        host: '',
      });
    }
  }, [mode, data, reset]);

  const employeeOptions = useMemo(
    () => allVisitorEmployee.map((emp: any) => ({ id: emp.id, label: emp.name })),
    [allVisitorEmployee],
  );

  const { create, update } = useDistrictMutation();
  const loading = create.isPending || update.isPending;

  const onSubmit = async (form: CreateDistrictRequest) => {
    try {
      

      if (mode === 'create') {
        await create.mutateAsync({ data: form });
        showSwal('success', 'District successfully created!');
      }
      if (mode === 'edit' && data) {
        await update.mutateAsync({ id: data.id, data: form });
        showSwal('success', 'District successfully updated!');
      }
      if (mode === 'batch' && selectedRows.length > 0) {
        await Promise.all(
          selectedRows.map((item) => {
            const payload = {
              name: form.name,
              code: item.code,
              host:
                typeof item.host === 'object'
                  ? String(item.host?.id || '')
                  : String(item.host || ''),
            };

            return update.mutateAsync({ id: item.id, data: payload });
          }),
        );

        showSwal('success', 'Batch update successful!');
      }
      reset();

      onSuccess?.();
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to create district.', 3000);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* NAME */}
        <Box display="flex" justifyContent="space-between">
          <CustomFormLabel required sx={{ mt: 0 }}>
            District Name
          </CustomFormLabel>
          {mode === 'batch' && (
            <Switch
              size="small"
              checked={enabledFields?.name}
              onChange={(e) =>
                setEnabledFields((prev: any) => ({
                  ...prev,
                  name: e.target.checked,
                }))
              }
            />
          )}
        </Box>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              disabled={mode === 'batch' && !enabledFields?.name}
            />
          )}
        />

        {/* CODE */}
        {mode === 'batch' ? (
          <>
            <CustomFormLabel required sx={{ mt: 2 }}>
              District Code
            </CustomFormLabel>
            <CustomTextField value={''} disabled fullWidth />
          </>
        ) : (
          <>
            <CustomFormLabel required sx={{ mt: 2 }}>
              District Code
            </CustomFormLabel>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  error={!!errors.code}
                  helperText={errors.code?.message}
                  fullWidth
                />
              )}
            />
          </>
        )}

        {/* HOST */}
        {mode === 'batch' ? (
          <>
            <CustomFormLabel required sx={{ mt: 2 }}>
              Head of District
            </CustomFormLabel>
            <CustomTextField value="" disabled fullWidth />
          </>
        ) : (
          <>
            <CustomFormLabel required sx={{ mt: 2 }}>
              Head of District
            </CustomFormLabel>
            <Controller
              name="host"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={employeeOptions}
                  value={employeeOptions.find((e) => e.id === field.value) ?? null}
                  onChange={(_, newValue) => {
                    field.onChange(newValue?.id ?? '');
                  }}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      error={!!errors.host}
                      helperText={errors.host?.message}
                      fullWidth
                    />
                  )}
                />
              )}
            />
          </>
        )}

        {/* SUBMIT */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button sx={{ mt: 2 }} variant="contained" type="submit" disabled={loading}>
            Submit
          </Button>
        </Box>
      </form>

      {/* LOADING */}
      <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress />
      </Backdrop>
    </>
  );
};

export default FormAddDistrict;
