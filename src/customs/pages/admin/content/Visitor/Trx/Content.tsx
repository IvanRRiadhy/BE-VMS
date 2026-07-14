import { useState, useRef, useCallback, useMemo } from 'react';
import { Box, Grid2 as Grid, Portal, Snackbar, Alert } from '@mui/material';
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
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorRequestSchema,
  CreateVisitorRequest,
} from 'src/customs/api/models/Admin/Visitor';
import { getAllVisitorPagination, getEmployeeById, getVisitorById } from 'src/customs/api/admin';
import FilterMoreContent from './FilterMoreContent';
import {
  IconClipboard,
  IconQrcode,
  IconShare,
  IconUser,
  IconUsers,
  IconBolt,
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
  createShareLinkByEmailById,
  deleteShareLink,
  getShareLinkById,
} from 'src/customs/api/ShareLink';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CreateLinkDialog from 'src/customs/pages/admin/content/Visitor/Trx/components/Dialog/CreateLinkDialog';
import DetailLinkDialog from 'src/customs/pages/admin/content/Visitor/Trx/components/Dialog/DetailLinkDialog';
import SendEmailDialog from 'src/customs/pages/admin/content/Visitor/Trx/components/Dialog/SendEmailDialog';
import InvitationShareDialog from './components/Dialog/InvitationShareDialog';
import ShareLinkDialog from './components/ShareLinkDialog';
import { useRegisteredSite } from 'src/hooks/useRegisteredSite';
import ConfirmUnsavedDialog from 'src/customs/pages/admin/components/ConfirmUnsavedDialog';
import { useVisitorType } from 'src/hooks/useVisitorType';
import { useSites } from 'src/hooks/useSites';
import InvitationVisitorDialog from './components/InvitationVisitorDialog';
import PreRegistrationDialog from './components/PreRegistrationDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { QuickAccessDialog } from './components/QuickAccessDialog';
import { createQuickAccess } from 'src/customs/api/Admin/Visitor';
import { useEmployeePagination } from 'src/hooks/useEmployeePagination';
import { useDebounce } from 'src/hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import { useInvitationVisitorEmployee } from 'src/hooks/useInvitationVisitorEmployee';

