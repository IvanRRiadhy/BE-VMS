import { useEffect, useState } from 'react';
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
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Portal,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { Box } from '@mui/system';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  IconDeviceFloppy,
  IconPencil,
  IconReport,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
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
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import {
  createReportVisitorTransaction,
  deleteReportVisitorTransaction,
  generateReportVisitorById,
  getReportVisitorTransactionById,
  getReportVisitorTransactionDt,
  updateReportVisitorTransaction,
} from 'src/customs/api/Report';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import axiosInstance from 'src/customs/api/interceptor';

const Content = () => {
  const { token } = useSession();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: null,
    end_date: null,
    time_report: 'all',
    sites: [] as string[],
    hosts: [] as string[],
    visitor_id: null as string | null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
    is_preregister_done: false,
    visitor_statuss: [] as string[],
    previous: false,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [siteOptions, setSiteOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [employeeOptions, setEmployeeOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [visitorOptions, setVisitorOptions] = useState<Array<{ id: string; visitor_name: string }>>(
    [],
  );
  const [activeTab, setActiveTab] = useState(0);
  const [summary, setSummary] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [sortDir, setSortDir] = useState('desc');
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [debouncedKeyword, setDebouncedSearch] = useState('');
  const [loadingReports, setLoadingReports] = useState(false);
  const [searchVisitor, setSearchVisitor] = useState('');
  // const [loadedReports, setLoadedReports] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
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

  const getSiteNames = (ids: string[]) => {
    if (!ids || !siteOptions.length) return '-';
    return ids
      .map((id) => {
        const site = siteOptions.find((site) => site.id.toUpperCase() === id.toUpperCase());
        return site?.name;
      })
      .filter(Boolean)
      .join(', ');
  };

  const getHostNames = (ids: string[]) => {
    if (!ids || !employeeOptions.length) return '-';
    return ids
      .map((id) => {
        const host = employeeOptions.find((e) => e.id.toUpperCase() === id.toUpperCase());
        return host?.name;
      })
      .filter(Boolean)
      .join(', ');
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchKeyword]);

  const fetchReports = async (reset = false) => {
    if (!token || loadingReports) return;

    setLoadingReports(true);

    try {
      const start = reset ? 0 : reports.length;

      const res = await getReportVisitorTransactionDt(token, {
        start,
        length: rowsPerPage,
        sort_dir: sortDir,
        search: debouncedKeyword || '',
      });

      const newData = res.collection || [];

      setReports((prev) => (reset ? newData : [...prev, ...newData]));

      if (newData.length < rowsPerPage) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    setHasMore(true);
    fetchReports(true);
  }, [debouncedKeyword, sortDir, token]);

  const refreshReportList = async () => {
    const start = page * rowsPerPage;
    const res = await getReportVisitorTransactionDt(token as string, {
      start,
      length: rowsPerPage,
      sort_dir: sortDir,
      search: searchKeyword || '',
    });
    setSavedReports(res.collection);
  };

  const [reportData, setReportData] = useState<any[]>([]);

  const isFormDataEmpty = (f: any) => {
    return (
      !f.start_date &&
      !f.end_date &&
      f.time_report === 'all' &&
      f.sites?.length === 0 &&
      f.hosts?.length === 0 &&
      !f.visitor_id &&
      f.visitor_statuss?.length === 0 &&
      f.is_preregister_done === false &&
      f.previous === false
    );
  };

  const handlePostReport = async (rep?: any) => {
    try {
      if (!token) return;

      if (!rep) {
        setSelectedReport(null);
      }

      if (isFormDataEmpty(formData)) {
        showSwal('error', 'Please select at least one filter.');
        return;
      }

      setLoading(true);

      if (formData.time_report === 'CustomDate' && (!formData.start_date || !formData.end_date)) {
        showSwal('error', 'Please select start and end date for CustomDate report');
        setLoading(false);
        return;
      }

      const res = rep
        ? await generateReportVisitorById(token, rep)
        : await generateReport(token, formData);
      console.log('res', res);
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

      setSummary(rowsSummary);

      const rows =
        res.collection?.data?.map((item: any) => ({
          id: item.id,
          visitor_type: item.visitor_type_name,
          name: item.visitor.name,
          email: item.visitor.email,
          organization: item.visitor.organization,
          gender: item.visitor.gender,
          phone: item.visitor.phone,
          // is_vip: item.visitor.is_vip,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          host: item.host_name ?? '-',
          vehicle_type: item.vehicle_type ?? '-',
          vehicle_plate_number: item.vehicle_plate_number ?? '-',
        })) ?? [];

      setReportData(rows);
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

  const exportToExcel = async () => {
    try {
      if (!token) return;

      // Validasi CustomDate
      if (formData.time_report === 'CustomDate' && (!formData.start_date || !formData.end_date)) {
        showSwal('error', 'Please select start and end date for CustomDate report');
        return;
      }

      setLoading(true);

      const exportData = {
        ...formData,
        is_export: true,
        export_report: 'Excell',
      };

      const res = await axiosInstance.post('/report/visitor-transaction/generate', exportData, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const dateStr = `${day}-${month}-${year}`;

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${dateStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showSwal('success', 'Report has been exported successfully.');
    } catch (err) {
      console.error('Error exporting report:', err);
      showSwal('error', 'Failed to export report.');
    } finally {
      setLoading(false);
    }
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

    // Format tanggal d-m-y
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    doc.save(`report-${dateStr}.pdf`);
  };

  const printReport = () => {
    //   const printWindow = window.open('', '_blank');
    //   const tableHtml = document.getElementById('print-report-area')?.innerHTML;
    //   printWindow!.document.write(`
    //   <html>
    //     <head>
    //       <title>Visitor Report</title>
    //     </head>
    //     <body>
    //       ${tableHtml}
    //     </body>
    //   </html>
    // `);
    //   printWindow!.document.close();
    //   printWindow!.focus();
    //   printWindow!.print();
    //   printWindow!.close();
  };

  const handleConfirmSaveReport = async () => {
    setLoading(true);
    try {
      await createReportVisitorTransaction(token as string, formData);
      await refreshReportList();
      await new Promise((res) => setTimeout(res, 600));

      showSnackbar('Report saved successfully!', 'success');
      handleResetForm();
      setOpenSaveDialog(false);
    } catch (err) {
      showSwal('error', 'Failed to save report.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: null,
      end_date: null,
      time_report: '',
      sites: [],
      hosts: [],
      visitor_id: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
      is_preregister_done: false,
      visitor_statuss: [],
      previous: false,
    });

    setEditingId(null);
    setReportData([]);
    setSummary([]);
    setSelectedReport(null);
  };

  const [openSaveDialog, setOpenSaveDialog] = useState(false);

  const handleEditReport = async (rep: any) => {
    if (!token) return;

    const res = await getReportVisitorTransactionById(token as string, rep.id);
    const d = res.collection;

    setFormData({
      name: d.name || null,
      description: d.description || null,
      start_date: d.start_date || null,
      end_date: d.end_date || null,
      time_report: d.time_report || 'all',
      visitor_id: d.visitor_id || null,
      timezone: d.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      is_preregister_done: d.is_preregister_done || false,
      previous: d.previous || false,

      visitor_statuss: d.visitor_statuss || [],
      sites: d.sites || [],
      hosts: d.hosts || [],
    });

    setSelectedReport(rep);
    setEditingId(rep.id);
  };
  const [loadingView, setLoadingView] = useState(false);

  const handleViewReport = async (rep: any) => {
    if (!token) return;

    setLoadingView(true);

    try {
      const res = await getReportVisitorTransactionById(token as string, rep.id);
      const d = res.collection;

      setFormData({
        name: d.name,
        description: d.description,
        start_date: d.start_date,
        end_date: d.end_date,
        time_report: d.time_report || 'all',
        visitor_id: d.visitor_id,
        timezone: d.timezone,
        is_preregister_done: d.is_preregister_done,
        previous: d.previous,
        visitor_statuss: d.visitor_statuss,
        sites: d.sites,
        hosts: d.hosts,
      });
      // console.log('Data', formData);

      setSelectedReport(rep);
      setEditingId(null);
    } finally {
      setLoadingView(false);
    }
  };

  const handleUpdateReport = async () => {
    if (!selectedReport) return;

    setLoading(true);

    try {
      await updateReportVisitorTransaction(token as string, selectedReport.id, formData);
      // await refreshReportList();
      await fetchReports(true);
      setEditingId(null);
      setTimeout(() => {
        showSwal('success', 'Report updated successfully!');
      }, 600);
    } catch (err) {
      console.error(err);
      // showSnackbar('Failed to update report.', 'error');
      showSwal('error', 'Failed to update report.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const isHavePreview = !!selectedReport?.id || summary.length > 0 || reportData.length > 0;

  const handleDelete = async (id: string) => {
    const isConfirmed = await showConfirmDelete('Are you sure to delete this report?');

    if (!isConfirmed) return;

    if (isConfirmed) {
      setLoading(true);
      try {
        await deleteReportVisitorTransaction(token as string, id);
        await fetchReports(true);

        showSwal('success', 'Report deleted successfully!');
      } catch (err) {
        console.error(err);
        showSwal('error', 'Failed to delete report.');
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const visitorStatusOptions = [
    { id: 'Preregis', label: 'Preregis' },
    { id: 'Checkin', label: 'Checkin' },
    { id: 'Checkout', label: 'Checkout' },
    { id: 'Block', label: 'Block' },
    { id: 'Unblock', label: 'Unblock' },
  ];

  return (
    <Container title="Report" description="This is Content Report page">
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 3, xl: 2 }}>
          <Box sx={{ backgroundColor: 'white', p: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom mb={2}>
              Transaction Log Report
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Report Name</CustomFormLabel>
                <TextField
                  fullWidth
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter Report Name"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Description</CustomFormLabel>
                <TextField
                  fullWidth
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Description"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

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
                  value={formData.start_date || ''}
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
                  value={formData.end_date || ''}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& input': { color: 'black' }, mt: 0.5 }}
                  disabled={formData.time_report !== 'CustomDate'}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Visitor</CustomFormLabel>
                <Autocomplete
                  size="small"
                  options={visitorOptions}
                  getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.visitor_name
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  inputValue={searchVisitor}
                  onInputChange={(_, newInputValue) => setSearchVisitor(newInputValue)}
                  filterOptions={(opts, state) => {
                    const term = (state.inputValue || '').toLowerCase();
                    if (term.length < 3) return [];
                    return opts.filter((opt) =>
                      (opt.visitor_name || '').toLowerCase().includes(term),
                    );
                  }}
                  noOptionsText={searchVisitor.length < 3 ? 'Search Visitor' : 'No visitor found'}
                  value={visitorOptions.find((x) => x.id === formData.visitor_id) || null}
                  onChange={(_, val) => handleChange('visitor_id', val ? val.id : null)}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.visitor_name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Search Visitor" fullWidth />
                  )}
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Visitor Status</CustomFormLabel>
                <Autocomplete
                  multiple
                  size="small"
                  options={visitorStatusOptions}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={visitorStatusOptions.filter((opt) =>
                    formData.visitor_statuss?.includes(opt.id),
                  )}
                  onChange={(_, values) =>
                    handleChange(
                      'visitor_statuss',
                      values.map((v) => v.id),
                    )
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.label}
                        size="small"
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Select Visitor Status" fullWidth />
                  )}
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomFormLabel sx={{ marginY: 0, marginX: 0 }}>Sites</CustomFormLabel>
                <Autocomplete
                  multiple
                  options={siteOptions}
                  value={siteOptions.filter((x) =>
                    formData.sites
                      .map((id) => id.toString().toUpperCase())
                      .includes(x.id.toString().toUpperCase()),
                  )}
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
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <FormGroup>
                  <FormControlLabel
                    label="Previous"
                    control={
                      <Checkbox
                        checked={formData.previous}
                        onChange={(e) => handleChange('previous', e.target.checked)}
                      />
                    }
                  />
                </FormGroup>
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 8 }}>
                <FormGroup>
                  <FormControlLabel
                    label="Preregister Done"
                    control={
                      <Checkbox
                        checked={formData.is_preregister_done}
                        onChange={(e) => handleChange('is_preregister_done', e.target.checked)}
                      />
                    }
                  />
                </FormGroup>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 12 }} mt={2}>
              <Box
                sx={{ display: 'flex', gap: 1, mt: 0.5 }}
                flexDirection="column"
                justifyContent="space-between"
                flexWrap={'wrap'}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePostReport(null);
                  }}
                  startIcon={<IconReport size={20} />}
                  disabled={loading}
                  sx={{ fontSize: 12 }}
                  size="medium"
                >
                  {loading ? <CircularProgress size={18} /> : 'Generate Report'}
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  // onClick={handleOpenSaveDialog}
                  onClick={handleConfirmSaveReport}
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
              <Grid size={{ xs: 12, xl: 2.5 }}>
                <FormControl sx={{ width: '100%' }}>
                  <CustomTextField
                    fullWidth
                    size="medium"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search  Report Name"
                    sx={{ mb: 1, width: '100%' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
                {loadingReports ? (
                  [...Array(7)].map((_, i) => (
                    <Card key={i} sx={{ p: 2, mb: 2 }}>
                      <Skeleton width="60%" height={30} />
                      <Skeleton height={20} />
                      <Skeleton height={20} width="80%" />
                    </Card>
                  ))
                ) : reports.length === 0 ? (
                  <Typography variant="h6" color="text.secondary" align="center" mt={5}>
                    Report not found.
                  </Typography>
                ) : (
                  <>
                    {reports.map((rep) => (
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
                          '&:hover': {
                            border: '2px solid #1976d2',
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            transition: 'all 0.3s ease-in-out',
                            transform: 'scale(1.05)',
                          },
                        }}
                        onClick={() => handleViewReport(rep)}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="h6">{rep.name}</Typography>
                          <Typography variant="body1"> {getHostNames(rep.hosts)}</Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 1,
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            {rep.time_report === 'CustomDate' && rep.start_date && rep.end_date
                              ? `${rep.start_date} - ${rep.end_date}`
                              : ''}
                          </Typography>
                          <Typography variant="body1"> {getSiteNames(rep.sites)}</Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'flex-end',
                            gap: 0.5,
                          }}
                        >
                          <Tooltip title="Generate Report" arrow>
                            <Button
                              variant="contained"
                              color="primary"
                              sx={{ mt: 2, me: 1 }}
                              // disabled={loading}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePostReport(rep.id);
                              }}
                            >
                              <IconReport size={20} />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Edit Report" arrow>
                            <Button
                              variant="contained"
                              color="secondary"
                              sx={{ mt: 2, backgroundColor: '#FA896B' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditReport(rep);
                              }}
                            >
                              {/* Edit */}
                              <IconPencil size={20} />
                            </Button>
                          </Tooltip>
                          {editingId === rep?.id && (
                            <Tooltip title="Update Report" arrow>
                              <Button
                                variant="contained"
                                color="warning"
                                startIcon={<IconDeviceFloppy size={20} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateReport();
                                }}
                                disabled={loading}
                                sx={{ mt: 2, me: 1 }}
                              >
                                Update
                              </Button>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete Report" arrow>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              sx={{ mt: 2 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(rep.id);
                              }}
                            >
                              {/* Edit */}
                              <IconTrash size={20} />
                            </Button>
                          </Tooltip>
                        </Box>
                      </Card>
                    ))}
                    {hasMore && (
                      <Box textAlign="center" mt={2}>
                        <Button
                          onClick={() => fetchReports(false)}
                          variant="contained"
                          color="primary"
                          fullWidth
                        >
                          {loadingReports || loadingMore ? (
                            <CircularProgress size={20} />
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </Grid>

              <Grid
                sx={{
                  display: { xs: 'none', md: 'block' },
                  borderRight: '1px solid #e0e0e0',
                  height: 'auto',
                  mx: 0.5,
                  flexGrow: 0.5,
                }}
                size={{ xs: 12, xl: 0.1 }}
              />

              <Grid size={{ xs: 12, xl: 9 }} flexGrow={1}>
                {isHavePreview ? (
                  <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                        <Tab label="Summary" />
                        <Tab label="Table Report" />
                      </Tabs>
                    </Box>
                    {activeTab === 0 && (
                      <Box>
                        {summary ? (
                          <DynamicTable
                            data={summary}
                            isHaveHeaderTitle={true}
                            titleHeader="Summary"
                            isHaveExportCsv={false}
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
                            isHaveSearch={false}
                            isHavePagination={false}
                            isHaveHeaderTitle={true}
                            titleHeader="Report"
                            isHavePeriod
                            // onSearchKeywordChange={(val) => {
                            //   setSearchReport(val);
                            //   handlePostReport(selectedReport?.id, val);
                            // }}
                            isHaveExportCsv={false}
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
                      minHeight: '90vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'none !important',
                    }}
                  >
                    <Typography variant="h5" color="text.secondary">
                      Select a report from the left to preview details.
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
        <DialogTitle sx={{ position: 'relative', padding: 3 }}>Transaction Log Report</DialogTitle>
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
  );
};

export default Content;
