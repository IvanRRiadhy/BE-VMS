import {
  Button,
  Grid2,
  Alert,
  Typography,
  Autocomplete,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useState, useEffect } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { createDepartment, getAllEmployee } from 'src/customs/api/admin';
import {
  CreateDepartementSubmitSchema,
  CreateDepartmentRequest,
} from 'src/customs/api/models/Department';
import { useSession } from 'src/customs/contexts/SessionContext';

interface FormAddDepartmentProps {
  formData: CreateDepartmentRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateDepartmentRequest>>;
  onSuccess?: () => void;
}

const FormAddDepartment: React.FC<FormAddDepartmentProps> = ({
  formData,
  setFormData,
  onSuccess,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const { token } = useSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = e.target.name || e.target.id;
    const { value } = e.target;

    // update form
    setFormData((prev) => ({ ...prev, [field]: value }));

    // clear error for this field
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateLocal = (data: any) => {
    const r = CreateDepartementSubmitSchema.safeParse(data);
    if (!r.success) {
      const fe = r.error.flatten().fieldErrors;
      setErrors({
        code: fe.code?.[0] ?? '',
        name: fe.name?.[0] ?? '',
        host: fe.host?.[0] ?? '',
      });
      return null;
    }
    setErrors({});
    return r.data;
  };

  const [allEmployes, setAllEmployees] = useState<any>([]);

  useEffect(() => {
    if (!token) return;

    const fetchEmployees = async () => {
      try {
        const res = await getAllEmployee(token);
        setAllEmployees(res?.collection ?? []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setAllEmployees([]);
      }
    };

    fetchEmployees();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!token) {
        setAlertType('error');
        setAlertMessage('Something went wrong. Please try again later.');

        setTimeout(() => {
          setAlertType('info');
          setAlertMessage('Complete the following data properly and correctly');
        }, 3000);
        return;
      }

      const parsed = validateLocal(formData);
      if (!parsed) {
        setAlertType('error');
        setAlertMessage('Please complete the required fields correctly.');
        return;
      }

      await createDepartment(parsed, token);
      localStorage.removeItem('unsavedDepartmentFormAdd');
      setAlertType('success');
      setAlertMessage('Department successfully created!');

      setTimeout(() => {
        onSuccess?.();
      }, 900);
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
      setTimeout(() => {
        setAlertType('info');
        setAlertMessage('Complete the following data properly and correctly');
      }, 3000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 size={12}>
          <Alert severity={alertType}>{alertMessage}</Alert>
        </Grid2>

        <CustomFormLabel htmlFor="name" sx={{ my: 1 }}>
          <Typography variant="caption">Department Name</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="name"
          value={formData.name}
          onChange={handleChange}
          error={Boolean(errors.name)}
          helperText={errors.name}
          fullWidth
          variant="outlined"
        />

        <CustomFormLabel htmlFor="code" sx={{ my: 1 }}>
          <Typography variant="caption">Department Code</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="code"
          value={formData.code}
          onChange={handleChange}
          error={Boolean(errors.code)}
          helperText={errors.code}
          fullWidth
          variant="outlined"
        />

        <CustomFormLabel htmlFor="host" sx={{ my: 1 }}>
          <Typography variant="caption">Head of Department</Typography>
        </CustomFormLabel>
        <Autocomplete
          // freeSolo
          autoHighlight
          disablePortal
          options={allEmployes.map((emp: any) => ({ id: emp.id, label: emp.name }))}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option; // user mengetik manual
            return option.label;
          }}
          value={
            // cari object di options yang id-nya sama dengan formData.host
            allEmployes
              .map((emp: any) => ({ id: emp.id, label: emp.name }))
              .find((emp: any) => emp.id === formData.host) ?? ''
          }
          onChange={(_, newValue) => {
            const newHost = typeof newValue === 'string' ? newValue : newValue?.id ?? '';
            setFormData((prev) => ({ ...prev, host: newHost }));

            // clear error langsung
            setErrors((prev) => ({ ...prev, host: '' }));
          }}
          onInputChange={(_, inputValue) => {
            setFormData((prev) => ({ ...prev, host: inputValue }));

            // clear error langsung
            setErrors((prev) => ({ ...prev, host: '' }));
          }}
          renderInput={(params) => (
            <CustomTextField
              {...params}
              variant="outlined"
              placeholder=""
              error={Boolean(errors.host)}
              helperText={errors.host}
              fullWidth
            />
          )}
        />

        <Button sx={{ mt: 2 }} color="primary" variant="contained" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>

      <Backdrop
        open={loading}
        sx={{
          color: 'primary',
          zIndex: (theme) => theme.zIndex.drawer + 1, // di atas drawer & dialog
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default FormAddDepartment;
