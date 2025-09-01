import {
  Button,
  Grid2,
  Alert,
  Typography,
  CircularProgress,
  FormControlLabel,
  Autocomplete,
  Switch,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { Item, CreateOrganizationSubmitSchema } from 'src/customs/api/models/Organization';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Box } from '@mui/system';
import { updateOrganization } from 'src/customs/api/admin';
import { MenuItem } from '@mui/material';
import { getAllEmployee } from 'src/customs/api/admin'; // sesuaikan import

interface FormUpdateOrganizationProps {
  data: Item | null;
  setData: React.Dispatch<React.SetStateAction<Item | null>>;
  onSuccess?: () => void;
  isBatchEdit?: boolean;
  selectedRows?: Item[];
  enabledFields?: EnabledFields;
  setEnabledFields: React.Dispatch<React.SetStateAction<EnabledFields>>;
}

type EnabledFields = {
  name: boolean;
};

const FormUpdateOrganization: React.FC<FormUpdateOrganizationProps> = ({
  data,
  onSuccess,
  isBatchEdit,
  selectedRows = [],
  enabledFields,
  setEnabledFields,
}) => {
  const [state, setState] = React.useState({
    checkedB: false,
  });
  const [name, setName] = useState('');
  const [host, setHost] = useState<string>('');
  const [code, setCode] = useState('');
  const [hostLabel, setHostLabel] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { token } = useSession();
  const [loading, setLoading] = React.useState(false);

  const [allEmployees, setAllEmployees] = useState<any>([]);

  const toEmpOption = (emp: any) => ({
    id: String(emp?.id ?? emp?.person_id ?? emp?.identity_id ?? ''),
    label: String(emp?.name ?? emp?.email ?? emp?.card_number ?? '-'),
  });

  // hasil map jadi options buat Autocomplete
  const empOptions = allEmployees.map(toEmpOption);

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

  const validateLocal = (formValues: any) => {
    // Untuk batch edit, hanya validasi field yang diaktifkan
    let dataToValidate = formValues;
    if (isBatchEdit) {
      dataToValidate = {
        ...(enabledFields?.name && { name: formValues.name }),
        code: formValues.code,
        host: formValues.host, // tetap validasi host kalau memang wajib
      };
    }

    const result = CreateOrganizationSubmitSchema.safeParse(dataToValidate);
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
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );

  // 1) helper gabung nilai form + nilai lama item
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

  const validateSingle = () => {
    const raw = {
      name: name.trim(),
      code: code.trim(),
      host: host.trim(),
    };
    const r = CreateOrganizationSubmitSchema.safeParse(raw);
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

  const validateMerged = (payload: any) => {
    const r = CreateOrganizationSubmitSchema.safeParse(payload);
    if (!r.success) {
      const fe = r.error.flatten().fieldErrors;
      setErrors({
        name: fe.name?.[0] ?? '',
        code: fe.code?.[0] ?? '',
        host: fe.host?.[0] ?? '',
      });
      return;
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
              await updateOrganization(item.id, parsed, token);
            }),
        );

        const failed = results.filter((r) => r.status === 'rejected');
        if (failed.length) {
          setAlertType('error');
          setAlertMessage('Something went wrong. Please try again later.');
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
        await updateOrganization(data.id, parsed, token);

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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <CustomFormLabel
            sx={{
              marginY: 1,
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

        <CustomFormLabel
          sx={{
            marginY: 1,
          }}
          htmlFor="company-code"
        >
          <Typography variant="caption">Organization Code</Typography>
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

        <CustomFormLabel
          sx={{
            marginY: 1,
          }}
          htmlFor="company-code"
        >
          <Typography variant="caption">Organization Host</Typography>
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

        <div>
          <Button sx={{ mt: 2 }} color="primary" variant="contained" type="submit">
            Submit
          </Button>
        </div>
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

export default FormUpdateOrganization;
