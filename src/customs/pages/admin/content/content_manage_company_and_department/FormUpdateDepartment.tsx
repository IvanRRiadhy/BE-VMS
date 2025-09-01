import {
  Button,
  Grid2,
  Alert,
  Typography,
  CircularProgress,
  FormControlLabel,
  Autocomplete,
  MenuItem,
  Switch,
  Backdrop,
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

type EmployeeOption = { id: string; label: string };

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
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [hostFallback, setHostFallback] = useState<EmployeeOption | null>(null);
  const [empLoading, setEmpLoading] = useState(false);

  const toEmpOption = (emp: any) => ({
    id: String(emp?.id ?? emp?.person_id ?? emp?.identity_id ?? ''),
    label: String(emp?.name ?? emp?.email ?? emp?.card_number ?? '-'),
  });

  // hasil map jadi options buat Autocomplete
  const empOptions = allEmployees.map(toEmpOption);

  const [hostLabel, setHostLabel] = useState('');
  useEffect(() => {
    if (!token) return;

    const fetchEmployees = async () => {
      try {
        const res = await getAllEmployee(token);
        setAllEmployees(res?.collection ?? []);
        const opts = (res?.collection ?? []).map((e: any) => ({
          id: String(e.id),
          label: e.name ?? e.email ?? String(e.id),
        }));
        setEmployeeOptions(opts);
      } catch (err) {
        console.error('Failed to fetch employees', err);
        setEmployeeOptions([]);
      } finally {
        setEmpLoading(false);
      }
    };

    fetchEmployees();
  }, [token]);

  const selectedHostOption =
    employeeOptions.find((o) => o.id === String(data?.host ?? '')) ||
    hostFallback || // fallback saat options belum selesai load
    null;

  useEffect(() => {
    if (!isBatchEdit && data) {
      setName(data.name || '');
      setCode(data.code || '');

      const h = (data as any).host;
      if (h && typeof h === 'object') {
        setHost(String(h.id || '')); // simpan ID untuk submit
        setHostLabel(h.name || ''); // simpan nama untuk tampilan awal
      } else if (typeof h === 'string') {
        setHost(h); // sudah ID
        setHostLabel(''); // tidak ada nama, biarkan kosong
      } else {
        setHost('');
        setHostLabel('');
      }
    }
  }, [data, isBatchEdit]);
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

  const buildPayload = (item: Item | any) => {
    const _name = name.trim();
    const _code = code.trim();
    const _host = host?.toString().trim(); // ID dari state

    const itemHostId =
      typeof item.host === 'object' ? String(item.host?.id || '') : String(item.host || '');

    return {
      name: isBatchEdit
        ? enabledFields?.name
          ? _name || item.name
          : item.name
        : _name || item.name,
      code: _code || item.code,
      host: _host || itemHostId || '',
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

  const validateSingle = () => {
    const raw = {
      name: name.trim(),
      code: code.trim(),
      host: host.trim(),
    };
    const r = CreateDepartementSubmitSchema.safeParse(raw);
    if (!r.success) {
      const fe = r.error.flatten().fieldErrors;
      setErrors({
        name: fe.name?.[0] ?? '',
        code: fe.code?.[0] ?? '',
        host: fe.host?.[0] ?? '',
      });
      return null;
    }
    return r.data; // { name, code, host } sudah trim & valid
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
        const parsed = validateSingle();
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
      }, 600);
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

        <Autocomplete
          // freeSolo
          autoHighlight
          disablePortal
          options={empOptions}
          filterOptions={(x) => x} // penting: jangan filter client-side (biar simpel/cepat)
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          isOptionEqualToValue={(opt, val) =>
            opt.id === (typeof val === 'string' ? val : (val as any)?.id)
          }
          // ✅ Kalau ketemu option berdasarkan ID → pakai object option.
          //    Kalau belum ketemu (data employee belum load / ID tidak ada di list) → tampilkan label string.
          value={
            (host && empOptions.find((o: any) => o.id === host)) || (hostLabel ? hostLabel : null)
          }
          // ✅ Saat user pilih option dari dropdown
          onChange={(_, newValue) => {
            if (typeof newValue === 'string') {
              // user mengetik manual → hanya ubah label, jangan ubah ID
              setHostLabel(newValue);
            } else if (newValue) {
              // pilih dari opsi
              setHost(newValue.id); // simpan ID untuk submit
              setHostLabel(newValue.label);
            } else {
              // clear
              setHost('');
              setHostLabel('');
            }
          }}
          // ✅ Ketik manual → hanya ubah label tampilan
          onInputChange={(_, inputValue, reason) => {
            if (reason === 'input') setHostLabel(inputValue || '');
          }}
          disabled={isBatchEdit}
          noOptionsText="No employees found"
          renderInput={(params) => (
            <CustomTextField
              {...params}
              variant="outlined"
              error={Boolean(errors.host)}
              helperText={errors.host}
              fullWidth
            />
          )}
        />

        <Button sx={{ mt: 2 }} color="primary" variant="contained" type="submit">
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
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

export default FormUpdateDepartment;
