import {
  Alert,
  Autocomplete,
  Avatar,
  Backdrop,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  Portal,
  Snackbar,
  Typography,
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import moment from 'moment-timezone';
import {
  IconBan,
  IconBellRingingFilled,
  IconCards,
  IconCheck,
  IconCircleOff,
  IconCircleX,
  IconForbid2,
  IconLogin,
  IconLogout,
  IconX,
} from '@tabler/icons-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import PageContainer from 'src/components/container/PageContainer';
import TopCards from './TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import Heatmap from '../Heatmap';
import { createApproval, getApproval } from 'src/customs/api/employee';
import dayjs from 'dayjs';
import {
  getActiveInvitation,
  getInvitation,
  getOngoingInvitation,
  openParkingBlocker,
} from 'src/customs/api/visitor';
import FormDialogInvitation from '../FormDialogInvitation';
import { getAccessPass } from 'src/customs/api/admin';
import { Download } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import Swal from 'sweetalert2';
import { showSwal } from 'src/customs/components/alerts/alerts';

import CreateLinkDialog from '../Components/Dialog/CreateLinkDialog';
import DetailLinkDialog from '../Components/Dialog/DetailLinkDialog';
import SendEmailDialog from '../Components/Dialog/SendEmailDialog';
import { useNavigate } from 'react-router';
import {
  createShareLink,
  deleteShareLink,
  getShareLink,
  getShareLinkByDt,
} from 'src/customs/api/ShareLink';
import AccessPassDialog from '../Components/Dialog/AccessPassDialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { set } from 'lodash';
const DashboardEmployee = () => {
  const CardItems = [
    { title: 'checkin', key: 'Checkin', icon: <IconLogin size={25} /> },
    { title: 'checkout', key: 'Checkout', icon: <IconLogout size={25} /> },
    { title: 'denied', key: 'Denied', icon: <IconCircleX size={25} /> },
    { title: 'block', key: 'Block', icon: <IconForbid2 size={25} /> },
    // {
    //   title: 'blacklist',
    //   key: 'blacklist',
    //   icon: <IconUsersGroup size={22} />,
    // },
  ];

  const { token } = useSession();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [openDialogInvitation, setOpenDialogInvitation] = useState(false);
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [invitationDetailVisitor, setInvitationDetailVisitor] = useState<any[]>([]);
  const [activeInvitation, setActiveInvitation] = useState<any[]>([]);
  const [invitationList, setInvitationList] = useState<any[]>([]);
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

  // const [shareLinkList, setShareLinkList] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [sortDir, setSortDir] = useState('desc');

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

  const shareLinkList =
    data?.collection?.map((item: any) => ({
      id: item.id,
      agenda: item.agenda,
      url: item.url,
      max_usage: item.max_usage,
      expired: new Date(item.expired_at + 'Z').toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      link_status: item.link_status,
    })) || [];

  const totalRecords = data?.RecordsTotal ?? 0;
  const totalFilteredRecords = data?.RecordsFiltered ?? 0;

  useEffect(() => {
    const fetchDataActiveInvtiation = async () => {
      try {
        const response = await getActiveInvitation(token as string);
        // console.log(response);

        let rows = response.collection.map((item: any) => ({
          id: item.id,
          // visitor_type:  item.visitor_type_name,
          name: item.visitor.name,
          email: item.visitor.email,
          organization: item.visitor.organization,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          host: item.host_name ?? '-',
          // visitor_status: item.visitor_status,
        }));
        setActiveInvitation(rows || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDataActiveInvtiation();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
        const endDate = dayjs().add(31, 'day').format('YYYY-MM-DD');

        const response = await getApproval(
          token as string,
          startDate,
          endDate,
          false,
          null as any,
          null as any,
        );

        const mappedData = response.collection.map((item: any) => {
          const trx = item.trx_visitor || {};
          let status = '';
          if (item.action === 'Accept') status = 'Accept';
          else if (item.action === 'Deny') status = 'Deny';
          else status = '-';
          return {
            id: item.id,
            visitor_name: item.visitor?.name || '-',
            // site_place_name: trx.site_place_name || '-',
            // visitor_type: trx.visitor_type_name || '-',
            agenda: trx.agenda || '-',
            // visitor_period_start: trx.visitor_period_start || '-',
            // visitor_period_end: trx.visitor_period_end || '-',
            // visitor_period_end: trx.visitor_period_end
            //   ? formatDateTime(trx.visitor_period_end, trx.extend_visitor_period)
            //   : trx.visitor_period_end || '-',
            action_by: item.action_by || '-',
            status: item.action,
          };
        });

        setApprovalData(mappedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await getOngoingInvitation(token as string);
        const data = res?.collection ?? [];

        // 🔍 Filter hanya yang belum pra-register
        const filtered = data.filter(
          (item: any) => item.is_praregister_done === false || item.is_praregister_done === null,
        );

        const mapped = filtered.map((item: any) => ({
          id: item.id,
          // visitor_type: visitorTypes[item.visitor_type] || item.visitor_type,
          name: item.visitor.name,
          email: item.visitor.email,
          organization: item.visitor.organization,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: item.visitor_period_end,
          host: item.host_name ?? '-',
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

        // setInvitationDetailVisitor(filtered);
      } catch (error) {
        console.error('Error fetching data:', error);
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

  const handleView = (row: any) => {
    // misalnya row.id berisi ID invitation
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
      // Clone elemen untuk PDF (tidak mempengaruhi UI asli)
      const clone = printRef.current.cloneNode(true) as HTMLElement;

      // Buat logo khusus untuk PDF
      const logoEl = document.createElement('img');
      logoEl.src = '/src/assets/images/logos/bio-experience-1x1-logo.png';
      logoEl.style.width = '100px';
      logoEl.style.height = '100px';
      logoEl.style.display = 'block';
      logoEl.style.margin = '0 auto';
      clone.prepend(logoEl);

      // Sembunyikan semua elemen "no-print" di clone
      clone.querySelectorAll('.no-print').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      // Tambahkan clone ke DOM tapi tersembunyi
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      // Ambil canvas dari clone
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
      setSnackbar({
        open: true,
        message: error?.message || 'Failed to open parking blocker.',
        severity: 'error',
      });
    } finally {
      setTimeout(() => setIsParkingLoading(false), 600);
    }
  };

  const handleActionApproval = async (id: string, action: 'Accept' | 'Deny') => {
    if (!id || !token) return;

    try {
      const confirm = await Swal.fire({
        title: `Do you want to ${action === 'Accept' ? 'Accept' : 'Deny'} this approval?`,
        icon: 'question',
        // imageUrl: BI_LOGO,
        imageWidth: 100,
        imageHeight: 100,
        showCancelButton: true,
        confirmButtonText: action === 'Accept' ? 'Yes' : 'No',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        confirmButtonColor: action === 'Accept' ? '#4caf50' : '#f44336',
        customClass: {
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-text-custom',
        },
      });

      if (!confirm.isConfirmed) return;

      setTimeout(() => setLoading(true), 800);

      await createApproval(token, { action }, id);
      setTimeout(() => {
        showSwal(
          'success',
          `Data Approval ${action === 'Accept' ? 'approved' : 'denied'} successfully.`,
        );
      }, 850);

      setTimeout(() => setLoading(false), 200);

      // setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Approval action error:', error);
      setTimeout(() => setLoading(false), 800);
      showSwal('error', 'Something went wrong while processing approval.');
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

  const [pendingPayload, setPendingPayload] = useState<any>(null);

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

  return (
    <PageContainer title="Dashboard Employee" description="This is Employee Dashboard">
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 9 }}>
          {/* <TopCard items={cards} size={{ xs: 12, lg: 6 }} /> */}
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
              justifyContent: '',
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
                    size={40}
                    style={{
                      height: 'auto',
                      width: '100px',
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
          >
            Invite
          </Button>
        </Grid>

        {/* Tabel */}

        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            height={510}
            isHavePagination={false}
            overflowX="auto"
            data={approvalData}
            isHaveChecked={false}
            isHaveAction={true}
            isActionVisitor={false}
            isHaveHeaderTitle
            titleHeader="Approval"
            isHaveApproval={true}
            onAccept={(row: { id: string }) => handleActionApproval(row.id, 'Accept')}
            onDenied={(row: { id: string }) => handleActionApproval(row.id, 'Deny')}
            isHavePeriod={true}
          />
        </Grid>
        {/* <Grid size={{ xs: 12, lg: 3 }}>
          <DynamicTable
            height={430}
            isHavePagination={false}
            overflowX="auto"
            data={activeInvitation}
            isHaveChecked={false}
            isHavePeriod={true}
            isHaveAction={false}
            isHaveHeaderTitle
            titleHeader="Active Visit"
          />
        </Grid> */}

        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            loading={isFetching}
            height={510}
            overflowX="auto"
            data={shareLinkList}
            titleHeader="Link Share Visitor"
            isHaveHeaderTitle={true}
            isCopyLink={true}
            isHavePagination={true}
            defaultRowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10]}
            onPaginationChange={(page, rowsPerPage) => {
              setPage(page);
              setRowsPerPage(rowsPerPage);
            }}
            isDetailLink={true}
            onCopyLink={(row: any) => handleCopyLink(row.url)}
            onDetailLink={(row: any) => handleDetailLink(row)}
            onDelete={(row: any) => handleDeleteLink(row)}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ height: '100%' }}>
          <DynamicTable
            data={invitationDetailVisitor}
            height={420}
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
        dataVisitor={dataVisitor}
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

            await createShareLink(token as string, finalPayload);
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
      {/* Praregister */}
      <Dialog
        open={openDialogInvitation}
        onClose={() => setOpenDialogInvitation(false)}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle>Praregister</DialogTitle>
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
                setInvitationDetailVisitor([]);
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
