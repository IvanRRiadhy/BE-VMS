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
  Checkbox,
  Switch,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  FormControl,
  Select,
  TableBody,
  IconButton,
  Paper,
} from '@mui/material';
import { Box } from '@mui/system';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import {
  createOperatorSettingGiveAccess,
  createPermission,
  createUser,
  createUserGroup,
  getAllAccessControl,
  getAllOrganizations,
  getAllSite,
  getAllUserGroup,
  getRegisteredSite,
  getVisitorEmployee,
  updateUser,
  updateUserGroup,
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
import { showSwal } from 'src/customs/components/alerts/alerts';
import { IconTrash } from '@tabler/icons-react';
import PermissionSection from '../PermissionSection';

interface FormWizardUserGroupProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  edittingId?: string;
  onSuccess?: () => void;
}

const FormWizardUserGroup: React.FC<FormWizardUserGroupProps> = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [employeeRes, setEmployeeRes] = useState<any[]>([]);
  const [selectedAccess, setSelectedAccess] = useState<any[]>([]);
  const [selectedSiteAccess, setSelectedSiteAccess] = useState<any[]>([]);
  const [deletedAccessIds, setDeletedAccessIds] = useState<string[]>([]);
  // const [siteOptions, setSiteOptions] = useState<any[]>([]);
  const [permissionSites, setPermissionSites] = useState<Record<string, string[]>>({});
  // const [regsiteredSiteOptions, setRegisteredSiteOptions] = useState<any[]>([]);
  // const [organizationSiteOptions, setOrganizationSiteOptions] = useState<any[]>([]);
  // const [accessOptions, setAccessOptions] = useState<any[]>([]);
  const { token } = useSession();

  const RoleAccess = ['Admin', 'OperatorAdmin', 'OperatorVMS', 'Employee', 'Manager', 'Visitor'];
  const groupOptions = RoleAccess.map((role) => ({
    id: role,
    label: role.replace(/([a-z])([A-Z])/g, '$1 $2').trim(),
  }));

  // const [groupOptions, setGroupOptions] = useState<any[]>([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await getAllUserGroup(token as string);
  //     setGroupOptions(res.collection);
  //   };
  //   fetchData();
  // }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSubmitPermission = async (userGroupId: string, permissions: string[]) => {
    try {
      const payload = permissions.map((perm: string) => ({
        user_group_id: userGroupId,
        permission: perm,
      }));

      console.log('payload', payload);
      // await createPermission(token as string, payload);

      // showSwal('success', 'Successfully create permission');
    } catch (error: any) {
      console.error(error);
      showSwal('error', error.response?.data?.msg ?? 'Failed update permission');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!token) {
        return;
      }

      console.log('payload submit', formData);

      if (edittingId) {
        await updateUserGroup(token, edittingId, formData);
      } else {
        await createUserGroup(token, formData);
      }

      // await handleSubmitPermission(formData.group_id, formData.permissions ?? []);

      showSwal('success', edittingId ? 'User successfully updated!' : 'User successfully created!');
      setTimeout(() => {
        onSuccess?.();
      }, 600);
    } catch (err: any) {
      if (err?.errors) setErrors(err.errors);
      showSwal('error', 'Something went wrong');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const GROUP_PERMISSION_MAP: Record<string, string[]> = {
    [GroupRoleId.Employee.toLowerCase()]: [
      'AsHead',
      'InviteVisitor',
      'InviteWithinOwnOrganization',
      'InviteWithinOwnSite',
      'InviteWithinAllowPreRegister',
      'ManageSchedule',
      'ManageApprove',
    ],

    [GroupRoleId.OperatorVMS.toLowerCase()]: [
      'AsHead',
      'InviteVisitor',
      'InviteWithinOwnOrganization',
      'InviteWithinOwnSite',
      'InviteWithinAllowPreRegister',
      'ManageApprove',
      'OperatorAsWatcher',
      'ManageInvite',
      'ManageVisitor',
      'ManageBlacklist',
      'ManageOperator',
      'ManageSite',
      'ManageRegisterSite',
      'ManageAccess',
    ],

    [GroupRoleId.Manager.toLowerCase()]: ['ManageApprove'],
  };

  const formatPermissionLabel = (value: string) => {
    const custom: Record<string, string> = {
      InviteWithinOwnOrganization: 'Invite Within Organization',
      InviteWithinOwnSite: 'Invite Within Site',
      InviteWithinAllowPreRegister: 'Invite Allow Pre Register',
    };

    if (custom[value]) return custom[value];

    return value
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleGroupChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      role_access: value,
    }));

    setPermissionSites({});
  };

  const [acessData, setAcessData] = useState<any[]>([]);

  const PERMISSION_NEED_SITE = [
    'InviteWithinOwnOrganization',
    'InviteWithinOwnSite',
    'ManageSite',
    'ManageOperator',
    'ManageRegisterSite',
    'ManageAccess',
  ];

  //   const getDropdownOptions = (perm: string) => {
  //     switch (perm) {
  //       case 'ManageSite':
  //         return siteOptions;
  //       case 'InviteWithinOwnOrganization':
  //         return organizationSiteOptions;
  //       case 'InviteWithinOwnSite':
  //         return siteOptions;
  //       case 'ManageAccess':
  //         return accessOptions;
  //       case 'ManageRegisterSite':
  //         return regsiteredSiteOptions;
  //       default:
  //         return [];
  //     }
  //   };

  const handleAddNewAccess = () => {
    setSelectedAccess((prev) => [
      ...prev,
      {
        access_control_id: '',
        can_grant: false,
        can_revoke: false,
        can_block: false,
      },
    ]);
  };

  const handleSubmitGiveAccess = async () => {
    try {
      if (!edittingId) {
        showSwal('error', 'User ID not found');
        return;
      }

      const payload = {
        data: selectedAccess.map((row) => ({
          user_id: edittingId,
          access_control_id: row.access_control_id,
          can_grant: true,
          can_revoke: true,
          can_block: true,
        })),
        deleted_ids: deletedAccessIds,
      };

      // console.log('payload', payload);

      await createOperatorSettingGiveAccess(token as string, payload, edittingId);

      showSwal('success', 'Give access successfully');
      // setOpenGiveAccess(false);
    } catch (error: any) {
      console.error(error);
      showSwal('error', error.response.data.msg ?? 'Failed give access');
    }
  };

  // const handleSubmitPermission = async () => {
  //   try {

  //     const res = await createPermission(token as string, {
  //       user_group_id: formData.group_id,
  //       permissions: formData.permissions,
  //     })

  //     console.log('res', res);

  //     showSwal('success', 'Successfully create permission');
  //   } catch (error: any) {
  //     console.error(error);
  //     showSwal('error', error.response.data.msg ?? 'Failed update permission');
  //   }
  // };

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
              Group
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
