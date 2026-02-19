import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Paper,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  Grid2 as Grid,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
} from '@mui/material';
import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import { IconScript, IconTrash, IconUsers } from '@tabler/icons-react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useQuery } from '@tanstack/react-query';
import {
  createPermission,
  deleteUser,
  deleteUserGroup,
  getAllAccessControl,
  getAllOrganizations,
  getAllSite,
  getAllUser,
  getAllUserGroup,
  getRegisteredSite,
  getUserById,
  getUserGroupById,
} from 'src/customs/api/admin';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { CreateUserSchema, Item, UpdateUserSchema } from 'src/customs/api/models/Admin/User';
import FormUser from '../FormUser';
import PageContainer from 'src/customs/components/container/PageContainer';
import { useNavigate } from 'react-router';
import DialogFormUser from '../components/DialogFormUser';
import DialogFormUserGroup from '../components/DialogFormUserGroup';
import { MenuItem } from '@mui/material';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { GroupRoleId } from 'src/constant/GroupRoleId';

const Content = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [edittingId, setEdittingId] = useState('');
  const [openFormAddDocument, setOpenFormAddDocument] = useState(false);
  const [formAddUser, setFormAddUser] = useState<any>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialogSetting, setOpenDialogSetting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangeTab = (event: any, newValue: any) => {
    setTabValue(newValue);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', token, page, rowsPerPage, searchKeyword],
    queryFn: async () => {
      const response = await getAllUserGroup(token as string);

      const filteredData = response.collection.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        homepage: item.homepage,
        level_priority: item.level_priority,
        role_access: item.role_access,
        // status: item.status,
      }));
      const dataForTable = filteredData.map(({ group_id, ...rest }: any) => rest);

      return {
        collection: filteredData,
        tableCollection: dataForTable,
        totalRecords: response.recordsTotal,
        totalFiltered: response.RecordsFiltered,
      };
    },
    enabled: !!token,
  });

  const collection = data?.collection || [];
  const totalRecords = data?.collection.length || 0;

  const cards = [
    {
      title: 'Total User Group',
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      icon: IconUsers,
      color: 'none',
    },
  ];

  const handleAdd = () => {
    setEdittingId('');
    setOpenFormAddDocument(true);
    setFormAddUser(CreateUserSchema.parse({}));
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await getUserGroupById(id, token as string);
      setFormAddUser({
        ...response.collection,
      });
      setEdittingId(id);
      setOpenFormAddDocument(true);
    } catch (error) {
      showSwal('error', 'Failed to load user data for editing.');
    }
  };

  const handleSetting = async (id: string) => {
    try {
      setOpenDialogSetting(true);
    } catch (error) {
      showSwal('error', 'Failed to load user data for editing.');
    }
  };

  const handleCloseDialog = () => setOpenFormAddDocument(false);

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDelete(`Are you sure to delete this user group?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteUserGroup(token as string, id);
      showSwal('success', 'Successfully deleted user group!');
      refetch();
    } catch (error) {
      showSwal('error', 'Failed to delete user group.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const navigate = useNavigate();

  const [siteOptions, setSiteOptions] = useState<any[]>([]);
  const [permissionSites, setPermissionSites] = useState<Record<string, string[]>>({});
  const [regsiteredSiteOptions, setRegisteredSiteOptions] = useState<any[]>([]);
  const [organizationSiteOptions, setOrganizationSiteOptions] = useState<any[]>([]);
  const [accessOptions, setAccessOptions] = useState<any[]>([]);
  const [organizaitonRes, setOrganizaitonRes] = useState<any[]>([]);
  const [acessData, setAcessData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      const siteRes = await getAllSite(token);
      setSiteOptions(siteRes.collection ?? []);

      const orgSites = await getAllOrganizations(token);
      setOrganizationSiteOptions(orgSites.collection ?? []);

      const regSites = await getRegisteredSite(token);
      setRegisteredSiteOptions(regSites.collection ?? []);

      const accessOpts = await getAllAccessControl(token);
      setAccessOptions(accessOpts.collection ?? []);

      const orgRes = await getAllOrganizations(token);
      setOrganizaitonRes(orgRes.collection ?? []);
    };

    fetchData();
  }, [token]);

  const [openPermission, setOpenPermission] = useState(false);

  const handlePermission = async (id: string) => {
    setEdittingId(id);

    try {
      const response = await getUserGroupById(id, token as string);

      //   // misalnya backend kirim permissions: string[]
      //   setActivePermissions(response.collection.permissions ?? []);

      //   setPermissionSites(response.collection.permission_sites ?? {});
      //   setSelectedAccess(response.collection.accesses ?? []);
    } catch (error) {
      showSwal('error', 'Failed to load permission data.');
    }

    setOpenPermission(true);
  };

  const [selectedAccess, setSelectedAccess] = useState<any[]>([]);

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

  const [deletedAccessIds, setDeletedAccessIds] = useState<string[]>([]);

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

  const PERMISSION_NEED_SITE = [
    'OrganizationAssigment',
    'InviteWithinOwnSite',
    // 'ManageSite',
    'ManageOperator',
    'ManageRegisterSite',
    'ManageAccessScope',
  ];

  const getDropdownOptions = (perm: string) => {
    switch (perm) {
      case 'ManageSite':
        return siteOptions;
      case 'OrganizationAssigment':
        return organizationSiteOptions;
      case 'InviteWithinOwnSite':
        return siteOptions;
      case 'ManageAccessScope':
        return accessOptions;
      case 'ManageRegisterSite':
        return regsiteredSiteOptions;
      default:
        return [];
    }
  };

  const GROUP_PERMISSION_MAP: Record<string, string[]> = {
    [GroupRoleId.Employee.toLowerCase()]: [
      'AsHead',
      'InviteVisitor',
      'InviteWithinAllowPreRegister',
      'InviteWithin Own Organization',
      'InviteWithin Own Site',
      'AllowMobileLogin',
      'Allow SSO ActiveDirectory',
      'OrganizationAssigment',
      'SiteAssigment',
    ],

    [GroupRoleId.OperatorVMS.toLowerCase()]: [
      'AsHead',
      'InviteVisitor',
      'InviteWithin Own Organization',
      'InviteWithin Own Site',
      'InviteWithinAllowPreRegister',
      'ManageApprove',
      'OperatorAsWatcher',
      'ManageInvite',
      'ManageVisitor',
      'ManageBlacklist',
      'ManageRegisterSite',
      'ManageAccessScope',
    ],

    [GroupRoleId.Manager.toLowerCase()]: ['ManageApprove'],
  };

  const [formData, setFormData] = useState({
    group_id: '',
    permissions: [] as string[],
    permission_sites: {} as Record<string, string[]>,
    accesses: [] as any[],
    organization: [] as string[],
    deleted_access_ids: [] as string[],
  });

  const handleSubmitPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!token) {
        return;
      }

      console.log('payload submit', formData);

      //   if (edittingId) {
      //     await updateUser(token, edittingId, formData);
      //   } else {
      //     await createUser(token, formData);
      //   }

      await handleSubmitPermissions(formData.permissions ?? []);
      await handleOrganizationnPermission();

      showSwal('success', edittingId ? 'User successfully updated!' : 'User successfully created!');
      //   setTimeout(() => {
      //     onSuccess?.();
      //   }, 600);
    } catch (err: any) {
      //   if (err?.errors) setErrors(err.errors);
      showSwal('error', 'Something went wrong. Please try again later.');
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };
  const handleSubmitPermissions = async (permissions: string[]) => {
    try {
      const payload = permissions.map((perm: string) => ({
        user_group_id: edittingId,
        permission: perm,
      }));

      console.log('Permission', payload);
      // await createPermission(token as string, payload);

      // showSwal('success', 'Successfully create permission');
    } catch (error: any) {
      console.error(error);
      showSwal('error', error.response?.data?.msg ?? 'Failed update permission');
    }
  };

  const handleSitenPermission = async (permissions: string[]) => {
    try {
      const payload = permissions.map((perm: string) => ({
        user_group_id: edittingId,
        site_id: '',
        can_grant: true,
        can_revoke: true,
        can_block: true,
        permission: 'ManageSiteScope',
      }));

      console.log('Permission', payload);
      // await createPermission(token as string, payload);

      // showSwal('success', 'Successfully create permission');
    } catch (error: any) {
      console.error(error);
      showSwal('error', error.response?.data?.msg ?? 'Failed update permission');
    }
  };
  const handleOrganizationnPermission = async () => {
    try {
      if (!formData.organization.length) return;

      const payload = formData.organization.map((orgId: string) => ({
        user_group_id: edittingId,
        organization_id: orgId,
        organization_type: 'Organization',
      }));

      console.log('Organization Payload', payload);

      // await createOrganizationPermission(token as string, payload);
    } catch (error: any) {
      console.error(error);
      showSwal('error', error.response?.data?.msg ?? 'Failed update organization');
    }
  };
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="User" description="User page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>

            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
                overflowX="auto"
                data={collection}
                isHavePagination
                selectedRows={selectedRows}
                isNoActionTableHead={true}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100, 500]}
                onPaginationChange={(newPage, newRowsPerPage) => {
                  setPage(newPage);
                  setRowsPerPage(newRowsPerPage);
                }}
                isHaveChecked
                isHaveAction={true}
                isOperatorSetting={true}
                onNavigatePage={() => {
                  navigate('/admin/settings');
                }}
                isHaveAddData={true}
                isHaveSearch={true}
                isHaveSettingOperator={true}
                onSettingOperator={(row) => handleSetting(row.id)}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onEdit={(row) => handleEdit(row.id)}
                onDelete={(row) => handleDelete(row.id)}
                onAddData={handleAdd}
                isHavePermission={true}
                onPermission={(row) => handlePermission(row.id)}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <DialogFormUserGroup
        open={openFormAddDocument}
        onClose={() => setOpenFormAddDocument(false)}
        edittingId={edittingId}
        onSuccess={() => {
          setOpenFormAddDocument(false);
          refetch();
        }}
      />

      {/* Dialog Setting Operator */}
      <Dialog
        open={openDialogSetting}
        onClose={() => setOpenDialogSetting(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Setting Operator</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpenDialogSetting(false);
          }}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 2 }}>
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={tabValue}
                onChange={handleChangeTab}
                sx={{
                  borderRight: 1,
                  borderColor: 'divider',
                  minHeight: '300px',
                }}
              >
                <Tab label="Registered Site" />
                <Tab label="Give Access" />
                <Tab label="Sites" />
              </Tabs>
            </Grid>

            {/* Bagian kanan: Konten tab */}
            <Grid size={{ xs: 12, md: 10 }}>
              {tabValue === 0 && (
                <Box>
                  <DynamicTable data={[]} isHaveHeaderTitle={true} titleHeader="Registered Site" />
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <DynamicTable data={[]} isHaveHeaderTitle={true} titleHeader="Give Access" />
                </Box>
              )}
              {tabValue === 2 && (
                <Box>
                  <DynamicTable data={[]} isHaveHeaderTitle={true} titleHeader="Sites" />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openPermission}
        onClose={() => setOpenPermission(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Permission</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpenPermission(false);
            setFormData({
              group_id: '',
              permissions: [],
              permission_sites: {},
              accesses: [],
              organization: [],
              deleted_access_ids: [],
            });
          }}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              {(GROUP_PERMISSION_MAP[edittingId] ?? []).map((perm: any) => {
                const checked = formData.permissions?.includes(perm);

                return (
                  <Grid
                    size={
                      perm === 'ManageAccessScope' ||
                      perm === 'ManageRegisterSite' ||
                      perm === 'OrganizationAssigment'
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
                      {checked && perm === 'ManageAccessScope' && (
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
                                                      acessData.find((a) => a.id === value)?.name ??
                                                      '',
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
                                              (x, i) => x.access_control_id === a.id && i !== index,
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

                      {checked && perm === 'OrganizationAssigment' && (
                        <Autocomplete
                          multiple
                          options={organizationSiteOptions}
                          getOptionLabel={(option: any) => option.name || ''}
                          value={organizationSiteOptions.filter((opt: any) =>
                            formData.organization.includes(opt.id),
                          )}
                          onChange={(_, newValues) => {
                            setFormData((prev) => ({
                              ...prev,
                              organization: newValues.map((v: any) => v.id),
                            }));
                          }}
                          renderInput={(params) => (
                            <CustomTextField
                              {...params}
                              placeholder="Select organization"
                              size="small"
                              sx={{ mt: 1, ml: 2 }}
                              fullWidth
                            />
                          )}
                        />
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
                                                      acessData.find((a) => a.id === value)?.name ??
                                                      '',
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
                                              (x, i) => x.access_control_id === a.id && i !== index,
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
                        perm !== 'ManageAccessScope' &&
                        perm !== 'ManageRegisterSite' &&
                        perm !== 'OrganizationAssigment' && (
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
                              <CustomTextField
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
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenPermission(false)}>Cancel</Button>
          <Button
            type="button"
            onClick={handleSubmitPermission}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>You have unsaved changes. Discard them and continue editing?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setConfirmDialogOpen(false);
              if (pendingEditId) handleEdit(pendingEditId);
              setPendingEditId(null);
            }}
            color="primary"
            variant="contained"
          >
            Yes, Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: 999999,
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </PageContainer>
  );
};

export default Content;
