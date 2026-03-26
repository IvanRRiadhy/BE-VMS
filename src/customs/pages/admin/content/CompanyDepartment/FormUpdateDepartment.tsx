import {
  Button,
  CircularProgress,
  Backdrop,
  FormControlLabel,
  Autocomplete,
  Switch,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useMemo, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { updateDepartment, getVisitorEmployee } from 'src/customs/api/admin';
import { Item, CreateDepartementSubmitSchema } from 'src/customs/api/models/Admin/Department';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

// RHF
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type EnabledFields = {
  name: boolean;
  code: boolean;
  host: boolean;
};

interface Props {
  data: Item | null;
  onSuccess?: () => void;
  isBatchEdit?: boolean;
  selectedRows?: Item[];
  enabledFields: EnabledFields;
  setEnabledFields: React.Dispatch<React.SetStateAction<EnabledFields>>;
}

const FormUpdateDepartment: React.FC<Props> = ({
  data,
  onSuccess,
  isBatchEdit,
  selectedRows = [],
  enabledFields,
  setEnabledFields,
}) => {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(CreateDepartementSubmitSchema),
    defaultValues: {
      name: '',
      code: '',
      host: '',
    },
  });

  // fetch employee
  useEffect(() => {
    if (!token) return;
    (async () => {
      const res = await getVisitorEmployee(token);
      setAllEmployees(res?.collection ?? []);
    })();
  }, [token]);

  const empOptions = useMemo(
    () =>
      allEmployees.map((emp: any) => ({
        id: String(emp.id),
        label: emp.name,
      })),
    [allEmployees],
  );

  // set initial value
  useEffect(() => {
    if (!isBatchEdit && data) {
      setValue('name', data.name || '');
      setValue('code', data.code || '');

      const h: any | undefined = data.host;
      if (typeof h === 'object') {
        setValue('host', String(h?.id || ''));
      } else {
        setValue('host', String(h || ''));
      }
    }
  }, [data, isBatchEdit]);

  // 🔥 tetap dipakai
  const buildPayload = (form: any, item: any) => {
    const itemHostId =
      typeof item.host === 'object' ? String(item.host?.id || '') : String(item.host || '');

    return {
      name: isBatchEdit
        ? enabledFields.name
          ? form.name || item.name
          : item.name
        : form.name || item.name,
      code: isBatchEdit
        ? enabledFields.code
          ? form.code || item.code
          : item.code
        : form.code || item.code,
      host: isBatchEdit
        ? enabledFields.host
          ? form.host || itemHostId
          : itemHostId
        : form.host || itemHostId,
    };
  };

  const onSubmit = async (form: any) => {
    setLoading(true);
    try {
      if (!token) return;

      // 🟡 Batch
      if (isBatchEdit && selectedRows.length > 0) {
        const results = await Promise.allSettled(
          selectedRows.map(async (item) => {
            const payload = buildPayload(form, item);
            await updateDepartment(item.id, payload, token);
          }),
        );

        const failed = results.filter((r) => r.status === 'rejected');

        showSwal(
          failed.length ? 'error' : 'success',
          failed.length
            ? 'Some departments failed to update.'
            : 'All departments updated successfully.',
        );

        setTimeout(() => onSuccess?.(), 800);
        return;
      }

      // 🟢 Single
      if (data) {
        const payload = buildPayload(form, data);
        await updateDepartment(data.id, payload, token);

        showSwal('success', 'Department updated successfully.');
        setTimeout(() => onSuccess?.(), 800);
      }
    } catch {
      showSwal('error', 'Failed to update department.');
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
            Department Name
          </CustomFormLabel>
          {isBatchEdit && (
            <Switch
              size="small"
              checked={enabledFields.name}
              onChange={(e) => setEnabledFields((p) => ({ ...p, name: e.target.checked }))}
            />
          )}
        </Box>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              disabled={isBatchEdit && !enabledFields.name}
              error={!!errors.name}
              helperText={errors.name?.message as string}
              fullWidth
            />
          )}
        />

        {/* CODE */}
        <Box display="flex" justifyContent="space-between">
          <CustomFormLabel required>Department Code</CustomFormLabel>
          {isBatchEdit && (
            <Switch
              size="small"
              checked={enabledFields.code}
              onChange={(e) => setEnabledFields((p) => ({ ...p, code: e.target.checked }))}
            />
          )}
        </Box>

        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              disabled={isBatchEdit && !enabledFields.code}
              error={!!errors.code}
              helperText={errors.code?.message as string}
              fullWidth
            />
          )}
        />

        {/* HOST */}
        <Box display="flex" justifyContent="space-between">
          <CustomFormLabel required>Head of Department</CustomFormLabel>
          {isBatchEdit && (
            <Switch
              size="small"
              checked={enabledFields.host}
              onChange={(e) => setEnabledFields((p) => ({ ...p, host: e.target.checked }))}
            />
          )}
        </Box>

        <Controller
          name="host"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={empOptions}
              value={empOptions.find((e) => e.id === field.value) ?? null}
              onChange={(_, val) => field.onChange(val?.id ?? '')}
              disabled={isBatchEdit && !enabledFields.host}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  error={!!errors.host}
                  helperText={errors.host?.message as string}
                />
              )}
            />
          )}
        />

        {/* SUBMIT */}
        <Box display="flex" justifyContent="flex-end">
          <Button type="submit" variant="contained" disabled={loading} sx={{mt:1}}>
            Submit
          </Button>
        </Box>
      </form>

      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  );
};

export default FormUpdateDepartment;
