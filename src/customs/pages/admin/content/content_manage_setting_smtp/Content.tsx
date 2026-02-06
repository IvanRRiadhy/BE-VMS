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
} from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { IconBrandGmail } from '@tabler/icons-react';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateEmailSchema,
  CreateSettingSmtpSchema,
  Item,
  ItemEmail,
} from 'src/customs/api/models/Admin/SettingSmtp';
import {
  createEmail,
  createSmtp,
  deleteSmtp,
  getAllPaginationSettingSmtp,
  updateSmtp,
} from 'src/customs/api/admin';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
  showSwal,
} from 'src/customs/components/alerts/alerts';
import FormSettingSmtp from './FormSettingSmtp';
import FormSendTestEmail from './FormSendTestEmail';

type SettingSMTPRow = {
  id: number;
  name: string;
  title_email: string;
  host: string;
  user: string;
  password: string;
  port: number;
  secure: boolean;
  from_address: string;
  selected_email: boolean;
};

const Content = () => {
  const { token } = useSession();

  // Table states
  const [smtpData, setSmtpData] = useState<SettingSMTPRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<SettingSMTPRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form state
  const initialFormData: Item = {
    id: '',
    name: '',
    from_address: '',
    title_email: '',
    host: '',
    port: 0,
    user: '',
    password: '',
    secure: false,
    selected_email: false,
  };

  const initialFormEmailData: ItemEmail = {
    id: '',
    is_html: false,
    email_sender: '',
    setting_smtp_id: '',
  };

  const [formData, setFormData] = useState<Item>(() => initialFormData);
  const [formEmailData, setFormEmailData] = useState<ItemEmail>(initialFormEmailData);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const cards = [
    {
      title: 'Total SMTP Provider',
      subTitle: `${smtpData.length}`,
      subTitleSetting: 10,
      icon: IconBrandGmail,
      color: 'none',
    },
  ];

  // Fetch data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      const start = page * rowsPerPage;
      setLoading(true);
      try {
        const res = await getAllPaginationSettingSmtp(
          token,
          start,
          rowsPerPage,
          sortColumn,
          searchKeyword,
        );

        const mapped = res.collection.map((x: any) => ({
          id: x.id,
          name: x.name,
          title_email: x.title_email,
          host: x.host,
          user: x.user,
          password: x.password,
          port: x.port,
          secure: x.secure,
          from_address: x.from_address,
          selected_email: x.selected_email,
        }));

        setSmtpData(mapped);
        setTotalRecords(res.RecordsTotal);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, searchKeyword, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirmed = await showConfirmDelete('Are you sure to delete this smtp provider?');
    if (!confirmed) return;
    try {
      if (confirmed) {
        setLoading(true);
        await deleteSmtp(id, token);
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', 'Successfully deleted smtp provider!');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    console.log('handleAdd terpanggil!');
    setEdittingId('');
    setFormData({ ...initialFormData });
    setShowForm(true);
  };

  const handleEdit = (id: number) => {
    const row = smtpData.find((x) => x.id === id);
    if (!row) return;
    setEdittingId(id.toString());
    setFormData({ ...row, id: row.id.toString() } as Item);
    setShowForm(true);
  };

  const handleSubmit = async (data: Item) => {
    try {
      const validated = CreateSettingSmtpSchema.parse(data);

      if (edittingId) {
        await updateSmtp(token as string, validated, edittingId);
        showSwal('success', 'SMTP updated.');
      } else {
        await createSmtp(validated, token as string);
        showSwal('success', 'SMTP created.');
      }

      setRefreshTrigger((p) => p + 1);
      setShowForm(false);
      setEdittingId('');
    } catch (error: any) {
      console.error(error);
      showSwal('error', error.message || 'Failed to submit SMTP data.');
    }
  };

  const handleBooleanSwitchChange = async (id: number | string, field: string, value: boolean) => {
    if (field !== 'selected_email') return;
    if (!token) return;

    try {
      setBusyId(id);
      setLoading(true);

      const row = smtpData.find((x) => String(x.id) === String(id));
      if (!row) return;

      const payload: Item = {
        id: row.id.toString(),
        name: row.name,
        from_address: row.from_address,
        title_email: row.title_email,
        host: row.host,
        port: Number(row.port) || 0,
        user: row.user,
        password: row.password,
        secure: row.secure,
        selected_email: value,
      };

      const validated = CreateSettingSmtpSchema.parse(payload);

      await updateSmtp(token, validated, row.id.toString());

      if (value) {
        const prev = smtpData.find((x) => x.selected_email && x.id !== row.id);
        if (prev) {
          const offPayload: Item = {
            id: prev.id.toString(),
            name: prev.name,
            from_address: prev.from_address,
            title_email: prev.title_email,
            host: prev.host,
            port: Number(prev.port) || 0,
            user: prev.user,
            password: prev.password,
            secure: prev.secure,
            selected_email: false,
          };
          await updateSmtp(token, CreateSettingSmtpSchema.parse(offPayload), prev.id.toString());
        }
      }

      setSmtpData((prev) =>
        prev.map((x) => (x.id === row.id ? { ...x, selected_email: value } : x)),
      );

      setTimeout(() => {
        setLoading(false);
        showSwal('success', 'Selected email updated.');
      }, 800);
    } catch (err: any) {
      console.error(err);
      showSwal('error', err?.message ?? 'Failed to update selected email.');
    } finally {
      setBusyId(null);
      setTimeout(() => setLoading(false), 400);
    }
  };

  const handleSubmitEmail = async (data: ItemEmail) => {
    if (!token) return;

    try {
      setLoading(true);

      const validated = CreateEmailSchema.parse(data);

      const provider = smtpData.find((x) => String(x.id) === String(validated.setting_smtp_id));
      const providerName = provider?.name ?? 'provider yang dipilih';

      await createEmail(validated, token as string);

      setFormEmailData(initialFormEmailData);

      flushSync(() => setLoading(false));

      await showSwal(
        'success',
        `Successfully sent test email from "${providerName}" to ${
          validated.email_sender || '(no email provided)'
        }`,
      );

      setRefreshTrigger((p) => p + 1);
    } catch (error: any) {
      flushSync(() => setLoading(false));
      // await showErrorAlert('Error!', error.message);
      showSwal('error', error.message || 'Failed to send test email.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Setting Smtp" description="Setting Smtp page">
        <Box>
          <Grid size={{ xs: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
          </Grid>

          <Paper sx={{ display: 'flex', minHeight: 400, mt: 2, p: 2, overflowX: 'hidden' }}>
            <Tabs
              orientation="vertical"
              value={tabIndex}
              onChange={(_, newValue) => setTabIndex(newValue)}
              sx={{ borderRight: 1, borderColor: 'divider', minWidth: 180 }}
            >
              <Tab label="SMTP Provider" />
              <Tab label="Send A Test" />
              {/* <Tab label="Sender Report" /> */}
            </Tabs>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Tab SMTP Provider */}
              {tabIndex === 0 && (
                <Box sx={{ overflowX: 'auto', p: 2, width: '100%' }}>
                  {!showForm ? (
                    <DynamicTable
                      loading={loading}
                      overflowX="auto"
                      isHavePagination={true}
                      isHaveHeaderTitle={true}
                      titleHeader="SMTP Provider"
                      data={smtpData}
                      selectedRows={selectedRows}
                      defaultRowsPerPage={rowsPerPage}
                      rowsPerPageOptions={[10, 25, 50, 100]}
                      onPaginationChange={(page, rowsPerPage) => {
                        setPage(page);
                        setRowsPerPage(rowsPerPage);
                      }}
                      isHaveChecked={false}
                      isHaveAction={true}
                      isHaveSearch={false}
                      isHaveFilter={false}
                      isHaveExportPdf={false}
                      isHaveAddData={true}
                      isHaveHeader={false}
                      onCheckedChange={setSelectedRows}
                      onEdit={(row) => handleEdit(row.id)}
                      onDelete={(row) => handleDelete(row.id.toString())}
                      onSearchKeywordChange={setSearchKeyword}
                      onAddData={handleAdd}
                      isHaveBooleanSwitch={true}
                      isDataVerified={true}
                      onBooleanSwitchChange={handleBooleanSwitchChange}
                      isHavePassword={true}
                    />
                  ) : (
                    <FormSettingSmtp
                      formData={formData}
                      setFormData={setFormData}
                      editingId={edittingId}
                      onSubmit={handleSubmit}
                      onCancel={handleCancelForm}
                    />
                  )}
                </Box>
              )}

              {/* Tab Send A Test */}
              {tabIndex === 1 && (
                <FormSendTestEmail
                  formEmailData={formEmailData}
                  setFormEmailData={setFormEmailData}
                  smtpOptions={smtpData}
                  onSubmit={handleSubmitEmail}
                  loading={loading}
                />
              )}

              {/* Tab Sender Report */}
              {/* {tabIndex === 2 && (
                <Box sx={{ overflowX: 'auto', p: 2 }}>
                  <DynamicTable
                    data={smtpData}
                    selectedRows={selectedRows}
                    isHaveChecked={false}
                    isHaveAction={true}
                    isHaveSearch={false}
                    isHaveFilter={false}
                    isHaveExportPdf={false}
                    isHaveAddData={true}
                    isHaveHeader={false}
                    onCheckedChange={setSelectedRows}
                    onEdit={(row) => handleEdit(row.id)}
                    onDelete={(row) => handleDelete(row.id.toString())}
                    onSearchKeywordChange={setSearchKeyword}
                    onAddData={handleAdd}
                    isHaveBooleanSwitch={true}
                    isDataVerified={true}
                    onBooleanSwitchChange={handleBooleanSwitchChange}
                    isHavePassword={true}
                  />
                </Box>
              )} */}
            </Box>
          </Paper>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;
