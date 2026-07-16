import {
  Button,
  CircularProgress,
  Autocomplete,
  Backdrop,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { use, useEffect, useMemo, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import {
  CreateOrganizationRequest,
  CreateOrganizationSubmitSchema,
} from 'src/customs/api/models/Admin/Organization';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

// RHF
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVisitorEmployees } from 'src/hooks/Employee/useVisitorEmployees';
import { useOrganizationMutation } from 'src/hooks/Organization/useOrganizationMutation';

type Mode = 'create' | 'edit' | 'batch';

interface FormOrganizationProps {
  mode: Mode;
  data?: any;
  selectedRows?: any[];
  enabledFields?: any;
  setEnabledFields?: any;
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const FormAddOrganization: React.FC<FormOrganizationProps> = ({
  mode,
  data,
  selectedRows = [],
  enabledFields,
  setEnabledFields,
  onSuccess,
  onDirtyChange,
}) => {
  const schema =
    mode === 'batch' ? CreateOrganizationSubmitSchema.partial() : CreateOrganizationSubmitSchema;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CreateOrganizationRequest>({
    resolver: zodResolver(schema as any),
    shouldUnregister: true,
    defaultValues: {
      name: '',
      code: '',
      host: '',
      is_internal: undefined,
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (mode === 'edit' && data) {
      reset({
        name: data.name || '',
        code: data.code || '',
        host: String(data.host || ''),
        is_internal: data.is_internal ?? undefined,
      });
    }

    if (mode === 'create') {
      reset({
        name: '',
        code: '',
        host: '',
        is_internal: undefined,
      });
    }
  }, [mode, data, reset]);

  const { allVisitorEmployee } = useVisitorEmployees();
  const { create, update } = useOrganizationMutation();

  const loading = create.isPending || update.isPending;

  const employeeOptions = useMemo(
    () => allVisitorEmployee.map((emp: any) => ({ id: emp.id, label: emp.name })),
    [allVisitorEmployee],
  );

  const onSubmit = async (form: CreateOrganizationRequest) => {
    try {
      if (mode === 'create') {
        await create.mutateAsync({ data: form });
        showSwal('success', 'Organization successfully created!');
      }

      if (mode === 'edit' && data) {
        await update.mutateAsync({ id: data.id, data: form });
        showSwal('success', 'Organization successfully updated!');
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
              is_internal: item.is_internal,
            };

            return update.mutateAsync({ id: item.id, data: payload });
          }),
        );

        showSwal('success', 'Batch update successful!');
      }

      reset();
      onSuccess?.();
    } catch {
      showSwal('error', 'Failed to process organization.');
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* NAME */}
        <Box display="flex" justifyContent="space-between">
          <CustomFormLabel required sx={{ mt: 0 }}>
            Organization Name
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
              Organization Code
            </CustomFormLabel>
            <CustomTextField value={''} disabled fullWidth />
          </>
        ) : (
          <>
            <CustomFormLabel required sx={{ mt: 2 }}>
              Organization Code
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
              Head of Organization
            </CustomFormLabel>
            <CustomTextField value="" disabled fullWidth />
          </>
        ) : (
          <>
            <CustomFormLabel required sx={{ mt: 2 }}>
              Head of Organization
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

        {/* TYPE */}
        {mode === 'batch' ? (
          <>
            <CustomFormLabel sx={{ mt: 2 }}>Type (Optional)</CustomFormLabel>
            <CustomTextField value="" disabled fullWidth />
          </>
        ) : (
          <>
            <CustomFormLabel sx={{ mt: 2 }}>Type (Optional)</CustomFormLabel>
            <Controller
              name="is_internal"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  row
                  value={field.value === undefined ? '' : String(field.value)}
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Internal" />
                  <FormControlLabel value="false" control={<Radio />} label="External" />
                </RadioGroup>
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
      <Backdrop open={loading} sx={{ zIndex: 999999 }}>
        <CircularProgress />
      </Backdrop>
    </>
  );
};

export default FormAddOrganization;
