import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Paper,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
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
import { Item } from 'src/customs/api/models/Admin/Setting';
import ApprovalWorkflow from 'src/customs/pages/admin/content/Approve/content';
import { getAllOrganizations, getSetting, updateSetting } from 'src/customs/api/admin';
import { showSwal } from 'src/customs/components/alerts/alerts';
import FormSetting from './FormSetting';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import NotificationSetting from './NotificationSetting';
import VMSConfigurationTab from './VmsConfugrationTab';
import useApprovalWorkflowPagination from 'src/hooks/ApprovalWorkflow/useApprovalWorkflowPagination';

const Content = () => {
  const [settingData, setSettingData] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const initialFormData: Item = {
    id: '',
    organization_id: '',
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sortDir, setSortDir] = useState('desc');
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [formData, setFormData] = useState<Item>(() => initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const handleSubmit = async () => {
    try {
      // const validated = CreateSettingSmtpSchema.parse(data);
      if (edittingId) {
        await updateSetting(edittingId, formData);
        showSwal('success', 'Setting updated successfully!');
      }

      setShowForm(false);
      setEdittingId('');
    } catch (error: any) {
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

  const {
    data,
    isLoading,
  } = useApprovalWorkflowPagination({
    page,
    rowsPerPage,
    search,
    sortDir,
  });

  const tableData = data?.collection ?? [];
  const totalRecords = data?.totalRecords ?? 0;

  const cards = useMemo(
    () => [
      {
        title: 'Total Visitor Setting',
        subTitle: `${settingData.length ?? 0}`,
        icon: IconSettingsFilled,
        color: 'none',
      },
      {
        title: 'Total Approval Workflow',
        subTitle: `${totalRecords ?? 0}`,
        icon: IconSettingsFilled,
        color: 'none',
      },
    ],
    [settingData.length, totalRecords],
  );


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
                <VMSConfigurationTab />
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
                      loading={isLoading}
                      searchKeyword={search}
                      setSearchKeyword={setSearch}
                      page={page}
                      setPage={setPage}
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
      </Container>
    </PageContainer>
  );
};

export default Content;