const Content = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<[]>([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [openInviteViaLinkEmail, setOpenInviteViaLinkEmail] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const defaultFormData = useMemo(() => CreateVisitorRequestSchema.parse({}), []);

  const [formDataAddVisitor, setFormDataAddVisitor] = useState(defaultFormData);

  const { roleAccess } = useSession();

  const isOperatorAdmin = roleAccess === 'OperatorAdmin';

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };

  const isFormChanged = JSON.stringify(formDataAddVisitor) !== JSON.stringify(defaultFormData);

  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
  const [flowTarget, setFlowTarget] = useState<'invitation' | 'preReg' | null>(null);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any>(null);
  const navigate = useNavigate();
  const [selectedShareLink, setSelectedShareLink] = useState(null);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [vtLoading, setVTLoading] = useState(false);
  const [openDetailShareLink, setOpenDetailShareLink] = useState(false);
  const [openDetailLink, setOpenDetailLink] = useState(false);
  const [openCreateLink, setOpenCreateLink] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openQuickAccess, setOpenQuickAccess] = useState(false);
  const { data: siteData = [], isLoading: isLoadingSite } = useRegisteredSite();
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);

  const { visitorType } = useVisitorType();
  const { sites } = useSites();
  // const { employee } = useEmployees(token as string);

  const [hostSearch, setHostSearch] = useState('');

  const debouncedSearch = useDebounce(hostSearch, 400);

  // const { allVisitorEmployee } = useVisitorEmployees(token as string);
  const { data: allVisitorEmployee = [], isLoading: isLoadingVisitorEmployee } =
    useInvitationVisitorEmployee({
      search: debouncedSearch,
      start: 0,
      length: 10,
    });

  const { data, isLoading: isLoadingEmployee } = useEmployeePagination({
    'search[value]': debouncedSearch,
    sortDir: 'desc',
  });

  const employeeData = data?.collection ?? [];

  const resetRegisteredFlow = () => {
    setSelectedSite(null);
    setFormDataAddVisitor(defaultFormData);
  };

  const handleEmployeeClick = async (employeeId: string) => {
    setOpenEmployeeDialog(true);
    setEmployeeLoading(true);
    setEmployeeError(null);
    setEmployeeDetail(null);

    try {
      const res = await getEmployeeById(employeeId);
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
    queryKey: ['visitors', search, appliedFilters],
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
        0,
        -1,
        search || undefined,
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
    staleTime: 1000 * 60 * 2,
  });

  const processedData = useMemo(() => {
    if (!allVisitorData) return [];

    return allVisitorData
      .map((item: any) => {
        const isExpired =
          item.visitor_period_end && dayjs(item.visitor_period_end).isBefore(dayjs(), 'day');

        return {
          id: item.id,
          visitor_type: item.visitor_type_name || '-',
          name: item.visitor_name || '-',
          identity_id: item.visitor_identity_id || '-',
          email: item.visitor_email || '-',
          organization: item.visitor_organization_name || '-',
          invitation_code: item.invitation_code || '-',
          phone: item.visitor_phone || '-',
          visitor_period_start: item.visitor_period_start || '-',
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          invitation_created_at: item.invitation_created_at,
          host: item.host ?? '-',
          visitor_status: isExpired ? 'Expired' : item.visitor_status || '-',
        };
      })
      .sort((a: any, b: any) => {
        const dateA = a.invitation_created_at ?? a.visitor_period_start;
        const dateB = b.invitation_created_at ?? b.visitor_period_start;

        return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
      })
      .map(({ invitation_created_at, ...rest }: any) => rest);
  }, [allVisitorData]);

  const visitorDataAll = useMemo(
    () => processedData.filter((item: any) => item.visitor_status !== 'QuickAccess'),
    [processedData],
  );

  const paginatedData = useMemo(() => {
    return visitorDataAll.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [processedData, page, rowsPerPage]);

  const [quickSearch, setQuickSearch] = useState('');
  const [quickPage, setQuickPage] = useState(0);
  const [quickRowsPerPage, setQuickRowsPerPage] = useState(10);

  const { data: quickAccessResult } = useQuery({
    queryKey: ['quick-access', quickPage, quickRowsPerPage, quickSearch],
    queryFn: async () => {
      const res = await getAllVisitorPagination(
        quickPage * quickRowsPerPage,
        quickRowsPerPage,
        quickSearch || undefined,
        undefined,
        undefined,
        'QuickAccess',
      );

      return res;
    },
    enabled:  openQuickAccess,
  });

  const processedQuickAccessData = useMemo(() => {
    if (!quickAccessResult?.collection) return [];

    return quickAccessResult.collection
      .map((item: any) => {
        const isExpired =
          item.visitor_period_end && dayjs(item.visitor_period_end).isBefore(dayjs(), 'day');

        return {
          id: item.id,
          // visitor_type: item.visitor_type_name || '-',
          name: item.visitor_name || '-',
          // identity_id: item.visitor_identity_id || '-',
          email: item.visitor_email || '-',
          organization: item.visitor_organization_name || '-',
          receiver_name: item.receiver_name || '-',
          // invitation_code: item.invitation_code || '-',
          phone: item.visitor_phone || '-',
          visitor_period_start: item.visitor_period_start || '-',
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          invitation_created_at: item.invitation_created_at,
          host: item.host ?? '-',
          visitor_status: isExpired ? 'Expired' : item.visitor_status || '-',
        };
      })
      .sort((a: any, b: any) => {
        const dateA = a.invitation_created_at ?? a.visitor_period_start;
        const dateB = b.invitation_created_at ?? b.visitor_period_start;

        return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
      })
      .map(({ invitation_created_at, ...rest }: any) => rest);
  }, [quickAccessResult]);

  const visitorTableData = {
    data: paginatedData,
    dataQuickAccess: processedQuickAccessData ?? [],
    RecordsFiltered: processedData.length,
    RecordsTotal: processedData.length,
  };

  const totalFilteredRecords = visitorTableData?.RecordsFiltered ?? 0;
  const { t } = useTranslation();

  const cards = [
    {
      title: t('totalVisitor'),
      icon: IconUsers,
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
    {
      title: 'Scan QR ' + t('navigation.visitor'),
      icon: IconQrcode,
      subTitle: iconScanQR,
      subTitleSetting: 'image',
      color: 'none',
    },
    ...(!isOperatorAdmin
      ? [
          {
            title: t('add') + ' Invitation',
            icon: IconUser,
            subTitle: iconAdd,
            subTitleSetting: 'image',
            color: 'none',
          },
          {
            title: t('add') + ' Pre Registration',
            icon: IconClipboard,
            subTitle: iconAdd,
            subTitleSetting: 'image',
            color: 'none',
          },
          {
            title: t('shareLink'),
            icon: IconShare,
            subTitle: iconAdd,
            subTitleSetting: 'image',
            color: 'none',
          },
          {
            title: t('quickAccess'),
            icon: IconBolt,
            subTitle: iconAdd,
            subTitleSetting: 'image',
            color: 'none',
          },
        ]
      : []),
  ];

  const closeVisitorDialog = useCallback(() => {
    setOpenDialogIndex(null);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    setSelectedSite(null);
    resetRegisteredFlow();
  }, []);

  const handleAdd = () => {
    setEdittingId('');
    setFormDataAddVisitor(defaultFormData);
    setSelectedSite(null);
  };

  const handleSuccess = () => {
    setSelectedSite(null);
    setFormDataAddVisitor((prev: any) => ({
      ...prev,
      registered_site: '',
    }));
    queryClient.invalidateQueries({ queryKey: ['visitors'] });
    closeVisitorDialog();
  };

  const openDiscardForCloseAdd = () => {
    setConfirmDialogOpen(true);
  };

  const handleCancelDiscard = () => {
    setConfirmDialogOpen(false);
    // setPendingEditId(null);
  };

  const resetFormData = () => {
    setFormDataAddVisitor(defaultFormData);
    setEdittingId('');
  };

  const confirmDiscardAndClose = () => {
    resetFormData();
    setWizardKey((k) => k + 1);
    setOpenDialogIndex(null);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    setFormDataAddVisitor(defaultFormData);
    setConfirmDialogOpen(false);
    closeVisitorDialog();
  };

  const handleView = async (id: string) => {
    setOpenVisitorDialog(true);
    setVisitorLoading(true);
    setVisitorError(null);
    setVisitorDetail(null);

    try {
      const res = await getVisitorById(id);
      setVisitorDetail(res?.collection ?? res ?? null);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
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
      const res = await getInvitationCode(value);
      const data = res.collection?.data ?? [];

      setVisitorData(data);
      setOpenDetail(true);
      closeVisitorDialog();
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

    // setSelectedType('All');
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

      await deleteShareLink(id);
      setRefreshKey((prev) => prev + 1);
      showSwal('success', 'Link deleted successfully.');
    } catch (error) {
      showSwal('error', 'Failed to delete link.');
    }
  };

  const handleOpenInviteDialog = async (row: any) => {
    const res = await getShareLinkById(row.id);
    setSelectedShareLink(res.collection);
    setSelectedShareLinkId(row.id);
    setGeneratedLink(row.shorten_url || row.url);
    // setGeneratedLink(row.url);
    setExpiredAt(row.expired_at);
    setOpenInviteViaLinkEmail(true);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showSwal('success', 'Link copied to clipboard.');
  };

  const handleDetailLink = (link: string) => {
    setOpenDetailLink(true);
  };

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

  const handleSendInvitation = async (emails: string[]) => {
    const validEmails = emails.filter((email: any) => email?.trim() !== '');

    if (!validEmails.length || !selectedShareLinkId) {
      showSwal('error', 'Please enter at least one email');
      return;
    }

    try {
      const payload = {
        emails: emails,
      };
      await createShareLinkByEmailById(payload, selectedShareLinkId as string);
      showSwal('success', 'Invitation sent successfully');
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      showSwal('error', error?.response.data.message || 'Failed to send invitation');
    }
  };

  const handleCreateLink = async (payload: any) => {
    try {
      setIsGenerating(true);

      await createShareLink(payload);
      setOpenCreateLink(false);
      showSwal('success', 'Share link created successfully');
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      showSwal('error', err?.response.data.message || 'Failed to create share link');
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

      await createShareLink(finalPayload);

      setOpenSendEmail(false);
      setOpenCreateLink(false);

      showSwal('success', 'Share link sent successfully');
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      showSwal('error', err?.response.data.message || 'Failed to send share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );
  const handleQuickSearch = useCallback((keyword: string) => {
    setQuickPage(0);
    setQuickSearch(keyword);
  }, []);

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

  const handleCreateQuickAccess = async (payload: any) => {
    try {
      await createQuickAccess( payload);

      showSwal('success', 'Quick access created successfully');

      setOpenQuickAccess(false);
      await queryClient.invalidateQueries({
        queryKey: ['quick-access'],
      });
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to create quick access');

      throw error;
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
                  } else if (index === 5) {
                    setOpenQuickAccess(true);
                  } else {
                    setOpenDialogIndex(index);
                  }
                }}
                size={{ xs: 12, lg: 2 }}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
                isHavePagination={true}
                overflowX={'auto'}
                minWidth={2400}
                stickyHeader={true}
                currentPage={page}
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
                    // setSelectedType(item.name);
                    setPage(0);
                    setAppliedFilters((prev: any) => ({
                      ...prev,
                      status: item.name === 'All' ? 0 : item.name,
                    }));
                  }
                }}
                defaultSelectedHeaderItem="All"
                onView={(row) => {
                  handleView(row.id);
                }}
                searchKeyword={search}
                onSearch={handleSearch}
                onFilterCalenderChange={(ranges) => {
                  if (ranges.startDate && ranges.endDate) {
                    setStartDate(ranges.startDate.toISOString());
                    setEndDate(ranges.endDate.toISOString());
                    setPage(0);
                  }
                }}
                onAddData={handleAdd}
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

      <InvitationVisitorDialog
        open={openInvitationVisitor}
        handleCloseDialog={closeVisitorDialog}
        openDiscardForCloseAdd={openDiscardForCloseAdd}
        isFormChanged={isFormChanged}
        wizardKey={wizardKey}
        formDataAddVisitor={formDataAddVisitor}
        setFormDataAddVisitor={setFormDataAddVisitor}
        edittingId={edittingId}
        handleSuccess={handleSuccess}
        visitorType={visitorType}
        sites={sites}
        employee={employeeData}
        search={setHostSearch}
        allVisitorEmployee={allVisitorEmployee}
        vtLoading={vtLoading}
        isLoadingEmployee={isLoadingEmployee}
      />

      <PreRegistrationDialog
        open={openPreRegistration}
        handleCloseDialog={closeVisitorDialog}
        openDiscardForCloseAdd={openDiscardForCloseAdd}
        isFormChanged={isFormChanged}
        wizardKey={wizardKey}
        formDataAddVisitor={formDataAddVisitor}
        setFormDataAddVisitor={setFormDataAddVisitor}
        edittingId={edittingId}
        handleSuccess={handleSuccess}
        visitorType={visitorType}
        sites={sites}
        employee={employeeData}
        search={setHostSearch}
        allVisitorEmployee={allVisitorEmployee}
        vtLoading={vtLoading}
        isLoadingEmployee={isLoadingEmployee}
      />

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
        onClose={closeVisitorDialog}
        toast={toast as any}
        onSubmit={handleSelectSite}
      />
      {/* QR Code */}
      <QrScannerDialog
        open={openDialogIndex === 1}
        onClose={closeVisitorDialog}
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
      />

      <DetailVisitorDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        visitorData={visitorData}
      />

      <QuickAccessDialog
        open={openQuickAccess}
        onClose={() => setOpenQuickAccess(false)}
        visitorTableData={visitorTableData.dataQuickAccess}
        handleEmployeeClick={handleEmployeeClick}
        onSubmit={handleCreateQuickAccess}
        page={quickPage}
        setPage={setQuickPage}
        setRowsPerPage={setQuickRowsPerPage}
        searchKeyword={quickSearch}
        onSearch={handleQuickSearch}
        totalCount={quickAccessResult?.RecordsFiltered ?? 0}
      />

      <ShareLinkDialog
        refreshKey={refreshKey}
        open={openDetailShareLink}
        onClose={() => setOpenDetailShareLink(false)}
        onCopyLink={(row) => handleOpenInviteDialog(row)}
        onDetailLink={handleDetailLink}
        onDelete={handleDeleteLink}
        onAddData={handleAddShareLink}
      />

      <InvitationShareDialog
        open={openInviteViaLinkEmail}
        onClose={() => setOpenInviteViaLinkEmail(false)}
        generatedLink={generatedLink}
        getExpireText={getExpireText}
        expiredAt={expiredAt}
        handleCopyLink={handleCopyLink}
        handleSendInvitation={handleSendInvitation}
        shareLinkData={selectedShareLink}
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
    </PageContainer>
  );
};

export default Content;
