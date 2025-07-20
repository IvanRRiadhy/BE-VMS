import { Button, Grid2, Alert, Typography, CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { Item } from 'src/customs/api/models/Organization';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Box } from '@mui/system';
import { updateOrganization } from 'src/customs/api/admin';

interface FormUpdateOrganizationProps {
  data: Item | null;
  onSuccess?: () => void;
}

const FormUpdateOrganization: React.FC<FormUpdateOrganizationProps> = ({ data, onSuccess }) => {
  const [state, setState] = React.useState({
    checkedB: false,
  });
  const [name, setName] = useState('');
  // const [host, setHost] = useState('');
  const [code, setCode] = useState('');

  const { token } = useSession();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (data) {
      setName(data.name || '');
      // setHost(data.host || '');
      setCode(data.code || '');
    }
  }, [data]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

      await updateOrganization(
        data.id,
        {
          name,
          // host,
          code,
        },
        token,
      );

      setAlertType('success');
      setAlertMessage('Organization updated successfully.');

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
      setTimeout(() => {
        setLoading(false);
      }, 800);
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
        <CustomFormLabel
          sx={{
            marginY: 1,
            marginX: 1,
          }}
          htmlFor="company-name"
        >
          <Typography variant="caption">Organization Name</Typography>
        </CustomFormLabel>
        <CustomTextField
          id="name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          error={Boolean(errors.name)}
          helperText={
            errors.name || 'You have to make sure that the name of this organization is true.'
          }
          variant="outlined"
          fullWidth
        />

        {/* <CustomFormLabel
        sx={{
          marginY: 1,
          marginX: 1,
        }}
        htmlFor="company-host"
      >
        <Typography variant="caption">Company Host</Typography>
      </CustomFormLabel>
      <CustomTextField
        id="company-host"
        helperText="You have to make sure that the host of this company is true."
        variant="outlined"
        fullWidth
      /> */}

        <CustomFormLabel
          sx={{
            marginY: 1,
            marginX: 1,
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
          helperText={
            errors.code || 'You have to make sure that the code of this organization is true.'
          }
          variant="outlined"
          fullWidth
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

export default FormUpdateOrganization;
