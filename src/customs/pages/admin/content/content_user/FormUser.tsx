import React, { useEffect, useState } from 'react';
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
import {
  createUser,
  getAllOrganizations,
  getVisitorEmployee,
  updateUser,
} from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';
import { CreateUserRequest } from 'src/customs/api/models/Admin/User';
import {
  Autocomplete,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material';
import { GroupRoleId } from 'src/constant/GroupRoleId';

interface FormUserProps {
  formData: CreateUserRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateUserRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
}

const FormUser: React.FC<FormUserProps> = ({ formData, setFormData, edittingId, onSuccess }) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const groupRoles = Object.entries(GroupRoleId).map(([name, id]) => ({
    id,
    name,
  }));
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
        setAlertMessage('Missing token. Please login again.');
        return;
      }

      if (edittingId) {
        await updateUser(token, edittingId, formData);
      } else {
        await createUser(token, formData);
      }

      setAlertType('success');
      setAlertMessage(edittingId ? 'User successfully updated!' : 'User successfully created!');
      setTimeout(() => {
        onSuccess?.();
      }, 600);
    } catch (err: any) {
      setAlertType('error');
      setAlertMessage('Something went wrong. Please try again later.');
      if (err?.errors) setErrors(err.errors);
      setTimeout(() => {
        setAlertType('info');
        setAlertMessage('Complete the following data properly and correctly');
      }, 3000);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const [employeeRes, setEmployeeRes] = useState<any[]>([]);

  const [organizationRes, setOrganizationRes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getVisitorEmployee(token as string);
      const res = await getAllOrganizations(token as string);
      setEmployeeRes(response.collection);
      setOrganizationRes(res.collection);
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (organizationRes.length > 0 && formData.organization_id) {
      const foundOrg = organizationRes.find((o) => o.id === formData.organization_id);
      if (foundOrg) {
        setFormData((prev) => ({ ...prev, organization_id: foundOrg.id }));
      }
    }

    if (employeeRes.length > 0 && formData.employee_id) {
      const foundEmp = employeeRes.find((e) => e.id === formData.employee_id);
      if (foundEmp) {
        setFormData((prev) => ({ ...prev, employee_id: foundEmp.id }));
      }
    }
  }, [organizationRes, employeeRes]);

  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toString(); // pastikan string

    console.log('👉 Dipilih value:', value);

    // jika pilih Employee → tampilkan alert dan hentikan update
    if (value === GroupRoleId.Employee) {
      setSnackbarMsg('Employee must be created in the Employee page.');
      setSnackbarType('info');
      setSnackbarOpen(true);
      return; // hentikan, jadi value tidak berubah
    }

    // lanjut kalau bukan Employee
    handleChange({ target: { id: 'group_id', value } } as any);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2} sx={{ mb: 2 }}>
          <Grid2 size={12} mt={2}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid2>

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
              required
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
              fullWidth
              required
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
                organizationRes.find((o) => o.id === formData.organization_id) ??
                (formData.organization_id ? { id: formData.organization_id, name: '' } : null)
              }
              onChange={(_, newValue) =>
                setFormData((prev) => ({
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
                  required
                  disabled={loading}
                />
              )}
            />
          </Grid2>

          {/* <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="employee_id" sx={{ mt: 0.5 }}>
              Employee
            </CustomFormLabel>
            <Autocomplete
              options={employeeRes}
              getOptionLabel={(option: any) => option.name || ''}
              value={
                employeeRes.find((e) => e.id === formData.employee_id) ??
                (formData.employee_id ? { id: formData.employee_id, name: '' } : null)
              }
              onChange={(_, newValue) =>
                setFormData((prev) => ({
                  ...prev,
                  employee_id: newValue ? newValue.id : '',
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(errors.employee_id)}
                  helperText={errors.employee_id ?? ''}
                  placeholder="Select employee"
                  fullWidth
                  required
                  disabled={loading}
                />
              )}
            />
          </Grid2> */}
          {/* <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="distributor" sx={{ mt: 0.5 }}>
              Distributor
            </CustomFormLabel>
            <CustomTextField
              id="distributor"
              value={formData.distributor_id || ''}
              onChange={handleChange}
              error={Boolean(errors.distributor_id)}
              helperText={errors.distributor_id ?? ''}
              fullWidth
              disabled={loading}
            />
          </Grid2> */}

          <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="group_id" sx={{ mt: 0.5 }}>
              Group
            </CustomFormLabel>
            <CustomTextField
              id="group_id"
              name="group_id"
              select
              value={formData.group_id || ''}
              onChange={handleGroupChange}
              error={Boolean(errors.group_id)}
              helperText={errors.group_id ?? ''}
              fullWidth
              disabled={loading}
            >
              {groupRoles.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </CustomTextField>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="email" sx={{ mt: 0.5 }}>
              Email
            </CustomFormLabel>
            <CustomTextField
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email ?? ''}
              fullWidth
              disabled={loading}
            />
          </Grid2>

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
                required
                disabled={loading}
              />
            </Grid2>
          )}
          {/* <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="is_employee" sx={{ mt: 0.5 }}>
              Is Employee
            </CustomFormLabel>
            <RadioGroup
              row
              name="is_employee"
              value={formData.is_employee?.toString() ?? '0'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_employee: Number(e.target.value),
                }))
              }
            >
              <FormControlLabel value="1" control={<Radio disabled={loading} />} label="Yes" />
              <FormControlLabel value="0" control={<Radio disabled={loading} />} label="No" />
            </RadioGroup>
            {errors.is_employee && <FormHelperText error>{errors.is_employee}</FormHelperText>}
          </Grid2> */}

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
              disabled={loading}
            />
          </Grid2>

          <Grid2 size={12}>
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : undefined}
              >
                Submit
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
            zIndex: (t) => (t.zIndex.snackbar ?? 1400) - 1,
          }}
        >
          <CircularProgress />
        </Backdrop>
      </Portal>
    </>
  );
};

export default FormUser;
