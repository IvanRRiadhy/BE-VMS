import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  Box,
  Grid2 as Grid,
  Paper,
  Tab,
  Tabs,
  Card,
  Skeleton,
  CircularProgress,
  Backdrop,
  Portal,
  Typography,
  Button,
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TableContainer,
  TableHead,
  Table,
  TableRow,
  TableCell,
  FormControl,
  Select,
  Switch,
  TableBody,
  MenuItem,
} from '@mui/material';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import Container from 'src/components/container/PageContainer';
import { IconBrandGmail, IconSettingsFilled, IconTrash, IconX } from '@tabler/icons-react';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Item } from 'src/customs/api/models/Admin/Setting';
import {
  createOperatorSettingGiveAccess,
  createOperatorSettingRegiterSite,
  createOperatorSiteAccess,
  deleteOperatorSettingGiveAccess,
  getAccessControl,
  getAllAccessControl,
  getAllOrganizations,
  getAllSite,
  getAllUserOperatorVms,
  getOperatorSettingGiveAccessById,
  getOperatorSettingRegiterSiteById,
  getOperatorSiteAccessById,
  getSetting,
  updateSetting,
} from 'src/customs/api/admin';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
  showSwal,
} from 'src/customs/components/alerts/alerts';

import FormSetting from './FormSetting';
import FormSettingRegisteredSite from './FormSettingRegisteredSite';
import { access } from 'fs';
import { id } from 'date-fns/locale';
import { create } from 'lodash';
// import FormSettingSmtp from './FormSettingSmtp';
// import FormSendTestEmail from './FormSendTestEmail';

type SettingSMTPRow = {
  id: number;
  organization_id: string;
};
interface RegisteredSite {
  id?: string;
  user_id?: string | null;
  site_id?: string | null;
  can_confirmation_arrival?: boolean;
  can_extend_period?: boolean;
  can_extend_visit?: boolean;
}

