import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  DialogActions,
  CircularProgress,
  Grid2 as Grid,
  IconButton,
  Button,
  Typography,
  Portal,
  Autocomplete,
  Snackbar,
  Alert,
  Backdrop,
  Tabs,
  FormGroup,
  FormControlLabel,
  Tab,
  TextareaAutosize,
  Chip,
} from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
import type { AlertColor } from '@mui/material/Alert';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import iconScanQR from 'src/assets/images/svgs/scan-qr.svg';
import iconAdd from 'src/assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import FormWizardAddInvitation from './FormWizardAddInvitation';
import FormWizardAddVisitor from './FormWizardAddVisitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorRequestSchema,
  Item,
  CreateVisitorRequest,
} from 'src/customs/api/models/Admin/Visitor';
import {
  getAllEmployee,
  getAllSite,
  getAllVisitorPagination,
  getAllVisitorType,
  getEmployeeById,
  getRegisteredSite,
  getVisitorById,
  getVisitorEmployee,
} from 'src/customs/api/admin';
import FilterMoreContent from './FilterMoreContent';
import {
  IconClipboard,
  IconLink,
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
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { useNavigate } from 'react-router';
import RegisteredSiteDialog from './components/Dialog/RegisteredSiteDialog';
import QrScannerDialog from './components/Dialog/QrScannerDialog';
import Swal from 'sweetalert2';
import {
  createShareLink,
  createShareLinkByEmail,
  createShareLinkByEmailById,
  deleteShareLink,
  getShareLinkByDt,
} from 'src/customs/api/ShareLink';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CreateLinkDialog from 'src/customs/pages/Employee/Components/Dialog/CreateLinkDialog';
import DetailLinkDialog from 'src/customs/pages/Employee/Components/Dialog/DetailLinkDialog';
import SendEmailDialog from 'src/customs/pages/Employee/Components/Dialog/SendEmailDialog';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import InvitationShareDialog from './components/Dialog/InvitationShareDialog';
import moment from 'moment';

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

const Content = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDir, setSortDir] = useState<string>('desc');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [discardMode, setDiscardMode] = useState<'close-add' | 'edit' | null>(null);
  const [tableCustomVisitor, setTableCustomVisitor] = useState<VisitorTableRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<[]>([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [openInviteViaLinkEmail, setOpenInviteViaLinkEmail] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });

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
  // Employee Detail
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [visitorType, setVisitorType] = useState<any[]>([]);
  // Visitor Detail
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any>(null);
  const navigate = useNavigate();
  // Registered Site
  const [siteData, setSiteData] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const queryClient = useQueryClient();
  // Qr Scanner
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [visitorPage, setVisitorPage] = useState(0);
  const [visitorRowsPerPage, setVisitorRowsPerPage] = useState(10);
  const [employee, setEmployee] = useState<any[]>([]);
  const [vtLoading, setVTLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
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
    {
      title: 'Share Link',
      icon: IconLink,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
  ];

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

  const fetchAllSites = async () => {
    try {
      const res = await getAllSite(token as string);
      setSites(res?.collection || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVisitorEmployee = async () => {
    try {
      const res = await getVisitorEmployee(token as string);
      setAllVisitorEmployee(res?.collection || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployee = async () => {
    try {
      const res = await getAllEmployee(token as string);
      setEmployee(res?.collection || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVisitorType();
      fetchAllSites();
      fetchVisitorEmployee();
      fetchEmployee();
    }
  }, [token]);

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
  const handleEmployeeClick = async (employeeId: string) => {
    if (!token) return;

    setOpenEmployeeDialog(true);
    setEmployeeLoading(true);
    setEmployeeError(null);
    setEmployeeDetail(null);

    try {
      const res = await getEmployeeById(employeeId, token);
      setEmployeeDetail(res?.collection ?? null);
    } catch (err: any) {
      setEmployeeError(err?.message || 'Failed to fetch employee details.');
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
    setEmployeeDetail(null);
    setEmployeeError(null);
  };

  const [selectedType, setSelectedType] = useState<
    'All' | 'Preregis' | 'Checkin' | 'Checkout' | 'Denied' | 'Block' | 'Waiting' | 'Precheckin'
  >('All');

  const statusMap: Record<string, string> = {
    All: 'All',
    Preregis: 'Preregis',
    Checkin: 'Checkin',
    Checkout: 'Checkout',
    Denied: 'Denied',
    Block: 'Block',
    Waiting: 'Waiting',
  };

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

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);

      try {
        const start = page * rowsPerPage;
        const statusParam = selectedType === 'All' ? undefined : statusMap[selectedType];
        const isEmergencyParam =
          appliedFilters.emergency_situation === ''
            ? undefined
            : appliedFilters.emergency_situation === 'true';

        const isBlockParam =
          appliedFilters.is_block === '' ? undefined : appliedFilters.is_block === 'true';
        const response = await getAllVisitorPagination(
          token,
          start,
          rowsPerPage,
          sortDir,
          searchKeyword || undefined,
          appliedFilters.start_date
            ? dayjs(appliedFilters.start_date).utc().toISOString()
            : undefined,
          appliedFilters.end_date ? dayjs(appliedFilters.end_date).utc().toISOString() : undefined,
          // appliedFilters.visitor_status || undefined,
          statusParam,
          appliedFilters.data_filter,
          appliedFilters.site_id || undefined,
          appliedFilters.visitor_role || undefined,
          isEmergencyParam,
          isBlockParam,
          appliedFilters.host_id || undefined,
        );
        let rows = response.collection.map((item: any) => {
          return {
            id: item.id,
            visitor_type: item.visitor_type_name || '-',
            name: item.visitor_name || '-',
            invitation_code: item.invitation_code,
            identity_id: item.visitor_identity_id || '-',
            email: item.visitor_email || '-',
            organization: item.visitor_organization_name || '-',
            gender: item.visitor_gender || '-',
            phone: item.visitor_phone || '-',
            // is_vip: item.is_vip || '-',
            visitor_period_start: item.visitor_period_start || '-',
            visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
            host: item.host ?? '-',
            visitor_status: item.visitor_status || '-',
          };
        });

        // if (selectedType !== 'All') {
        //   const apiStatus = statusMap[selectedType];
        //   rows = rows.filter((r) => r.visitor_status === apiStatus);
        // }

        // setTableRowVisitors(response.collection);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);
        setTableCustomVisitor(rows);
      } catch (err) {
        setTableCustomVisitor([]);
        setTotalRecords(0);
        setTotalFilteredRecords(0);
        // setTableRowVisitors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    token,
    page,
    rowsPerPage,
    sortDir,
    refreshTrigger,
    searchKeyword,
    dateRange,
    selectedType,
    appliedFilters,
  ]);

  // const start = page * rowsPerPage;

  // const {
  //   data: visitorResponse,
  //   isLoading: isLoadingVisitor,
  //   isFetching: isFetchingVisitor,
  // } = useQuery({
  //   queryKey: [
  //     'visitors',
  //     visitorPage,
  //     rowsPerPage,
  //     sortDir,
  //     searchKeyword,
  //     selectedType,
  //     appliedFilters.start_date,
  //     appliedFilters.end_date,
  //     appliedFilters.emergency_situation,
  //     appliedFilters.is_block,
  //     appliedFilters.data_filter,
  //     appliedFilters.site_id,
  //     appliedFilters.visitor_role,
  //     appliedFilters.host_id,
  //   ],
  //   queryFn: async () => {
  //     if (!token) return null;

  //     const statusParam = selectedType === 'All' ? undefined : statusMap[selectedType];
  //     const start = visitorPage * visitorRowsPerPage;

  //     const isEmergencyParam =
  //       appliedFilters.emergency_situation === ''
  //         ? undefined
  //         : appliedFilters.emergency_situation === 'true';

  //     const isBlockParam =
  //       appliedFilters.is_block === '' ? undefined : appliedFilters.is_block === 'true';

  //     return await getAllVisitorPagination(
  //       token!,
  //       start,
  //       visitorRowsPerPage,
  //       sortDir,
  //       searchKeyword || undefined,
  //       appliedFilters.start_date
  //         ? dayjs(appliedFilters.start_date).utc().toISOString()
  //         : undefined,
  //       appliedFilters.end_date ? dayjs(appliedFilters.end_date).utc().toISOString() : undefined,
  //       statusParam,
  //       appliedFilters.data_filter,
  //       appliedFilters.site_id || undefined,
  //       appliedFilters.visitor_role || undefined,
  //       isEmergencyParam,
  //       isBlockParam,
  //       appliedFilters.host_id || undefined,
  //     );
  //   },
  //   enabled: !!token,
  //   placeholderData: (prev) => prev,
  // });

  // const tableCustomVisitor =
  //   visitorResponse?.collection?.map((item: any) => ({
  //     id: item.id,
  //     visitor_type: item.visitor_type_name || '-',
  //     name: item.visitor_name || '-',
  //     identity_id: item.visitor_identity_id || '-',
  //     email: item.visitor_email || '-',
  //     organization: item.visitor_organization_name || '-',
  //     gender: item.visitor_gender || '-',
  //     phone: item.visitor_phone || '-',
  //     visitor_period_start: item.visitor_period_start || '-',
  //     visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
  //     host: item.host ?? '-',
  //     visitor_status: item.visitor_status || '-',
  //   })) || [];

  // console.log('tableCustomVisitor', tableCustomVisitor);

  // const totalFilteredRecords = visitorResponse?.RecordsFiltered || 0;

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

  const handleView = async (id: string) => {
    if (!token) return;

    setOpenVisitorDialog(true);
    setVisitorLoading(true);
    setVisitorError(null);
    setVisitorDetail(null);

    try {
      const res = await getVisitorById(token, id);
      setVisitorDetail(res?.collection ?? res ?? null);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
    }
  };

  type VisitorAction = 'checkin' | 'checkout' | 'deny' | 'block';

  const [confirm, setConfirm] = useState<{
    type: VisitorAction;
    loading: boolean;
  } | null>(null);

  const actionMeta: Record<
    VisitorAction,
    { title: string; ok: string; color: 'success' | 'error' | 'warning' | 'info' }
  > = {
    checkin: { title: 'Confirm Check In', ok: 'Check In', color: 'success' },
    checkout: { title: 'Confirm Check Out', ok: 'Check Out', color: 'error' },
    deny: { title: 'Confirm Deny', ok: 'Deny', color: 'warning' },
    block: { title: 'Confirm Block', ok: 'Block', color: 'info' },
  };

  const openConfirm = (type: VisitorAction) => setConfirm({ type, loading: false });
  const closeConfirm = () => {
    if (!confirm?.loading) setConfirm(null);
  };

  const runConfirmedAction = async () => {
    if (!confirm || !token || !visitorDetail?.id) return;
    setConfirm((c) => (c ? { ...c, loading: true } : c));

    try {
      await new Promise((r) => setTimeout(r, 400));

      setConfirm(null);
      setOpenVisitorDialog(false);
      setRefreshTrigger((p) => p + 1);
    } catch (e) {
      setConfirm((c) => (c ? { ...c, loading: false } : c));
    }
  };

  const handleApplyFilter = () => {
    setAppliedFilters({
      status: selectedType === 'All' ? undefined : statusMap[selectedType],
      ...filters,
    });

    setPage(0);
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

    setSelectedType('All');
    setPage(0);
  };

  const [openDetailShareLink, setOpenDetailShareLink] = useState(false);
  const [openDetailLink, setOpenDetailLink] = useState(false);
  const [openCreateLink, setOpenCreateLink] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [openSendEmail, setOpenSendEmail] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [emails, setEmails] = useState<string[]>([]);

  const handleDeleteLink = async (id: string) => {
    try {
      const confirm = await Swal.fire({
        title: 'Do you want to delete this link?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        confirmButtonColor: '#4caf50',
        customClass: {
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-text-custom',
        },
      });

      if (!confirm.isConfirmed) return;

      await deleteShareLink(token as string, id);
      await queryClient.invalidateQueries({
        queryKey: ['share-links'],
      });
      showSwal('success', 'Link deleted successfully.');
    } catch (error) {
      console.error('Delete link error:', error);
      showSwal('error', 'Something went wrong while deleting link.');
    }
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenInviteDialog = (id: string, link: string, expired_at: string) => {
    setSelectedShareLinkId(id);
    setGeneratedLink(link);
    setExpiredAt(expired_at);
    setTabValue(0);
    setOpenInviteViaLinkEmail(true);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);

    showSwal('success', 'Link copied to clipboard.');
  };

  const handleDetailLink = (link: string) => {
    setOpenDetailLink(true);
  };

  const start = page * rowsPerPage;
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['share-links', page, rowsPerPage, searchKeyword, sortDir],
    queryFn: async () => {
      const res = await getShareLinkByDt(
        token as string,
        start,
        rowsPerPage,
        searchKeyword,
        sortDir,
      );

      return res;
    },

    staleTime: 1000 * 60 * 5,
    enabled: !!token,
    gcTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });

  const formatDateTimes = (dateStr?: string, extendMinutes = 0) => {
    if (!dateStr) return '-';

    const base = moment.utc(dateStr);

    if (extendMinutes !== 0) {
      base.add(extendMinutes, 'minutes');
    }

    return base.tz('Asia/Jakarta').format('DD-MM-YYYY, HH:mm');
  };

  const shareLinkList =
    data?.collection?.map((item: any) => ({
      id: item.id,
      agenda: item.agenda,
      url: item.url,
      current_usage: item.current_usage,
      max_usage: item.max_usage,
      visitor_period_start: formatDateTime(item.visitor_period_start),
      visitor_period_end: formatDateTime(item.visitor_period_end),
      // expired_at: new Date(item.expired_at + 'Z').toLocaleString(undefined, {
      //   year: 'numeric',
      //   month: '2-digit',
      //   day: '2-digit',
      //   hour: '2-digit',
      //   minute: '2-digit',
      // }),
      // expired_at: formatDateTimes(item.expired_at),
      // expired_at_raw: item.expired_at,

      // ✅ format hanya untuk display
      expired_at: dayjs.utc(item.expired_at).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm'),

      link_status: item.link_status,
    })) || [];

  const totalFilterRecords = data?.RecordsFiltered || 0;
  const handleAddShareLink = () => {
    setOpenCreateLink(true);
  };

  const getExpireText = () => {
    if (!expiredAt) return '';

    // bersihkan microseconds + paksa jadi UTC
    const cleanDate = expiredAt.replace(/\.\d+/, '') + 'Z';
    const expireDate = new Date(cleanDate);

    if (isNaN(expireDate.getTime())) return '';

    const now = new Date();
    const diffMs = expireDate.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} left`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} left`;
  };

  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);

  const handleSendInvitation = async () => {
    let finalEmails = [...emails];

    if (emailInput.trim() !== '') {
      finalEmails.push(emailInput.trim());
    }

    if (!finalEmails.length || !selectedShareLinkId) {
      showSwal('error', 'Please enter at least one email');
      return;
    }

    try {
      const payload = {
        emails: finalEmails,
      };
      await createShareLinkByEmailById(token as string, payload, selectedShareLinkId);
      showSwal('success', 'Invitation sent successfully');
      setEmails([]);
      setEmailInput('');
    } catch (error) {
      console.error(error);
      showSwal('error', 'Failed to send invitation');
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Live Visitor" description="this is live visitor page">
        <Box>
          <Grid container spacing={1}>
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
                  } else if (index === 4) {
                    setOpenDetailShareLink(true);
                  } else {
                    setOpenDialogIndex(index);
                  }
                }}
                size={{ xs: 12, lg: 2.4 }}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                isHavePagination={true}
                overflowX={'auto'}
                minWidth={2400}
                stickyHeader={true}
                data={tableCustomVisitor}
                totalCount={totalFilteredRecords}
                isNoActionTableHead={true}
                selectedRows={selectedRows}
                rowsPerPageOptions={[10, 25, 50, 100, 500]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveImage={true}
                isHaveSearch={true}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveVip={true}
                isHavePeriod={true}
                // isVip={(row) => row.is_vip === true}
                isHaveAddData={false}
                isHaveHeader={true}
                isHaveGender={true}
                isHaveVisitor={true}
                isActionVisitor={true}
                isActionEmployee={true}
                stickyVisitorCount={2}
                isBlacklistPage={true}
                onNavigatePage={() => {
                  navigate('/admin/visitor/blacklist-visitor');
                }}
                isHaveEmployee={true}
                onEmployeeClick={(row) => {
                  handleEmployeeClick(row.host as string);
                }}
                isHaveVerified={false}
                headerContent={{
                  title: '',
                  subTitle: 'Monitoring Data Visitor',
                  items: [
                    { name: 'All' },
                    { name: 'Preregis' },
                    { name: 'Checkin' },
                    { name: 'Checkout' },
                    { name: 'Block' },
                    { name: 'Denied' },
                    { name: 'Waiting' },
                    { name: 'Precheckin' },
                  ],
                }}
                onHeaderItemClick={(item) => {
                  if (
                    item.name === 'All' ||
                    item.name === 'Checkin' ||
                    item.name === 'Checkout' ||
                    item.name === 'Preregis' ||
                    item.name === 'Denied' ||
                    item.name === 'Block' ||
                    item.name === 'Waiting' ||
                    item.name === 'Precheckin'
                  ) {
                    setSelectedType(item.name);
                    setPage(0);
                  }
                }}
                defaultSelectedHeaderItem="All"
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onView={(row) => {
                  handleView(row.id);
                }}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onFilterCalenderChange={(ranges) => {
                  if (ranges.startDate && ranges.endDate) {
                    setStartDate(ranges.startDate.toISOString());
                    setEndDate(ranges.endDate.toISOString());
                    // setStartDate(ranges.startDate);
                    // setEndDate(ranges.endDate);
                    setPage(0);
                    setRefreshTrigger((prev) => prev + 1);
                  }
                }}
                onAddData={() => {
                  handleAdd();
                }}
                isHaveFilterMore={true}
                // isHaveFilter={true}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                    onResetFilter={handleResetFilter}
                  />
                }
              />
            </Grid>
          </Grid>
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
        <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
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

      <EmployeeDetailDialog
        open={openEmployeeDialog}
        onClose={handleCloseEmployeeDialog}
        employeeDetail={employeeDetail}
        employeeLoading={employeeLoading}
        employeeError={employeeError}
      />

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
        onSubmit={(site) => {
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
        }}
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

      <VisitorDetailDialog
        open={openVisitorDialog}
        loading={visitorLoading}
        error={visitorError}
        detail={visitorDetail}
        onClose={() => setOpenVisitorDialog(false)}
        onConfirm={(action: any) => openConfirm(action)}
      />

      <DetailVisitorDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        visitorData={visitorData}
      />

      {/* Dialog Confirm */}
      <Dialog open={!!confirm} onClose={closeConfirm} fullWidth>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ px: 0.2 }}>
          <DialogTitle>{confirm ? actionMeta[confirm.type].title : 'Confirm'}</DialogTitle>
          <IconButton onClick={closeConfirm}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            {`Are you sure you want to ${
              confirm ? actionMeta[confirm.type].ok.toLowerCase() : 'proceed'
            } `}
            <b>{visitorDetail?.name ?? 'this visitor'}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} disabled={!!confirm?.loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            // color={confirm ? actionMeta[confirm.type].color : 'primary'}
            color="primary"
            onClick={runConfirmedAction}
            disabled={!!confirm?.loading}
            startIcon={confirm?.loading ? <CircularProgress size={16} /> : undefined}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* List Share  Link */}
      <Dialog
        open={openDetailShareLink}
        onClose={() => setOpenDetailShareLink(false)}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle>
          List Share Link
          <IconButton
            aria-label="close"
            onClick={() => {
              setOpenDetailShareLink(false);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DynamicTable
            data={shareLinkList}
            isHaveHeaderTitle
            isHaveChecked={true}
            isNoActionTableHead={true}
            titleHeader="Share Link"
            isCopyLink={true}
            isHavePagination={true}
            totalCount={totalFilterRecords}
            rowsPerPageOptions={[10, 50, 100]}
            onPaginationChange={(page, rowsPerPage) => {
              setPage(page);
              setRowsPerPage(rowsPerPage);
            }}
            onCopyLink={(row: any) => handleOpenInviteDialog(row.id, row.url, row.expired_at)}
            onDetailLink={(row: any) => handleDetailLink(row)}
            onDelete={(row: any) => handleDeleteLink(row.id)}
            isHaveAddData={true}
            onAddData={handleAddShareLink}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Invite via link & invite via email */}
      <InvitationShareDialog
        open={openInviteViaLinkEmail}
        onClose={() => setOpenInviteViaLinkEmail(false)}
        generatedLink={generatedLink}
        getExpireText={getExpireText}
        expiredAt={expiredAt}
        handleCopyLink={handleCopyLink}
        handleSendInvitation={handleSendInvitation}
      />

      <CreateLinkDialog
        open={openCreateLink}
        onClose={() => setOpenCreateLink(false)}
        onCreateLink={async (payload) => {
          try {
            setIsGenerating(true);
            await createShareLink(token as string, payload);
            await queryClient.invalidateQueries({
              queryKey: ['share-links'],
            });
            setOpenCreateLink(false);
            showSwal('success', 'Share link created successfully');
          } catch (err) {
            console.error(err);
            showSwal('error', 'Failed to create share link');
          } finally {
            setIsGenerating(false);
          }
        }}
        onSendEmail={(payload) => {
          setPendingPayload(payload);
          setOpenSendEmail(true);
        }}
      />

      <DetailLinkDialog
        open={openDetailLink}
        onClose={() => setOpenDetailLink(false)}
        dataVisitor={[]}
      />

      <SendEmailDialog
        open={openSendEmail}
        onClose={() => setOpenSendEmail(false)}
        onSend={async (emails: string[]) => {
          try {
            setIsGenerating(true);

            const finalPayload = {
              ...pendingPayload,
              emails: emails,
            };

            await createShareLinkByEmail(token as string, finalPayload);
            await queryClient.invalidateQueries({
              queryKey: ['share-links'],
            });
            setOpenSendEmail(false);
            setOpenCreateLink(false);

            showSwal('success', 'Share link sent successfully');
          } catch (err) {
            console.error(err);
            showSwal('error', 'Failed to send share link');
          } finally {
            setIsGenerating(false);
          }
        }}
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
      <Portal>
        <Backdrop
          sx={{
            zIndex: 99999,
            position: 'fixed',
            margin: '0 auto',
            color: 'primary',
          }}
          open={isGenerating}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default Content;
