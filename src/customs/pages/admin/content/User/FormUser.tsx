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
  getAllAccessControl,
  getAllOrganizations,
  getAllSite,
  getAllUserGroup,
  getRegisteredSite,
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
import { showSwal } from 'src/customs/components/alerts/alerts';
import { IconTrash } from '@tabler/icons-react';
import PermissionSection from './PermissionSection';

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
  organizationSiteOptions,
  regsiteredSiteOptions,
  accessOptions,
  siteOptions,
  organizationRes,
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
  const groupOptions = Object.entries(GroupRoleId).map(([key, value]) => ({
    id: value,
    label: key.replace(/([A-Z])/g, ' $1'),
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
        await updateUser(token, edittingId, formData);
      } else {
        await createUser(token, formData);
      }

      // await handleSubmitPermission(formData.group_id, formData.permissions ?? []);

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

    if (employeeRes.length > 0 && formData.employee_id) {
      const foundEmp = employeeRes.find((e) => e.id === formData.employee_id);
      if (foundEmp) {
        setFormData((prev: any) => ({ ...prev, employee_id: foundEmp.id }));
      }
    }
  }, [organizationRes, employeeRes]);

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
      group_id: value,
      permissions: [],
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

  const getDropdownOptions = (perm: string) => {
    switch (perm) {
      case 'ManageSite':
        return siteOptions;
      case 'InviteWithinOwnOrganization':
        return organizationSiteOptions;
      case 'InviteWithinOwnSite':
        return siteOptions;
      case 'ManageAccess':
        return accessOptions;
      case 'ManageRegisterSite':
        return regsiteredSiteOptions;
      default:
        return [];
    }
  };

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
          <Grid2 size={{ xs: 12, lg: 6 }}>
            <CustomFormLabel htmlFor="group_id" sx={{ mt: 0.5 }}>
              Group
            </CustomFormLabel>

            <CustomTextField
              id="group_id"
              select
              value={formData.group_id || ''}
              onChange={(e) => handleGroupChange(e.target.value)}
              error={Boolean(errors.group_id)}
              helperText={errors.group_id ?? ''}
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
{/* 
          {formData.group_id && (
            <Grid2 size={{ xs: 12 }}>
              <CustomFormLabel sx={{ mt: 0.5 }}>Permissions</CustomFormLabel>

              <Grid2 container spacing={2}>
                {(GROUP_PERMISSION_MAP[formData.group_id] ?? []).map((perm) => {
                  const checked = formData.permissions?.includes(perm);

                  return (
                    <Grid2
                      size={
                        perm === 'ManageAccess' || perm === 'ManageRegisterSite'
                          ? { xs: 12 }
                          : { xs: 12, md: 6 }
                      }
                      key={perm}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={checked}
                              onChange={(e) => {
                                const isChecked = e.target.checked;

                                setFormData((prev: any) => ({
                                  ...prev,
                                  permissions: isChecked
                                    ? [...(prev.permissions ?? []), perm]
                                    : (prev.permissions ?? []).filter((p: any) => p !== perm),
                                }));
                                if (!isChecked) {
                                  setPermissionSites((prev) => ({
                                    ...prev,
                                    [perm]: [],
                                  }));
                                }
                              }}
                            />
                          }
                          label={formatPermissionLabel(perm)}
                          sx={{
                            m: 0,
                            '.MuiFormControlLabel-label': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                        {checked && perm === 'ManageAccess' && (
                          <TableContainer component={Paper} sx={{ mt: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Access</TableCell>
                                  <TableCell align="center">Can Grant</TableCell>
                                  <TableCell align="center">Can Revoke</TableCell>
                                  <TableCell align="center">Can Block</TableCell>
                                  <TableCell align="center">Action</TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {selectedAccess.map((row, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <FormControl size="small" fullWidth>
                                        <Select
                                          value={row.access_control_id}
                                          onChange={(e) => {
                                            const value = e.target.value as string;
                                            setSelectedAccess((prev) =>
                                              prev.map((r, i) =>
                                                i === index
                                                  ? {
                                                      ...r,
                                                      access_control_id: value,
                                                      access_control_name:
                                                        acessData.find((a) => a.id === value)
                                                          ?.name ?? '',
                                                    }
                                                  : r,
                                              ),
                                            );
                                          }}
                                        >
                                          {acessData.map((a) => (
                                            <MenuItem
                                              key={a.id}
                                              value={a.id}
                                              disabled={selectedAccess.some(
                                                (x, i) =>
                                                  x.access_control_id === a.id && i !== index,
                                              )}
                                            >
                                              {a.name}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </TableCell>

                                    <TableCell align="center">
                                      <Switch
                                        checked={row.can_grant ?? false}
                                        onChange={(e) => {
                                          const checked = e.target.checked;

                                          setSelectedAccess((prev) =>
                                            prev.map((r, i) =>
                                              i === index
                                                ? {
                                                    ...r,
                                                    can_grant: checked,
                                                  }
                                                : r,
                                            ),
                                          );
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell align="center">
                                      <Switch
                                        checked={row.can_revoke ?? false}
                                        onChange={(e) => {
                                          const checked = e.target.checked;

                                          setSelectedAccess((prev) =>
                                            prev.map((r, i) =>
                                              i === index
                                                ? {
                                                    ...r,
                                                    can_revoke: checked,
                                                  }
                                                : r,
                                            ),
                                          );
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell align="center">
                                      <Switch
                                        checked={row.can_block ?? false}
                                        onChange={(e) => {
                                          const checked = e.target.checked;

                                          setSelectedAccess((prev) =>
                                            prev.map((r, i) =>
                                              i === index
                                                ? {
                                                    ...r,
                                                    can_block: checked,
                                                  }
                                                : r,
                                            ),
                                          );
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell align="center">
                                      <IconButton
                                        color="error"
                                        onClick={() => {
                                          setSelectedAccess((prev) => {
                                            const removed = prev[index];

                                            if (removed?.id) {
                                              setDeletedAccessIds((ids) => [...ids, removed.id]);
                                            }

                                            return prev.filter((_, i) => i !== index);
                                          });
                                        }}
                                      >
                                        <IconTrash size={18} />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}

                                {selectedAccess.length === 0 && (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      align="center"
                                      sx={{ color: 'text.secondary' }}
                                    >
                                      No access added yet
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>

                            <Box sx={{ p: 2 }}>
                              <Button variant="contained" onClick={handleAddNewAccess}>
                                Add New
                              </Button>
                            </Box>
                          </TableContainer>
                        )}

                        {checked && perm === 'ManageRegisterSite' && (
                          <TableContainer component={Paper} sx={{ mt: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Site</TableCell>
                                  <TableCell align="center">Can Confirmation Arrival</TableCell>
                                  <TableCell align="center">Can Extend Period</TableCell>
                                  <TableCell align="center">Can Extend Visit</TableCell>
                                  <TableCell align="center">Action</TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {selectedAccess.map((row, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <FormControl size="small" fullWidth>
                                        <Select
                                          value={row.access_control_id}
                                          onChange={(e) => {
                                            const value = e.target.value as string;
                                            setSelectedAccess((prev) =>
                                              prev.map((r, i) =>
                                                i === index
                                                  ? {
                                                      ...r,
                                                      access_control_id: value,
                                                      access_control_name:
                                                        acessData.find((a) => a.id === value)
                                                          ?.name ?? '',
                                                    }
                                                  : r,
                                              ),
                                            );
                                          }}
                                        >
                                          {acessData.map((a) => (
                                            <MenuItem
                                              key={a.id}
                                              value={a.id}
                                              disabled={selectedAccess.some(
                                                (x, i) =>
                                                  x.access_control_id === a.id && i !== index,
                                              )}
                                            >
                                              {a.name}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </TableCell>

                                    <TableCell align="center">
                                      <Switch
                                        checked={row.can_grant ?? false}
                                        onChange={(e) => {
                                          const checked = e.target.checked;

                                          setSelectedAccess((prev) =>
                                            prev.map((r, i) =>
                                              i === index
                                                ? {
                                                    ...r,
                                                    can_grant: checked,
                                                  }
                                                : r,
                                            ),
                                          );
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell align="center">
                                      <Switch
                                        checked={row.can_revoke ?? false}
                                        onChange={(e) => {
                                          const checked = e.target.checked;

                                          setSelectedAccess((prev) =>
                                            prev.map((r, i) =>
                                              i === index
                                                ? {
                                                    ...r,
                                                    can_revoke: checked,
                                                  }
                                                : r,
                                            ),
                                          );
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell align="center">
                                      <Switch
                                        checked={row.can_block ?? false}
                                        onChange={(e) => {
                                          const checked = e.target.checked;

                                          setSelectedAccess((prev) =>
                                            prev.map((r, i) =>
                                              i === index
                                                ? {
                                                    ...r,
                                                    can_block: checked,
                                                  }
                                                : r,
                                            ),
                                          );
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell align="center">
                                      <IconButton
                                        color="error"
                                        onClick={() => {
                                          setSelectedAccess((prev) => {
                                            const removed = prev[index];

                                            if (removed?.id) {
                                              setDeletedAccessIds((ids) => [...ids, removed.id]);
                                            }

                                            return prev.filter((_, i) => i !== index);
                                          });
                                        }}
                                      >
                                        <IconTrash size={18} />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}

                                {selectedAccess.length === 0 && (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      align="center"
                                      sx={{ color: 'text.secondary' }}
                                    >
                                      No access added yet
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>

                            <Box sx={{ p: 2 }}>
                              <Button variant="contained" onClick={handleAddNewAccess}>
                                Add New
                              </Button>
                            </Box>
                          </TableContainer>
                        )}

                        {checked &&
                          perm !== 'ManageAccess' &&
                          perm !== 'ManageRegisterSite' &&
                          PERMISSION_NEED_SITE.includes(perm) && (
                            <Autocomplete
                              multiple
                              options={getDropdownOptions(perm)}
                              getOptionLabel={(option: any) => option.name || ''}
                              value={getDropdownOptions(perm).filter((opt: any) =>
                                (permissionSites[perm] ?? []).includes(opt.id),
                              )}
                              onChange={(_, newValues) => {
                                setPermissionSites((prev) => ({
                                  ...prev,
                                  [perm]: newValues.map((v: any) => v.id),
                                }));
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select values"
                                  size="small"
                                  sx={{ mt: 1, ml: 2 }}
                                  fullWidth
                                />
                              )}
                            />
                          )}
                      </Box>
                    </Grid2>
                  );
                })}
              </Grid2>
            </Grid2>
            // <PermissionSection
            //   groupId={formData.group_id}
            //   permissions={formData.permissions ?? []}
            //   setPermissions={(newPermissions) =>
            //     setFormData((prev: any) => ({
            //       ...prev,
            //       permissions: newPermissions,
            //     }))
            //   }
            //   siteOptions={siteOptions}
            //   organizationSiteOptions={organizationSiteOptions}
            //   regsiteredSiteOptions={regsiteredSiteOptions}
            //   accessOptions={accessOptions}
            // />
          )} */}

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

export default FormUser;