const Content = () => {
  const { token } = useSession();

  // Table states
  const [settingData, setSettingData] = useState<any[]>([]);
  const [operatorSettingData, setOperatorSettingData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<SettingSMTPRow[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form state
  const initialFormData: Item = {
    id: '',
    organization_id: '',
  };

  const [formData, setFormData] = useState<Item>(() => initialFormData);
  const [formDataRegisteredSite, setFormDataRegisteredSite] = useState({
    id: '',
    user_id: '',
    site_id: '',
    can_confirmation_arrival: false,
    can_extend_period: false,
    can_extend_visit: false,
  });

  const [showForm, setShowForm] = useState(false);
  // Tambah di atas return()
  const [busyId, setBusyId] = useState<string | number | null>(null);
  // UI states
  const [loading, setLoading] = useState(false);

  const [loadingData, setLoadingData] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const cards = [
    {
      title: 'Total Visitor Setting',
      subTitle: `${settingData.length ?? 0}`,
      subTitleSetting: 10,
      icon: IconSettingsFilled,
      color: 'none',
    },
    {
      title: 'Total Operator Setting',
      subTitle: `${operatorSettingData.length ?? 0}`,
      subTitleSetting: 10,
      icon: IconSettingsFilled,
      color: 'none',
    },
  ];

  const handleSubmit = async () => {
    try {
      // const validated = CreateSettingSmtpSchema.parse(data);

      if (edittingId) {
        await updateSetting(token as string, edittingId, formData);
        // showSuccessAlert('Success!', 'Setting updated.');
        showSwal('success', 'Setting updated successfully!');
      }

      setRefreshTrigger((p) => p + 1); // refresh table
      setShowForm(false); // kembali ke tabel
      setEdittingId(''); // reset state edit
    } catch (error: any) {
      console.error(error);
      showErrorAlert('Error!', error.message);
    }
  };

  const handleSubmitRegisteredSite = async (data: any) => {
    try {
      const payload = {
        // id: data.id,
        user_id: edittingId,
        site_id: data.site_id,
        can_confirmation_arrival: !!data.can_confirmation_arrival,
        can_extend_period: !!data.can_extend_period,
        can_extend_visit: !!data.can_extend_visit,
      };

      console.log('payload', payload);

      await createOperatorSettingRegiterSite(token as string, payload, edittingId);
      showSwal('success', 'Successfully updated registered site.');
      setRefreshTrigger((p) => p + 1);
      setShowForm(false);
      setEdittingId('');
    } catch (error: any) {
      console.error(error);
      // showErrorAlert('Error!', error.message);
      showSwal('error', error.message);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };
  const normalizeSetting = (raw: any) => ({
    id: raw.id,
    // organization_id: raw.organization_id,
    organization_name: raw.organization?.name ?? '-', // ambil nama
  });

  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    const fetchData = async () => {
      try {
        const resSetting = await getSetting(token as string);
        const resOrgs = await getAllOrganizations(token as string);

        const orgs = resOrgs.collection ?? [];
        setOrganizations(orgs);

        let raw = resSetting.collection;
        let data: any[] = [];

        if (Array.isArray(raw)) {
          data = raw;
        } else if (raw) {
          data = [raw];
        }

        // enrich data dengan nama organisasi
        const enriched = data.map((item) => {
          const org = orgs.find((o: any) => o.id === item.organization_id);
          return {
            id: item.id,
            organization_id: item.organization_id,
            organization_name: org?.name ?? '-',
          };
        });

        setSettingData(enriched);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleEdit = (id: number) => {
    const row = settingData.find((x) => x.id === id);
    if (!row) return;
    setEdittingId(id.toString());
    setFormData({ ...row, id: row.id.toString() } as Item);
    setShowForm(true);
  };

  const handleRegisteredSite = async (userId: string) => {
    setEdittingId(userId);

    try {
      const res = await getOperatorSettingRegiterSiteById(token as string, userId);

      // normalisasi response
      const data = res.data.collection[0];
      console.log('data', data);

      if (data) {
        setFormDataRegisteredSite({
          id: data.id ?? '',
          user_id: userId,
          site_id: data.site_id ?? '',
          can_confirmation_arrival: !!data.can_confirmation_arrival,
          can_extend_period: !!data.can_extend_period,
          can_extend_visit: !!data.can_extend_visit,
        });
      } else {
        setFormDataRegisteredSite({
          id: '',
          user_id: userId,
          site_id: '',
          can_confirmation_arrival: false,
          can_extend_period: false,
          can_extend_visit: false,
        });
      }
    } catch (error) {
      // kalau 404 / kosong → create mode
      setFormDataRegisteredSite({
        id: '',
        user_id: userId,
        site_id: '',
        can_confirmation_arrival: false,
        can_extend_period: false,
        can_extend_visit: false,
      });
    }

    setShowForm(true);
  };

  const [openGiveAccess, setOpenGiveAccess] = useState(false);
  const [openSiteAccess, setOpenSiteAccess] = useState(false);

  const [acessData, setAcessData] = useState<any[]>([]);
  const [siteAccessData, setSiteAccessData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllAccessControl(token as string);
      const resMapp = res.collection.map((item: any) => ({
        id: item.id,
        name: item.name,
      }));
      setAcessData(resMapp ?? []);
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllSite(token as string);
      const resMapp = res.collection.map((item: any) => ({
        id: item.id,
        name: item.name,
      }));
      setSiteAccessData(resMapp ?? []);
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllUserOperatorVms(token as string);
      const resMapp = res.collection.map((item: any) => ({
        id: item.id,
        fullname: item.fullname,
        username: item.username,
        email: item.email,
        group_name: item.group_name,
      }));
      setOperatorSettingData(resMapp ?? []);
    };

    fetchData();
  }, [token]);

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
      setOpenGiveAccess(false);
    } catch (error: any) {
      console.error(error);
      showSwal('error', error.message);
    }
  };

  const handleSubmitSiteAccess = async () => {
    try {
      const payload = {
        data: selectedSiteAccess.map((row) => ({
          user_id: edittingId,
          site_id: row.site_id,
        })),
      };
      console.log('payload', payload);
      await createOperatorSiteAccess(token as string, payload, edittingId);
      showSwal('success', 'Save site access successfully');
      setOpenSiteAccess(false);
    } catch (error: any) {
      console.error(error);
      showSwal('error', error.message);
    }
  };

  const handleOpenGiveAccess = async (userId: string) => {
    setEdittingId(userId);
    setDeletedAccessIds([]);

    try {
      const res = await getOperatorSettingGiveAccessById(token as string, userId);
      const rows = res.data.collection ?? [];

      setSelectedAccess(
        rows.map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          access_control_id: r.access_control_id,
          access_control_name: r.access_control?.name ?? '',
          can_grant: !!r.can_grant,
          can_revoke: !!r.can_revoke,
          can_block: !!r.can_block,
        })),
      );
    } catch {
      setSelectedAccess([]);
    }

    setOpenGiveAccess(true);
  };

  const [selectedAccess, setSelectedAccess] = useState<any[]>([]);
  const [selectedSiteAccess, setSelectedSiteAccess] = useState<any[]>([]);
  const [deletedAccessIds, setDeletedAccessIds] = useState<string[]>([]);

  const handleAddNewAccess = () => {
    setSelectedAccess((prev) => [
      ...prev,
      {
        access_control_id: '',
        can_grant: true,
        can_revoke: true,
        can_block: true,
      },
    ]);
  };

  const handleAddSiteAccess = () => {
    setSelectedSiteAccess((prev) => [
      ...prev,
      {
        site_id: '',
      },
    ]);
  };

  const handleSiteAccess = async (userId: string) => {
    setEdittingId(userId);

    try {
      const res = await getOperatorSiteAccessById(token as string, userId);
      const rows = res.data.collection ?? [];

      setSelectedSiteAccess(
        rows.map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          site_id: r.site_id?.toLowerCase(),
        })),
      );
    } catch (error) {
      setSelectedSiteAccess([]);
    }

    setOpenSiteAccess(true);
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Settings" description="Setting Smtp page">
        <Box>
          <Grid size={{ xs: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
          </Grid>

          <Paper sx={{ display: 'flex', minHeight: 400, mt: 2, p: 2, overflowX: 'auto' }}>
            <Tabs
              orientation="vertical"
              value={tabIndex}
              onChange={(_, newValue) => setTabIndex(newValue)}
              sx={{ borderRight: 1, borderColor: 'divider', minWidth: 180 }}
            >
              <Tab label="Visitor Setting" />
              <Tab label="Operator Setting" />
            </Tabs>

            <Box sx={{ flex: 1 }}>
              {tabIndex === 0 ? (
                <Box sx={{ overflowX: 'auto', p: 2, height: '100%' }}>
                  {!showForm ? (
                    <DynamicTable
                      loading={loading}
                      isHavePagination={false}
                      isHaveHeaderTitle={true}
                      titleHeader="Setting"
                      data={settingData.map(({ organization_id, ...rest }) => rest)}
                      isHaveChecked={true}
                      isHaveAction={false}
                      isHaveSearch={false}
                      isHaveFilter={false}
                      isHaveExportPdf={false}
                      isHaveAddData={false}
                      isSelectedType={true}
                      isHaveActionOnlyEdit={true}
                      isNoActionTableHead
                      isHaveHeader={false}
                      // onCheckedChange={setSelectedRows}
                      onEdit={(row) => handleEdit(row.id)}
                      // onDelete={(row) => handleDelete(row.id.toString())}
                      onSearchKeywordChange={setSearchKeyword}
                    />
                  ) : (
                    <FormSetting
                      formData={formData}
                      setFormData={setFormData}
                      editingId={edittingId}
                      onSubmit={handleSubmit}
                      onCancel={handleCancelForm}
                    />
                  )}
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto', p: 2, height: '100%' }}>
                  {!showForm ? (
                    <DynamicTable
                      loading={loading}
                      isHavePagination={false}
                      isHaveHeaderTitle={true}
                      titleHeader="Operator Setting"
                      data={operatorSettingData}
                      isHaveChecked={true}
                      isHaveAction={false}
                      isHaveSearch={false}
                      isHaveFilter={false}
                      isHaveExportPdf={false}
                      isHaveAddData={false}
                      isSelectedType={true}
                      isNoActionTableHead
                      isHaveActionOnlyEdit={false}
                      isHaveHeader={false}
                      isButtonRegisteredSite={true}
                      isButtonGiveAccess={true}
                      isButtonSiteAccess={true}
                      // onCheckedChange={setSelectedRows}
                      onRegisteredSite={(row) => handleRegisteredSite(row.id)}
                      onGiveAccess={(row) => handleOpenGiveAccess(row.id)}
                      onSiteAccess={(row) => handleSiteAccess(row.id)}
                      // onDelete={(row) => handleDelete(row.id.toString())}
                      onSearchKeywordChange={setSearchKeyword}
                    />
                  ) : (
                    <FormSettingRegisteredSite
                      formData={formDataRegisteredSite}
                      setFormData={setFormDataRegisteredSite}
                      editingId={edittingId}
                      onSubmit={handleSubmitRegisteredSite}
                      onCancel={handleCancelForm}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
        <Portal>
          <Backdrop
            open={loadingData}
            sx={{
              color: '#fff',
              zIndex: 999999,
            }}
          >
            <CircularProgress color="primary" />
          </Backdrop>
        </Portal>
      </Container>
      <Dialog
        open={openGiveAccess}
        onClose={() => setOpenGiveAccess(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Give Access</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenGiveAccess(false)}
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
        <DialogContent dividers>
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Access</TableCell>
                  {/* <TableCell align="center">Can Grant</TableCell>
                  <TableCell align="center">Can Revoke</TableCell>
                  <TableCell align="center">Can Block</TableCell> */}
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
                                        acessData.find((a) => a.id === value)?.name ?? '',
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

                    {/* <TableCell align="center">
                      <Switch
                        checked={giveAccessForm.can_grant}
                        onChange={(e) =>
                          setGiveAccessForm((prev) => ({
                            ...prev,
                            can_grant: e.target.checked,
                          }))
                        }
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Switch
                        checked={giveAccessForm.can_revoke}
                        onChange={(e) =>
                          setGiveAccessForm((prev) => ({
                            ...prev,
                            can_revoke: e.target.checked,
                          }))
                        }
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Switch
                        checked={giveAccessForm.can_block}
                        onChange={(e) =>
                          setGiveAccessForm((prev) => ({
                            ...prev,
                            can_block: e.target.checked,
                          }))
                        }
                      />
                    </TableCell> */}

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
                    <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>
                      No access added yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* ADD NEW */}
            <Box sx={{ p: 2 }}>
              <Button variant="contained" onClick={handleAddNewAccess}>
                Add New
              </Button>
            </Box>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenGiveAccess(false)} color="secondary">
            Cancel
          </Button>

          <Button variant="contained" onClick={handleSubmitGiveAccess}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Give Site Access */}
      <Dialog
        open={openSiteAccess}
        onClose={() => setOpenSiteAccess(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Site Access</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenSiteAccess(false)}
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
        <DialogContent dividers>
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Site</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {selectedSiteAccess.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          size="small"
                          fullWidth
                          value={row.site_id}
                          onChange={(e) => {
                            const siteId = e.target.value as string;

                            setSelectedSiteAccess((prev) =>
                              prev.map((r, i) => (i === index ? { ...r, site_id: siteId } : r)),
                            );
                          }}
                        >
                          {siteAccessData.map((site) => (
                            <MenuItem key={site.id} value={site.id.toLowerCase()}>
                              {site.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSelectedSiteAccess((prev) => {
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

                {selectedSiteAccess.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>
                      No site access added yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Box sx={{ p: 2 }}>
              <Button variant="contained" onClick={handleAddSiteAccess}>
                Add New
              </Button>
            </Box>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenSiteAccess(false)} color="secondary">
            Cancel
          </Button>

          <Button variant="contained" onClick={handleSubmitSiteAccess}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Content;
