import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid2 as Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Autocomplete,
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
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

type SettingSMTPRow = {
  id: number;
  name: string;
  title_email: string;
  host: string;
  user: string;
  password: string;
  port: string;
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
    port: '',
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
    console.log('useEffect FETCH DATA DIPANGGIL', {
      token,
      page,
      rowsPerPage,
      sortColumn,
      searchKeyword,
      refreshTrigger,
    });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev, // merge data lama
      [name]: value, // update field yang diubah
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: Item) => ({ ...prev, [name]: checked }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = CreateSettingSmtpSchema.parse(formData);

      if (edittingId) {
        // UPDATE
        await updateSmtp(token as string, validated, edittingId);
        showSuccessAlert('Success!', 'SMTP updated.');
      } else {
        // CREATE
        await createSmtp(validated, token as string);
        showSuccessAlert('Success!', 'SMTP created.');
      }

      // refresh table
      setRefreshTrigger((prev) => prev + 1);

      // kembali ke table view
      setShowForm(false);

      // reset form & id edit
      setEdittingId('');
    } catch (error: any) {
      console.error(error);
      showErrorAlert('Error!', error.message);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = CreateEmailSchema.parse(formEmailData);

      await createEmail(validated, token as string);
      showSuccessAlert('Success!', 'Email has been sent.');

      // refresh table
      setRefreshTrigger((prev) => prev + 1);

      // kembali ke table view
      setShowForm(false);

      // reset form & id edit
      setEdittingId('');
    } catch (error: any) {
      console.error(error);
      showErrorAlert('Error!', error.message);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  // useEffect(() => {
  //   console.log('useEffect localStorage DIPANGGIL', formData);
  //   localStorage.setItem('unsavedSmtpData', JSON.stringify(formData));
  // }, [formData]);

  // Sub components
  const SmtpProviderForm = () => (
    <Box>
      {!showForm ? (
        <Box sx={{ overflowX: 'auto' }}>
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
            onCheckedChange={(selected) => setSelectedRows(selected)}
            onEdit={(row) => handleEdit(row.id)}
            onDelete={(row) => handleDelete(row.id.toString())}
            onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
            onAddData={handleAdd}
            isHaveBooleanSwitch={true}
          />
        </Box>
      ) : (
        <form onSubmit={handleSubmit} style={{ padding: 16 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="name" sx={{ marginTop: '0px' }}>
                <Typography variant="body1" fontWeight={500}>
                  Name
                </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="name"
                name="name"
                value={formData.name ?? ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="from_address" sx={{ marginTop: '0px' }}>
                <Typography variant="body1" fontWeight={500}>
                  From Address
                </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="from_address"
                name="from_address"
                value={formData.from_address ?? ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="title_email" sx={{ marginTop: '0px' }}>
                <Typography variant="body1" fontWeight={500}>
                  Title Email
                </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="title_email"
                name="title_email"
                value={formData.title_email || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="host" sx={{ marginTop: '0px' }}>
                <Typography variant="body1" fontWeight={500}>
                  Host
                </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="host"
                name="host"
                value={formData.host || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="port" sx={{ marginTop: '0px' }}>
                <Typography variant="body1" fontWeight={500}>
                  Port
                </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="port"
                name="port"
                value={formData.port || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="user" sx={{ marginTop: '0px' }}>
                <Typography variant="body1" fontWeight={500}>
                  User
                </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="user"
                name="user"
                value={formData.user ?? ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="password" sx={{ marginTop: '0px' }}>
                <Typography variant="body1" fontWeight={500}>
                  Password
                </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="password"
                name="password"
                type="password"
                value={formData.password ?? ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.secure || false}
                    onChange={handleSwitchChange}
                    name="secure"
                  />
                }
                label="Secure (SSL/TLS)"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.selected_email || false}
                    onChange={handleSwitchChange}
                    name="selected_email"
                  />
                }
                label="Set as Selected Email"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<IconSend size={18} />}
              >
                {edittingId ? 'Edit' : 'Submit'}
              </Button>
              <Button variant="outlined" sx={{ ml: 1 }} onClick={handleCancelForm}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </Box>
  );
  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormEmailData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const SendTestForm = () => (
    <Box component="form" onSubmit={handleSubmitEmail}>
      <Grid container spacing={2} paddingX={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h4" gutterBottom>
            Send A Test
          </Typography>
          <Typography variant="body2" gutterBottom>
            Verify your SMTP setup by sending a test email
          </Typography>
          <Divider />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="email_sender" sx={{ marginTop: '0px' }}>
            <Typography variant="body1" fontWeight={500}>
              Send To
            </Typography>
          </CustomFormLabel>
          <CustomTextField
            name="email_sender"
            fullWidth
            value={formEmailData?.email_sender ?? ''}
            onChange={handleChangeEmail}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel sx={{ marginTop: '0px' }}>
            <Typography variant="body1" fontWeight={500}>
              Send With
            </Typography>
          </CustomFormLabel>
          <Autocomplete
            options={smtpData}
            value={smtpData.find((o) => o.id === Number(formEmailData?.setting_smtp_id)) || null}
            onChange={(_, newValue) => {
              if (newValue) {
                setFormEmailData((prev: any) => ({
                  ...prev,
                  setting_smtp_id: newValue.id,
                }));
              }
            }}
            getOptionLabel={(option) => (option ? `${option.name}` : '')}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <CustomTextField {...params} placeholder="" fullWidth />}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight={500}>
              HTML
            </Typography>
            <Switch
              name="is_html"
              checked={formEmailData?.is_html || false}
              onChange={handleSwitchChange}
            />
          </Box>
          <Typography variant="body2" color="gray">
            Send test email as HTML
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            startIcon={<IconSend size={18} />}
          >
            Send Test
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
  const SenderReport = () => (
    <Grid container spacing={2} paddingX={2}>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Testing Email"
          name="testing"
          fullWidth
          value={(formData as any).testing || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Testing Message"
          name="testing_msg"
          multiline
          rows={3}
          fullWidth
          value={(formData as any).testing_msg || ''}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );

  return (
    <PageContainer title="Manage Setting Smtp" description="Setting Smtp page">
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
            <Tab label="SMTP Provider" />
            <Tab label="Send A Test" />
            <Tab label="Sender Report" />
          </Tabs>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: tabIndex === 0 ? 'block' : 'none' }}>
              <SmtpProviderForm />
            </Box>
            <Box sx={{ display: tabIndex === 1 ? 'block' : 'none' }}>
              <SendTestForm />
            </Box>
            <Box sx={{ display: tabIndex === 2 ? 'block' : 'none' }}>
              <SenderReport />
            </Box>
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default Content;
