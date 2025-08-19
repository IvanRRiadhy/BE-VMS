import {
  Button,
  Grid2,
  Alert,
  Typography,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Switch,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';
import { updateDepartment } from 'src/customs/api/admin';
import { Item, CreateDepartementSubmitSchema } from 'src/customs/api/models/Department';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getAllEmployee } from 'src/customs/api/admin'; // sesuaikan import

interface FormUpdateDepartmentProps {
  data: Item | null;
  onSuccess?: () => void;
  isBatchEdit?: boolean;
  selectedRows?: Item[];
  enabledFields?: EnabledFields;
  setEnabledFields: React.Dispatch<React.SetStateAction<EnabledFields>>;
}

type EnabledFields = {
  name: boolean;
};

const FormUpdateDepartment: React.FC<FormUpdateDepartmentProps> = ({
  data,
  onSuccess,
  isBatchEdit,
  selectedRows = [],
  enabledFields,
  setEnabledFields,
}) => {
  const { token } = useSession();
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [code, setCode] = useState('');

  const [allEmployees, setAllEmployees] = useState<any>([]);

  useEffect(() => {
    if (!token) return;

    const fetchEmployees = async () => {
      try {
        const res = await getAllEmployee(token);
        setAllEmployees(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch employees', err);
      }
    };

    fetchEmployees();
  }, [token]);

  useEffect(() => {
    if (!isBatchEdit && data) {
      setName(data.name || '');
      setCode(data.code || '');

      if (allEmployees.length > 0) {
        // Kalau data.host sudah berupa id langsung pakai
        const foundById = allEmployees.find((emp: any) => emp.id === data.host);
        if (foundById) {
          setHost(foundById.id);
          return;
        }

        // Kalau data.host berupa nama, cari id-nya
        const foundByName = allEmployees.find((emp: any) => emp.name === data.host);
        setHost(foundByName ? foundByName.id : '');
      } else {
        setHost(data.host || '');
      }
    }
  }, [data, isBatchEdit, allEmployees]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = React.useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );

  const validateLocal = (formValues: any) => {
    // Untuk batch edit, hanya validasi field yang diaktifkan
    let dataToValidate = formValues;
    if (isBatchEdit) {
      dataToValidate = {
        ...(enabledFields?.name && { name: formValues.name }),
        host: formValues.host, // tetap validasi host kalau memang wajib
        code: formValues.code,
      };
    }

    const result = CreateDepartementSubmitSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setErrors({
        code: fe.code?.[0] ?? '',
        name: fe.name?.[0] ?? '',
        host: fe.host?.[0] ?? '',
      });
      return null;
    }

    setErrors({});
    return result.data;
  };

  const buildPayload = (item: Item) => {
    const _name = name.trim();
    const _code = code.trim();
    const _host = host?.toString().trim(); // pastikan string

    return {
      name: isBatchEdit
        ? enabledFields?.name
          ? _name || item.name
          : item.name
        : _name || item.name,

      code: _code || item.code, // code wajib: fallback ke item.code
      host: _host || item.host || '', // host boleh kosong -> ''
    };
  };

  // 2) validasi setelah merge
  const validateMerged = (payload: any) => {
    const r = CreateDepartementSubmitSchema.safeParse(payload);
    if (!r.success) {
      const fe = r.error.flatten().fieldErrors;
      setErrors({
        name: fe.name?.[0] ?? '',
        code: fe.code?.[0] ?? '',
        host: fe.host?.[0] ?? '',
      });
      return null;
    }
    setErrors({});
    return r.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!token) {
        setAlertType('error');
        setAlertMessage('Something went wrong. Please try again later.');
        return;
      }

      if (isBatchEdit && selectedRows.length > 0) {
        // Kerjakan per item: merge -> validate -> update
        const results = await Promise.allSettled(
          selectedRows
            .filter((x) => x?.id)
            .map(async (item) => {
              const payload = buildPayload(item);
              const parsed = validateMerged(payload);
              if (!parsed) throw new Error('Validation failed');
              await updateDepartment(item.id, parsed, token);
            }),
        );

        const failed = results.filter((r) => r.status === 'rejected');
        if (failed.length) {
          setAlertType('error');
          setAlertMessage('something went wrong. Please try again later.');
        } else {
          setAlertType('success');
          setAlertMessage('All organizations updated successfully.');
          onSuccess?.();
        }
        return;
      }

      // single edit
      if (data) {
        const payload = buildPayload(data);
        const parsed = validateMerged(payload);
        if (!parsed) return;
        await updateDepartment(data.id, parsed, token);

        setAlertType('success');
        setAlertMessage('Organization updated successfully.');
        onSuccess?.();
      }
    } catch (err: any) {
      const be = err?.response?.data?.errors;
      if (be && typeof be === 'object') {
        setErrors({
          code: be.Code?.[0] ?? '',
          name: be.Name?.[0] ?? '',
          host: be.Host?.[0] ?? '',
        });
      }
      setAlertType('error');
      setAlertMessage('Something went wrong. Please try again later.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 size={{ xs: 12, sm: 12 }}>
          <Alert severity={alertType}>{alertMessage}</Alert>
        </Grid2>

        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginX: 1 }}>
          <CustomFormLabel
            sx={{
              marginY: 1,
              marginX: 1,
            }}
            htmlFor="name"
          >
            <Typography variant="caption">Organization Name</Typography>
          </CustomFormLabel>
          {isBatchEdit && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={enabledFields?.name || false}
                  onChange={(e) =>
                    setEnabledFields((prev) => ({
                      ...prev,
                      name: e.target.checked,
                    }))
                  }
                />
              }
              label=""
              labelPlacement="start"
              sx={{ mt: 2 }}
            />
          )}
        </Box>
        <CustomTextField
          id="name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          variant="outlined"
          fullWidth
          disabled={isBatchEdit && !enabledFields?.name}
        />

        {/* Code */}
        <CustomFormLabel htmlFor="code" sx={{ my: 1, mx: 0 }}>
          <Typography variant="caption">Department Code</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="code"
          value={code}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
          error={Boolean(errors.code)}
          helperText={errors.code}
          variant="outlined"
          fullWidth
          disabled={isBatchEdit}
        />

        <CustomFormLabel htmlFor="code" sx={{ my: 1, mx: 0 }}>
          <Typography variant="caption">Department Host</Typography>
        </CustomFormLabel>

        <CustomTextField
          id="host"
          name="host"
          value={host}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHost(e.target.value)}
          error={Boolean(errors.host)}
          helperText={errors.host}
          variant="outlined"
          fullWidth
          disabled={isBatchEdit}
          select
        >
          <MenuItem value="">Pilih Host</MenuItem>
          {allEmployees.map((emp: any) => (
            <MenuItem key={emp.id} value={emp.id}>
              {emp.name}
            </MenuItem>
          ))}
        </CustomTextField>

        <Button sx={{ mt: 2 }} color="primary" variant="contained" type="submit">
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: '#ffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </>
  );
};

export default FormUpdateDepartment;
