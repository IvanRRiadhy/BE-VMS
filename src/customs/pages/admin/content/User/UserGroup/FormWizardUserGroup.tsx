import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Grid2,
  Alert,
  CircularProgress,
  Portal,
  Backdrop,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { Box } from '@mui/system';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { createUserGroup, updateUserGroup } from 'src/customs/api/admin';


import { showSwal } from 'src/customs/components/alerts/alerts';
interface FormWizardUserGroupProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  edittingId?: string;
  onSuccess?: () => void;
  onDirtyChange?: any;
}

const FormWizardUserGroup: React.FC<FormWizardUserGroupProps> = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
  onDirtyChange,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const RoleAccess = ['Admin', 'OperatorAdmin', 'OperatorVMS', 'Employee', 'Manager', 'Visitor'];
  const groupOptions = RoleAccess.map((role) => ({
    id: role,
    label: role.replace(/([a-z])([A-Z])/g, '$1 $2').trim(),
  }));

  const initialRef = useRef(formData);

  const isDirty = useMemo(() => {
    return JSON.stringify(initialRef.current) !== JSON.stringify(formData);
  }, [formData]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      
      const payload = {
        name: formData.name,
        description: formData.description,
        homepage: formData.homepage,
        role_access: formData.role_access,
      };
      if (edittingId) {
        await updateUserGroup( edittingId, payload);
      } else {
        await createUserGroup (payload);
      }

      showSwal('success', edittingId ? 'User successfully updated!' : 'User successfully created!');

      onSuccess?.();
    } catch (err: any) {
      if (err?.errors) setErrors(err.errors);
      showSwal('error', 'Failed to create user group');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      role_access: value,
      permissions: [],
    }));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2} sx={{ mb: 2 }}>
          <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="name" sx={{ mt: 0.5 }}>
              Name
            </CustomFormLabel>
            <CustomTextField
              id="name"
              value={formData.name || ''}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name ?? ''}
              placeholder="Enter your name"
              fullWidth
              // required
              disabled={loading}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="homepage" sx={{ mt: 0.5 }}>
              Homepage
            </CustomFormLabel>
            <CustomTextField
              id="homepage"
              value={formData.homepage || ''}
              onChange={handleChange}
              error={Boolean(errors.homepage)}
              helperText={errors.homepage ?? ''}
              fullWidth
              placeholder="/homepage"
              // required
              disabled={loading}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 12 }}>
            <CustomFormLabel htmlFor="role_access" sx={{ mt: 0.5 }}>
              Role Access
            </CustomFormLabel>

            <CustomTextField
              id="role_access"
              select
              value={formData.role_access || ''}
              onChange={(e) => handleGroupChange(e.target.value)}
              error={Boolean(errors.role_access)}
              helperText={errors.role_access ?? ''}
              fullWidth
            >
              <MenuItem value="" disabled>
                Select Group
              </MenuItem>

              {groupOptions.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.label}
                </MenuItem>
              ))}
            </CustomTextField>
          </Grid2>

          <Grid2 size={12}>
            <CustomFormLabel htmlFor="description" sx={{ mt: 0.5 }}>
              Description
            </CustomFormLabel>
            <CustomTextField
              id="description"
              value={formData.description || ''}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description ?? ''}
              fullWidth
              multiline
              rows={3}
              placeholder="Enter your description"
              disabled={loading}
            />
          </Grid2>

          <Grid2 size={12}>
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Button color="primary" variant="contained" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Submit'}
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </form>

      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            zIndex: 99999,
            position: 'fixed',
            top: 20,
            left: 0,
            right: 0,
            margin: '0 auto',
            maxWidth: 500,
          }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarType}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Portal>
      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: (t) => 999999,
          }}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </>
  );
};

export default FormWizardUserGroup;
