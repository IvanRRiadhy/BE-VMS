import React, { useEffect, useMemo, useState } from 'react';
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
import { createUser, getAllUserGroup, updateUser } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Autocomplete, TextField } from '@mui/material';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import { showSwal } from 'src/customs/components/alerts/alerts';

interface FormUserProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  edittingId?: string;
  onSuccess?: () => void;
  regsiteredSiteOptions?: any;
  organizationSiteOptions?: any;
  accessOptions?: any;
  siteOptions?: any;
  organizationRes?: any;
}

const FormUser: React.FC<FormUserProps> = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
  organizationRes,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [employeeRes, setEmployeeRes] = useState<any[]>([]);
  const [userGroup, setUserGroup] = useState<any[]>([]);
  const { token } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllUserGroup(token as string);
        setUserGroup(res?.collection ?? []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  // const groupOptions = Object.entries(GroupRoleId).map(([key, value]) => ({
  //   id: value.toLowerCase(), // ⬅ normalize ke lowercase
  //   label: key.replace(/([A-Z])/g, ' $1'),
  // }));

  const groupOptions = useMemo(() => {
    return userGroup.map((g: any) => ({
      id: g.id,
      label: g.name,
    }));
  }, [userGroup]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!token) {
        return;
      }

      const { application_id, ...payload } = formData;

      if (edittingId) {
        await updateUser(token, edittingId, payload);
      } else {
        await createUser(token, payload);
      }

      showSwal('success', edittingId ? 'User successfully updated!' : 'User successfully created!');
      setTimeout(() => {
        onSuccess?.();
      }, 600);
    } catch (err: any) {
      if (err?.errors) setErrors(err.errors);
      showSwal('error', 'Something went wrong. Please try again later.');
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  useEffect(() => {
    if (organizationRes.length > 0 && formData.organization_id) {
      const foundOrg = organizationRes.find((o: any) => o.id === formData.organization_id);
      if (foundOrg) {
        setFormData((prev: any) => ({ ...prev, organization_id: foundOrg.id }));
      }
    }
  }, [organizationRes, employeeRes]);

  const handleGroupChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      user_group_id: value,
    }));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2} sx={{ mb: 2 }}>
          <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="fullname" sx={{ mt: 0.5 }}>
              Full Name
            </CustomFormLabel>
            <CustomTextField
              id="fullname"
              value={formData.fullname || ''}
              onChange={handleChange}
              error={Boolean(errors.fullname)}
              helperText={errors.fullname ?? ''}
              fullWidth
              placeholder="Enter your fullname"
              // required
              disabled={loading}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="username" sx={{ mt: 0.5 }}>
              Username
            </CustomFormLabel>
            <CustomTextField
              id="username"
              value={formData.username || ''}
              onChange={handleChange}
              error={Boolean(errors.username)}
              helperText={errors.username ?? ''}
              placeholder="Enter your username"
              fullWidth
              // required
              disabled={loading}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="organization_id" sx={{ mt: 0.5 }}>
              Organization
            </CustomFormLabel>
            <Autocomplete
              options={organizationRes}
              getOptionLabel={(option: any) => option.name || ''}
              value={
                organizationRes.find((o: any) => o.id === formData.organization_id) ??
                (formData.organization_id ? { id: formData.organization_id, name: '' } : null)
              }
              onChange={(_, newValue) =>
                setFormData((prev: any) => ({
                  ...prev,
                  organization_id: newValue ? newValue.id : '',
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(errors.organization_id)}
                  helperText={errors.organization_id ?? ''}
                  placeholder="Select organization"
                  fullWidth
                  // required
                  disabled={loading}
                />
              )}
            />
          </Grid2>

          {/* GROUP */}
          {/* <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="user_group_id" sx={{ mt: 0.5 }}>
              Group
            </CustomFormLabel>

            <CustomTextField
              id="user_group_id"
              select
              value={formData.user_group_id || ''}
              onChange={(e) => handleGroupChange(e.target.value)}
              error={Boolean(errors.user_group_id)}
              helperText={errors.user_group_id ?? ''}
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
          </Grid2> */}

          <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="user_group_id" sx={{ mt: 0.5 }}>
              Group
            </CustomFormLabel>

            <CustomTextField
              id="user_group_id"
              select
              value={formData.user_group_id ?? ''}
              onChange={(e) => handleGroupChange(e.target.value)}
              error={Boolean(errors.user_group_id)}
              helperText={errors.user_group_id ?? ''}
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

          {!edittingId && (
            <Grid2 size={{ xs: 12, lg: 6 }}>
              <CustomFormLabel htmlFor="email" sx={{ mt: 0.5 }}>
                Email
              </CustomFormLabel>
              <CustomTextField
                id="email"
                value={formData.email || ''}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email ?? ''}
                fullWidth
                placeholder="Enter your email"
                // required
                disabled={loading}
              />
            </Grid2>
          )}

          {edittingId && (
            <Grid2 size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="email" sx={{ mt: 0.5 }}>
                Email
              </CustomFormLabel>
              <CustomTextField
                id="email"
                value={formData.email || ''}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email ?? ''}
                fullWidth
                // required
                disabled={loading}
              />
            </Grid2>
          )}

          {!edittingId && (
            <Grid2 size={{ xs: 12, lg: 6 }}>
              <CustomFormLabel htmlFor="password" sx={{ mt: 0.5 }}>
                Password
              </CustomFormLabel>
              <CustomTextField
                id="password"
                type="password"
                value={formData.password || ''}
                onChange={handleChange}
                error={Boolean(errors.password)}
                helperText={errors.password ?? ''}
                fullWidth
                placeholder="Enter your password"
                // required
                disabled={loading}
              />
            </Grid2>
          )}

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
                {loading ? 'Submit' : 'Submit'}
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
            zIndex: 999999,
          }}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </>
  );
};

export default FormUser;
