import { useState, useEffect, useMemo, useCallback } from 'react';
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
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import PageContainer from 'src/components/container/PageContainer';
import iconAdd from '../../../..//assets/images/svgs/add-circle.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
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
  getRegisteredSite,
  getVisitorEmployee,
} from 'src/customs/api/admin';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { IconBolt, IconClipboard, IconLink, IconShare, IconUsers } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Praregist from './Praregist';
import { getInvitationRelatedVisitor, getOngoingInvitation } from 'src/customs/api/visitor';
import { useSelector } from 'react-redux';
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

const Content = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<[]>([]);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });
  const [selectedShareLink, setSelectedShareLink] = useState<any>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const defaultFormData = CreateVisitorRequestSchema.parse({});
  const isFormChanged = JSON.stringify(formDataAddVisitor) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    if (isFormChanged) {
      localStorage.setItem('unsavedVisitorData', JSON.stringify(formDataAddVisitor));
    } else {
      localStorage.removeItem('unsavedVisitorData');
    }
  }, [formDataAddVisitor, isFormChanged]);

  const employeeId = useSelector((state: any) => state.userReducer.data?.employee_id);

  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
  const [flowTarget, setFlowTarget] = useState<'invitation' | 'preReg' | null>(null);
  // Employee Detail
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  // Visitor Detail
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorDetail, setVisitorDetail] = useState<any[]>([]);
  const [openRelatedInvitation, setOpenRelatedInvitation] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  // Registered Site
  // const [siteData, setSiteData] = useState<any[]>([]);
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

  const [selected, setSelected] = useState<number[]>([]);
  const [disabledIndexes, setDisabledIndexes] = useState<number[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);

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

  const [selectedType, setSelectedType] = useState<
    'All' | 'Preregis' | 'Checkin' | 'Checkout' | 'Denied' | 'Block' | 'Waiting'
  >('All');

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
        token as string,
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
    enabled: !!token,
    staleTime: 1000 * 60 * 1,
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
    data: paginatedData,
    dataQuickAccess: processedQuickAccessData,
    RecordsFiltered: processedData.length,
    RecordsTotal: processedData.length,
  };

  const totalVisitorRecords = useMemo(() => {
    return visitorDataAll.length;
  }, [visitorDataAll]);

  const cards = [
    {
      title: 'Total Visitor',
      icon: IconUsers,
      subTitle: `${totalVisitorRecords}`,
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
    const saved = localStorage.getItem('unsavedVisitorData');
    let freshForm;

    // if (saved) {
    //   try {
    //     freshForm = JSON.parse(saved);
    //   } catch {
    //     freshForm = CreateVisitorRequestSchema.parse({});
    //   }
    // } else {
    //   freshForm = CreateVisitorRequestSchema.parse({});
    // }

    freshForm = CreateVisitorRequestSchema.parse({});
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
    setConfirmDialogOpen(true);
  };

  const handleCancelDiscard = () => {
    setConfirmDialogOpen(false);
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
    handleDialogClose();
  };

  const handleView = async (id: string) => {
    if (!id || !token) return;

    setOpenRelatedInvitation(true);

    try {
      const res = await getInvitationRelatedVisitor(id, token);
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
        vehicle_plate_number: v.vehicle_plate_number,
        visitor_status: v.visitor_status,
      }));
  }, [visitorDetail, selected]);

  const handleCloseRelation = () => {
    setOpenRelatedInvitation(false);
    setVisitorDetail([]);
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

  const { data: allVisitorEmployee = [] } = useInvitationVisitorEmployee(token, {
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

  return (
    <>
      <PageContainer title="Invitation" description="invitation page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard
                cardMarginBottom={1}
                items={cards}
                onImageClick={(_, index) => {
                  if (index === 1) {
                    setFlowTarget('preReg');
                    setOpenPreRegistration(true);
                  } else if (index === 2) {
                    setOpenDetailShareLink(true);
                  } else if (index === 3) {
                    setOpenQuickAccess(true);
                  } else {
                    setOpenDialogIndex(index);
                  }
                }}
                size={{ xs: 12, lg: 3 }}
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
                totalCount={totalVisitorRecords}
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
                isBlacklistPage={false}
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
                isHaveFilterMore={false}
              />
            </Grid>
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
