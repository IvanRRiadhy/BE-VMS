import { useEffect, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Backdrop,
  Portal,
  useTheme,
  useMediaQuery,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Stack,
  Switch,
  Tooltip,
  Divider,
} from '@mui/material';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import Container from 'src/components/container/PageContainer';
import { IconInfoCircle, IconSettingsFilled } from '@tabler/icons-react';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Item } from 'src/customs/api/models/Admin/Setting';
import ApprovalWorkflow from 'src/customs/pages/admin/content/Approve/content';
import { getAllOrganizations, getSetting, updateSetting } from 'src/customs/api/admin';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';

import FormSetting from './FormSetting';
import { getApprovalWorkflowByDt } from 'src/customs/api/Admin/ApprovalWorkflow';
import VisitorCardSetting from './VisitorCardSetting';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import NotificationSetting from './NotificationSetting';

type SettingSMTPRow = {
  id: number;
  organization_id: string;
};

const Content = () => {
  const [settingData, setSettingData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form state
  const initialFormData: Item = {
    id: '',
    organization_id: '',
  };

  const [formData, setFormData] = useState<Item>(() => initialFormData);

  const [showForm, setShowForm] = useState(false);
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
    // {
    //   title: 'Total Operator Setting',
    //   subTitle: `${operatorSettingData.length ?? 0}`,
    //   subTitleSetting: 10,
    //   icon: IconSettingsFilled,
    //   color: 'none',
    // },
    {
      title: 'Total Approval Workflow',
      subTitle: `${totalRecords ?? 0}`,
      subTitleSetting: 10,
      icon: IconSettingsFilled,
      color: 'none',
    },
    {
      title: 'Total Visitor Card Setting',
      subTitle: `${0}`,
      subTitleSetting: 10,
      icon: IconSettingsFilled,
      color: 'none',
    },
  ];

  const handleSubmit = async () => {
    try {
      // const validated = CreateSettingSmtpSchema.parse(data);
      if (edittingId) {
        await updateSetting(edittingId, formData);
        showSwal('success', 'Setting updated successfully!');
      }

      setRefreshTrigger((p) => p + 1);
      setShowForm(false);
      setEdittingId('');
    } catch (error: any) {
      console.error(error);
      // showErrorAlert('Error!', error.message);
      showSwal('error', error.message || 'Failed to update setting');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        const [settingRes, orgRes] = await Promise.allSettled([
          getSetting(),
          getAllOrganizations(),
        ]);
        let raw: any = null;
        if (settingRes.status === 'fulfilled') {
          raw = settingRes.value.collection;
        }

        let data: any[] = [];
        if (Array.isArray(raw)) {
          data = raw;
        } else if (raw) {
          data = [raw];
        }

        let orgs: any[] = [];
        if (orgRes.status === 'fulfilled') {
          orgs = orgRes.value.collection ?? [];
        }

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
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (id: number) => {
    const row = settingData.find((x) => x.id === id);
    if (!row) return;
    setEdittingId(id.toString());
    setFormData({ ...row, id: row.id.toString() } as Item);
    setShowForm(true);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sortDir, setSortDir] = useState('desc');
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getApprovalWorkflowByDt(start, rowsPerPage, sortDir, search);
        setTableData(response.collection.map(({ conditions, ...rest }: any) => rest));
        setTotalRecords(response.RecordsTotal);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTableData([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, rowsPerPage, sortDir, refreshTrigger, search]);

  const [configuration, setConfiguration] = useState({
    employeeInvitationMode: '',
    visitorInvitationMode: '',
    defaultCredentialMode: '',
    grantAccessWhen: '',
    temporaryAccessBeforeMinutes: '',
    temporaryAccessAfterMinutes: '',
    needHostApproval: false,
    autoCheckout: false,
    autoCheckoutAfterMinutes: '',
  });

  const [initialCardAccessEnabled, setInitialCardAccessEnabled] = useState(false);
  const [giveCardSettingEnabled, setGiveCardSettingEnabled] = useState(false);

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
          <Paper
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              minHeight: 400,
              mt: 2,
              p: 2,
              overflowX: 'auto',
            }}
          >
            <Tabs
              orientation={isMobile ? 'horizontal' : 'vertical'}
              value={tabIndex}
              onChange={(_, newValue) => setTabIndex(newValue)}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
              sx={{
                borderRight: isMobile ? 0 : 1,
                borderBottom: isMobile ? 1 : 0,
                borderColor: 'divider',
                minWidth: isMobile ? '100%' : 180,
              }}
            >
              <Tab label="Configuration" />
              <Tab label="Visitor Setting" />
              <Tab label="Approval Workflow" />
              {/* <Tab label="Visitor Card Setting" /> */}
              <Tab label="Notification Setting" />
            </Tabs>

            <Box
              sx={{
                flex: 1,
                mt: isMobile ? 2 : 0,
              }}
            >
              {/* vms configuration */}
              {tabIndex === 0 && (
                <Box sx={{ p: { xs: 1, md: 3 } }}>
                  <Grid container spacing={3}>
                    {/* Employee */}
                    <Grid size={12}>
                      <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          Employee Configuration
                        </Typography>

                        <FormControl fullWidth>
                          <InputLabel>Invitation Mode</InputLabel>
                          <Select
                            label="Invitation Mode"
                            value={configuration.employeeInvitationMode}
                            onChange={(e) =>
                              setConfiguration((prev) => ({
                                ...prev,
                                employeeInvitationMode: e.target.value,
                              }))
                            }
                          >
                            <MenuItem value="DirectAccess">Direct Access</MenuItem>
                            <MenuItem value="NeedCheckIn">Need Check In</MenuItem>
                            <MenuItem value="NeedVisitorCard">Need Visitor Card</MenuItem>
                          </Select>
                        </FormControl>
                      </Paper>
                    </Grid>

                    {/* Visitor */}
                    <Grid size={12}>
                      <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          Visitor Configuration
                        </Typography>

                        <FormControl fullWidth>
                          <InputLabel>Invitation Mode</InputLabel>
                          <Select
                            label="Invitation Mode"
                            value={configuration.visitorInvitationMode}
                            onChange={(e) =>
                              setConfiguration((prev) => ({
                                ...prev,
                                visitorInvitationMode: e.target.value,
                              }))
                            }
                          >
                            <MenuItem value="QRCode">QR Code</MenuItem>
                            <MenuItem value="TemporaryCard">Temporary Card</MenuItem>
                            <MenuItem value="FaceRecognition">Face Recognition</MenuItem>
                            <MenuItem value="ManualRegistration">Manual Registration</MenuItem>
                          </Select>
                        </FormControl>
                      </Paper>
                    </Grid>

                    {/* Credential */}
                    <Grid size={12}>
                      <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          Credential
                        </Typography>

                        <FormControl fullWidth>
                          <InputLabel>Default Credential</InputLabel>
                          <Select
                            label="Default Credential"
                            value={configuration.defaultCredentialMode}
                            onChange={(e) =>
                              setConfiguration((prev) => ({
                                ...prev,
                                defaultCredentialMode: e.target.value,
                              }))
                            }
                          >
                            <MenuItem value="ExistingCard">Existing Card</MenuItem>
                            <MenuItem value="VisitorCard">Visitor Card</MenuItem>
                            <MenuItem value="QRCode">QR Code</MenuItem>
                          </Select>
                        </FormControl>
                      </Paper>
                    </Grid>

                    {/* Access */}
                    <Grid size={12}>
                      <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          Access Configuration
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth>
                              <InputLabel>Grant Access</InputLabel>
                              <Select
                                label="Grant Access"
                                value={configuration.grantAccessWhen}
                                onChange={(e) =>
                                  setConfiguration((prev) => ({
                                    ...prev,
                                    grantAccessWhen: e.target.value,
                                  }))
                                }
                              >
                                <MenuItem value="TimeVisit">Time Visit</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Before (Minutes)"
                              value={configuration.temporaryAccessBeforeMinutes}
                              onChange={(e) =>
                                setConfiguration((prev) => ({
                                  ...prev,
                                  temporaryAccessBeforeMinutes: e.target.value,
                                }))
                              }
                            />
                          </Grid>

                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label="After (Minutes)"
                              value={configuration.temporaryAccessAfterMinutes}
                              onChange={(e) =>
                                setConfiguration((prev) => ({
                                  ...prev,
                                  temporaryAccessAfterMinutes: e.target.value,
                                }))
                              }
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {/* Automation */}
                    <Grid size={12}>
                      <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          Automation
                        </Typography>

                        <Stack spacing={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={configuration.needHostApproval}
                                onChange={(e) =>
                                  setConfiguration((prev) => ({
                                    ...prev,
                                    needHostApproval: e.target.checked,
                                  }))
                                }
                              />
                            }
                            label="Need Host Approval"
                          />

                          <FormControlLabel
                            control={
                              <Switch
                                checked={configuration.autoCheckout}
                                onChange={(e) =>
                                  setConfiguration((prev) => ({
                                    ...prev,
                                    autoCheckout: e.target.checked,
                                  }))
                                }
                              />
                            }
                            label="Enable Auto Checkout"
                          />

                          {configuration.autoCheckout && (
                            <TextField
                              sx={{ maxWidth: 300 }}
                              type="number"
                              label="Auto Checkout After (Minutes)"
                              value={configuration.autoCheckoutAfterMinutes}
                              onChange={(e) =>
                                setConfiguration((prev) => ({
                                  ...prev,
                                  autoCheckoutAfterMinutes: e.target.value,
                                }))
                              }
                            />
                          )}
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid size={12}>
                      <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          Visitor Card Setting
                        </Typography>
                        <Divider />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="h6"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            Initial Card Access
                            <Tooltip title="Initial Card Access" arrow placement="bottom">
                              <IconInfoCircle />
                            </Tooltip>
                          </Typography>

                          <Switch
                            checked={initialCardAccessEnabled}
                            onChange={(e) => setInitialCardAccessEnabled(e.target.checked)}
                          />
                        </Box>

                        {initialCardAccessEnabled && (
                          <Select fullWidth value="QR">
                            <MenuItem value="QR">Card Access (QR)</MenuItem>
                          </Select>
                        )}
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="h6"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            Give Card Setting
                            <Tooltip title="Give Card Setting" arrow placement="bottom">
                              <IconInfoCircle />
                            </Tooltip>
                          </Typography>

                          <Switch
                            checked={giveCardSettingEnabled}
                            onChange={(e) => setGiveCardSettingEnabled(e.target.checked)}
                          />
                        </Box>

                        {giveCardSettingEnabled && (
                          <Select fullWidth value="old">
                            <MenuItem value="old">Disabled Access Old Card</MenuItem>
                          </Select>
                        )}
                      </Paper>
                    </Grid>

                    <Grid size={12} display="flex" justifyContent="flex-end">
                      <Button variant="contained" size="large">
                        Save Configuration
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
              {tabIndex === 1 ? (
                <Box sx={{ overflowX: 'auto', p: { xs: 0, md: 2 }, height: '100%' }}>
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
                      // onSearchKeywordChange={search}
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
              ) : null}

              {tabIndex === 2 ? (
                <Box sx={{ overflowX: 'auto', p: { xs: 0, md: 2 }, height: '100%' }}>
                  {!showForm ? (
                    <ApprovalWorkflow
                      tableData={tableData}
                      searchKeyword={search}
                      setSearchKeyword={setSearch}
                      page={page}
                      setPage={setPage}
                      refreshTrigger={refreshTrigger}
                      setRefreshTrigger={setRefreshTrigger}
                    />
                  ) : null}
                </Box>
              ) : null}
              {/* 
              {tabIndex === 3 ? (
                <Box sx={{ overflowX: 'auto', p: { xs: 0, md: 2 }, height: '100%' }}>
                  {!showForm ? <VisitorCardSetting /> : null}
                </Box>
              ) : null} */}
              {tabIndex === 3 ? (
                <Box sx={{ overflowX: 'auto', p: { xs: 0, md: 2 }, height: '100%' }}>
                  {!showForm ? <NotificationSetting /> : null}
                </Box>
              ) : null}
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
    </PageContainer>
  );
};

export default Content;
