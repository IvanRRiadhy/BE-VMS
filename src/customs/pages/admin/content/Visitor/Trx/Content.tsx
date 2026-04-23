import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  IconQrcode,
  IconShare,
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
import InvitationShareDialog from './components/Dialog/InvitationShareDialog';
import ShareLinkDialog from './components/ShareLinkDialog';

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
  const [sortDir, setSortDir] = useState<string>('desc');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [discardMode, setDiscardMode] = useState<'close-add' | 'edit' | null>(null);
  // const [tableCustomVisitor, setTableCustomVisitor] = useState<VisitorTableRow[]>([]);
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
  const [employee, setEmployee] = useState<any[]>([]);
  const [vtLoading, setVTLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [openDetailShareLink, setOpenDetailShareLink] = useState(false);
  const [openDetailLink, setOpenDetailLink] = useState(false);
  const [openCreateLink, setOpenCreateLink] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

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
    'All' | 'Preregis' | 'Checkin' | 'Checkout' | 'Denied' | 'Block' | 'Waiting'
  >('All');

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

  const {
    data: allVisitorData,
    isLoading: isLoading,
    isFetching: isFetching,
  } = useQuery({
    queryKey: ['visitors', searchKeyword, appliedFilters],
    queryFn: async () => {
      const statusParam =
        appliedFilters.status && appliedFilters.status !== 'All'
          ? appliedFilters.status
          : undefined;

      const isEmergencyParam =
        appliedFilters.emergency_situation === ''
          ? undefined
          : appliedFilters.emergency_situation === 'true';

      const isBlockParam =
        appliedFilters.is_block === '' ? undefined : appliedFilters.is_block === 'true';

      const res = await getAllVisitorPagination(
        token as string,
        0,
        -1,
        searchKeyword || undefined,
        appliedFilters.start_date
          ? dayjs(appliedFilters.start_date).utc().toISOString()
          : undefined,
        appliedFilters.end_date ? dayjs(appliedFilters.end_date).utc().toISOString() : undefined,
        statusParam,
        appliedFilters.data_filter,
        appliedFilters.site_id || undefined,
        appliedFilters.visitor_role || undefined,
        isEmergencyParam,
        isBlockParam,
        appliedFilters.host_id || undefined,
      );

      return res.collection;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 1,
  });

  const processedData = useMemo(() => {
    if (!allVisitorData) return [];

    return allVisitorData
      .map((item: any) => ({
        id: item.id,
        visitor_type: item.visitor_type_name || '-',
        name: item.visitor_name || '-',
        identity_id: item.visitor_identity_id || '-',
        email: item.visitor_email || '-',
        organization: item.visitor_organization_name || '-',
        // gender: item.visitor_gender || '-',
        invitation_code: item.invitation_code || '-',
        phone: item.visitor_phone || '-',
        visitor_period_start: item.visitor_period_start || '-',
        visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
        invitation_created_at: item.invitation_created_at,
        host: item.host ?? '-',
        visitor_status: item.visitor_status || '-',
      }))
      .sort(
        (a: any, b: any) =>
          dayjs(b.invitation_created_at).valueOf() - dayjs(a.invitation_created_at).valueOf(),
      )
      .map(({ invitation_created_at, ...rest }: any) => rest);
  }, [allVisitorData]);

  const paginatedData = useMemo(() => {
    return processedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [processedData, page, rowsPerPage]);

  const visitorTableData = {
    data: paginatedData,
    RecordsFiltered: processedData.length,
    RecordsTotal: processedData.length,
  };

  // const {
  //   data: visitorTableData,
  //   isLoading: isLoading,
  //   isFetching: isFetching,
  //   error,
  // } = useQuery({
  //   queryKey: ['visitors', page, rowsPerPage, sortDir, searchKeyword, appliedFilters],
  //   queryFn: async () => {
  //     // const limit = rowsPerPage === -1 ? undefined : rowsPerPage;
  //     // const start = rowsPerPage === -1 ? 0 : page * rowsPerPage;
  //     const start = page * rowsPerPage;
  //     const statusParam =
  //       appliedFilters.status && appliedFilters.status !== 'All'
  //         ? appliedFilters.status
  //         : undefined;
  //     const isEmergencyParam =
  //       appliedFilters.emergency_situation === ''
  //         ? undefined
  //         : appliedFilters.emergency_situation === 'true';

  //     const isBlockParam =
  //       appliedFilters.is_block === '' ? undefined : appliedFilters.is_block === 'true';
  //     const res = await getAllVisitorPagination(
  //       token as string,
  //       start,
  //       rowsPerPage,
  //       // sortDir,
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

  //     return {
  //       data: res.collection
  //         .map((item: any) => ({
  //           id: item.id,
  //           visitor_type: item.visitor_type_name || '-',
  //           name: item.visitor_name || '-',
  //           identity_id: item.visitor_identity_id || '-',
  //           email: item.visitor_email || '-',
  //           organization: item.visitor_organization_name || '-',
  //           gender: item.visitor_gender || '-',
  //           phone: item.visitor_phone || '-',
  //           visitor_period_start: item.visitor_period_start || '-',
  //           visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
  //           invitation_created_at: item.invitation_created_at,
  //           host: item.host ?? '-',
  //           visitor_status: item.visitor_status || '-',
  //         }))
  //         .sort((a: any, b: any) => {
  //           return (
  //             dayjs(b.invitation_created_at).valueOf() - dayjs(a.invitation_created_at).valueOf()
  //           );
  //         }),
  //       RecordsFiltered: res.RecordsFiltered,
  //       RecordsTotal: res.RecordsTotal,
  //     };
  //   },
  //   enabled: !!token,
  //   staleTime: 1000 * 60 * 1,
  //   placeholderData: (prev) => prev,
  // });

  const totalFilteredRecords = visitorTableData?.RecordsFiltered ?? 0;
  const totalRecords = visitorTableData?.RecordsTotal ?? 0;

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
      icon: IconShare,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const response = await getRegisteredSite(token as string);
      setSiteData(response.collection);
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      try {
        setLoading(true);

        const [vtRes, siteRes, visitorEmpRes, empRes] = await Promise.all([
          getAllVisitorType(token),
          getAllSite(token),
          getVisitorEmployee(token),
          getAllEmployee(token),
        ]);

        setVisitorType(vtRes?.collection || []);
        setSites(siteRes?.collection || []);
        setAllVisitorEmployee(visitorEmpRes?.collection || []);
        setEmployee(empRes?.collection || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  const handleCloseDialog = () => {
    setSelectedSite(null);
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
  };

  const handleSuccess = () => {
    setSelectedSite(null);
    setFormDataAddVisitor((prev: any) => ({
      ...prev,
      registered_site: '',
    }));
    // localStorage.removeItem('unsavedVisitorData');
    queryClient.invalidateQueries({ queryKey: ['visitors'] });
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
      ...filters,
    });

    if (page !== 0) {
      setPage(0);
    }
  };
  const handleSubmitQRCode = async (value: string) => {
    try {
      setLoading(true);
      const res = await getInvitationCode(token as string, value);
      const data = res.collection?.data ?? [];

      setVisitorData(data);
      setOpenDetail(true);

      if (data.length === 0) {
        showSwal('error', 'Your code does not exist.', 3000);
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
      showSwal('error', 'Failed to delete link.');
    }
  };

  const handleOpenInviteDialog = (id: string, link: string, expired_at: string) => {
    setSelectedShareLinkId(id);
    setGeneratedLink(link);
    setExpiredAt(expired_at);
    setOpenInviteViaLinkEmail(true);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showSwal('success', 'Link copied to clipboard.');
  };

  const handleDetailLink = (link: string) => {
    setOpenDetailLink(true);
  };
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);

  const handleAddShareLink = () => {
    setOpenCreateLink(true);
  };

  const getExpireText = () => {
    if (!expiredAt) return '';

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
      showSwal('error', 'Failed to send invitation');
    }
  };

  const handleCreateLink = async (payload: any) => {
    try {
      setIsGenerating(true);

      await createShareLink(token as string, payload);

      await queryClient.invalidateQueries({
        queryKey: ['share-links'],
      });

      setOpenCreateLink(false);
      showSwal('success', 'Share link created successfully');
    } catch (err) {
      showSwal('error', 'Failed to create share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (emails: string[]) => {
    try {
      setIsGenerating(true);

      const finalPayload = {
        ...pendingPayload,
        emails: emails,
      };

      await createShareLink(token as string, finalPayload);

      await queryClient.invalidateQueries({
        queryKey: ['share-links'],
      });

      setOpenSendEmail(false);
      setOpenCreateLink(false);

      showSwal('success', 'Share link sent successfully');
    } catch (err) {
      showSwal('error', 'Failed to send share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback(() => {
    setPage(0);
    setSearchKeyword(searchInput);
  }, [searchInput]);

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
                loading={isLoading}
                isHavePagination={true}
                overflowX={'auto'}
                minWidth={2400}
                stickyHeader={true}
                data={visitorTableData?.data || []}
                totalCount={totalFilteredRecords}
                isNoActionTableHead={true}
                selectedRows={selectedRows}
                rowsPerPageOptions={[10, 50, 100]}
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
                onEmployeeClick={(row: any) => {
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
                    item.name === 'Waiting'
                  ) {
                    setSelectedType(item.name);
                    setPage(0);
                    setAppliedFilters((prev: any) => ({
                      ...prev,
                      status: item.name === 'All' ? undefined : item.name,
                    }));
                  }
                }}
                defaultSelectedHeaderItem="All"
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onView={(row) => {
                  handleView(row.id);
                }}
                // onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                searchKeyword={searchInput}
                onSearch={handleSearch}
                onSearchKeywordChange={handleSearchKeywordChange}
                onFilterCalenderChange={(ranges) => {
                  if (ranges.startDate && ranges.endDate) {
                    setStartDate(ranges.startDate.toISOString());
                    setEndDate(ranges.endDate.toISOString());
                    setPage(0);
                    setRefreshTrigger((prev) => prev + 1);
                  }
                }}
                onAddData={() => {
                  handleAdd();
                }}
                isHaveFilterMore={true}
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

      {/* Detail Employee */}
      <EmployeeDetailDialog
        open={openEmployeeDialog}
        onClose={handleCloseEmployeeDialog}
        employeeDetail={employeeDetail}
        employeeLoading={employeeLoading}
        employeeError={employeeError}
      />

      {/* Registered Site */}
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

      <ShareLinkDialog
        open={openDetailShareLink}
        onClose={() => setOpenDetailShareLink(false)}
        token={token as string}
        onCopyLink={(row) => handleOpenInviteDialog(row.id, row.url, row.expired_at)}
        onDetailLink={handleDetailLink}
        onDelete={handleDeleteLink}
        onAddData={handleAddShareLink}
      />

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
        onCreateLink={handleCreateLink}
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
        onSend={handleSendEmail}
      />

      {/* Unsaved Changes */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelDiscard} fullWidth maxWidth="sm">
        <DialogTitle>
          Unsaved Changes
          <IconButton
            aria-label="close"
            onClick={handleCancelDiscard}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
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
