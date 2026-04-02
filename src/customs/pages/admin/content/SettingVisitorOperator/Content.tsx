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
import ApprovalWorkflow from 'src/customs/pages/admin/content/Approve/content';
import {
  createOperatorSettingGiveAccess,
  createOperatorSettingRegiterSite,
  createOperatorSiteAccess,
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
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';

import FormSetting from './FormSetting';
import FormSettingRegisteredSite from './FormSettingRegisteredSite';
import { getApprovalWorkflowByDt } from 'src/customs/api/Admin/ApprovalWorkflow';

type SettingSMTPRow = {
  id: number;
  organization_id: string;
};

const Content = () => {
  const { token } = useSession();

  const [settingData, setSettingData] = useState<any[]>([]);
  const [operatorSettingData, setOperatorSettingData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<SettingSMTPRow[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
  ];

  const handleSubmit = async () => {
    try {
      // const validated = CreateSettingSmtpSchema.parse(data);
      if (edittingId) {
        await updateSetting(token as string, edittingId, formData);
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
      showSwal('error', error.message || 'Failed to update registered site.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  useEffect(() => {
    if (!token) return;

    setLoading(true);

    const fetchData = async () => {
      try {
        const [settingRes, orgRes] = await Promise.allSettled([
          getSetting(token as string),
          getAllOrganizations(token as string),
        ]);

        // ✅ HANDLE SETTING (WAJIB)
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
      console.log('res', res.data.collection);
      // normalisasi response
      const data = res.data.collection;
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

    // setShowForm(true);
    setOpenRegisteredSite(true);
  };

  const [openGiveAccess, setOpenGiveAccess] = useState(false);
  const [openSiteAccess, setOpenSiteAccess] = useState(false);

  const [acessData, setAcessData] = useState<any[]>([]);
  const [siteAccessData, setSiteAccessData] = useState<any[]>([]);

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

  const [openRegisteredSite, setOpenRegisteredSite] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sortDir, setSortDir] = useState('desc');
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getApprovalWorkflowByDt(
          token,
          start,
          rowsPerPage,
          sortDir,
          searchKeyword,
        );
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
  }, [token, page, rowsPerPage, sortDir, refreshTrigger, searchKeyword]);

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
              <Tab label="Visitor Setting" />
              {/* <Tab label="Operator Setting" /> */}
              <Tab label="Approval Workflow" />
            </Tabs>

            <Box
              sx={{
                flex: 1,
                mt: isMobile ? 2 : 0,
              }}
            >
              {tabIndex === 0 ? (
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
              ) : null}

              {/* {tabIndex === 1 ? (
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
                      isButtonRegisteredSite={false}
                      isButtonGiveAccess={false}
                      isButtonSiteAccess={false}
                      // onCheckedChange={setSelectedRows}
                      onRegisteredSite={(row) => handleRegisteredSite(row.id)}
                      onGiveAccess={(row) => handleOpenGiveAccess(row.id)}
                      onSiteAccess={(row) => handleSiteAccess(row.id)}
                      // onDelete={(row) => handleDelete(row.id.toString())}
                      onSearchKeywordChange={setSearchKeyword}
                    />
                  ) : null}
                </Box>
              ) : null} */}

              {tabIndex === 1 ? (
                <Box sx={{ overflowX: 'auto', p: { xs: 0, md: 2 }, height: '100%' }}>
                  {!showForm ? (
                    <ApprovalWorkflow
                      tableData={tableData}
                      searchKeyword={searchKeyword}
                      setSearchKeyword={setSearchKeyword}
                      refreshTrigger={refreshTrigger}
                      setRefreshTrigger={setRefreshTrigger}
                    />
                  ) : null}
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
