import {
  Button,
  Grid2,
  Alert,
  Typography,
  CircularProgress,
  Switch,
  Autocomplete,
  FormControlLabel,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';
import { updateDistrict } from 'src/customs/api/admin';
import { CreateDepartementSubmitSchema, Item } from 'src/customs/api/models/Department';
import { useSession } from 'src/customs/contexts/SessionContext';
import Swal from 'sweetalert2';

interface FormUpdateDistrictProps {
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

const FormUpdateDistrict: React.FC<FormUpdateDistrictProps> = ({
  data,
  onSuccess,
  isBatchEdit,
  selectedRows = [],
  enabledFields,
  setEnabledFields,
}) => {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [code, setCode] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const { token } = useSession();

  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const [allEmployees, setAllEmployees] = useState<any>([]);
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

  //     if (isBatchEdit && selectedRows.length > 0) {
  //       await Promise.all(
  //         selectedRows
  //           .filter((item) => item && item.id)
  //           .map((item) =>
  //             updateDistrict(
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
  //       await updateDistrict(data.id, { name, host, code }, token);

  //       setAlertType('success');
  //       setAlertMessage('District updated successfully.');
  //       setTimeout(() => {
  //         onSuccess?.();
  //       }, 900);
  //     }
  //   } catch (error: any) {
  //     if (error.errors) {
  //       setErrors(error.errors);
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
              await updateDistrict(item.id, parsed, token);
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
        await updateDistrict(data.id, parsed, token);

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
          {/* <Alert severity={alertType}>{alertMessage}</Alert> */}
        </Grid2>

        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginX: 1 }}>
          <CustomFormLabel
            sx={{
              marginY: 1,
            }}
            htmlFor="name"
          >
            <Typography variant="caption">District Name</Typography>
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
        <CustomFormLabel htmlFor="code" sx={{ my: 1 }}>
          <Typography variant="caption">District Code</Typography>
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

        <CustomFormLabel htmlFor="code" sx={{ my: 1 }}>
          <Typography variant="caption">Head of District</Typography>
        </CustomFormLabel>

        {/* Host */}
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

        <Button sx={{ mt: 2 }} color="primary" variant="contained" type="submit">
          Submit
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
            zIndex: 2000,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </>
  );
};

export default FormUpdateDistrict;
