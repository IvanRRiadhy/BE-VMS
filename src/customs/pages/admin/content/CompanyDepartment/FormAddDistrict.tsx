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
import React, { useEffect, useMemo, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { createDistrict, getVisitorEmployee, updateDistrict } from 'src/customs/api/admin';
import {
  CreateDistrictRequest,
  CreateDistrictSubmitSchema,
} from 'src/customs/api/models/Admin/District';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

// RHF
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormAutoSave } from 'src/hooks/useFormAutoSave';

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
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [allEmployes, setAllEmployees] = useState<any[]>([]);

  const schema =
    mode === 'batch' ? CreateDistrictSubmitSchema.partial() : CreateDistrictSubmitSchema;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateDistrictRequest>({
    resolver: zodResolver(schema as any),
        shouldUnregister: true,
    defaultValues: {
      name: '',
      code: '',
      host: '',
      // is_internal: undefined,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && data) {
      reset({
        name: data.name || '',
        code: data.code || '',
        host: String(data.host || ''),
        // is_internal: data.is_internal ?? undefined,
      });
    }

    if (mode === 'create') {
      reset({
        name: '',
        code: '',
        host: '',
        // is_internal: undefined,
      });
    }
  }, [mode, data, reset]);

  useFormAutoSave({
    watch,
    reset,
    storageKey: 'unsavedDistrictFormAdd',
    onDirtyChange,
  });

  useEffect(() => {
    if (!token) return;

    const fetchEmployees = async () => {
      try {
        const res = await getVisitorEmployee(token);
        setAllEmployees(res?.collection ?? []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setAllEmployees([]);
      }
    };

    fetchEmployees();
  }, [token]);

  const employeeOptions = useMemo(
    () => allEmployes.map((emp: any) => ({ id: emp.id, label: emp.name })),
    [allEmployes],
  );

  const onSubmit = async (form: CreateDistrictRequest) => {
    setLoading(true);
    try {
      if (!token) return;

      // ✅ CREATE
      if (mode === 'create') {
        await createDistrict(form, token);
        showSwal('success', 'District successfully created!');
      }

      // ✅ EDIT
      if (mode === 'edit' && data) {
        await updateDistrict(data.id, form, token);
        showSwal('success', 'District successfully updated!');
      }

      // ✅ BATCH
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
              // is_internal: item.is_internal,
            };

            return updateDistrict(item.id, payload, token);
          }),
        );

        showSwal('success', 'Batch update successful!');
      }
      reset();

      onSuccess?.();
    } catch (err) {
      showSwal('error', 'Failed to create district.', 3000);
    } finally {
      setLoading(false);
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

        {/* TYPE */}
        {/* {mode === 'batch' ? (
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
        )} */}

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
