import { Button, Grid2, Alert, Typography, CircularProgress } from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';
import { updateDepartment } from 'src/customs/api/admin';
import { Item } from 'src/customs/api/models/Department';
import { useSession } from 'src/customs/contexts/SessionContext';
import Swal from 'sweetalert2';

interface FormUpdateDepartmentProps {
  data: Item | null;
  onSuccess?: () => void;
}

const FormUpdateDepartment: React.FC<FormUpdateDepartmentProps> = ({ data, onSuccess }) => {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (data) {
      setName(data.name || '');
      setHost(data.host || '');
      setCode(data.code || '');
    }
  }, [data]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { token } = useSession();
  const [loading, setLoading] = React.useState(false);

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

      await updateDepartment(
        data.id,
        {
          name,
          host,
          code,
        },
        token,
      );

      setAlertType('success');
      setAlertMessage('Department updated successfully.');

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

  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 size={{ xs: 12, sm: 12 }}>
          <Alert severity={alertType}>{alertMessage}</Alert>
        </Grid2>

        {/* Name */}
        <CustomFormLabel htmlFor="name" sx={{ my: 1, mx: 1 }}>
          <Typography variant="caption">Department Name</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          error={Boolean(errors.name)}
          helperText={
            errors.name || 'You have to make sure that the name of this department is true.'
          }
          variant="outlined"
          fullWidth
        />

        {/* Host */}
        <CustomFormLabel htmlFor="host" sx={{ my: 1, mx: 1 }}>
          <Typography variant="caption">Department Host</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="host"
          value={host}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHost(e.target.value)}
          error={Boolean(errors.host)}
          helperText={
            errors.host || 'You have to make sure that the host of this department is true.'
          }
          variant="outlined"
          fullWidth
        />

        {/* Code */}
        <CustomFormLabel htmlFor="code" sx={{ my: 1, mx: 1 }}>
          <Typography variant="caption">Department Code</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="code"
          value={code}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
          error={Boolean(errors.code)}
          helperText={
            errors.code || 'You have to make sure that the code of this department is true.'
          }
          variant="outlined"
          fullWidth
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

export default FormUpdateDepartment;
