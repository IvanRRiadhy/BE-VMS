import React, { useEffect, useState } from 'react';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
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
  Divider,
  Grid2 as Grid,
  IconButton,
  MenuItem,
  Portal,
  TextField,
  Typography,
} from '@mui/material';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { Box } from '@mui/system';
import dayjs from 'dayjs';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { IconDeviceFloppy, IconReport, IconTrash, IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Snackbar, Alert } from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import {
  generateReport,
  getAllSite,
  getAllVisitor,
  getVisitorEmployee,
} from 'src/customs/api/admin';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { showSwal } from 'src/customs/components/alerts/alerts';

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
  const [summary, setSummary] = useState<any[]>([]);
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

  // useEffect(() => {
  //   // Fetch initial data if needed

  //   const fetchData = async () => {
  //     if (!token) return;
  //     const resSite = await getAllSite(token);
  //     setSiteOptions(resSite.collection);
  //     const resEmployeee = await getVisitorEmployee(token);
  //     setEmployeeOptions(resEmployeee.collection);
  //     const resVisitor = await getAllVisitor(token);
  //     setVisitorOptions(resVisitor.collection);
  //   };

  //   fetchData();
  // }, [token]);

  const [reportData, setReportData] = useState<any[]>([]);
  const emptyFilter = {
    start_date: null,
    end_date: null,
    time_report: 'all',
    sites: [],
    hosts: [],
    visitor_id: null,
    visitor_statuses: [],
    is_preregister_done: false,
    previous: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
  };

  const isFormDataEmpty = (f: any) => {
    return (
      !f.start_date &&
      !f.end_date &&
      f.time_report === 'all' &&
      f.sites?.length === 0 &&
      f.hosts?.length === 0 &&
      !f.visitor_id &&
      f.visitor_statuses?.length === 0 &&
      f.is_preregister_done === false &&
      f.previous === false
    );
  };

  const handlePostReport = async () => {
    try {
      if (!token) return;

      if (isFormDataEmpty(formData)) {
        showSwal('error', 'Please select at least one filter.');
        return;
      }

      setLoading(true);

      if (formData.time_report === 'CustomDate' && (!formData.start_date || !formData.end_date)) {
        alert('Please select start and end date for CustomDate report');
        setLoading(false);
        return;
      }

      const res = await generateReport(token, formData);
      const rowsSummary = res.collection?.summary?.map((item: any) => ({
        id: item.id,
        date: item.date,
        month: item.month,
        invited: item.invited,
        checkin: item.checkin,
        checkout: item.checkout,
        block: item.block,
        active: item.activeOnSite,
        average_duration: item.average_duration ?? 0,
      }));
      // const summaryData = res.collection?.summary ?? []; // ✅ ambil summary
      setSummary(rowsSummary); // ✅ simpan di state

      const rows =
        res.collection?.data?.map((item: any) => ({
          id: item.id,
          visitor_type: item.visitor_type_name,
          name: item.visitor.name,
          identity_id: item.visitor.identity_id,
          email: item.visitor.email,
          organization: item.visitor.organization,
          gender: item.visitor.gender,
          address: item.visitor.address ?? '-',
          phone: item.visitor.phone,
          is_vip: item.visitor.is_vip,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          host: item.host_name ?? '-',
        })) ?? [];

      setReportData(rows);
      setTimeout(() => {
        setOpenDialog(true);
      }, 400);
    } catch (err) {
      console.error('Error generating report:', err);
      setTimeout(() => {
        showSwal('error', 'Failed to generate report.');
      }, 400);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `report-${Date.now()}.xlsx`);
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!reportData || reportData.length === 0) return;

    const doc = new jsPDF('l', 'mm', 'a4');

    doc.text('Visitor Report', 14, 15);

    const tableColumn = Object.keys(reportData[0] || {});
    const tableRows = reportData.map((row) => Object.values(row));

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows as any[],
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`report-${Date.now()}.pdf`);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const tableHtml = document.getElementById('print-report-area')?.innerHTML;

    printWindow!.document.write(`
    <html>
      <head>
        <title>Visitor Report</title>
      </head>
      <body>
        ${tableHtml}
      </body>
    </html>
  `);

    printWindow!.document.close();
    printWindow!.focus();
    printWindow!.print();
    printWindow!.close();
  };

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
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
      is_preregister_done: false,
      visitor_statuses: [],
      previous: false,
    });

    // kosongkan data hasil juga jika mau sekalian
    setReportData([]);
    setSummary([]);
    setSelectedReport(null);

    // showSnackbar('Form has been reset.', 'info');
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
    <>
      <Container title="Report" description="This is Content Report page">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3, xl: 2 }}>
            <Box sx={{ backgroundColor: 'white', p: 3 }}>
              <Typography variant="h5" gutterBottom mb={2}>
                Transaction Log Report
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Period</CustomFormLabel>
                  <CustomSelect
                    fullWidth
                    value={formData.time_report}
                    onChange={(e: any) => handleChange('time_report', e.target.value)}
                    sx={{ mt: 0.5 }}
                  >
                    <MenuItem value="all">Select Period</MenuItem>
                    <MenuItem value="Daily">Daily</MenuItem>
                    <MenuItem value="Weekly">Weekly</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Yearly">Yearly</MenuItem>
                    <MenuItem value="CustomDate">Custom Date</MenuItem>
                  </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Start Date</CustomFormLabel>
                  <TextField
                    type="date"
                    fullWidth
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& input': { color: 'black' }, mt: 0.5 }}
                    disabled={formData.time_report !== 'CustomDate'}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>End Date</CustomFormLabel>
                  <TextField
                    type="date"
                    fullWidth
                    value={formData.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& input': { color: 'black' }, mt: 0.5 }}
                    disabled={formData.time_report !== 'CustomDate'}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Visitor Status</CustomFormLabel>
                  <CustomSelect
                    fullWidth
                    value={formData.visitor_statuses}
                    onChange={(e: any): any => handleChange('visitor_statuses', e.target.value)}
                    placeholder="Select Visitor Status"
                    sx={{ mt: 0.5 }}
                  >
                    <MenuItem value="">Select Visitor Status</MenuItem>
                    <MenuItem value="Checkin">Checkin</MenuItem>
                    <MenuItem value="Checkout">Checkout</MenuItem>
                    <MenuItem value="Block">Block</MenuItem>
                  </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12 }}>
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
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
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
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 12 }} mt={2}>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }} flexDirection={'column'}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePostReport}
                    startIcon={!loading && <IconReport size={20} />}
                    disabled={loading}
                    sx={{ fontSize: 12 }}
                    size="medium"
                  >
                    {loading ? <CircularProgress size={18} color="inherit" /> : 'Generate Report'}
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleOpenSaveDialog}
                    startIcon={<IconDeviceFloppy size={20} />}
                    disabled={loading}
                    sx={{
                      fontSize: 12,
                      minWidth: 150,
                      backgroundColor: 'success',
                      '&.Mui-disabled': {
                        backgroundColor: 'success.main',
                        color: '#fff',
                        opacity: 0.7,
                      },
                    }}
                    size="medium"
                  >
                    Save Generate
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleResetForm}
                    startIcon={<IconTrash size={20} />}
                    size="medium"
                    loading={loading}
                    sx={{
                      fontSize: 12,
                      minWidth: 150,
                      borderColor: '#d32f2f',
                      color: '#d32f2f',
                      '&.Mui-disabled': {
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                        opacity: 0.5,
                      },
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 9, xl: 10 }}>
            <Box sx={{ backgroundColor: 'white', p: 3 }}>
              <Typography variant="h5" gutterBottom mb={2}>
                Report Result
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Grid container spacing={2} gap={2}>
                <Grid size={{ xs: 12, md: 2 }}>
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
                          border:
                            selectedReport?.id === rep.id ? '2px solid #1976d2' : '1px solid #ddd',
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
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2 }}
                          // onClick={() => {
                          //   setReportData(selectedReport.data);
                          //   setOpenDialog(true);
                          // }}
                        >
                          Generate
                        </Button>
                      </Card>
                    ))
                  )}
                </Grid>

                <Grid
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    borderRight: '1px solid #e0e0e0',
                    height: 'auto',
                    mx: 1,
                  }}
                />

                {/* Kanan - preview */}
                <Grid size={{ xs: 12, md: 9.5 }}>
                  {selectedReport ? (
                    <>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                          <Tab label="Summary" />
                          <Tab label="Table Report" />
                        </Tabs>
                      </Box>

                      {/* 🔹 TAB 1 - SUMMARY */}
                      {activeTab === 0 && (
                        <Box>
                          {summary ? (
                            <DynamicTable
                              data={summary}
                              isHaveHeaderTitle={true}
                              titleHeader="Summary"
                              isHaveExportCsv={true}
                              onExportCsv={exportToCSV}
                              isHaveExportExcel={true}
                              onExportExcel={exportToExcel}
                              isHaveExportPdf={true}
                              onExportPdf={exportToPDF}
                            />
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
                          <div id="print-report-area">
                            <DynamicTable
                              data={reportData}
                              isHaveSearch={true}
                              isHavePagination={false}
                              isHavePeriod
                              onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                              isHaveExportCsv={true}
                              isHaveExportExcel={true}
                              // isHavePrint={true}
                              isHaveVip={true}
                              isHaveExportPdf={true}
                              onExportCsv={exportToCSV}
                              onExportExcel={exportToExcel}
                              onExportPdf={exportToPDF}
                              onPrint={printReport}
                            />
                          </div>
                        </Box>
                      )}
                    </>
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
          </Grid>
        </Grid>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="xl"
          PaperProps={{
            sx: {
              width: '90vw',
              maxWidth: 'none',
            },
          }}
        >
          <DialogTitle sx={{ position: 'relative', padding: 3 }}>
            Transaction Log Report
          </DialogTitle>
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
                <Tab label="Table Report" />
              </Tabs>
            </Box>

            {/* 🔹 TAB 1 - SUMMARY */}
            {activeTab === 0 && (
              <Box>
                {summary ? (
                  <DynamicTable
                    data={summary}
                    isHaveHeaderTitle={true}
                    titleHeader="Summary"
                    isHaveExportCsv={true}
                    onExportCsv={exportToCSV}
                    isHaveExportExcel={true}
                    onExportExcel={exportToExcel}
                    isHaveExportPdf={true}
                    onExportPdf={exportToPDF}
                  />
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
                <div id="print-report-area">
                  <DynamicTable
                    data={reportData}
                    isHaveSearch={true}
                    isHavePagination={false}
                    isHavePeriod
                    onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                    isHaveExportCsv={true}
                    isHaveExportExcel={true}
                    // isHavePrint={true}
                    isHaveVip={true}
                    isHaveExportPdf={true}
                    onExportCsv={exportToCSV}
                    onExportExcel={exportToExcel}
                    onExportPdf={exportToPDF}
                    onPrint={printReport}
                  />
                </div>
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
        <Portal>
          <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={loading}>
            <CircularProgress color="primary" />
          </Backdrop>
        </Portal>
      </Container>
    </>
  );
};

export default Content;
