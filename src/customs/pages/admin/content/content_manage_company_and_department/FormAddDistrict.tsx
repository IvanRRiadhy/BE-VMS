import { Button, Grid2, Alert, Typography, CircularProgress } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { createDistrict } from 'src/customs/api/admin';
import { CreateDistrictRequest } from 'src/customs/api/models/District';
import { useSession } from 'src/customs/contexts/SessionContext';

//
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
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

      await createDistrict(formData, token);
      localStorage.removeItem('unsavedDistrictFormAdd');
      setAlertType('success');
      setAlertMessage('Department successfully created.');

      setTimeout(() => {
        onSuccess?.();
      }, 900);
    } catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors);
      }
      setAlertType('error');
      setAlertMessage('Something went wrong. Please try again later.');
      setTimeout(() => {
        setAlertType('info');
        setAlertMessage('Complete the following data properly and correctly');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 size={{ xs: 12, sm: 12 }}>
          <Alert severity={alertType}>{alertMessage}</Alert>
        </Grid2>

        {/* District Name */}
        <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="name">
          <Typography variant="caption">District Name</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="name"
          value={formData.name}
          onChange={handleChange}
          error={Boolean(errors.name)}
          helperText={
            errors.name || 'You have to make sure that the name of this district is true.'
          }
          variant="outlined"
          fullWidth
        />

        {/* District Code */}
        <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="code">
          <Typography variant="caption">District Code</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="code"
          value={formData.code}
          onChange={handleChange}
          error={Boolean(errors.code)}
          helperText={
            errors.code || 'You have to make sure that the code of this district is true.'
          }
          variant="outlined"
          fullWidth
        />

        {/* Host */}
        <CustomFormLabel htmlFor="host" sx={{ my: 1, mx: 1 }}>
          <Typography variant="caption">District Host</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="host"
          value={formData.host}
          onChange={handleChange}
          error={Boolean(errors.host)}
          helperText={
            errors.host || 'You have to make sure that the host of this district is true.'
          }
          variant="outlined"
          fullWidth
        />

        <Button sx={{ mt: 2 }} color="primary" variant="contained" type="submit" disabled={loading}>
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
            bgcolor: 'rgba(0,0,0,0.4)',
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

export default FormAddDistrict;
