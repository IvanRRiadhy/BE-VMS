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
  const [host, setHost] = useState('');
  const [code, setCode] = useState('');

  const { token } = useSession();
  const [loading, setLoading] = React.useState(false);

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

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   setLoading(true);
  //   setErrors({});

  //   try {
  //     if (!token) {
  //       setAlertType('error');
  //       setAlertMessage('Something went wrong. Please try again later.');

  //       setTimeout(() => {
  //         setAlertType('info');
  //         setAlertMessage('Complete the following data properly and correctly');
  //       }, 3000);
  //       return;
  //     }

  //     const parsed = validateLocal({ name, host, code });
  //     if (!parsed) return;

  //     if (isBatchEdit && selectedRows.length > 0) {
  //       await Promise.all(
  //         selectedRows
  //           .filter((item) => item && item.id)
  //           .map((item) =>
  //             updateOrganization(
  //               item.id,
  //               {
  //                 name: name || item.name, // gunakan name dari input form
  //                 host: host || item.host,
  //                 code: code || item.code, // gunakan code dari input form (walaupun disabled)
  //               },
  //               token,
  //             ),
  //           ),
  //       );

  //       setAlertType('success');
  //       setAlertMessage('All organizations updated successfully.');
  //       onSuccess?.();
  //       return;
  //     }

  //     if (data) {
  //       await updateOrganization(
  //         data.id,
  //         {
  //           name,
  //           host,
  //           code,
  //         },
  //         token,
  //       );

  //       setAlertType('success');
  //       setAlertMessage('Organization updated successfully.');

  //       onSuccess?.();
  //     }
  //   } catch (err: any) {
  //     const be = err?.response?.data?.errors;
  //     if (be && typeof be === 'object') {
  //       setErrors({
  //         code: be.Code?.[0] ?? '',
  //         name: be.Name?.[0] ?? '',
  //         host: be.Host?.[0] ?? '',
  //       });
  //     }

  //     setAlertType('error');
  //     setAlertMessage('Something went wrong. Please try again later.');
  //     setTimeout(() => {
  //       setAlertType('info');
  //       setAlertMessage('Complete the following data properly and correctly');
  //     }, 3000);
  //   } finally {
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 800);
  //   }
  // };

  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );

  // 1) helper gabung nilai form + nilai lama item
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
    const r = CreateOrganizationSubmitSchema.safeParse(payload);
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
              await updateOrganization(item.id, parsed, token);
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
      }, 800);
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
          freeSolo
          options={allEmployees.map((emp: any) => ({ id: emp.id, label: emp.name }))}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option; // user mengetik manual
            return option.label;
          }}
          value={
            allEmployees
              .map((emp: any) => ({ id: emp.id, label: emp.name }))
              .find((emp: any) => emp.id === host) ?? ''
          }
          onChange={(_, newValue) => {
            setHost(typeof newValue === 'string' ? newValue : newValue?.id ?? '');
          }}
          onInputChange={(_, inputValue) => {
            setHost(inputValue);
          }}
          disabled={isBatchEdit}
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
