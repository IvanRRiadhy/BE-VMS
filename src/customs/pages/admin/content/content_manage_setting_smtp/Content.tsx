import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { IconSend, IconBrandGmail } from '@tabler/icons-react';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateEmailSchema,
  CreateSettingSmtpSchema,
  Item,
  ItemEmail,
} from 'src/customs/api/models/SettingSmtp';
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
  const [isDataReady, setIsDataReady] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
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
  // const [formData, setFormData] = useState<Item>({} as Item);
  const [showForm, setShowForm] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const cards = [
    {
      title: 'Total SMTP',
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
      const res = await getAllPaginationSettingSmtp(
        token,
        page,
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
      setIsDataReady(true);
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, searchKeyword, refreshTrigger]);

  // Handlers
  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirmed = await showConfirmDelete('Are you sure?', "You won't be able to revert this!");
    if (!confirmed) return;
    try {
      if (confirmed) {
        setLoading(true);
        await deleteSmtp(id, token);
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', 'Item has been deleted.');
      }
    } catch (error) {
      console.error(error);
      showErrorAlert('Error!', 'Failed to delete item.');
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
        showSuccessAlert('Success!', 'SMTP updated.');
      } else {
        await createSmtp(validated, token as string);
        showSuccessAlert('Success!', 'SMTP created.');
      }

      setRefreshTrigger((p) => p + 1); // refresh table
      setShowForm(false); // kembali ke tabel
      setEdittingId(''); // reset state edit
    } catch (error: any) {
      console.error(error);
      showErrorAlert('Error!', error.message);
    }
  };

  // Tambah di atas return()
  const [busyId, setBusyId] = useState<string | number | null>(null);

  const handleBooleanSwitchChange = async (id: number | string, field: string, value: boolean) => {
    // Abaikan switch lain, kita fokus ke selected_email
    if (field !== 'selected_email') return;
    if (!token) return;

    try {
      setBusyId(id);
      // setLoading(true);
      // Ambil row yang di-toggle
      const row = smtpData.find((x) => String(x.id) === String(id));
      if (!row) return;

      // Payload update (pakai data row lama, ganti selected_email)
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

      // (opsional) validasi zod
      const validated = CreateSettingSmtpSchema.parse(payload);

      // Update row yang diklik
      await updateSmtp(token, validated, row.id.toString());

      // Jika ingin hanya boleh SATU selected_email=true:
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

      // Update UI secara optimistis
      // setSmtpData((prev) =>
      //   prev.map((x) =>
      //     x.id === row.id
      //       ? { ...x, selected_email: value }
      //       : value
      //       ? { ...x, selected_email: false } // pastikan unik
      //       : x,
      //   ),
      // );

      setSmtpData((prev) =>
        prev.map((x) => (x.id === row.id ? { ...x, selected_email: value } : x)),
      );

      showSuccessAlert('Updated!', 'Selected email updated.');
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Error!', err?.message ?? 'Failed to update selected email.');
    } finally {
      setBusyId(null);
      // setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleSubmitEmail = async (data: ItemEmail) => {
    if (!token) return;

    try {
      setLoading(true); // BACKDROP ON

      // Validasi
      const validated = CreateEmailSchema.parse(data);

      // Cari nama provider dari daftar SMTP yang sudah kamu load
      const provider = smtpData.find((x) => String(x.id) === String(validated.setting_smtp_id));
      const providerName = provider?.name ?? 'provider yang dipilih';

      // Kirim email
      await createEmail(validated, token as string);

      setFormEmailData(initialFormEmailData);

      // Tutup backdrop dulu, baru tampilkan alert
      flushSync(() => setLoading(false));
      await showSuccessAlert(
        'Berhasil!',
        `Email berhasil dikirim via "${providerName}" ke ${
          validated.email_sender || '(tanpa alamat)'
        }`,
      );

      setRefreshTrigger((p) => p + 1);
    } catch (error: any) {
      flushSync(() => setLoading(false));
      await showErrorAlert('Error!', error.message);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <PageContainer title="Manage Setting Smtp" description="Setting Smtp page">
      <Box>
        <Grid size={{ xs: 12 }}>
          <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
        </Grid>

        {!showForm ? (
          <Paper sx={{ display: 'flex', minHeight: 400, mt: 2, p: 2, overflowX: 'auto' }}>
            <Tabs
              orientation="vertical"
              value={tabIndex}
              onChange={(_, newValue) => setTabIndex(newValue)}
              sx={{ borderRight: 1, borderColor: 'divider', minWidth: 180 }}
            >
              <Tab label="SMTP Provider" />
              <Tab label="Send A Test" />
              <Tab label="Sender Report" />
            </Tabs>

            <Box sx={{ flex: 1 }}>
              {tabIndex === 0 && (
                <Box sx={{ overflowX: 'auto', p: 2 }}>
                  {isDataReady ? (
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
                  ) : (
                    <Card sx={{ width: '100%' }}>
                      <Skeleton />
                      <Skeleton animation="wave" />
                      <Skeleton animation={false} />
                    </Card>
                  )}
                </Box>
              )}

              {tabIndex === 1 && (
                // tempatkan Send Test versi table/preview, kalau ada
                <FormSendTestEmail
                  formEmailData={formEmailData}
                  setFormEmailData={setFormEmailData}
                  smtpOptions={smtpData}
                  onSubmit={handleSubmitEmail}
                  // onCancel opsional kalau mau ada tombol Cancel
                  // onCancel={() => { setFormEmailData(initialFormEmailData); }}
                  loading={loading}
                />
              )}

              {tabIndex === 2 && (
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
              )}
            </Box>
          </Paper>
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
      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1, // di atas drawer & dialog
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </PageContainer>
  );
};

export default Content;
