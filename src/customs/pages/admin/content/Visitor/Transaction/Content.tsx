import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  DialogActions,
  CircularProgress,
  TextField,
  Card,
  Skeleton,
  Grid2 as Grid,
  IconButton,
  Button,
  Avatar,
  Typography,
  Portal,
  Autocomplete,
  Snackbar,
  Alert,
  TableRow,
  TableCell,
  TableHead,
  Collapse,
  Table,
  TableBody,
  TableContainer,
  Paper,
  useTheme,
  useMediaQuery,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';

import type { AlertColor } from '@mui/material/Alert';
import PageContainer from 'src/customs/components/container/PageContainer';
import Container from 'src/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import iconScanQR from 'src/assets/images/svgs/scan-qr.svg';
import iconAdd from 'src/assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import CloseIcon from '@mui/icons-material/Close';
import FormWizardAddInvitation from '../Trx/FormWizardAddInvitation';
import FormWizardAddVisitor from '../Trx/FormWizardAddVisitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorRequestSchema,
  Item,
  CreateVisitorRequest,
} from 'src/customs/api/models/Admin/Visitor';
import {
  getAllSite,
  getAllVisitorType,
  getRegisteredSite,
  getVisitorById,
  getVisitorEmployee,
  getVisitorTransactionByIds,
  getVisitorTransactionPagination,
} from 'src/customs/api/admin';
import { Scanner } from '@yudiel/react-qr-scanner';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import {
  IconArrowRight,
  IconCamera,
  IconClipboard,
  IconFileSpreadsheet,
  IconFilterFilled,
  IconPdf,
  IconQrcode,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import EmployeeDetailDialog from '../Dialog/EmployeeDetailDialog';
import VisitorDetailDialog from '../Dialog/VisitorDetailDialog';
import { getInvitationCode } from 'src/customs/api/operator';
import { showSwal } from 'src/customs/components/alerts/alerts';
import DetailVisitorDialog from 'src/customs/pages/Operator/Dialog/DetailVisitorDialog';
import {
  FilterList,
  KeyboardArrowDown,
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
} from '@mui/icons-material';
import { useDebounce } from 'src/hooks/useDebounce';
import VisitorRow from './VisitorRow';
import FilterTransaction from './FilterMoreContent';

dayjs.extend(utc);
dayjs.extend(timezone);

type VisitorTableRow = {
  id: string;
  identity_id: string;
  name: string;
  visitor_type: string;
  email: string;
  organization: string;
  gender: string;
  phone: string;
  // is_vip: string;
  visitor_period_start: string;
  visitor_period_end: string;
  host: string;
};

type Group = {
  id: string;
  name: string;
  agenda: string;
  rows: any[];
};

const Content = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDir, setSortDir] = useState<string>('desc');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

  const [edittingId, setEdittingId] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  // mode konfirmasi: "close-add" atau "edit"
  const [discardMode, setDiscardMode] = useState<'close-add' | 'edit' | null>(null);
  const [tableRowVisitors, setTableRowVisitors] = useState<any[]>([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });

  const cards = [
    {
      title: 'Total Visitor',
      icon: IconUsers,
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
    {
      title: 'Scan QR Visitor',
      icon: IconQrcode,
      subTitle: iconScanQR,
      subTitleSetting: 'image',
      color: 'none',
    },
    {
      title: 'Add Invitation',
      icon: IconUser,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
    {
      title: 'Add Pre Registration',
      icon: IconClipboard,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
  ];

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor; 
  }>({ open: false, message: '', severity: 'info' });

  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };

  const defaultFormData = CreateVisitorRequestSchema.parse({});
  const isFormChanged = JSON.stringify(formDataAddVisitor) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    if (isFormChanged) {
      localStorage.setItem('unsavedVisitorData', JSON.stringify(formDataAddVisitor));
    } else {
      localStorage.removeItem('unsavedVisitorData');
    }
  }, [formDataAddVisitor, isFormChanged]);

  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
  const [flowTarget, setFlowTarget] = useState<'invitation' | 'preReg' | null>(null);

  // Registered Site
  const [siteData, setSiteData] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  // Qr Scanner
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const secdrawerWidth = 260;
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [openGroup, setOpenGroup] = useState(true);
  const [showDrawerFilterMore, setShowDrawerFilterMore] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupDetail, setGroupDetail] = useState<any | null>(null);
  const [groupDetailLoading, setGroupDetailLoading] = useState(false);
  const [groupHeader, setGroupHeader] = useState<any | null>(null);
  const [groupVisitors, setGroupVisitors] = useState<any[]>([]);
  const [visitorType, setVisitorType] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [vtLoading, setVTLoading] = useState(false);
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);

  const resetRegisteredFlow = () => {
    setSelectedSite(null);
    setFormDataAddVisitor(defaultFormData);
  };
  const handleDialogClose = () => {
    setOpenDialogIndex(null);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    resetRegisteredFlow();
  };

  const [selectedType, setSelectedType] = useState<
    'All' | 'Preregis' | 'Checkin' | 'Checkout' | 'Denied' | 'Block'
  >('All');

  const statusMap: Record<string, string> = {
    All: 'All',
    Preregis: 'Preregis',
    Checkin: 'Checkin',
    Checkout: 'Checkout',
    Denied: 'Denied',
    Block: 'Block',
  };

  const visitorRole: Record<string, string> = {
    Visitor: 'Visitor',
    Delivery: 'Delivery',
    Vip: 'Vip',
  };


  const [searchAgenda, setSearchAgenda] = useState('');
  const debouncedSearchAgenda = useDebounce(searchAgenda, 400);

  const [filters, setFilters] = useState<any>({
    status: undefined,
    visitor_type: '',
    visitor_role: '',
    host_id: '',
    site_id: '',
    is_employee: '',
    is_block: '',
    transaction_status: '',
    emergency_situation: '',
    start_date: '',
    end_date: '',
  });

  const [appliedFilters, setAppliedFilters] = useState<any>({
    status: undefined,
    visitor_status: '',
    visitor_type: '',
    visitor_role: '',
    host_id: '',
    site_id: '',
    is_block: '',
    transaction_status: '',
    emergency_situation: '',
    start_date: '',
    end_date: '',
  });

  const fetchData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const start = page * rowsPerPage;

      const isEmergencyParam =
        appliedFilters.emergency_situation === ''
          ? undefined
          : appliedFilters.emergency_situation === 'true';

      const isBlockParam =
        appliedFilters.is_block === '' ? undefined : appliedFilters.is_block === 'true';

      const res = await getVisitorTransactionPagination(
        token,
        start,
        rowsPerPage,
        sortDir,
        debouncedSearchAgenda || undefined,
        appliedFilters.start_date || undefined,
        appliedFilters.end_date || undefined,
        appliedFilters.visitor_status || undefined,
        appliedFilters.data_filter,
        appliedFilters.transaction_status || undefined,
        appliedFilters.site_id || undefined,
        appliedFilters.visitor_role || undefined,
        isEmergencyParam,
        isBlockParam,
        appliedFilters.host_id || undefined,
      );

      setTableRowVisitors(
        res.collection.map((item: any) => ({
          id: item.id,
          agenda: item.agenda || '-',
          visitor_type: item.visitor_type_name || '-',
          host_name: item.host_name || '-',
        })),
      );

      setTotalRecords(res.RecordsTotal);
      setTotalFilteredRecords(res.RecordsFiltered);
    } catch (err) {
      console.error('fetchData error:', err);
      setTableRowVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token, page, rowsPerPage, sortDir, appliedFilters, debouncedSearchAgenda]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getRegisteredSite(token as string);
      setSiteData(response.collection);
    };
    fetchData();
  }, [token]);

  const handleCloseDialog = () => {
    setSelectedSite(null);
    setOpenDialog(false);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    handleDialogClose();
  };
  const handleAdd = () => {
    const saved = localStorage.getItem('unsavedVisitorData');
    let freshForm;

    if (saved) {
      try {
        freshForm = JSON.parse(saved);
      } catch {
        freshForm = CreateVisitorRequestSchema.parse({});
      }
    } else {
      freshForm = CreateVisitorRequestSchema.parse({});
    }

    setEdittingId('');
    setFormDataAddVisitor(freshForm);
    setSelectedSite(null);
    setPendingEditId(null);
    setOpenDialog(true);
  };

  const handleSuccess = () => {
    setSelectedSite(null);
    setFormDataAddVisitor((prev: any) => ({
      ...prev,
      registered_site: '',
    }));
    setRefreshTrigger((prev) => prev + 1);
    handleCloseDialog();
  };

  const openDiscardForCloseAdd = () => {
    setDiscardMode('close-add');
    setConfirmDialogOpen(true);
  };

  const handleCancelDiscard = () => {
    setConfirmDialogOpen(false);
    setDiscardMode(null);
    setPendingEditId(null);
  };

  const resetFormData = () => {
    localStorage.removeItem('unsavedVisitorData');
    setFormDataAddVisitor(defaultFormData);
    setEdittingId('');
  };

  const confirmDiscardAndClose = () => {
    resetFormData();
    setWizardKey((k) => k + 1);
    setOpenDialog(false);
    setOpenDialogIndex(null);
    setFormDataAddVisitor(defaultFormData);
    setConfirmDialogOpen(false);
    setDiscardMode(null);
    handleDialogClose();
  };

  const handleSubmitQRCode = async (value: string) => {
    try {
      setLoading(true);
      const res = await getInvitationCode(token as string, value);
      const data = res.collection?.data ?? [];

      setVisitorData(data);
      setOpenDetail(true);

      if (data.length === 0) {
        showSwal('error', 'Your code does not exist.');
        return;
      }
    } catch (error) {
      showSwal('error', 'Failed to fetch visitor data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedGroupId || !token) return;

    const fetchDetail = async () => {
      setGroupDetailLoading(true);
      try {
        const res = await getVisitorTransactionByIds(token, selectedGroupId);
        console.log('res', res.collection);
        setGroupHeader(res.collection[0]);
        setGroupVisitors(res.collection);
      } catch (e) {
        setGroupDetail(null);
        setGroupVisitors([]);
      } finally {
        setGroupDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedGroupId, token]);

  const handleResetFilter = () => {
    const empty = {
      visitor_status: '',
      visitor_type: '',
      visitor_role: '',
      host_id: '',
      site_id: '',
      is_block: '',
      transaction_status: '',
      emergency_situation: '',
      start_date: '',
      end_date: '',
    };

    setFilters(empty);
    setAppliedFilters({
      status: undefined,
      ...empty,
    });

    setSearch('');
    setSelectedType('All');
    setPage(0);
  };

  const handleApplyFilter = () => {
    setAppliedFilters({
      status: selectedType === 'All' ? undefined : statusMap[selectedType],
      ...filters,
    });

    setPage(0);
    setSelectedGroupId(null);
    setGroupVisitors([]);
    // setShowDrawerFilterMore(false);
  };

  const fetchVisitorType = async () => {
    try {
      setVTLoading(true);
      const res = await getAllVisitorType(token as string);
      setVisitorType(res?.collection || []);
    } catch (err) {
      console.error(err);
    } finally {
      setVTLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVisitorType();
    }
  }, [token]);
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [siteRes, employeeRes] = await Promise.all([
          getAllSite(token),
          getVisitorEmployee(token),
        ]);

        setSites(siteRes?.collection ?? []);
        setEmployee(employeeRes?.collection ?? []);
        setAllVisitorEmployee(employeeRes?.collection ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Transaction Visitor" description="this is transaction visitor page">
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard
                cardMarginBottom={1}
                items={cards}
                onImageClick={(_, index) => {
                  if (index === 2) {
                    setFlowTarget('invitation');
                    setOpenDialogIndex(2);
                  } else if (index === 3) {
                    setFlowTarget('preReg');
                    setOpenPreRegistration(true);
                  } else {
                    setOpenDialogIndex(index);
                  }
                }}
                size={{ xs: 12, lg: 3 }}
              />
            </Grid>
          </Grid>
          <Box
            sx={{
              display: 'flex',
              flexDirection: mdUp ? 'row' : 'column',
              backgroundColor: '#fff',
              height: '100%',
              width: '100%',
              // overflow: 'hidden',
              marginTop: '5px',
            }}
          >
            <Box
              sx={{
                width: mdUp ? secdrawerWidth : '100%',
                borderRight: '1px solid #eee',
                p: 2,
                pt: 2,
                overflow: 'auto',
                height: { xs: '100%', md: '75vh' },
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontSize="1rem">
                  Transaction Visitor
                </Typography>
              </Box>

              {/* Search */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search Agenda"
                value={searchAgenda}
                onChange={(e) => setSearchAgenda(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowDrawerFilterMore(true)}>
                        <IconFilterFilled />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box>
                <Box>
                  {tableRowVisitors.map((group: any) => (
                    <Box
                      key={group.id}
                      sx={{
                        backgroundColor: selectedGroup?.id === group.id ? '#e3f2fd' : '#f5f5f5',
                        borderRadius: '8px',
                        padding: '10px',
                        cursor: 'pointer',
                        mb: 1,
                        '&:hover': {
                          backgroundColor: '#eee',
                        },
                      }}
                      onClick={() => {
                        setSelectedGroup(group);
                        setSelectedGroupId(group.id);
                      }}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        {group.agenda}
                      </Typography>
                      <Box display={'flex'} justifyContent={'space-between'}>
                        <Typography>{group.visitor_type}</Typography>
                        <Typography>{group.host_name}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
            <Box flexGrow={1} p={2} sx={{ height: { xs: 'auto', xl: '78vh' }, overflow: 'auto' }}>
              {selectedGroupId ? (
                <TableContainer component={Paper} sx={{ border: '1px solid #d6d6d6ff' }}>
                  <Table aria-label="collapsible table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 50 }}>
                          <IconButton size="small" onClick={() => setOpenGroup(!openGroup)}>
                            {openGroup ? (
                              <KeyboardArrowUpOutlined />
                            ) : (
                              <KeyboardArrowDownOutlined />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell colSpan={5}>
                          <Box
                            display={'flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}
                          >
                            <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>
                              {groupHeader?.group_name ?? '-'}
                            </Typography>
                            <Box display={'flex'} gap={0.5}>
                              <Tooltip title="Export PDF" arrow>
                                <Button variant="contained" color="error">
                                  <IconPdf />
                                </Button>
                              </Tooltip>
                              <Tooltip title="Export Excel" arrow>
                                <Button variant="contained" color="success">
                                  <IconFileSpreadsheet />
                                </Button>
                              </Tooltip>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupDetailLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <CircularProgress size={24} />
                          </TableCell>
                        </TableRow>
                      ) : groupVisitors.length > 0 ? (
                        groupVisitors.map((visitor: any, index: number) => (
                          <VisitorRow key={visitor.id} visitor={visitor} index={index} />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="text.secondary">No visitor data</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  height="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <img src={bg_nodata} width={150} />
                  <Typography color="text.secondary" mt={2} variant="h5">
                    Select a group from the list.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
      {/* Add New Invitation Visitor */}
      <Dialog
        fullWidth
        // maxWidth="xl"
        open={openInvitationVisitor}
        onClose={handleDialogClose}
        keepMounted
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100vw',
          },
        }}
      >
        <DialogTitle
          display="flex"
          justifyContent={'space-between'}
          alignItems="center"
          // sx={{
          //   background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(99,102,241,0.08))',
          // }}
        >
          Add Invitation Visitor
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                openDiscardForCloseAdd();
              } else {
                handleCloseDialog();
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <FormWizardAddVisitor
            key={wizardKey}
            formData={formDataAddVisitor}
            setFormData={setFormDataAddVisitor}
            edittingId={edittingId}
            onSuccess={handleSuccess}
            visitorType={visitorType}
            sites={sites}
            employee={employee}
            allVisitorEmployee={allVisitorEmployee}
            vtLoading={vtLoading}
          />
        </DialogContent>
      </Dialog>
      {/* Add Pre registration */}
      <Dialog
        fullWidth
        // maxWidth="xl"
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100vw',
          },
        }}
        open={openPreRegistration}
        onClose={handleDialogClose}
      >
        <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
          Add Pra Registration
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                openDiscardForCloseAdd();
              } else {
                handleCloseDialog();
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: '0px' }}>
          <br />
          <FormWizardAddInvitation
            key={wizardKey}
            formData={formDataAddVisitor}
            setFormData={setFormDataAddVisitor}
            edittingId={edittingId}
            onSuccess={handleSuccess}
            visitorType={visitorType}
            sites={sites}
            employee={employee}
            allVisitorEmployee={allVisitorEmployee}
            vtLoading={vtLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Select Registered Site */}
      <Dialog open={openDialogIndex === 2} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle
          display="flex"
          justifyContent={'space-between'}
          alignItems="center"
          // sx={{
          //   background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(99,102,241,0.08))',
          // }}
        >
          Select Registered Site
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                openDiscardForCloseAdd();
              } else {
                handleCloseDialog();
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <CustomFormLabel sx={{ marginTop: 0 }}>Registered Site</CustomFormLabel>
          <Autocomplete
            fullWidth
            options={siteData}
            getOptionLabel={(o) => o.name || ''}
            value={selectedSite}
            onChange={(_, nv) => {
              setSelectedSite(nv);
              setFormDataAddVisitor((prev) => ({
                ...prev,
                registered_site: nv?.id || '',
              }));
            }}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => <TextField {...params} label="" />}
          />
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              onClick={() => {
                if (!selectedSite) {
                  toast('Minimal pilih 1 Registered Site.', 'warning');
                  return;
                }
                setFormDataAddVisitor((prev) => ({
                  ...prev,
                  registered_site: selectedSite.id,
                }));
                setOpenDialogIndex(null);
                if (flowTarget === 'invitation') {
                  setOpenInvitationVisitor(true);
                } else if (flowTarget === 'preReg') {
                  setOpenPreRegistration(true);
                }
              }}
              color="primary"
              endIcon={<IconArrowRight width={18} />}
            >
              Next
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* QR Code */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={openDialogIndex === 1}
        onClose={() => {
          // matikan torch kalau menyala (best-effort)
          try {
            const video = scanContainerRef.current?.querySelector(
              'video',
            ) as HTMLVideoElement | null;
            const stream = video?.srcObject as MediaStream | null;
            const track = stream?.getVideoTracks()?.[0];
            const caps = track?.getCapabilities?.() as any;
            if (track && caps?.torch && torchOn) {
              track.applyConstraints({ advanced: [{ facingMode: 'user' }] });
            }
          } catch {}

          setTorchOn(false);
          setFacingMode('environment');
          setQrMode('manual');
          setHasDecoded(false);
          setQrValue('');
          handleDialogClose();
        }}
      >
        <DialogTitle display="flex">
          Scan QR Visitor
          <IconButton
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => {
              // matikan torch kalau menyala (best-effort)
              try {
                const video = scanContainerRef.current?.querySelector(
                  'video',
                ) as HTMLVideoElement | null;
                const stream = video?.srcObject as MediaStream | null;
                const track = stream?.getVideoTracks()?.[0];
                const caps = track?.getCapabilities?.() as any;
                if (track && caps?.torch && torchOn) {
                  track.applyConstraints({ advanced: [{ facingMode: 'user' }] });
                }
              } catch {}

              setTorchOn(false);
              setFacingMode('environment');
              setQrMode('manual');
              setHasDecoded(false);
              setQrValue('');
              handleDialogClose();
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent>
          {/* Toggle mode */}
          <Box display="flex" gap={1} mb={2}>
            <Button
              variant={qrMode === 'manual' ? 'contained' : 'outlined'}
              onClick={() => setQrMode('manual')}
              size="small"
            >
              Manual
            </Button>
            <Button
              variant={qrMode === 'scan' ? 'contained' : 'outlined'}
              onClick={() => {
                setHasDecoded(false);
                setQrMode('scan');
              }}
              size="small"
              startIcon={<IconCamera />}
            >
              Scan Camera
            </Button>
          </Box>

          {/* MODE: MANUAL */}
          {qrMode === 'manual' && (
            <>
              <TextField
                fullWidth
                label=""
                variant="outlined"
                placeholder="Input your invitation code"
                size="small"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
              />
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    handleSubmitQRCode(qrValue);
                    // setQrValue('');
                  }}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </Box>
            </>
          )}

          {/* MODE: SCAN */}
          {qrMode === 'scan' && (
            <>
              <Box
                ref={scanContainerRef}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'black',
                  aspectRatio: '3 / 4',
                }}
              >
                <Scanner
                  constraints={{ facingMode }}
                  onScan={async (result: any) => {
                    // if (!result) return;
                    // if (hasDecoded) return; // cegah spam callback
                    // setHasDecoded(true);
                    // setQrValue(typeof result === 'string' ? result : String(result));
                    if (!result || hasDecoded) return;

                    console.log('📸 QR scan raw result:', result);
                    setHasDecoded(true);

                    let value = '';
                    if (typeof result === 'string') value = result;
                    else if (Array.isArray(result)) value = result[0]?.rawValue || '';
                    else if (typeof result === 'object')
                      value = result.rawValue || JSON.stringify(result);

                    console.log('✅ Extracted QR value:', value);
                    setQrValue(value);

                    try {
                      // setIsSubmitting(true);
                      await handleSubmitQRCode(value);
                      // onClose();
                      handleDialogClose();
                    } catch (err) {
                      console.error('❌ Error saat submit QR:', err);
                    } finally {
                      // setIsSubmitting(false);
                    }
                  }}
                  onError={(error: any) => {
                    console.log('QR error:', error?.message || error);
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      border: 'none !important',
                    },
                  }}
                />

                <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <Box
                    sx={{
                      // ukuran kotak scan (responsif)
                      '--scanSize': { xs: '70vw', sm: '380px' },

                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 'var(--scanSize)',
                      height: 'var(--scanSize)',
                      transform: 'translate(-50%, -50%)',

                      // ini yang bikin area luar gelap, tengah tetap terang
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                      borderRadius: 2, // 0 jika mau siku
                      outline: '2px solid rgba(255,255,255,0.18)',
                    }}
                  >
                    {/* 4 corner, ditempel di dalam kotak agar selalu pas */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        '& .corner': {
                          position: 'absolute',
                          width: 24,
                          height: 24,
                          border: '3px solid #00e5ff',
                        },
                        '& .tl': { top: 0, left: 0, borderRight: 'none', borderBottom: 'none' },
                        '& .tr': { top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' },
                        '& .bl': { bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' },
                        '& .br': { bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' },
                      }}
                    >
                      <Box className="corner tl" />
                      <Box className="corner tr" />
                      <Box className="corner bl" />
                      <Box className="corner br" />
                    </Box>

                    {/* Laser animasi (bergerak di dalam kotak) */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 10,
                        right: 10,
                        height: 2,
                        top: 0,
                        background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
                        animation: 'scanLine 2s linear infinite',
                        '@keyframes scanLine': {
                          '0%': { transform: 'translateY(0)' },
                          '100%': { transform: 'translateY(calc(var(--scanSize) - 2px))' },
                        },
                      }}
                    />
                  </Box>
                </Box>
                {/* Kontrol: Flip & Torch */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 8,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Button
                    onClick={() =>
                      setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'))
                    }
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.6)' }}
                    startIcon={<FlipCameraAndroidIcon fontSize="small" />}
                  >
                    Flip
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        const video = scanContainerRef.current?.querySelector(
                          'video',
                        ) as HTMLVideoElement | null;
                        const stream = video?.srcObject as MediaStream | null;
                        const track = stream?.getVideoTracks()?.[0];
                        const caps = track?.getCapabilities?.() as any;
                        if (track && caps?.torch) {
                          await track.applyConstraints({ advanced: [{ torch: !torchOn }] as any });
                          setTorchOn((t) => !t);
                        } else {
                          console.log('Torch not supported on this device.');
                        }
                      } catch (e) {
                        console.log('Torch toggle error:', e);
                      }
                    }}
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.6)' }}
                    startIcon={
                      torchOn ? <FlashOnIcon fontSize="small" /> : <FlashOffIcon fontSize="small" />
                    }
                  >
                    Torch
                  </Button>
                </Box>
              </Box>
              {/* <Box mt={2} display="flex" gap={1} justifyContent="space-between">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setHasDecoded(false);
                    setQrValue('');
                  }}
                >
                  Reset
                </Button>
                <Box>
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      handleSubmitQRCode(qrValue);
                    }}
                    disabled={!qrValue}
                  >
                    Submit
                  </Button>
                </Box>
              </Box> */}
            </>
          )}
        </DialogContent>
      </Dialog>

      <DetailVisitorDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        visitorData={visitorData}
      />

      {/* Unsaved Changes */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelDiscard} fullWidth maxWidth="sm">
        <DialogTitle>Unsaved Changes</DialogTitle>

        <DialogContent>
          <Typography>Are you sure you want to discard your changes?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDiscard}>Cancel</Button>
          <Button onClick={confirmDiscardAndClose} color="primary" variant="contained">
            Yes, Discard and Continue
          </Button>
        </DialogActions>
      </Dialog>
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ zIndex: 99999 }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
      <FilterTransaction
        open={showDrawerFilterMore}
        onClose={() => setShowDrawerFilterMore(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilter}
        onResetFilter={handleResetFilter}
      />
    </PageContainer>
  );
};

export default Content;
