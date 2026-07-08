import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Portal,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Typography,
  InputAdornment,
  Skeleton,
  Button,
  CircularProgress,
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import PageContainer from 'src/components/container/PageContainer';
import iconAdd from '../../../..//assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorRequestSchema,
  CreateVisitorRequest,
} from 'src/customs/api/models/Admin/Visitor';
import {
  getAllVisitorPagination,
  getEmployeeById,
  getFormEmployee,
  getVisitorTransactionByIds,
  getVisitorTransactionPagination,
} from 'src/customs/api/admin';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { IconBolt, IconClipboard, IconSearch, IconShare, IconUsers } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Praregist from './Praregist';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import EmployeeDetailDialog from '../Components/Dialog/EmployeeDetailDialog';
import {
  getInvitationSite,
  getInvitationVisitorEmployee,
  getInvitationVisitorType,
} from 'src/customs/api/Admin/InvitationData';
import {
  createShareLink,
  createShareLinkByEmailById,
  deleteShareLink,
  getShareLinkByDt,
  getShareLinkById,
} from 'src/customs/api/ShareLink';
import Swal from 'sweetalert2';
import { showSwal } from 'src/customs/components/alerts/alerts';
import CreateLinkDialog from '../Components/Dialog/CreateLinkDialog';
import DetailLinkDialog from '../Components/Dialog/DetailLinkDialog';
import SendEmailDialog from '../Components/Dialog/SendEmailDialog';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import RelatedInvitationDialog from '../Components/Dialog/RelatedInvitationDialog';
import InvitationShareDialog from '../../admin/content/Visitor/Trx/components/Dialog/InvitationShareDialog';
import ShareLinkDialog from '../../admin/content/Visitor/Trx/components/ShareLinkDialog';
import ConfirmUnsavedDialog from 'src/customs/pages/admin/components/ConfirmUnsavedDialog';
import { QuickAccessDialog } from '../Components/Dialog/QuickAccessDialog';
import { createQuickAccess } from 'src/customs/api/Admin/Visitor';
import useInvitationVisitorType from 'src/hooks/useInvitationVisitorType';
import { useDebounce } from 'src/hooks/useDebounce';
import { useInvitationVisitorEmployee } from 'src/hooks/useInvitationVisitorEmployee';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { cancelVisitor } from 'src/customs/api/users';
import { useProfile } from 'src/hooks/useProfile';
import VisitorDetailPanel from './components/VisitorDetailPanel';
import VisitorListTable from './components/VisitorListTable';
import { useTranslation } from 'react-i18next';

type Group = {
  id: string;
  name: string;
  agenda: string;
  rows: any[];
};

