import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  CircularProgress,
  Skeleton,
  Grid2 as Grid,
  IconButton,
  Button,
  Typography,
  Portal,
  Snackbar,
  Alert,
  TableRow,
  TableCell,
  TableHead,
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
import iconScanQR from 'src/assets/images/svgs/scan-qr.svg';
import iconAdd from 'src/assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import CloseIcon from '@mui/icons-material/Close';
import FormWizardAddInvitation from 'src/customs/pages/admin/content/Visitor/Trx/FormWizardAddInvitation';
import FormWizardAddVisitor from 'src/customs/pages/admin/content/Visitor/Trx/FormWizardAddVisitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorRequestSchema,
  Item,
  CreateVisitorRequest,
} from 'src/customs/api/models/Admin/Visitor';
import {
  getAllEmployee,
  getAllSite,
  getAllVisitorType,
  getRegisteredSite,
  getVisitorById,
  getVisitorEmployee,
  getVisitorTransactionByIds,
  getVisitorTransactionPagination,
} from 'src/customs/api/admin';
import {
  IconClipboard,
  IconFileSpreadsheet,
  IconFilterFilled,
  IconPdf,
  IconQrcode,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';

import { getInvitationCode } from 'src/customs/api/operator';
import { showSwal } from 'src/customs/components/alerts/alerts';
import DetailVisitorDialog from 'src/customs/pages/Operator/Dialog/DetailVisitorDialog';
import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { useDebounce } from 'src/hooks/useDebounce';
import VisitorRow from './VisitorRow';
import FilterTransaction from './FilterMoreContent';
import { useQuery } from '@tanstack/react-query';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import ConfirmUnsavedDialog from '../../../components/ConfirmUnsavedDialog';
import QrScannerDialog from '../Trx/components/Dialog/QrScannerDialog';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import RegisteredSiteDialog from '../Trx/components/Dialog/RegisteredSiteDialog';
import { useVisitorType } from 'src/hooks/useVisitorType';
import { useSites } from 'src/hooks/useSites';
import { useEmployees } from 'src/hooks/useEmployees';
import { useVisitorEmployees } from 'src/hooks/useVisitorEmployees';
import InvitationVisitorDialog from '../Trx/components/InvitationVisitorDialog';
import PreRegistrationDialog from '../Trx/components/PreRegistrationDialog';

dayjs.extend(utc);
dayjs.extend(timezone);

type Group = {
  id: string;
  name: string;
  agenda: string;
  rows: any[];
};

const Content = () => {
  const { token, roleAccess } = useSession();
  const isOperatorAdmin = roleAccess === 'OperatorAdmin';
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [sortDir, setSortDir] = useState<string>('desc');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [edittingId, setEdittingId] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
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
    ...(!isOperatorAdmin
      ? [
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
        ]
      : []),
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
  const [groupDetailLoading, setGroupDetailLoading] = useState(false);
  const [groupHeader, setGroupHeader] = useState<any | null>(null);
  const [groupVisitors, setGroupVisitors] = useState<any[]>([]);

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
          visitor_period_start: formatDateTime(item.visitor_period_start),
          visitor_period_end: formatDateTime(item.visitor_period_end),
        })),
      );

      setTotalRecords(res.RecordsTotal);
      setTotalFilteredRecords(res.RecordsFiltered);
    } catch (err) {
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

  const handleSuccess = () => {
    setSelectedSite(null);
    setFormDataAddVisitor((prev: any) => ({
      ...prev,
      registered_site: '',
    }));
    // setRefreshTrigger((prev) => prev + 1);
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
        // setGroupVisitors([]);
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

  // const { data: visitorType = [], isLoading: vtLoading } = useQuery({
  //   queryKey: ['visitorType'],
  //   queryFn: async () => {
  //     const res = await getAllVisitorType(token as string);
  //     return res?.collection || [];
  //   },
  //   enabled: !!token,
  //   staleTime: 0,
  //   refetchOnMount: true,
  //   refetchOnWindowFocus: false,
  // });
  // const { data: sites = [], isLoading: siteLoading } = useQuery({
  //   queryKey: ['sites'],
  //   queryFn: async () => {
  //     const res = await getAllSite(token as string);
  //     return res?.collection ?? [];
  //   },
  //   enabled: !!token,
  //   staleTime: 0,
  //   refetchOnMount: true,
  //   refetchOnWindowFocus: false,
  // });

  // const { data: employee = [], isLoading: employeeLoading } = useQuery({
  //   queryKey: ['employee'],
  //   queryFn: async () => {
  //     const res = await getAllEmployee(token as string);
  //     return res?.collection ?? [];
  //   },
  //   enabled: !!token,
  //   staleTime: 0,
  //   refetchOnMount: true,
  //   refetchOnWindowFocus: false,
  // });

  // const { data: allVisitorEmployee = [], isLoading: visitorEmployeeLoading } = useQuery({
  //   queryKey: ['allVisitorEmployee'],
  //   queryFn: async () => {
  //     const res = await getVisitorEmployee(token as string);
  //     return res?.collection ?? [];
  //   },
  //   enabled: !!token,
  //   staleTime: 0,
  //   refetchOnMount: true,
  //   refetchOnWindowFocus: false,
  // });

  const { visitorType } = useVisitorType(token as string);
  const { sites } = useSites(token as string);
  const { employee } = useEmployees(token as string);
  const { allVisitorEmployee } = useVisitorEmployees(token as string);
  const [vtLoading, setVtLoading] = useState(false);

  const handleSelectSite = (site: any) => {
    setFormDataAddVisitor((prev) => ({
      ...prev,
      registered_site: site.id,
    }));

    setOpenDialogIndex(null);

    if (flowTarget === 'invitation') {
      setOpenInvitationVisitor(true);
    } else if (flowTarget === 'preReg') {
      setOpenPreRegistration(true);
    }
  };

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
              <CustomTextField
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
                  {loading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            padding: '10px',
                            mb: 1,
                          }}
                        >
                          <Skeleton variant="text" width="60%" height={24} />
                          <Skeleton variant="text" width="40%" height={20} />
                        </Box>
                      ))
                    : tableRowVisitors.map((group: any) => (
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
                          <Typography>Start : {group.visitor_period_start}</Typography>
                          <Typography>End : {group.visitor_period_end}</Typography>
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

      <InvitationVisitorDialog
        open={openInvitationVisitor}
        onClose={handleDialogClose}
        handleDialogClose={handleDialogClose}
        handleCloseDialog={handleCloseDialog}
        openDiscardForCloseAdd={openDiscardForCloseAdd}
        isFormChanged={isFormChanged}
        wizardKey={wizardKey}
        formDataAddVisitor={formDataAddVisitor}
        setFormDataAddVisitor={setFormDataAddVisitor}
        edittingId={edittingId}
        handleSuccess={handleSuccess}
        visitorType={visitorType}
        sites={sites}
        employee={employee}
        allVisitorEmployee={allVisitorEmployee}
        vtLoading={vtLoading}
      />

      <PreRegistrationDialog
        open={openPreRegistration}
        handleDialogClose={handleDialogClose}
        handleCloseDialog={handleCloseDialog}
        openDiscardForCloseAdd={openDiscardForCloseAdd}
        isFormChanged={isFormChanged}
        wizardKey={wizardKey}
        formDataAddVisitor={formDataAddVisitor}
        setFormDataAddVisitor={setFormDataAddVisitor}
        edittingId={edittingId}
        handleSuccess={handleSuccess}
        visitorType={visitorType}
        sites={sites}
        employee={employee}
        allVisitorEmployee={allVisitorEmployee}
        vtLoading={vtLoading}
      />

      {/* Select Registered Site */}
      <RegisteredSiteDialog
        open={openDialogIndex === 2}
        siteData={siteData}
        selectedSite={selectedSite}
        setSelectedSite={(nv) => {
          setSelectedSite(nv);
          setFormDataAddVisitor((prev) => ({
            ...prev,
            registered_site: nv?.id || '',
          }));
        }}
        isFormChanged={isFormChanged}
        onDiscard={openDiscardForCloseAdd}
        onClose={handleCloseDialog}
        toast={toast as any}
        onSubmit={handleSelectSite}
      />

      {/* QR Code */}
      <QrScannerDialog
        open={openDialogIndex === 1}
        onClose={handleDialogClose}
        qrMode={qrMode}
        setQrMode={setQrMode}
        qrValue={qrValue}
        setQrValue={setQrValue}
        loading={loading}
        onSubmit={handleSubmitQRCode}
        scanContainerRef={scanContainerRef as any}
        facingMode={facingMode}
        setFacingMode={setFacingMode}
        torchOn={torchOn}
        setTorchOn={setTorchOn}
        hasDecoded={hasDecoded}
        setHasDecoded={setHasDecoded}
      />

      <DetailVisitorDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        visitorData={visitorData}
      />
      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={handleCancelDiscard}
        onDiscard={confirmDiscardAndClose}
      />
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
