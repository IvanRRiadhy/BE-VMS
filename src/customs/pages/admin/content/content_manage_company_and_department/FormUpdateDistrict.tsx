import {
  Button,
  Grid2,
  Alert,
  Typography,
  CircularProgress,
  Switch,
  Autocomplete,
  FormControlLabel,
  Backdrop,
  RadioGroup,
  Radio,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { getAllEmployee, getVisitorEmployee, updateDistrict } from 'src/customs/api/admin';
import { Item } from 'src/customs/api/models/Admin/Department';
import { CreateDistrictSubmitSchema } from 'src/customs/api/models/Admin/District';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

interface FormUpdateDistrictProps {
  data: Item | null;
  onSuccess?: () => void;
  isBatchEdit?: boolean;
  selectedRows?: Item[];
  enabledFields: EnabledFields;
  setEnabledFields: React.Dispatch<React.SetStateAction<EnabledFields>>;
}

type EnabledFields = {
  name: boolean;
  code: boolean;
  host: boolean;
};

const FormUpdateDistrict: React.FC<FormUpdateDistrictProps> = ({
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
  const [hostLabel, setHostLabel] = useState('');

  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );

  const toEmpOption = (emp: any) => ({
    id: String(emp?.id ?? emp?.person_id ?? emp?.identity_id ?? ''),
    label: String(emp?.name ?? emp?.email ?? emp?.card_number ?? '-'),
  });
  const empOptions = allEmployees.map(toEmpOption);

  useEffect(() => {
    if (!isBatchEdit && data) {
      setName(data.name || '');
      setCode(data.code || '');

      const h = (data as any).host;
      if (h && typeof h === 'object') {
        setHost(String(h.id || ''));
        setHostLabel(h.name || '');
      } else if (typeof h === 'string') {
        setHost(h);
        setHostLabel('');
      } else {
        setHost('');
        setHostLabel('');
      }
    }
  }, [data, isBatchEdit]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await getVisitorEmployee(token);
        setAllEmployees(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch employees', err);
      }
    })();
  }, [token]);

  const buildPayload = (item: Item | any) => {
    const _name = name.trim();
    const _code = code.trim();
    const _host = host?.toString().trim();

    const itemHostId =
      typeof item.host === 'object' ? String(item.host?.id || '') : String(item.host || '');

    return {
      name: isBatchEdit
        ? enabledFields?.name
          ? _name || item.name
          : item.name
        : _name || item.name,
      code: isBatchEdit
        ? enabledFields?.code
          ? _code || item.code
          : item.code
        : _code || item.code,
      host: isBatchEdit
        ? enabledFields?.host
          ? _host || itemHostId || ''
          : itemHostId
        : _host || itemHostId || '',
    };
  };

  const validateMerged = (payload: any) => {
    const r = CreateDistrictSubmitSchema.safeParse(payload);
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
    const r = CreateDistrictSubmitSchema.safeParse(raw);
    if (!r.success) {
      const fe = r.error.flatten().fieldErrors;
      setErrors({
        name: fe.name?.[0] ?? '',
        code: fe.code?.[0] ?? '',
        host: fe.host?.[0] ?? '',
      });
      return null;
    }
    return r.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!token) {
        showSwal('error', 'Something went wrong. Please try again later.');
        return;
      }

      // 🟡 Batch Edit Mode
      if (isBatchEdit && selectedRows.length > 0) {
        const results = await Promise.allSettled(
          selectedRows
            .filter((x) => x?.id)
            .map(async (item) => {
              const payload = buildPayload(item);
              const parsed = validateMerged(payload);
              if (!parsed) throw new Error('Validation failed');
              await updateDistrict(item.id, parsed, token);
            }),
        );

        const failed = results.filter((r) => r.status === 'rejected');

        // ✅ Swal langsung tampil
        if (failed.length > 0) {
          showSwal('error', 'Some districts failed to update.');
        } else {
          showSwal('success', 'All districts updated successfully.', 2000);
        }

        // ✅ Tutup dialog setelah swal muncul
        setTimeout(() => onSuccess?.(), 800);
        return;
      }

      // 🟢 Single Edit Mode
      if (data) {
        const payload = buildPayload(data);
        const parsed = validateSingle();
        if (!parsed) return;

        await updateDistrict(data.id, parsed, token);

        // ✅ Swal tampil langsung
        showSwal('success', 'District updated successfully.', 2000);

        // ✅ Tutup dialog sedikit setelah swal
        setTimeout(() => onSuccess?.(), 800);
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

      // 🔥 Swal error langsung tampil
      showSwal('error', 'Failed to update district.');
    } finally {
      // 🕒 Pastikan backdrop dimatikan
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <CustomFormLabel htmlFor="name" sx={{ marginY: 1, fontWeight: 500 }}>
            District Name
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
          onChange={(e) => setName(e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          variant="outlined"
          fullWidth
          disabled={isBatchEdit && !enabledFields?.name}
        />

        {/* CODE */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <CustomFormLabel htmlFor="code" sx={{ marginY: 1, fontWeight: 500 }}>
            District Code
          </CustomFormLabel>
          {isBatchEdit && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={enabledFields?.code || false}
                  onChange={(e) =>
                    setEnabledFields((prev) => ({
                      ...prev,
                      code: e.target.checked,
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
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={Boolean(errors.code)}
          helperText={errors.code}
          variant="outlined"
          fullWidth
          disabled={isBatchEdit && !enabledFields?.code}
        />

        {/* HOST */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <CustomFormLabel htmlFor="host" sx={{ marginY: 1, fontWeight: 500 }}>
            Head of District
          </CustomFormLabel>
          {isBatchEdit && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={enabledFields?.host || false}
                  onChange={(e) =>
                    setEnabledFields((prev) => ({
                      ...prev,
                      host: e.target.checked,
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
        <Autocomplete
          autoHighlight
          disablePortal={false}
          options={empOptions}
          filterOptions={(x) => x}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          isOptionEqualToValue={(opt, val) =>
            opt.id === (typeof val === 'string' ? val : (val as any)?.id)
          }
          value={empOptions.find((o: any) => o.id === host) || null}
          onChange={(_, newValue) => {
            if (typeof newValue === 'string') {
              setHostLabel(newValue);
            } else if (newValue) {
              setHost(newValue.id);
              setHostLabel(newValue.label);
            } else {
              setHost('');
              setHostLabel('');
            }
          }}
          onInputChange={(_, inputValue, reason) => {
            if (reason === 'input') setHostLabel(inputValue || '');
          }}
          disabled={isBatchEdit && !enabledFields?.host}
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

        <RadioGroup
          row
          // value={formData.visitorType}
          // onChange={(e) =>
          //   setFormData((prev) => ({
          //     ...prev,
          //     visitorType: e.target.value,
          //   }))
          // }
        >
          <FormControlLabel value="internal" control={<Radio />} label="Internal" />
          <FormControlLabel value="external" control={<Radio />} label="External" />
        </RadioGroup>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            sx={{ mt: 2 }}
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading}
          >
            Submit
          </Button>
        </Box>
      </form>

      <Backdrop
        open={loading}
        sx={{
          color: 'primary',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default FormUpdateDistrict;
