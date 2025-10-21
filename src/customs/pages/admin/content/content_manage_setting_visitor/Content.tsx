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
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { IconBrandGmail, IconSettingsFilled } from '@tabler/icons-react';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Item } from 'src/customs/api/models/Admin/Setting';
import {
  createEmail,
  createSmtp,
  deleteSmtp,
  getAllEmployee,
  getAllOrganizations,
  getAllPaginationSettingSmtp,
  getSetting,
  updateSetting,
  updateSmtp,
} from 'src/customs/api/admin';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
} from 'src/customs/components/alerts/alerts';

import FormSetting from './FormSetting';
// import FormSettingSmtp from './FormSettingSmtp';
// import FormSendTestEmail from './FormSendTestEmail';

type SettingSMTPRow = {
  id: number;
  organization_id: string;
};
const Content = () => {
  const { token } = useSession();

  // Table states
  const [settingData, setSettingData] = useState<any[]>([]);
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

  // const initialFormEmailData: ItemEmail = {
  //   id: '',
  //   is_html: false,
  //   email_sender: '',
  //   setting_smtp_id: '',
  // };

  const [formData, setFormData] = useState<Item>(() => initialFormData);

  const [showForm, setShowForm] = useState(false);
  // Tambah di atas return()
  const [busyId, setBusyId] = useState<string | number | null>(null);
  // UI states
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const cards = [
    {
      title: 'Total Setting',
      subTitle: `${settingData.length ?? 0}`,
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
        showSuccessAlert('Success!', 'Setting updated.');
      }

      setRefreshTrigger((p) => p + 1); // refresh table
      setShowForm(false); // kembali ke tabel
      setEdittingId(''); // reset state edit
    } catch (error: any) {
      console.error(error);
      showErrorAlert('Error!', error.message);
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

    const fetchData = async () => {
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
          organization_id: item.organization_id, // dipakai saat edit
          organization_name: org?.name ?? '-', // dipakai di tabel
        };
      });

      setSettingData(enriched);
      setIsDataReady(true);
      setIsDataReady(true);
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

  return (
    <PageContainer title="Settings" description="Setting Smtp page">
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
            <Tab label="Visitor User" />
          </Tabs>

          <Box sx={{ flex: 1 }}>
            {tabIndex === 0 && (
              <Box sx={{ overflowX: 'auto', p: 2, height: '100%' }}>
                {!showForm ? (
                  isDataReady ? (
                    <DynamicTable
                      isHavePagination={false}
                      isHaveHeaderTitle={true}
                      titleHeader="Setting"
                      data={settingData.map(({ organization_id, ...rest }) => rest)}
                      // selectedRows={selectedRows}
                      // defaultRowsPerPage={rowsPerPage}
                      // rowsPerPageOptions={[5, 10, 25, 50, 100]}
                      // onPaginationChange={(page, rowsPerPage) => {
                      //   setPage(page);
                      //   setRowsPerPage(rowsPerPage);
                      // }}
                      isHaveChecked={true}
                      isHaveAction={false}
                      isHaveSearch={false}
                      isHaveFilter={false}
                      isHaveExportPdf={false}
                      isHaveAddData={false}
                      isSelectedType={true}
                      isHaveActionOnlyEdit={true}
                      isHaveHeader={false}
                      // onCheckedChange={setSelectedRows}
                      onEdit={(row) => handleEdit(row.id)}
                      // onDelete={(row) => handleDelete(row.id.toString())}
                      onSearchKeywordChange={setSearchKeyword}
                      // onAddData={handleAdd}
                      // isHaveBooleanSwitch={true}
                      // isDataVerified={true}
                      // isHavePassword={true}
                    />
                  ) : (
                    <Card sx={{ width: '100%' }}>
                      <Skeleton />
                      <Skeleton animation="wave" />
                      <Skeleton animation={false} />
                    </Card>
                  )
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
            )}
            {/* {tabIndex === 0 && (
              <form action={handleSubmit as any}>
                <Box
                  sx={{
                    overflowX: 'auto',
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <CustomFormLabel htmlFor="name" sx={{ margin: 0 }}>
                        <Typography variant="subtitle1" mb={1} fontWeight="500">
                          Visitor Organization
                        </Typography>
                      </CustomFormLabel>
                      <Autocomplete
                        options={AllOrganization}
                        getOptionLabel={(option) => option?.name ?? ''}
                        isOptionEqualToValue={(option, value) => option.organization_id === value}
                        value={
                          AllOrganization.find(
                            (o) => o.organization_id === selectedOrganizationId,
                          ) ?? null
                        }
                        onChange={(_, newValue) =>
                          setSelectedOrganizationId(newValue?.organization_id ?? null)
                        }
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select Visitor Organization" />
                        )}
                      />
                    </Grid>
                  </Grid>
                  <Box display={'flex'} justifyContent={'flex-end'}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() => console.log('save')}
                    >
                      Save
                    </Button>
                  </Box>
                </Box>
              </form>
            )} */}
          </Box>
        </Paper>
      </Box>
      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1, // di atas drawer & dialog
          }}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default Content;
