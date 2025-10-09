import {
  Button,
  Grid2,
  Alert,
  Typography,
  CircularProgress,
  Autocomplete,
  Backdrop,
  Portal,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useState, useEffect } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { createDistrict, getAllEmployee } from 'src/customs/api/admin';
import { CreateDistrictRequest, CreateDistrictSubmitSchema } from 'src/customs/api/models/District';
import { useSession } from 'src/customs/contexts/SessionContext';

interface FormAddDistrictProps {
  formData: CreateDistrictRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateDistrictRequest>>;
  onSuccess?: () => void;
}

const FormAddDistrict: React.FC<FormAddDistrictProps> = ({ formData, setFormData, onSuccess }) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const [loading, setLoading] = useState(false);

  const { token } = useSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = e.target.name || e.target.id;
    const { value } = e.target;

    // update form
    setFormData((prev) => ({ ...prev, [field]: value }));

    // clear error for this field
    setErrors((prev) => ({ ...prev, [field]: '' }));
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

  const validateLocal = (data: any) => {
    const r = CreateDistrictSubmitSchema.safeParse(data);
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

      await createDistrict(parsed, token);
      localStorage.removeItem('unsavedDistrictFormAdd');
      setAlertType('success');
      setAlertMessage('Department successfully created.');

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
        <Grid2 size={{ xs: 12, sm: 12 }}>
          <Alert severity={alertType}>{alertMessage}</Alert>
        </Grid2>

        {/* District Name */}
        <CustomFormLabel sx={{ my: 1 }} htmlFor="name">
          <Typography variant="caption">District Name</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="name"
          value={formData.name}
          onChange={handleChange}
          error={Boolean(errors.name)}
          helperText={errors.name}
          variant="outlined"
          fullWidth
        />

        {/* District Code */}
        <CustomFormLabel sx={{ my: 1 }} htmlFor="code">
          <Typography variant="caption">District Code</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="code"
          value={formData.code}
          onChange={handleChange}
          error={Boolean(errors.code)}
          helperText={errors.code}
          variant="outlined"
          fullWidth
        />

        <CustomFormLabel htmlFor="host" sx={{ my: 1 }}>
          <Typography variant="caption">Head of District</Typography>
        </CustomFormLabel>
        <Autocomplete
          id="host"
          autoHighlight
          disablePortal
          options={allEmployes.map((emp: any) => ({ id: emp.id, label: emp.name }))}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          value={
            allEmployes
              .map((emp: any) => ({ id: emp.id, label: emp.name }))
              .find((emp: any) => emp.id === formData.host) ?? ''
          }
          onChange={(_, newValue) => {
            setFormData((prev) => ({
              ...prev,
              host: typeof newValue === 'string' ? newValue : newValue?.id ?? '',
            }));
            // ⬅️ clear validation error
            setErrors((prev) => ({ ...prev, host: '' }));
          }}
          onInputChange={(_, inputValue) => {
            setFormData((prev) => ({ ...prev, host: inputValue }));
            // ⬅️ clear validation error
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
          zIndex: (theme) => theme.zIndex.drawer + 1, // di atas drawer & dialog
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default FormAddDistrict;
