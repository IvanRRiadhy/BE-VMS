import {
  Alert,
  Autocomplete,
  Avatar,
  Backdrop,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid2 as Grid,
  IconButton,
  Portal,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
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
  IconLogin,
  IconLogin2,
  IconLogout,
  IconPlus,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import Heatmap from './Heatmap';
import { createApproval, getApproval } from 'src/customs/api/employee';
import dayjs from 'dayjs';
import {
  getActiveInvitation,
  getInvitation,
  getOngoingInvitation,
  openParkingBlocker,
} from 'src/customs/api/visitor';
import FormDialogInvitation from './FormDialogInvitation';
import { getAccessPass } from 'src/customs/api/admin';
import { Download } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import Swal from 'sweetalert2';
import { showSwal } from 'src/customs/components/alerts/alerts';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
const DashboardEmployee = () => {
  const cards = [
    { title: 'Check In', icon: IconLogin, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Check Out', icon: IconLogout, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Denied', icon: IconCircleOff, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Block', icon: IconBan, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  ];

  const { token } = useSession();

  // ✅ state untuk buka tutup dialog QR
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDetailQRCode, setOpenDetailQRCode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  // QR Scanner state
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [openDialogInvitation, setOpenDialogInvitation] = useState(false);
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [invitationDetailVisitor, setInvitationDetailVisitor] = useState<any[]>([]);
  const [activeInvitation, setActiveInvitation] = useState<any[]>([]);
  const [invitationList, setInvitationList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [alertInvitationData, setAlertInvitationData] = useState<any | null>(null);
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

  const handleOpenInviteOrCreateLink = () => {
    setOpenInviteOrCreateLink(true);
  };

  const handleCloseInviteOrCreateLink = () => {
    setOpenInviteOrCreateLink(false);
  };

  const handleOpenCreateLink = () => {
    setOpenCreateLink(true);
  };

  const handleOpenAccess = () => {
    setOpenAccess(true);
  };

  const handleCloseAccess = () => {
    setOpenAccess(false);
  };

  const handleCloseScanQR = () => {
    try {
      const video = scanContainerRef.current?.querySelector('video') as HTMLVideoElement | null;
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
    setOpenDialogIndex(null);
  };

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

  const dataLink = [
    {
      id: 1,
      name: 'https://www.vms-portal.com/invite/83KAK8209',
      status_link: true,
    },
    {
      id: 2,
      name: 'https://www.vms-portal.com/invite/83KAK8256',
      status_link: false,
    },
    {
      id: 3,
      name: 'https://www.vms-portal.com/invite/83KAK8202',
      status_link: false,
    },
    {
      id: 4,
      name: 'https://www.vms-portal.com/invite/83KAK8201',
      status_link: false,
    },
  ];

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showSwal('success', 'Link copied to clipboard.' + '\n' + link);
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

  return (
    <PageContainer title="Dashboard Employee" description="This is Employee Dashboard">
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <TopCard items={cards} size={{ xs: 12, lg: 6 }} />
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
            height={420}
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
        <Grid size={{ xs: 12, lg: 3 }}>
          <DynamicTable
            height={420}
            isHavePagination={false}
            overflowX="auto"
            data={activeInvitation}
            isHaveChecked={false}
            isHavePeriod={true}
            isHaveAction={false}
            isHaveHeaderTitle
            titleHeader="Active Visit"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <DynamicTable
            data={dataLink}
            titleHeader="Link Share Visitor"
            isHaveHeaderTitle={true}
            isCopyLink={true}
            isDetailLink={true}
            onCopyLink={(row: any) => handleCopyLink(row.name)}
            onDetailLink={(row: any) => handleDetailLink(row)}
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

      {/* Open Create Link */}
      <Dialog
        open={openCreateLink}
        onClose={() => setOpenCreateLink(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create Link Invitation</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenCreateLink(false)}
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
          <Grid container spacing={2} mb={0}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent={'space-between'}
                spacing={1}
              >
                <CustomFormLabel sx={{ marginTop: 0 }}>Visitor Type</CustomFormLabel>
                <FormControlLabel
                  control={<Switch size="small" checked={false} />}
                  label=""
                  labelPlacement="start"
                  sx={{ mt: 2 }}
                />
              </Stack>

              <CustomTextField
                id="guest-id"
                variant="outlined"
                fullWidth
                size="medium"
                sx={{ marginTop: '10px' }}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent={'space-between'}
                spacing={1}
              >
                <CustomFormLabel sx={{ marginTop: 0 }}>Visitor Quantity</CustomFormLabel>
                <FormControlLabel
                  control={<Switch size="small" checked={false} />}
                  label=""
                  labelPlacement="start"
                  sx={{ mt: 2 }}
                />
              </Stack>

              <CustomTextField
                id="guest-id"
                variant="outlined"
                fullWidth
                size="medium"
                sx={{ marginTop: '10px' }}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent={'space-between'}
                spacing={1}
              >
                <CustomFormLabel sx={{ marginTop: 0 }}>Destination</CustomFormLabel>
                <FormControlLabel
                  control={<Switch size="small" checked={false} />}
                  label=""
                  labelPlacement="start"
                  sx={{ mt: 2 }}
                />
              </Stack>

              <CustomTextField
                id="guest-id"
                variant="outlined"
                fullWidth
                size="medium"
                sx={{ marginTop: '10px' }}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent={'space-between'}
                spacing={1}
              >
                <CustomFormLabel sx={{ marginTop: 0 }}>Agenda</CustomFormLabel>
                <FormControlLabel
                  control={<Switch size="small" checked={false} />}
                  label=""
                  labelPlacement="start"
                  sx={{ mt: 2 }}
                />
              </Stack>

              <CustomTextField
                id="guest-id"
                variant="outlined"
                fullWidth
                size="medium"
                sx={{ marginTop: '10px' }}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent={'space-between'}
                spacing={1}
              >
                <CustomFormLabel sx={{ marginTop: 0 }}>Visit Start</CustomFormLabel>
                <FormControlLabel
                  control={<Switch size="small" checked={false} />}
                  label=""
                  labelPlacement="start"
                  sx={{ mt: 2 }}
                />
              </Stack>

              <CustomTextField
                type="date"
                id="guest-id"
                variant="outlined"
                fullWidth
                size="medium"
                sx={{ marginTop: '10px' }}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent={'space-between'}
                spacing={1}
              >
                <CustomFormLabel sx={{ marginTop: 0 }}>Visit End</CustomFormLabel>
                <FormControlLabel
                  control={<Switch size="small" checked={false} />}
                  label=""
                  labelPlacement="start"
                  sx={{ mt: 2 }}
                />
              </Stack>

              <CustomTextField
                type="date"
                id="guest-id"
                variant="outlined"
                fullWidth
                size="medium"
                sx={{ marginTop: '10px' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" fullWidth>
            Create Link
          </Button>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => setOpenSendEmail(true)}
          >
            Create Link And Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Open Detail Link */}
      <Dialog
        open={openDetailLink}
        onClose={() => setOpenDetailLink(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Detail Visitor</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenDetailLink(false)}
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
          <DynamicTable
            data={dataVisitor}
            titleHeader="Visitor"
            isHaveHeaderTitle={true}
            isHaveChecked={true}
          />
        </DialogContent>
      </Dialog>

      {/* Send Email Link */}
      <Dialog open={openSendEmail} onClose={() => setOpenSendEmail(false)} fullWidth maxWidth="md">
        <DialogTitle>Send Invitation Link</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenSendEmail(false)}
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
          <Typography variant="h6" color="primary">
            Send Via Email
          </Typography>
          <Typography mb={2}>
            Please enter a valid email address of the reccipient to send the invitation link via
            email
          </Typography>
          <Autocomplete multiple options={[]} renderInput={(params) => <TextField {...params} />} />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" startIcon={<IconSend />}>
            Send
          </Button>
        </DialogActions>
      </Dialog>

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
        <Dialog open={openAccess} onClose={handleCloseAccess} fullWidth maxWidth="sm">
          <DialogTitle textAlign={'center'} sx={{ p: 2 }}>
            Your Access Pass
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseAccess}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
          <DialogContent
            sx={{
              paddingTop: 2,
              position: 'relative',
            }}
            dividers
            ref={printRef}
          >
            <img
              src="src/assets/images/backgrounds/back-test.jpg"
              alt="background"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: -1,
              }}
            />
            <Box
              display="flex"
              justifyContent="center"
              className="only-print"
              sx={{
                display: 'none',
                '@media print': {
                  display: 'flex',
                },
              }}
            >
              <img
                src="/src/assets/images/logos/BI_Logo.png"
                alt="logo"
                width={100}
                height={100}
                style={{
                  objectFit: 'contain',
                  maxHeight: '100px',
                }}
              />
            </Box>
            <Box mt={1} zIndex={1} position={'relative'}>
              <Grid container spacing={2} justifyContent="center">
                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Invitation Code
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.invitation_code}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }} textAlign="center" position={'relative'}>
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Card
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.card_number || '-'}
                  </Typography>
                </Grid>
                {!isGenerating && (
                  <IconButton
                    color="primary"
                    className="no-print"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      position: 'absolute',
                      right: 20,
                      '&:hover': { backgroundColor: 'primary.dark' },
                      '@media print': {
                        display: 'none !important',
                      },
                    }}
                    onClick={handleDownloadPDF}
                  >
                    <Download />
                  </IconButton>
                )}

                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Host
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.host_name || '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Group Code
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.group_code || '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Period Visit
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatVisitorPeriodLocal(
                      activeAccessPass.visitor_period_start as string,
                      activeAccessPass.visitor_period_end as string,
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box mt={1}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }} textAlign={'center'}>
                {activeAccessPass.site_place_name}
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                mt={0}
                mb={1}
                flexDirection={'column'}
                alignItems={'center'}
              >
                <Box
                  sx={{
                    display: 'inline-block',
                    p: 3,
                    borderRadius: 2,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'white',
                  }}
                  my={2}
                >
                  <QRCode
                    value={activeAccessPass.visitor_number || activeAccessPass.invitation_code}
                    size={180}
                    style={{
                      height: 'auto',
                      width: '180px',
                      borderRadius: 8,
                    }}
                  />
                </Box>
                <Box display="flex" gap={3} mb={2}>
                  <Typography color="error">Tracked</Typography>
                  <Typography color="error">Low Battery</Typography>
                </Box>
                <Typography variant="body2" mb={1}>
                  Show this while visiting
                </Typography>
                <Typography variant="h6">ID : {activeAccessPass.visitor_code}</Typography>
                <Divider sx={{ width: '100%', my: 2, borderColor: 'grey' }} />
                <Typography
                  variant="h5"
                  color="textSecondary"
                  fontWeight={700}
                  mb={1}
                  textAlign={'start'}
                >
                  Parking
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Parking Area
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass?.parking_area || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Parking Slot
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass?.parking_slot || '-'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Vehicle Plate
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass.vehicle_plate_number || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Vehicle Type
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {activeAccessPass.vehicle_type || '-'}
                    </Typography>
                  </Grid>
                </Grid>
                {!isGenerating && (
                  <Button
                    size="small"
                    variant="contained"
                    className="no-print"
                    onClick={handleOpenParkingBlocker}
                    disabled={isParkingLoading}
                    sx={{
                      mt: 2,
                      width: '100%',
                      position: 'relative',
                      '@media print': {
                        display: 'none',
                      },
                    }}
                  >
                    {isParkingLoading ? (
                      <CircularProgress
                        size={22}
                        sx={{
                          color: 'white',
                        }}
                      />
                    ) : (
                      'Open Parking Blocker'
                    )}
                  </Button>
                )}
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
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
