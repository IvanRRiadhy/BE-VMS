import React, { useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import {
  Autocomplete,
  Backdrop,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { Box } from '@mui/system';
import { DateTimePicker } from '@mui/x-date-pickers';
import { DateRangePicker } from 'react-date-range';
import dayjs from 'dayjs';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import {
  IconActivity,
  IconCalendarMonth,
  IconClockHour4,
  IconDeviceFloppy,
  IconFileExport,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconMapPin,
  IconPrinter,
  IconReport,
  IconTrash,
  IconUserCheck,
  IconUsers,
  IconUserX,
  IconX,
} from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Snackbar, Alert } from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import axiosInstance from 'src/customs/api/interceptor';
import {
  generateReport,
  getAllSite,
  getAllVisitor,
  getVisitorEmployee,
} from 'src/customs/api/admin';
import { IconCalendar } from '@tabler/icons-react';

const Content = () => {
  const { token } = useSession();

  const [formData, setFormData] = useState({
    start_date: null,
    end_date: null,
    time_report: 'all',
    sites: [] as string[],
    hosts: [] as string[],
    visitor_id: null as string | null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
    is_preregister_done: false,
    visitor_statuses: [] as string[],
    previous: false,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [siteOptions, setSiteOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [employeeOptions, setEmployeeOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [visitorOptions, setVisitorOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [summary, setSummary] = useState<any | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // 👈 default 10

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });
  const [loading, setLoading] = useState(false);

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success',
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    // Fetch initial data if needed

    const fetchData = async () => {
      if (!token) return;
      const resSite = await getAllSite(token);
      setSiteOptions(resSite.collection);
      const resEmployeee = await getVisitorEmployee(token);
      setEmployeeOptions(resEmployeee.collection);
      const resVisitor = await getAllVisitor(token);
      setVisitorOptions(resVisitor.collection);
    };

    fetchData();
  }, [token]);

  const [reportData, setReportData] = useState<any[]>([]);

  const handlePostReport = async () => {
    try {
      if (!token) return;

      // if (!reportData || reportData.length === 0) {
      //   showSnackbar('No data found.', 'info');
      //   return;
      // }

      setLoading(true);

      if (formData.time_report === 'CustomDate' && (!formData.start_date || !formData.end_date)) {
        alert('Please select start and end date for CustomDate report');
        setLoading(false);
        return;
      }

      const res = await generateReport(token, formData);
      const summaryData = res.collection?.summary?.[0] ?? null; // ✅ ambil summary
      setSummary(summaryData); // ✅ simpan di state

      const rows =
        res.collection?.data?.map((item: any) => ({
          id: item.id,
          visitor_type: item.visitor_type_name,
          name: item.visitor.name,
          identity_id: item.visitor.identity_id,
          email: item.visitor.email,
          organization: item.visitor.organization,
          gender: item.visitor.gender,
          address: item.visitor.address,
          phone: item.visitor.phone,
          is_vip: item.visitor.is_vip,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: item.visitor_period_end,
          host: item.host_name ?? '-',
        })) ?? [];

      setReportData(rows);
      setOpenDialog(true);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const handleConfirmSaveReport = async () => {
    // if (!reportData || reportData.length === 0) {
    //   showSnackbar('No report data to save. Please generate the report first.', 'info');
    //   return;
    // }

    setLoading(true); // ⏳ mulai loading
    try {
      const siteSelected = siteOptions.find((s: any) => s.id === formData.sites?.[0]);
      const siteName = siteSelected ? siteSelected.name : '';
      const todayStr = dayjs().format('YYYY-MM-DD');

      let periodForSave = `${formData.start_date || '-'} → ${formData.end_date || '-'}`;
      let periodForTitle = '';

      switch (formData.time_report) {
        case 'Yearly':
          const year = formData.start_date
            ? dayjs(formData.start_date).format('YYYY')
            : formData.end_date
            ? dayjs(formData.end_date).format('YYYY')
            : dayjs().format('YYYY');
          periodForTitle = year;
          periodForSave = year;
          break;
        case 'Daily':
          const dailyDate = formData.end_date || formData.start_date || todayStr;
          periodForTitle = dailyDate;
          periodForSave = dailyDate;
          break;
        default:
          if (formData.start_date && formData.end_date) {
            periodForTitle = `${formData.start_date} → ${formData.end_date}`;
            periodForSave = periodForTitle;
          } else if (formData.end_date) {
            periodForTitle = formData.end_date;
            periodForSave = periodForTitle;
          } else if (formData.start_date) {
            periodForTitle = formData.start_date;
            periodForSave = periodForTitle;
          } else {
            periodForTitle = '';
            periodForSave = '-';
          }
      }

      const titleParts = [`${formData.time_report}`];
      if (periodForTitle) titleParts.push(`(${periodForTitle})`);
      const title = titleParts.join(' - ').replace(' - (', ' (');

      const newReport = {
        id: Date.now(),
        title,
        time_report: formData.time_report,
        period: periodForSave,
        site: siteName || '',
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        data: reportData,
      };

      // simulasi delay biar loading kelihatan
      await new Promise((res) => setTimeout(res, 600));

      setSavedReports((prev: any) => [...prev, newReport]);
      showSnackbar('Report saved successfully!', 'success');
      setOpenSaveDialog(false);
    } catch (err) {
      showSnackbar('Failed to save report.', 'error');
    } finally {
      setLoading(false); // ⏹️ selesai loading
    }
  };

  const handleResetForm = () => {
    setFormData({
      start_date: null,
      end_date: null,
      time_report: 'all',
      sites: [],
      hosts: [],
      visitor_id: null,
      timezone: 'Asia/Jakarta',
      is_preregister_done: false,
      visitor_statuses: [],
      previous: false,
    });

    // kosongkan data hasil juga jika mau sekalian
    setReportData([]);
    setSummary(null);
    setSelectedReport(null);

    showSnackbar('Form has been reset.', 'info');
  };

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenSaveDialog = () => {
    // if (!reportData || reportData.length === 0) {
    //   showSnackbar('No report data to save. Please generate the report first.', 'info');
    //   return;
    // }
    setOpenSaveDialog(true);
  };

  return (
    <PageContainer title="Report" description="This is Content Report page">
      <Box sx={{ backgroundColor: 'white', p: 3 }}>
        <Typography variant="h5" gutterBottom mb={2}>
          Transaction Visitor Report
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Period</CustomFormLabel>
            <CustomSelect
              fullWidth
              value={formData.time_report}
              onChange={(e: any) => handleChange('time_report', e.target.value)}
            >
              <MenuItem value="all">Select Period</MenuItem>
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
              <MenuItem value="CustomDate">Custom Date</MenuItem>
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Start Date</CustomFormLabel>
            <TextField
              type="date"
              fullWidth
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& input': { color: 'black' } }}
              disabled={formData.time_report !== 'CustomDate'} // ✅ Disable kalau bukan CustomDate
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>End Date</CustomFormLabel>
            <TextField
              type="date"
              fullWidth
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& input': { color: 'black' } }}
              disabled={formData.time_report !== 'CustomDate'} // ✅ Disable juga di sini
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Visitor Status</CustomFormLabel>
            <CustomSelect
              fullWidth
              value={formData.visitor_statuses}
              onChange={(e: any): any => handleChange('visitor_statuses', e.target.value)}
              placeholder="Select Visitor Status"
            >
              <MenuItem value="Checkin">Checkin</MenuItem>
              <MenuItem value="Checkout">Checkout</MenuItem>
              <MenuItem value="Block">Block</MenuItem>
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Sites</CustomFormLabel>
            <Autocomplete
              multiple
              options={siteOptions}
              value={siteOptions.filter((x) => formData.sites.includes(x.id))}
              getOptionLabel={(option) => option.name}
              onChange={(e, val) =>
                handleChange(
                  'sites',
                  val.map((v) => v.id),
                )
              }
              renderInput={(params) => <TextField {...params} placeholder="Select Sites" />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Host</CustomFormLabel>
            <Autocomplete
              multiple
              options={employeeOptions}
              value={employeeOptions.filter((x) => formData.hosts.includes(x.id))}
              getOptionLabel={(option) => option.name}
              onChange={(e, val) =>
                handleChange(
                  'hosts',
                  val.map((v) => v.id),
                )
              }
              renderInput={(params) => <TextField {...params} placeholder="Select Host" />}
            />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} mt={2}>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePostReport}
              startIcon={<IconReport />}
              disabled={loading}
            >
              Generate Report
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleOpenSaveDialog}
              startIcon={<IconDeviceFloppy />}
              disabled={loading}
            >
              Save Generate Report
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleResetForm}
              startIcon={<IconTrash />}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </Box>
      <Box sx={{ backgroundColor: 'white', p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom mb={2}>
          Report Result
        </Typography>
        <Grid container spacing={2} gap={2}>
          {/* Kiri - daftar report */}
          <Grid size={{ xs: 12, md: 4 }}>
            {savedReports.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No saved reports yet.
              </Typography>
            ) : (
              savedReports.map((rep) => (
                <Card
                  key={rep.id}
                  sx={{
                    p: 2,
                    minHeight: 100,
                    mb: 2,
                    cursor: 'pointer',
                    border: selectedReport?.id === rep.id ? '2px solid #1976d2' : '1px solid #ddd',
                    backgroundColor:
                      selectedReport?.id === rep.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                  }}
                  onClick={() => setSelectedReport(rep)}
                >
                  <Typography variant="h6">Report {rep.title}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {rep.time_report}
                    </Typography>
                    <Typography variant="body1">{rep.site}</Typography>
                  </Box>
                </Card>
              ))
            )}
          </Grid>

          {/* 🔹 Garis pemisah vertikal */}
          <Grid
            sx={{
              display: { xs: 'none', md: 'block' },
              borderRight: '1px solid #e0e0e0',
              height: 'auto',
              mx: 1,
            }}
          />

          {/* Kanan - preview */}
          <Grid size={{ xs: 12, md: 7.6 }}>
            {selectedReport ? (
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{selectedReport.title}</Typography>
                  <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>
                    {selectedReport.site}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setReportData(selectedReport.data);
                    setOpenDialog(true);
                  }}
                >
                  Generate Report
                </Button>
              </Card>
            ) : (
              <Card
                sx={{
                  p: 3,
                  minHeight: 150,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none !important',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Select a report from the left to preview details
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            width: '90vw', // ✅ Lebih lebar dari "xl"
            maxWidth: 'none', // 🔸 Hilangkan batas maxWidth bawaan MUI
          },
        }}
      >
        <DialogTitle sx={{ position: 'relative', padding: 3 }}>Report Dialog</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenDialog(false)}
          sx={{
            position: 'absolute',
            top: 15,
            right: 15,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
        <DialogContent dividers>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
              <Tab label="Summary" />
              <Tab label="Report Table" />
            </Tabs>
          </Box>

          {/* 🔹 TAB 1 - SUMMARY */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={700} mb={2}>
                Summary Report
              </Typography>

              {summary ? (
                // <Grid container spacing={2}>
                //   {[
                //     {
                //       icon: <IconCalendar size={22} />,
                //       label: 'Year',
                //       value: summary.year,
                //       color: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                //     },
                //     {
                //       icon: <IconCalendarMonth size={22} />,
                //       label: 'Month',
                //       value: summary.month,
                //       color: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                //     },
                //     {
                //       icon: <IconUsers size={22} />,
                //       label: 'Invited',
                //       value: summary.invited,
                //       color: 'linear-gradient(135deg, #10b981, #059669)',
                //     },
                //     {
                //       icon: <IconUserCheck size={22} />,
                //       label: 'Check-in',
                //       value: summary.checkin,
                //       color: 'linear-gradient(135deg, #f59e0b, #d97706)',
                //     },
                //     {
                //       icon: <IconUserX size={22} />,
                //       label: 'Check-out',
                //       value: summary.checkout,
                //       color: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                //     },
                //     {
                //       icon: <IconMapPin size={22} />,
                //       label: 'Block',
                //       value: summary.block,
                //       color: 'linear-gradient(135deg, #000, #4338ca)',
                //     },
                //     {
                //       icon: <IconActivity size={22} />,
                //       label: 'Active On Site',
                //       value: summary.activeOnSite,
                //       color: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                //     },
                //     {
                //       icon: <IconClockHour4 size={22} />,
                //       label: 'Avg Duration (min)',
                //       value: summary.avgDurationMinutes,
                //       color: 'linear-gradient(135deg, #f43f5e, #be123c)',
                //     },
                //   ].map((item, idx) => (
                //     <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                //       <Card
                //         sx={{
                //           p: 2.5,
                //           borderRadius: 3,
                //           color: '#fff',
                //           background: item.color,
                //           boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                //           transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                //           '&:hover': {
                //             transform: 'translateY(-4px)',
                //             boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                //           },
                //         }}
                //       >
                //         <Box display="flex" alignItems="center" gap={1}>
                //           {item.icon}
                //           <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                //             {item.label}
                //           </Typography>
                //         </Box>
                //         <Typography variant="h5" fontWeight={700} mt={0.5} ml={3.5}>
                //           {item.value}
                //         </Typography>
                //       </Card>
                //     </Grid>
                //   ))}
                // </Grid>

                <DynamicTable data={[summary]} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No summary data available.
                </Typography>
              )}
            </Box>
          )}

          {/* 🔹 TAB 2 - TABLE */}
          {activeTab === 1 && (
            <Box>
              <Box display={'flex'} justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Detail Report</Typography>
                <Box display="flex" gap={1}>
                  <Button variant="contained" color="primary" startIcon={<IconPrinter size={18} />}>
                    Print
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<IconFileTypePdf size={18} />}
                    sx={{
                      backgroundColor: '#d32f2f',
                      '&:hover': { backgroundColor: '#b71c1c' },
                    }}
                  >
                    PDF
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<IconFileSpreadsheet size={18} />}
                    // sx={{
                    //   backgroundColor: '#2e7d32',
                    //   '&:hover': { backgroundColor: '#1b5e20' },
                    // }}
                  >
                    Export CSV
                  </Button>

                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<IconFileExport size={18} />}
                  >
                    Export Excel
                  </Button>
                </Box>
              </Box>

              <DynamicTable
                data={reportData}
                isHaveSearch={true}
                isHavePagination={false}
                // defaultRowsPerPage={rowsPerPage}
                isHavePeriod
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                // rowsPerPageOptions={[5, 10, 20, 50, 100]}
                // onPaginationChange={(page, rowsPerPage) => {
                //   setPage(page);
                //   setRowsPerPage(rowsPerPage);
                // }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={openSaveDialog}
        onClose={() => setOpenSaveDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Save Template Report</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenSaveDialog(false)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
        <DialogContent dividers>
          <CustomFormLabel sx={{ mt: 0.5 }}>Name</CustomFormLabel>
          <TextField
            fullWidth
            label=""
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmSaveReport}
            disabled={isSaving}
            startIcon={
              isSaving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <IconDeviceFloppy size={16} />
              )
            }
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity as any}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </PageContainer>
  );
};

export default Content;
