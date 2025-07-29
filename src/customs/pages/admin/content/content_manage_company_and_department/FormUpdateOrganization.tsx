import {
  Button,
  Grid2,
  Alert,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
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
  // const [host, setHost] = useState('');
  const [code, setCode] = useState('');

  const { token } = useSession();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!isBatchEdit && data) {
      setName(data.name || '');
      setCode(data.code || '');
    }
  }, [data, isBatchEdit]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

      if (isBatchEdit && selectedRows.length > 0) {
        await Promise.all(
          selectedRows
            .filter((item) => item && item.id)
            .map((item) =>
              updateOrganization(
                item.id,
                {
                  name: name || item.name, // gunakan name dari input form
                  code: code || item.code, // gunakan code dari input form (walaupun disabled)
                },
                token,
              ),
            ),
        );

        setAlertType('success');
        setAlertMessage('All organizations updated successfully.');
        setTimeout(() => {
          onSuccess?.();
        }, 900);

        return;
      }

      if (data) {
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
      }
    } catch (error: any) {
      // cek kalau error dari validasi
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
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginX: 1 }}>
          <CustomFormLabel
            sx={{
              marginY: 1,
              marginX: 1,
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
          helperText={errors.code}
          variant="outlined"
          fullWidth
          disabled={isBatchEdit}
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
