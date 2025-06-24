import { Button, Grid2, Alert, Typography, CircularProgress } from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';
import { updateDistrict } from 'src/customs/api/admin';
import { Item } from 'src/customs/api/models/Department';
import { useSession } from 'src/customs/contexts/SessionContext';
import Swal from 'sweetalert2';

interface FormUpdateDistrictProps {
  data: Item | null;
  onSuccess?: () => void;
}

const FormUpdateDistrict: React.FC<FormUpdateDistrictProps> = ({ data, onSuccess }) => {
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

  useEffect(() => {
    if (data) {
      setName(data.name || '');
      setHost(data.host || '');
      setCode(data.code || '');
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrors({});

    try {
      if (!data?.id || !token) {
        setAlertType('error');
        setAlertMessage('Something went wrong. Please try again later.');

        setTimeout(() => {
          setAlertType('info');
          setAlertMessage('Complete the following data properly and correctly');
        }, 3000);
        return;
      }

      await updateDistrict(data.id, { name, host, code }, token);

      setAlertType('success');
      setAlertMessage('District updated successfully.');

      setTimeout(() => {
        onSuccess?.();
      }, 900);
    } catch (error: any) {
      if (error.errors) {
        setErrors(error.errors);
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

        {/* Name */}
        <CustomFormLabel htmlFor="name" sx={{ my: 1, mx: 1 }}>
          <Typography variant="caption">District Name :</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(errors.name)}
          helperText={
            errors.name || 'You have to make sure that the name of this district is true.'
          }
          fullWidth
          variant="outlined"
        />

        {/* Host */}
        <CustomFormLabel htmlFor="host" sx={{ my: 1, mx: 1 }}>
          <Typography variant="caption">District Host :</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="host"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          error={Boolean(errors.host)}
          helperText={
            errors.host || 'You have to make sure that the host of this district is true.'
          }
          fullWidth
          variant="outlined"
        />

        {/* Code */}
        <CustomFormLabel htmlFor="code" sx={{ my: 1, mx: 1 }}>
          <Typography variant="caption">District Code :</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={Boolean(errors.code)}
          helperText={
            errors.code || 'You have to make sure that the code of this district is true.'
          }
          fullWidth
          variant="outlined"
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

export default FormUpdateDistrict;
