import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  Portal,
  Snackbar,
  Typography,
} from '@mui/material';
import moment from 'moment-timezone';
import {
  IconBolt,
  IconCircleMinus,
  IconLogin,
  IconLogout,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import TopCards from './TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import Heatmap from './Heatmap';
import {
  getActiveInvitation,
  getOngoingInvitation,
  openParkingBlocker,
} from 'src/customs/api/visitor';
import FormDialogInvitation from './FormDialogInvitation';
import {
  getVisitorTransactionByIds,
} from 'src/customs/api/admin';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import Swal from 'sweetalert2';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { setDateRange } from 'src/store/apps/Daterange/dateRangeSlice';
import CreateLinkDialog from '../Components/Dialog/CreateLinkDialog';
import DetailLinkDialog from '../Components/Dialog/DetailLinkDialog';
import SendEmailDialog from '../Components/Dialog/SendEmailDialog';
import { useNavigate } from 'react-router';
import AccessPassDialog from '../Components/Dialog/AccessPassDialog';
import { useQuery } from '@tanstack/react-query';
import {
  getApprovalTicket,
} from 'src/customs/api/Admin/ApprovalWorkflow';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { QuickAccessDialog } from '../Components/Dialog/QuickAccessDialog';
import dayjs from 'dayjs';
import InvitationShareDialog from '../../admin/content/Visitor/Trx/components/Dialog/InvitationShareDialog';
import { useActivities } from 'src/hooks/Dashboard/useActivity';
import PendingInvitationDialog from '../Components/Dialog/PendingInvitationDialog';
import AccessPassEmployee from '../Components/AccessPassEmployee';
import { useTranslation } from 'react-i18next';
import InviteOrCreateLinkDialog from '../Components/Dialog/InviteOrCreateLinkDialog';
import DashboardEmployeeActionBar from '../Components/DashboardEmployeeActionBar';
import { useAccessPass } from 'src/hooks/Dashboard/useAccessPass';
import GlobalBackdropLoading from '../../Operator/Components/GlobalBackdrop';
import { useShareLinkPagination } from 'src/hooks/Visitor/useShareLinkPagination';
import { useShareLinkMutation } from 'src/hooks/Visitor/useShareLinkMutation';
import ApprovalVisitorGroupDialog from '../Components/Dialog/ApprovalVisitorGroupDialog';
import { useQuickAccessPagination } from 'src/hooks/Visitor/useQuickAccessPagination';
import { useQuickAccessMutation } from 'src/hooks/Visitor/useQuickAccesMutation';
import { getShareLinkById } from 'src/customs/api/Admin/ShareLink';
import { useDebounce } from 'src/hooks/useDebounce';
import { useApprovalMutation } from 'src/hooks/Approval/useApprovalMutation';

const DashboardEmployee = () => {
  const CardItems = [
    { title: 'checkin', key: 'Checkin', icon: <IconLogin size={25} /> },
    { title: 'checkout', key: 'Checkout', icon: <IconLogout size={25} /> },
    { title: 'denied', key: 'Denied', icon: <IconX size={25} /> },
    { title: 'block', key: 'Block', icon: <IconCircleMinus size={25} /> },
  ];
  const [openDialogInvitation, setOpenDialogInvitation] = useState(false);
  const [invitationDetailVisitor, setInvitationDetailVisitor] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [openAlertInvitation, setOpenAlertInvitation] = useState(false);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [openAccess, setOpenAccess] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openInviteOrCreateLink, setOpenInviteOrCreateLink] = useState(false);
  const [openCreateLink, setOpenCreateLink] = useState(false);
  const [openDetailLink, setOpenDetailLink] = useState(false);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [sortDir, setSortDir] = useState('desc');
  const dispatch = useDispatch();
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [openQuickAccess, setOpenQuickAccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [triggerCheckAll, setTriggerCheckAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openInviteViaLinkEmail, setOpenInviteViaLinkEmail] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);
  const [selectedShareLink, setSelectedShareLink] = useState<any>(null);
  const { t } = useTranslation();
  const start = page * rowsPerPage;
  const navigate = useNavigate();
  const [groupVisitors, setGroupVisitors] = useState<any[]>([]);
  const [groupDetailLoading, setGroupDetailLoading] = useState(false);
  const { createMutation: createQuickAccess } = useQuickAccessMutation();
  const { accessPass, loading: loadingAccessPass } = useAccessPass();
  const [quickSearch, setQuickSearch] = useState('');
  const [quickPage, setQuickPage] = useState(0);
  const [quickRowsPerPage, setQuickRowsPerPage] = useState(10);
  const [isParkingLoading, setIsParkingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleOpenInviteOrCreateLink = () => {
    setOpenInviteOrCreateLink(true);
  };

  const {
    approveMutation,
    rejectMutation,
    approveMeetingHostMutation,
  } = useApprovalMutation();

  const handleCloseInviteOrCreateLink = () => {
    setOpenInviteOrCreateLink(false);
  };

  const handleOpenCreateLink = () => {
    setOpenInviteOrCreateLink(false);
    setOpenCreateLink(true);
  };

  const handleOpenAccess = () => {
    setOpenAccess(true);
  };

  const handleCloseAccess = () => {
    setOpenAccess(false);
  };

  const {
    data,
    isLoading: isLoadingShareLink,
    isFetching,
  } = useShareLinkPagination({
    page,
    rowsPerPage,
    search: searchKeyword,
    sortDir,
  });

  const shareLinkList = data?.collection ?? [];
  const debouncedKeyword = useDebounce(searchKeyword, 500);

  const {
    data: approvalRes,
    refetch: refetchApproval,
    isFetching: loadingApproval,
  } = useQuery({
    queryKey: ['approval', page, rowsPerPage, debouncedKeyword, sortDir],
    queryFn: async () => {
      return await getApprovalTicket({
        start,
        length: rowsPerPage,
        sort_dir: sortDir,
        keyword: debouncedKeyword,
      });
    },
  });

  const approvalData =
    approvalRes?.collection?.map(
      ({
        entity_id,
        visitor_type_name,
        agenda,
        host_name,
        approval_actor_status,
        approval_workflow_type,
        approval_status,
        visitor_period_start,
        visitor_period_end,
        ticket_id,
      }: any) => ({
        id: entity_id,
        visitor_type_name,
        agenda,
        host_name,
        approval_actor_status,
        approval_workflow_type,
        approval_status,
        visitor_period_start,
        visitor_period_end: formatDateTime(visitor_period_end),
        ticket_id,
      }),
    ) || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getOngoingInvitation();
        const data = res?.collection ?? [];

        const filtered = data
          .filter(
            (item: any) => item.is_praregister_done === false || item.is_praregister_done === null,
          )
          .slice(0, 5);

        const mapped = filtered.map((item: any) => ({
          id: item.id,
          name: item.visitor_name,
          email: item.visitor_email,
          organization: item.visitor_organization_name,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          host: item.host_name ?? '-',
          site: item.site_place_name,
          // visitor_status: item.visitor_status,
        }));

        setInvitationDetailVisitor(mapped);

        const notDoneInvitations = data.filter(
          (inv: any) => inv.is_praregister_done === null || inv.is_praregister_done === false,
        );

        if (notDoneInvitations.length > 0) {
          setPendingInvitationCount(notDoneInvitations.length);
          setOpenAlertInvitation(true);
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  const {
    data: quickAccessResult,
    isLoading: isLoadingQuickAccess,
  } = useQuickAccessPagination({
    page: quickPage,
    rowsPerPage: quickRowsPerPage,
    search: quickSearch,
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
          name_courier: item.visitor_name || '-',
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

  const handleView = (row: any) => {
    setSelectedInvitationId(row.id);
    setOpenDialogInvitation(true);
  };

  function formatVisitorPeriodLocal(startUtc: string, endUtc: string) {
    const startLocal = moment.utc(startUtc).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm');
    const endLocal = moment.utc(endUtc).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm');
    return `${startLocal} - ${endLocal}`;
  }

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      const clone = printRef.current.cloneNode(true) as HTMLElement;

      const logoEl = document.createElement('img');
      logoEl.src = '/src/assets/images/logos/bio-experience-1x1-logo.png';
      logoEl.style.width = '100px';
      logoEl.style.height = '100px';
      logoEl.style.display = 'block';
      logoEl.style.margin = '0 auto';
      clone.prepend(logoEl);

      clone.querySelectorAll('.no-print').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Access Pass ${accessPass?.group_name || 'Visitor'}.pdf`);

      clone.remove();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenParkingBlocker = async () => {
    if (!accessPass?.id) return;
    setIsParkingLoading(true);
    try {
      const res = await openParkingBlocker({ id: accessPass.id });

      setSnackbar({
        open: true,
        message: 'Parking blocker opened successfully.',
        severity: 'success',
      });
    } catch (error: any) {
      showSwal('error', error?.message || 'Failed to open parking blocker.');
    } finally {
      setTimeout(() => setIsParkingLoading(false), 600);
    }
  };

  const handleApproveMeetingHost = async (id: string) => {
    try {
      setIsGenerating(true);

      const payload = {
        list_trx_visitor_id: selectedRows.map((item: any) => item.id),
      };
      const response = await approveMeetingHostMutation.mutateAsync({
        id,
        payload: {
          list_trx_visitor_id: selectedRows.map((item) => item.id),
        },
      });
      const res = await handleActionApproval(id, 'Approve');

      showSwal('success', response?.msg || 'Approve meeting host successfully.');
      setSelectedRows([]);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed approve meeting host.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActionApproval = async (id: string, action: 'Approve' | 'Reject') => {
    try {
      setIsGenerating(true);
      if (action === 'Reject') {
        const confirm = await Swal.fire({
          title: 'Reject Approval?',
          text: 'Do you want to reject this approval?',
          icon: 'warning',
          reverseButtons: true,
          showCancelButton: true,
          confirmButtonText: 'Reject',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#f44336',
          customClass: {
            title: 'swal2-title-custom',
            htmlContainer: 'swal2-text-custom',
          },
        });

        if (!confirm.isConfirmed) return;
      }

      // if (action === 'Approve') await approveTicket(id);
      // if (action === 'Reject') await rejectTicket(id);
      if (action === 'Approve') await approveMutation.mutateAsync(id);
      if (action === 'Reject') await rejectMutation.mutateAsync(id);

      showSwal(
        'success',
        `Data Approval ${action === 'Approve' ? 'approved' : 'denied'} successfully.`,
      );

      setOpenDialog(false);
    } catch (error: any) {
      setTimeout(() => setIsGenerating(false), 800);
      showSwal('error', error.response.data.msg || 'Failed action approval.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInviteDialog = async (row: any) => {
    const res = await getShareLinkById(row.id);
    setSelectedShareLink(res.collection);
    setSelectedShareLinkId(row.id);
    setGeneratedLink(row.shorten_url || row.url);
    setExpiredAt(row.expired_at);
    setOpenInviteViaLinkEmail(true);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showSwal('success', 'Link copied to clipboard.');
  };

  const handleDetailLink = (link: string) => {
    // window.open(link, '_blank');
    setOpenDetailLink(true);
  };

  const { deleteMutation, createMutation, sendEmailMutation } = useShareLinkMutation();

  const handleDeleteLink = async (id: string) => {
    try {
      setIsGenerating(true);
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
      await deleteMutation.mutateAsync(id);
      showSwal('success', 'Link deleted successfully.');
    } catch (error) {
      showSwal('error', 'Something went wrong while deleting link.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateLink = async (payload: any) => {
    try {
      setIsGenerating(true);

      await createMutation.mutateAsync(payload);
      setOpenCreateLink(false);
      showSwal('success', 'Share link created successfully');
    } catch (err: any) {
      showSwal('error', err.response.data.message ?? 'Failed to create share link');
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

      await createMutation.mutateAsync(finalPayload);

      setOpenSendEmail(false);
      setOpenCreateLink(false);

      showSwal('success', 'Share link sent successfully');
    } catch (err) {
      showSwal('error', 'Failed to send share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPdf = async () => {
    if (!exportRef.current || isExporting) return;

    try {
      setIsExporting(true);

      await new Promise((resolve) => setTimeout(resolve, 0));

      const canvas = await html2canvas(exportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // const formatDate = (date: Date) => date.toISOString().split('T')[0];
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
      };
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      pdf.save(`Dashboard Report-${start}_to_${end}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateQuickAccess = async (payload: any) => {
    try {
      setIsGenerating(true);
      await createQuickAccess.mutateAsync(payload);
      showSwal('success', 'Quick access created successfully');
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to create quick access');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickSearch = useCallback((keyword: string) => {
    setQuickPage(0);
    setQuickSearch(keyword);
  }, []);


  const handleOpenApprovalDialog = async (row: any) => {
    try {
      setSelectedId(row.ticket_id);
      setOpenDialog(true);
      setGroupDetailLoading(true);

      const res = await getVisitorTransactionByIds(row.id);

      setGroupVisitors(res?.collection ?? []);
      setTriggerCheckAll(true);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed load visitor detail.');
    } finally {
      setGroupDetailLoading(false);
    }
  };

  const visitorTableData = groupVisitors.map((item: any) => ({
    id: item.id,
    agenda: item.agenda,
    site_name: item.site_place_name,
    name: item.visitor_name,
    organization_name: item.visitor_organization_name,
    identity_id: item.visitor_identity_id,
    visitor_phone: item.visitor_phone,
    email: item.visitor_email,
    visitor_period_start: formatDateTime(item.visitor_period_start),
    visitor_period_end: formatDateTime(item.visitor_period_end),
  }));

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
      await sendEmailMutation.mutateAsync({
        id: selectedShareLinkId,
        payload: {
          emails: validEmails,
        },
      });
      showSwal('success', 'Invitation sent successfully');
    } catch (error: any) {
      showSwal('error', error?.response.data.message || 'Failed to send invitation');
    }
  };

  const {
    data: activites = [],
    isLoading: isLoadingActivities,
    error,
  } = useActivities({
    start: 0,
    length: 5,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  });

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTriggerCheckAll(false);
  };

  return (
    <PageContainer title="Dashboard" description="This is Employee Dashboard">
      <DashboardEmployeeActionBar
        startDate={startDate}
        endDate={endDate}
        onDateChange={(startDate, endDate) => {
          dispatch(
            setDateRange({
              startDate,
              endDate,
            }),
          );
        }}
        onExport={handleExportPdf}
        isExporting={isExporting}
      />
      <Grid container spacing={2} sx={{ mt: 0 }} ref={exportRef}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <TopCards items={CardItems} size={{ xs: 12, lg: 6 }} />
        </Grid>

        <Grid
          size={{ xs: 12, lg: 3 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AccessPassEmployee activeAccessPass={accessPass} onClick={handleOpenAccess} />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 0.5 }}
            onClick={handleOpenInviteOrCreateLink}
            startIcon={<IconPlus />}
          >
            Invite
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 0.5 }}
            onClick={() => setOpenQuickAccess(true)}
            startIcon={<IconBolt />}
          >
            {t('quickAccess')}
          </Button>
        </Grid>
        <Grid container spacing={2} alignItems="stretch" width={'100%'}>
          <Grid
            size={{ xs: 12, lg: 6 }}
            sx={{
              display: 'flex',
            }}
          >
            <DynamicTable
              loading={loadingApproval}
              height={'100%'}
              overflowX="auto"
              data={approvalData}
              isHaveChecked={true}
              isHaveAction={true}
              isActionVisitor={false}
              isHaveHeaderTitle
              titleHeader="Approval"
              isHaveApproval={true}
              onAccept={(row: any) => handleOpenApprovalDialog(row)}
              onDenied={(row: any) => handleActionApproval(row.ticket_id, 'Reject')}
              isHavePeriod={true}
            />
          </Grid>

          <Grid
            size={{ xs: 12, lg: 6 }}
            sx={{
              display: 'flex',
            }}
          >
            <DynamicTable
              loading={isLoadingShareLink}
              height={'100%'}
              overflowX="auto"
              data={shareLinkList}
              isHaveChecked={true}
              titleHeader="Link Share Visitor"
              isHaveHeaderTitle={true}
              isCopyLink={true}
              isNoActionTableHead={true}
              onPaginationChange={(page, rowsPerPage) => {
                setPage(page);
                setRowsPerPage(rowsPerPage);
              }}
              isHaveAddData={true}
              isDetailLink={true}
              onCopyLink={(row: any) => handleOpenInviteDialog(row)}
              onDetailLink={(row: any) => handleDetailLink(row)}
              onDelete={(row: any) => handleDeleteLink(row.id)}
              onAddData={() => setOpenCreateLink(true)}
            />
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }} sx={{ height: '100%' }}>
          <DynamicTable
            data={invitationDetailVisitor}
            height={430}
            isHavePagination={false}
            overflowX="auto"
            isHaveChecked={false}
            isHaveView={true}
            isHaveAction={true}
            isHaveHeaderTitle
            isHavePeriod={true}
            onView={(row: any) => handleView(row)}
            titleHeader="Ongoing Invitation"
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ height: '100%' }}>
          <Heatmap />
        </Grid>
        <Grid size={{ xs: 12, lg: 12 }}>
          <DynamicTable
            loading={isLoadingActivities}
            isHavePagination={false}
            defaultRowsPerPage={10}
            data={activites}
            isHaveHeaderTitle
            titleHeader="Activities"
            // height={420}
            overflowX="auto"
          />
        </Grid>
      </Grid>

      {/* Dialog Praregist or Create link */}
      <InviteOrCreateLinkDialog
        open={openInviteOrCreateLink}
        onClose={handleCloseInviteOrCreateLink}
        onPreregister={() => navigate('/employee/invitation')}
        onCreateLink={handleOpenCreateLink}
      />

      {/* Open Alert Invitation */}
      <PendingInvitationDialog
        open={openAlertInvitation}
        onClose={() => setOpenAlertInvitation(false)}
        pendingInvitationCount={pendingInvitationCount}
      />

      <QuickAccessDialog
        open={openQuickAccess}
        onClose={() => setOpenQuickAccess(false)}
        visitorTableData={processedQuickAccessData}
        loading={isLoadingQuickAccess}
        onSubmit={handleCreateQuickAccess}
        page={quickPage}
        setPage={setQuickPage}
        setRowsPerPage={setQuickRowsPerPage}
        searchKeyword={quickSearch}
        onSearch={handleQuickSearch}
        totalCount={quickAccessResult?.RecordsFiltered ?? 0}
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
      {/* Praregister */}
      <Dialog
        open={openDialogInvitation}
        onClose={() => setOpenDialogInvitation(false)}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle>Fill Praregister</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenDialogInvitation(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
        <DialogContent dividers>
          {selectedInvitationId ? (
            <FormDialogInvitation
              id={selectedInvitationId}
              onClose={() => setOpenDialogInvitation(false)}
              onSubmitted={() => {
                setOpenDialogInvitation(false);
                // setInvitationDetailVisitor([]);
              }}
              onSubmitting={setSubmitting}
            />
          ) : (
            <Typography variant="body2" textAlign="center" color="text.secondary">
              No invitation selected.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Active Pass */}
      {accessPass && (
        <AccessPassDialog
          open={openAccess}
          onClose={handleCloseAccess}
          data={accessPass}
          isGenerating={isGenerating}
          isParkingLoading={isParkingLoading}
          onDownload={handleDownloadPDF}
          onOpenParking={handleOpenParkingBlocker}
          formatVisitorPeriodLocal={formatVisitorPeriodLocal}
          ref={printRef}
        />
      )}

      <ApprovalVisitorGroupDialog
        open={openDialog}
        onClose={handleCloseDialog}
        loading={groupDetailLoading}
        data={visitorTableData}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        triggerCheckAll={triggerCheckAll}
        selectedId={selectedId as string}
        onReject={(id) => handleActionApproval(id, 'Reject')}
        onApprove={handleApproveMeetingHost}
        t={t}
      />

      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            zIndex: 2,
            position: 'fixed',
          }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
      <GlobalBackdropLoading open={isGenerating} />
    </PageContainer>
  );
};

export default DashboardEmployee;
