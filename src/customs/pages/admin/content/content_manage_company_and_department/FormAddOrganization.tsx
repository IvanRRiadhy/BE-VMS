import { Button, Grid2, Alert, Typography, CircularProgress } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { createOrganization } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

//

interface CreateOrganizationRequest {
  name: string;
  code: string;
  host: string;
}

interface FormAddOrganizationProps {
  formData: CreateOrganizationRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateOrganizationRequest>>;
  onSuccess?: () => void;
}

const FormAddOrganization: React.FC<FormAddOrganizationProps> = ({
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

      await createOrganization(formData, token);
      localStorage.removeItem('unsavedOrganizationFormAdd');

      setAlertType('success');
      setAlertMessage('Organization successfully created!');

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
        <Grid2 size={12}>
          <Alert severity={alertType}>{alertMessage}</Alert>
        </Grid2>

        <CustomFormLabel htmlFor="name" sx={{ my: 1, mx: 1 }}>
          <Typography variant="caption">Company Name :</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="name"
          value={formData.name}
          onChange={handleChange}
          error={Boolean(errors.name)}
          helperText={errors.name || 'You have to make sure that the name of this company is true.'}
          fullWidth
          variant="outlined"
        />

        <CustomFormLabel htmlFor="code" sx={{ my: 1, mx: 1 }}>
          <Typography variant="caption">Company Code :</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="code"
          value={formData.code}
          onChange={handleChange}
          error={Boolean(errors.code)}
          helperText={errors.code || 'You have to make sure that the code of this company is true.'}
          fullWidth
          variant="outlined"
        />

        <CustomFormLabel htmlFor="host" sx={{ my: 1, mx: 1 }}>
          <Typography variant="caption">Company Host :</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="host"
          value={formData.host}
          onChange={handleChange}
          error={Boolean(errors.host)}
          helperText={errors.host || 'You have to make sure that the host of this company is true.'}
          fullWidth
          variant="outlined"
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

export default FormAddOrganization;
