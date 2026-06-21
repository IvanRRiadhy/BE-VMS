import {
  Alert,
  Backdrop,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  Grid2 as Grid,
  IconButton,
  Portal,
  Snackbar,
  Typography,
  Box,
  DialogActions,
} from '@mui/material';
import moment from 'moment-timezone';
import {
  IconBellRingingFilled,
  IconBolt,
  IconCards,
  IconCircleMinus,
  IconLogin,
  IconLogout,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import PageContainer from 'src/components/container/PageContainer';
import TopCards from './TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import Heatmap from './Heatmap';
import {
  getActiveInvitation,
  getOngoingInvitation,
  openParkingBlocker,
} from 'src/customs/api/visitor';
import FormDialogInvitation from './FormDialogInvitation';
import {
  getAccessPass,
  getAllVisitorPagination,
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
import {
  createShareLink,
  createShareLinkByEmailById,
  deleteShareLink,
  getShareLinkByDt,
} from 'src/customs/api/ShareLink';
import AccessPassDialog from '../Components/Dialog/AccessPassDialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveMeetingHost,
  approveTicket,
  getApprovalTicket,
  rejectTicket,
} from 'src/customs/api/Admin/ApprovalWorkflow';
import { IconCalendar } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import Calendar from 'src/customs/components/calendar/Calendar';
import { IconDownload } from '@tabler/icons-react';

import { createQuickAccess } from 'src/customs/api/Admin/Visitor';
import { QuickAccessDialog } from '../Components/Dialog/QuickAccessDialog';
import dayjs from 'dayjs';
import InvitationShareDialog from '../../admin/content/Visitor/Trx/components/Dialog/InvitationShareDialog';
import { useActivities } from 'src/hooks/useActivity';

const DashboardEmployee = () => {
  const CardItems = [
    { title: 'checkin', key: 'Checkin', icon: <IconLogin size={25} /> },
    { title: 'checkout', key: 'Checkout', icon: <IconLogout size={25} /> },
    { title: 'denied', key: 'Denied', icon: <IconX size={25} /> },
    { title: 'block', key: 'Block', icon: <IconCircleMinus size={25} /> },
  ];

  const { token } = useSession();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [openDialogInvitation, setOpenDialogInvitation] = useState(false);
  const [invitationDetailVisitor, setInvitationDetailVisitor] = useState<any[]>([]);
  const [activeInvitation, setActiveInvitation] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [openAlertInvitation, setOpenAlertInvitation] = useState(false);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [openAccess, setOpenAccess] = useState(false);
  const [activeAccessPass, setActiveAccessPass] = useState<any>();
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
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [openQuickAccess, setOpenQuickAccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [triggerCheckAll, setTriggerCheckAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedApprovalTicketId, setSelectedApprovalTicketId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const start = page * rowsPerPage;
  const navigate = useNavigate();

  const handleOpenInviteOrCreateLink = () => {
    setOpenInviteOrCreateLink(true);
  };

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

    staleTime: 1000 * 60 * 1,
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });

  const shareLinkList =
    data?.collection?.map((item: any) => ({
      id: item.id,
      agenda: item.agenda,
      url: item.url,
      current_usage: item.current_usage,
      max_usage: item.max_usage,
      expired_at: (() => {
        const date = new Date(item.expired_at + 'Z');

        const formattedDate = date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        const formattedTime = date
          .toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
          .replace(':', '.');

        return `${formattedDate}, ${formattedTime}`;
      })(),
      link_status: item.link_status,
    })) || [];

  useEffect(() => {
    const fetchDataActiveInvtiation = async () => {
      try {
        const response = await getActiveInvitation(token as string);
        let rows = response.collection.map((item: any) => ({
          id: item.id,
          name: item.visitor.name,
          email: item.visitor.email,
          organization: item.visitor.organization,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          host: item.host_name ?? '-',
          // visitor_status: item.visitor_status,
        }));
        setActiveInvitation(rows || []);
      } catch (error) {}
    };

    fetchDataActiveInvtiation();
  }, [token]);

  const {
    data: approvalRes,
    refetch: refetchApproval,
    isFetching: loadingApproval,
  } = useQuery({
    queryKey: ['approval-ticket', page, rowsPerPage, searchKeyword, sortDir],
    queryFn: async () => {
      return await getApprovalTicket(token, {
        start,
        length: rowsPerPage,
        sort_dir: sortDir,
        keyword: searchKeyword,
      });
    },
    enabled: !!token,
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

  // const approvalData =
  //   approvalRes?.collection?.map((item: any) => {
  //     const { ticket_id, ...rest } = item;

  //     return {
  //       id: item.entity_id,
  //       ticket_id,
  //       visitor_type_name: item.visitor_type_name,
  //       agenda: item.agenda,
  //       host_name: item.host_name,
  //       approval_actor_status: item.approval_actor_status,
  //       approval_workflow_type: item.approval_workflow_type,
  //       approval_status: item.approval_status,
  //       visitor_period_start: item.visitor_period_start,
  //       visitor_period_end: formatDateTime(item.visitor_period_end),
  //     };
  //   }) || [];

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await getOngoingInvitation(token as string);
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
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const resAccess = await getAccessPass(token as string);
        setActiveAccessPass(resAccess);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [token]);

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
      pdf.save(`Access Pass ${activeAccessPass?.group_name || 'Visitor'}.pdf`);

      clone.remove();
    } finally {
      setIsGenerating(false);
    }
  };

  const [isParkingLoading, setIsParkingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleOpenParkingBlocker = async () => {
    if (!activeAccessPass?.id || !token) return;
    setIsParkingLoading(true);
    try {
      const res = await openParkingBlocker(token, { id: activeAccessPass.id });
      console.log('res', JSON.stringify(res, null, 2));
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
      setLoading(true);
      console.log('id', id);
      console.log('selectedRows', selectedRows);

      const payload = {
        list_trx_visitor_id: selectedRows.map((item: any) => item.id),
      };

      console.log('payload', payload);

      const response = await approveMeetingHost(token, id, payload);
      console.log('response', response);

      const res = await handleActionApproval(id, 'Approve');
      console.log('res', res);

      showSwal('success', response?.msg || 'Approve meeting host successfully.');

      queryClient.invalidateQueries({
        queryKey: ['approval-ticket'],
      });

      setSelectedRows([]);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed approve meeting host.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionApproval = async (id: string, action: 'Approve' | 'Reject') => {
    try {
      setIsGenerating(true);

      if (action === 'Approve') await approveTicket(token as string, id);
      if (action === 'Reject') await rejectTicket(token as string, id);

      queryClient.invalidateQueries({
        queryKey: ['approval-ticket'],
      });

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

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showSwal('success', 'Link copied to clipboard.');
  };

  const handleDetailLink = (link: string) => {
    // window.open(link, '_blank');
    setOpenDetailLink(true);
  };

  const dataVisitor = [
    {
      id: 1,
      name: 'Dedy',
      agenda: 'Agenda 1',
      visitor_type: 'Visitor',
      destination: 'Gedung Sinergi',
      visitor_period_start: '2023-04-01, 08:00',
      visitor_period_end: '2023-04-01, 09:00',
    },
    {
      id: 2,
      name: 'Budi',
      agenda: 'Agenda 2',
      visitor_type: 'Visitor',
      destination: 'Gedung Sinergi',
      visitor_period_start: '2026-04-01, 10:00',
      visitor_period_end: '2026-04-01, 11:00',
    },
  ];

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
      showSwal('error', 'Something went wrong while deleting link.');
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

      const formatDate = (date: Date) => date.toISOString().split('T')[0];
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
      await createQuickAccess(token, payload);

      showSwal('success', 'Quick access created successfully');

      // setOpenQuickAccess(false);
      await queryClient.invalidateQueries({ queryKey: ['quick-access'] });
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

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupVisitors, setGroupVisitors] = useState<any[]>([]);
  const [groupDetailLoading, setGroupDetailLoading] = useState(false);

  const handleOpenApprovalDialog = async (row: any) => {
    // console.log('row', row);
    if (!token) return;

    try {
      setSelectedId(row.ticket_id);
      setOpenDialog(true);
      setGroupDetailLoading(true);

      const res = await getVisitorTransactionByIds(token, row.id);

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

  const [openInviteViaLinkEmail, setOpenInviteViaLinkEmail] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [selectedShareLinkId, setSelectedShareLinkId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedShareLink, setSelectedShareLink] = useState<any>(null);

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

  const {
    data: activites = [],
    isLoading: isLoadingActivities,
    error,
  } = useActivities({
    token,
    start: 0,
    length: 5,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  });

  return (
    <PageContainer title="Dashboard" description="This is Employee Dashboard">
      <Grid container spacing={3} alignItems="center" justifyContent="space-between" mb={1}>
        <Grid
          size={{ xs: 12, lg: 12 }}
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
          sx={{ mt: 0.5 }}
        >
          <Button
            size="small"
            sx={{
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid #d1d1d1',
              ':hover': { backgroundColor: '#d1d1d1', color: 'black' },
            }}
            startIcon={<IconCalendar size={18} />}
            onClick={handleClick}
          >
            {`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
          </Button>

          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<IconDownload />}
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export '}
          </Button>

          <Drawer open={open} anchor="right" onClose={handleClose}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" mb={1}>
                Select Date Range
              </Typography>
              <Calendar
                value={{ startDate, endDate }}
                onChange={(selection: any) => {
                  dispatch(
                    setDateRange({
                      startDate: selection.startDate,
                      endDate: selection.endDate,
                    }),
                  );
                  handleClose();
                }}
              />
            </Box>
          </Drawer>
        </Grid>
      </Grid>
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
          <Card
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              cursor: 'pointer',
              gap: 1,
            }}
            onClick={handleOpenAccess}
          >
            {activeAccessPass ? (
              <>
                <Typography variant="h5">Access Pass</Typography>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <QRCode
                    value={activeAccessPass.visitor_number || ''}
                    size={50}
                    style={{
                      height: 'auto',
                      width: '160px',
                    }}
                  />
                </Box>
                <Typography variant="body1" fontWeight={'600'} color="primary">
                  Tap to show detail
                </Typography>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <IconCards size={40} />
                <Typography
                  variant="body1"
                  color="textSecondary"
                  fontStyle="italic"
                  textAlign="center"
                  mt={1}
                >
                  No access pass found
                </Typography>
              </Box>
            )}
          </Card>
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
            Quick Access
          </Button>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            loading={loadingApproval}
            height={'100%'}
            overflowX="auto"
            // minWidth={200}
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

        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            loading={isFetching}
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
            onCopyLink={(row: any) => handleCopyLink(row.url)}
            onDetailLink={(row: any) => handleDetailLink(row)}
            onDelete={(row: any) => handleDeleteLink(row.id)}
            onAddData={() => setOpenCreateLink(true)}
          />
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
      <Dialog
        open={openInviteOrCreateLink}
        onClose={handleCloseInviteOrCreateLink}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Invite or Create Link
          <IconButton
            aria-label="close"
            onClick={handleCloseInviteOrCreateLink}
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
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            textAlign="center"
            py={3}
          >
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
              // onClick={() => setOpenDialogInvitation(true)}
              onClick={() => {
                navigate('/employee/invitation');
              }}
            >
              Praregister
            </Button>
            <Button variant="outlined" color="primary" fullWidth onClick={handleOpenCreateLink}>
              Share Link Invitation
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Open Alert Invitation */}
      <Dialog
        open={openAlertInvitation}
        onClose={() => setOpenAlertInvitation(false)}
        fullWidth
        maxWidth="sm"
      >
        <IconButton
          aria-label="close"
          onClick={() => setOpenAlertInvitation(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>

        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            textAlign="center"
            py={3}
          >
            <IconBellRingingFilled size={60} color="orange" />
            <Typography variant="h5" mt={2} fontWeight={600}>
              {pendingInvitationCount > 1
                ? `${pendingInvitationCount} invitation must be completed`
                : '1 invitation must be completed'}
            </Typography>

            <Typography variant="body1" color="text.secondary" mt={1}>
              You must complete the invitation before it expires
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      <QuickAccessDialog
        open={openQuickAccess}
        onClose={() => setOpenQuickAccess(false)}
        visitorTableData={processedQuickAccessData}
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
      {activeAccessPass && (
        <AccessPassDialog
          open={openAccess}
          onClose={handleCloseAccess}
          data={activeAccessPass}
          isGenerating={isGenerating}
          isParkingLoading={isParkingLoading}
          onDownload={handleDownloadPDF}
          onOpenParking={handleOpenParkingBlocker}
          formatVisitorPeriodLocal={formatVisitorPeriodLocal}
          ref={printRef}
        />
      )}
      {/* 
      <VisitorApprovalDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        groupName={groupHeader?.group_name}
        loading={groupDetailLoading}
        visitorTableData={visitorTableData ?? []}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        triggerCheckAll={triggerCheckAll}
        selectedId={selectedId ?? undefined}
        onReject={(id) => {
          handleActionApproval(id, 'Reject');
          setOpenDialog(false);
        }}
        onApprove={(id) => {
          handleApproveMeetingHost(id);
          setOpenDialog(false);
        }}
      /> */}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100vw',
          },
        }}
      >
        <DialogTitle>
          {/* {groupHeader?.group_name ?? 'Visitor Group'} */}
          Visitor Group
          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            onClick={() => setOpenDialog(false)}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ padding: '0px !important' }}>
          <DynamicTable
            loading={groupDetailLoading}
            data={visitorTableData}
            selectedRows={selectedRows}
            onCheckedChange={setSelectedRows}
            setSelectedRows={setSelectedRows}
            triggerCheckAll={triggerCheckAll}
            isHaveChecked={true}
            titleHeader="Select visitors for approval or rejection"
            isHaveHeaderTitle={true}
            isNoActionTableHead={true}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={(e: any) => {
              e.stopPropagation();

              if (!selectedId) return;

              handleActionApproval(selectedId, 'Reject');
              setOpenDialog(false);
            }}
            fullWidth
            color="error"
            variant="contained"
          >
            Reject
          </Button>
          <Button
            onClick={(e: any) => {
              e.stopPropagation();

              if (!selectedId) return;

              handleApproveMeetingHost(selectedId);
            }}
            variant="contained"
            fullWidth
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

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

export default DashboardEmployee;