const Content = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const defaultFormData = useMemo(() => CreateVisitorRequestSchema.parse({}), []);

  const [formDataAddVisitor, setFormDataAddVisitor] = useState(defaultFormData);
  const [selectedShareLink, setSelectedShareLink] = useState<any>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const isFormChanged = JSON.stringify(formDataAddVisitor) !== JSON.stringify(defaultFormData);

  // const employeeId = useSelector((state: any) => state.userReducer.data?.employee_id);
  const [tab, setTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
  const [flowTarget, setFlowTarget] = useState<'invitation' | 'preReg' | null>(null);
  // Employee Detail
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any[]>([]);
  const [openRelatedInvitation, setOpenRelatedInvitation] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [generatedLink, setGeneratedLink] = useState('');
  const [openInviteViaLinkEmail, setOpenInviteViaLinkEmail] = useState(false);
  const [openDetailShareLink, setOpenDetailShareLink] = useState(false);
  const [openDetailLink, setOpenDetailLink] = useState(false);
  const [openCreateLink, setOpenCreateLink] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [openQuickAccess, setOpenQuickAccess] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [tableRowVisitors, setTableRowVisitors] = useState<any[]>([]);
  const { t } = useTranslation();
  const resetRegisteredFlow = () => {
    setSelectedSite(null);
    setFormDataAddVisitor(defaultFormData);
  };
  const handleDialogClose = () => {
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    resetRegisteredFlow();
  };

  const [selected, setSelected] = useState<number[]>([]);
  const [disabledIndexes, setDisabledIndexes] = useState<number[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);
  const secdrawerWidth = 300;
  const [groupDetailLoading, setGroupDetailLoading] = useState(false);
  const [groupHeader, setGroupHeader] = useState<any | null>(null);
  const [groupVisitors, setGroupVisitors] = useState<any[]>([]);

  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setOpenEmployeeDialog(true);
  };

  const {
    data: employeeDetail,
    isLoading: employeeLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['employee', selectedEmployeeId],
    queryFn: async () => {
      const res = await getEmployeeById(selectedEmployeeId!, token as string);
      return res.collection ?? [];
    },
    enabled: !!selectedEmployeeId && !!token,
    staleTime: 1 * 60 * 1000,
    retry: 1,
  });

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
    // setEmployeeDetail(null);
    setEmployeeError(null);
  };
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [search, setSearch] = useState<string>('');
  const [searchHost, setSearchHost] = useState<any>('');

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

  const queryClient = useQueryClient();
  const [sortDir, setSortDir] = useState<string>('desc');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchAgenda, setSearchAgenda] = useState('');
  const debouncedSearchAgenda = useDebounce(searchAgenda, 400);
  const [openGroup, setOpenGroup] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const fetchData = async (append = false) => {
    if (!token) return;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const start = append ? tableRowVisitors.length : 0;

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

      const newRows = res.collection.map((item: any) => ({
        id: item.id,
        agenda: item.agenda || '-',
        visitor_type: item.visitor_type_name || '-',
        host_name: item.host_name || '-',
        visitor_period_start: formatDateTime(item.visitor_period_start),
        visitor_period_end: formatDateTime(item.visitor_period_end),
        invited_by: item.invited_by || '-',
      }));

      if (append) {
        setTableRowVisitors((prev) => [...prev, ...newRows]);
      } else {
        setTableRowVisitors(newRows);
      }

      setHasMore(start + newRows.length < res.RecordsFiltered);

      setTotalRecords(res.RecordsTotal);
      setTotalFilteredRecords(res.RecordsFiltered);
    } catch {
      setTableRowVisitors([]);
      setTotalRecords(0);
      setTotalFilteredRecords(0);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData(false);
  }, [token, page, rowsPerPage, sortDir, appliedFilters, debouncedSearchAgenda, refreshTrigger]);

  useEffect(() => {
    if (!selectedGroupId || !token) return;

    const fetchDetail = async () => {
      setGroupDetailLoading(true);
      try {
        const res = await getVisitorTransactionByIds(token, selectedGroupId);
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

  const [quickSearch, setQuickSearch] = useState('');
  const [quickPage, setQuickPage] = useState(0);
  const [quickRowsPerPage, setQuickRowsPerPage] = useState(10);
  const { data: profile } = useProfile(token);

  const { data: quickAccessResult } = useQuery({
    queryKey: ['quick-access', quickPage, quickRowsPerPage, quickSearch],
    queryFn: async () => {
      const res = await getAllVisitorPagination(
        token as string,
        quickPage * quickRowsPerPage,
        quickRowsPerPage,
        quickSearch || undefined,
        undefined,
        undefined,
        'QuickAccess',
      );

      return res;
    },
    enabled: !!token && openQuickAccess,
  });

  const processedQuickAccessData = useMemo(() => {
    if (!quickAccessResult?.collection) return [];

    return quickAccessResult.collection
      .map((item: any) => {
        const isExpired =
          item.visitor_period_end && dayjs(item.visitor_period_end).isBefore(dayjs(), 'day');

        return {
          id: item.id,
          visitor_type: item.visitor_type_name || '-',
          name: item.visitor_name || '-',
          // identity_id: item.visitor_identity_id || '-',
          email: item.visitor_email || '-',
          organization: item.visitor_organization_name || '-',
          receiver_name: item.receiver_name || '-',
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
  }, [quickAccessResult]);

  const visitorTableData = {
    // data: visitorDataAll,
    dataQuickAccess: processedQuickAccessData,
    // RecordsFiltered: processedData.length,
    // RecordsTotal: processedData.length,
  };

  const cards = [
    {
      title: 'Total Visitor',
      icon: IconUsers,
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
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
    {
      title: 'Quick Access',
      icon: IconBolt,
      subTitle: iconAdd,
      subTitleSetting: 'image',
      color: 'none',
    },
  ];

  const handleCloseDialog = () => {
    setSelectedSite(null);
    setOpenDialog(false);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    handleDialogClose();
  };

  const handleAdd = () => {
    setEdittingId('');
    setFormDataAddVisitor(defaultFormData);
    setSelectedSite(null);
    setPendingEditId(null);
    setIsDirty(false);
    setOpenPreRegistration(true);
  };

  const handleSuccess = () => {
    setSelectedSite(null);
    setFormDataAddVisitor(defaultFormData);
    setIsDirty(false);

    setRefreshTrigger((prev) => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['visitors'] });

    handleCloseDialog();
  };

  const openDiscardForCloseAdd = () => {
    setConfirmDialogOpen(true);
  };

  const handleCancelDiscard = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const resetFormData = () => {
    setFormDataAddVisitor(defaultFormData);
    setEdittingId('');
    setIsDirty(false);
  };

  const confirmDiscardAndClose = () => {
    resetFormData();
    setWizardKey((k) => k + 1);
    setOpenDialog(false);
    setConfirmDialogOpen(false);
    handleCloseDialog();
  };

  const handleView = async (id: string) => {
    if (!id || !token) return;

    setOpenRelatedInvitation(true);

    try {
      // const res = await getInvitationRelatedVisitor(id, token);
      const res = await getVisitorTransactionByIds(token, id);
      setVisitorDetail(res?.collection ?? res ?? null);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
    }
  };

  const selectedVisitorData = useMemo(() => {
    return visitorDetail
      .filter((_, index) => selected.includes(index))
      .map((v, i) => ({
        id: v.id,
        name: v.visitor_name,
        phone: v.visitor_phone,
        email: v.visitor_email,
        agenda: v.agenda,
        visitor_period_start: formatDateTime(v.visitor_period_start),
        visitor_period_end: formatDateTime(v.visitor_period_end, v.extend_visitor_period),
        vehicle_type: v.vehicle_type,
        vehicle_plate_number: v.vehicle_plate_number || '-',
        site: v.site_place_name || '-',
        visitor_status: v.visitor_status,
      }));
  }, [visitorDetail, selected]);

  const handleCloseRelation = () => {
    setOpenRelatedInvitation(false);
    setVisitorDetail([]);
    setSelected([]);
    setVisitorError(null);
  };

  // const [visitorType, setVisitorType] = useState<any[]>([]);
  const [vtLoading, setVtLoading] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);

  // const [search, setSearch] = useState<string>('');
  const debounceSearch = useDebounce(searchHost, 400);
  const params = {
    'search[value]': debounceSearch,
    start: 0,
    length: 10,
  };

  useEffect(() => {
    if (!token) return;

    const fetchSecondaryData = async () => {
      try {
        const [employeeRes, siteRes] = await Promise.all([
          // getFormEmployee(token),
          getInvitationVisitorEmployee(token),
          getInvitationSite(token),
        ]);

        setEmployee(employeeRes?.collection ?? []);
        setSites(siteRes?.collection ?? []);
      } catch (error) {
        console.error('Error fetching secondary data:', error);
      }
    };

    fetchSecondaryData();
  }, [token]);

  const { data: allVisitorEmployee = [], isLoading: isLoadingEmployee } =
    useInvitationVisitorEmployee(token, {
      search: debounceSearch,
      start: 0,
      length: 10,
    });

  const { visitorType } = useInvitationVisitorType(token);

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
      showSwal('success', 'Link deleted successfully.');
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      showSwal('error', error?.response.data.message || 'Failed to delete link.');
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showSwal('success', 'Link copied to clipboard.');
  };

  const handleDetailLink = (link: string) => {
    setOpenDetailLink(true);
  };

  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddShareLink = () => {
    setOpenCreateLink(true);
  };

  const getExpireText = () => {
    if (!expiredAt) return '';

    const now = new Date();
    const expireDate = new Date(expiredAt);

    const diffMs = expireDate.getTime() - now.getTime();

    if (diffMs <= 0) return '0';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }

    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  };

  const handleSendInvitation = async (emails: any) => {
    const validEmails = emails.filter((email: any) => email?.trim() !== '');

    if (!validEmails.length || !selectedShareLinkId) {
      showSwal('error', 'Please enter at least one email');
      return;
    }
    try {
      const payload = {
        emails: emails,
      };
      console.log('payload', payload);
      await createShareLinkByEmailById(token as string, payload, selectedShareLinkId as string);
      showSwal('success', 'Invitation sent successfully');
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      showSwal('error', error?.response.data.message || 'Failed to send invitation');
    }
  };

  const handleOpenInviteDialog = async (row: any) => {
    // setSelectedShareLink(row);

    const res = await getShareLinkById(row.id, token as string);
    setSelectedShareLink(res.collection);

    setSelectedShareLinkId(row.id);
    setGeneratedLink(row.shorten_url || row.url);
    setExpiredAt(row.expired_at);

    // setTabValue(0);
    setOpenInviteViaLinkEmail(true);
  };

  const handleSendEmail = async (emails: string[]) => {
    try {
      setIsGenerating(true);

      const finalPayload = {
        ...pendingPayload,
        emails: emails,
      };

      await createShareLink(token as string, finalPayload);

      setOpenSendEmail(false);
      setOpenCreateLink(false);

      showSwal('success', 'Share link sent successfully');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showSwal('error', 'Failed to send share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateLink = async (payload: any) => {
    try {
      setIsGenerating(true);

      await createShareLink(token as string, payload);

      setOpenCreateLink(false);
      showSwal('success', 'Share link created successfully');
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      showSwal('error', err.response.data.message ?? 'Failed to create share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateQuickAccess = async (payload: any) => {
    try {
      await createQuickAccess(token, payload);

      showSwal('success', 'Quick access created successfully');

      setOpenQuickAccess(false);
      await queryClient.invalidateQueries({ queryKey: ['quick-access'] });
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to create quick access');

      throw error;
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

  const filteredVisitors = tableRowVisitors.filter((item) => {
    const keyword = searchAgenda.trim().toLowerCase();

    return (
      item.agenda?.toLowerCase().includes(keyword) ||
      item.host_name?.toLowerCase().includes(keyword)
    );
  });

  const handleCancel = async (id: string) => {
    try {
      await cancelVisitor(token as string, id);

      showSwal('success', 'Transaction successfully cancelled');

      fetchData();
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to cancel visitor');
    }
  };

  const requestCloseDialog = () => {
    if (isFormChanged) {
      openDiscardForCloseAdd();
    } else {
      handleCloseDialog();
    }
  };

  return (
    <>
      <PageContainer title="Invitation" description="invitation page">
        <Box>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard
                cardMarginBottom={1}
                items={cards}
                onImageClick={(_, index) => {
                  if (index === 1) {
                    setFlowTarget('preReg');
                    handleAdd();
                  } else if (index === 2) {
                    setOpenDetailShareLink(true);
                  } else if (index === 3) {
                    setOpenQuickAccess(true);
                  }
                }}
                size={{ xs: 12, lg: 3 }}
              />
            </Grid>

            {/* <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
                isHavePagination={true}
                overflowX={'auto'}
                minWidth={2400}
                stickyHeader={true}
                currentPage={page}
                data={processedData || []}
                totalCount={totalFilteredRecords}
                isNoActionTableHead={true}
                selectedRows={selectedRows}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveImage={true}
                isHaveSearch={true}
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
                isBlacklistPage={false}
                isHaveEmployee={false}
                // onEmployeeClick={(row: any) => {
                //   handleEmployeeClick(row.host as string);
                // }}
                isHaveVerified={false}
                // headerContent={{
                //   title: '',
                //   subTitle: 'Monitoring Data Visitor',
                //   items: [
                //     { name: 'All' },
                //     { name: 'Preregis' },
                //     { name: 'Checkin' },
                //     { name: 'Checkout' },
                //     { name: 'Block' },
                //     { name: 'Denied' },
                //     { name: 'Waiting' },
                //   ],
                // }}
                // onHeaderItemClick={(item) => {
                //   if (
                //     item.name === 'All' ||
                //     item.name === 'Checkin' ||
                //     item.name === 'Checkout' ||
                //     item.name === 'Preregis' ||
                //     item.name === 'Denied' ||
                //     item.name === 'Block' ||
                //     item.name === 'Waiting'
                //   ) {
                //     setSelectedType(item.name);
                //     setPage(0);
                //     setAppliedFilters((prev: any) => ({
                //       ...prev,
                //       status: item.name === 'All' ? 0 : item.name,
                //     }));
                //   }
                // }}
                defaultSelectedHeaderItem="All"
                onView={(row) => {
                  handleView(row.id);
                }}
                searchKeyword={search}
                onSearch={handleSearch}
                onAddData={handleAdd}
              />
            </Grid> */}
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
                  placeholder="Search Transaction"
                  value={searchAgenda}
                  onChange={(e) => setSearchAgenda(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" style={{ paddingLeft: '0px !important' }}>
                        <IconSearch style={{ color: 'gray' }} />
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
                      : filteredVisitors.map((group: any) => (
                          <Box
                            key={group.id}
                            sx={{
                              backgroundColor:
                                selectedGroup?.id === group.id ? '#e3f2fd' : '#f5f5f5',
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
                            {/* <Box display={'flex'} justifyContent={'flex-end'}>
                              {group.invited_by === profile?.user_id && (
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleCancel(group.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </Box> */}
                          </Box>
                        ))}
                    {hasMore && (
                      <Box display="flex" justifyContent="center" mt={2}>
                        <Button
                          variant="outlined"
                          onClick={() => fetchData(true)}
                          disabled={loadingMore}
                          fullWidth
                        >
                          {loadingMore ? (
                            <>
                              <CircularProgress size={18} sx={{ mr: 1 }} />
                            </>
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box
                p={2}
                sx={{
                  height: { xs: 'auto', xl: '78vh' },
                  overflow: 'auto',
                  display: 'flex',
                  width: '100%',
                  flexDirection: {
                    xs: 'column',
                    md: 'row',
                  },
                  gap: 2,
                }}
              >
                {/* List */}
                <VisitorListTable
                  selectedGroupId={selectedGroupId}
                  groupHeader={groupHeader}
                  groupVisitors={groupVisitors}
                  groupDetailLoading={groupDetailLoading}
                  selectedVisitor={selectedVisitor}
                  setSelectedVisitor={setSelectedVisitor}
                  openGroup={openGroup}
                  setOpenGroup={setOpenGroup}
                />
                {/* Detail From List */}
                <VisitorDetailPanel selectedVisitor={selectedVisitor} tab={tab} setTab={setTab} />
              </Box>
            </Box>
          </Grid>
        </Box>
      </PageContainer>
      {/* Add Pre registration */}
      <Dialog
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100vw',
          },
        }}
        open={openPreRegistration}
        onClose={requestCloseDialog}
      >
        <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
          {t('add')} Pra Registration
          <IconButton aria-label="close" onClick={requestCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: '10px' }}>
          <Praregist
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
            search={setSearchHost}
            isLoadingEmployee={isLoadingEmployee}
          />
        </DialogContent>
      </Dialog>

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

      {/* Employee Detail */}
      <EmployeeDetailDialog
        open={openEmployeeDialog}
        onClose={handleCloseEmployeeDialog}
        employeeDetail={employeeDetail}
        employeeLoading={employeeLoading}
        employeeError={employeeError}
        axiosInstance2={axiosInstance2}
      />

      {/* Related Visitor */}
      <RelatedInvitationDialog
        open={openRelatedInvitation}
        onClose={handleCloseRelation}
        visitorDetail={visitorDetail}
        selected={selected}
        setSelected={setSelected}
        disabledIndexes={disabledIndexes}
        selectedVisitorData={selectedVisitorData}
      />

      {/* Share Link */}
      <ShareLinkDialog
        refreshKey={refreshKey}
        open={openDetailShareLink}
        onClose={() => setOpenDetailShareLink(false)}
        token={token as string}
        onCopyLink={(row) => handleOpenInviteDialog(row)}
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
          sx={{ zIndex: 2000 }}
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
    </>
  );
};

export default Content;
