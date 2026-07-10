import {
  Button,
  Autocomplete,
  CircularProgress,
  Backdrop,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useMemo, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import {
  CreateDepartementSubmitSchema,
  CreateDepartmentRequest,
} from 'src/customs/api/models/Admin/Department';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';
// RHF
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVisitorEmployees } from 'src/hooks/useVisitorEmployees';
import { useDepartmentMutation } from 'src/hooks/Department/useDepartmentMutation';

type Mode = 'create' | 'edit' | 'batch';

interface FormAddDepartmentProps {
  mode: Mode;
  data?: any;
  selectedRows?: any[];
  enabledFields?: any;
  setEnabledFields?: any;
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const FormAddDepartment: React.FC<FormAddDepartmentProps> = ({
  mode,
  data,
  selectedRows = [],
  enabledFields,
  setEnabledFields,
  onSuccess,
  onDirtyChange,
}) => {
  const { token } = useSession();
  const schema =
    mode === 'batch' ? CreateDepartementSubmitSchema.partial() : CreateDepartementSubmitSchema;
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<CreateDepartmentRequest>({
    resolver: zodResolver(schema as any),
    shouldUnregister: true,
    defaultValues: {
      name: '',
      code: '',
      host: '',
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // fetch employee
  const { allVisitorEmployee } = useVisitorEmployees(token);
  const { create, update } = useDepartmentMutation();

  const loading = create.isPending || update.isPending;

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

  const onSubmit = async (form: CreateDepartmentRequest) => {
    try {
      if (!token) return;
      if (mode === 'create') {
        await create.mutateAsync({
          token,
          data: form,
        });
        showSwal('success', 'Department successfully created!');
      }

      if (mode === 'edit' && data) {
        await update.mutateAsync({
          id: data.id,
          token,
          data: form,
        });
        showSwal('success', 'Department successfully updated!');
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

            return update.mutateAsync({
              id: item.id,
              token,
              data: payload,
            });
          }),
        );

        showSwal('success', 'Batch update successful!');
      }

      reset();
      onSuccess?.();
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to update', 3000);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* NAME */}
        <Box display="flex" justifyContent="space-between">
          <CustomFormLabel required sx={{ mt: 0 }}>
            Department Name
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
              Department Code
            </CustomFormLabel>
            <CustomTextField value={''} disabled fullWidth />
          </>
        ) : (
          <>
            <CustomFormLabel required sx={{ mt: 2 }}>
              Department Code
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
              Head of Department
            </CustomFormLabel>
            <CustomTextField value="" disabled fullWidth />
          </>
        ) : (
          <>
            <CustomFormLabel required sx={{ mt: 2 }}>
              Head of Department
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button sx={{ mt: 2 }} variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      </form>

      <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress />
      </Backdrop>
    </>
  );
};

export default FormAddDepartment;
