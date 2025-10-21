import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Grid2 as Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  CardActions,
  Avatar,
  Tabs,
  Tab,
  CardHeader,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
} from '@mui/material';
import { Box, useMediaQuery, useTheme } from '@mui/system';
import moment from 'moment-timezone';
import {
  IconArrowsMaximize,
  IconBan,
  IconBrandGmail,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCalendarTime,
  IconCar,
  IconCards,
  IconCheck,
  IconCheckupList,
  IconForbid2,
  IconGenderMale,
  IconHistory,
  IconHome,
  IconLicense,
  IconLogin2,
  IconLogout,
  IconMapPin,
  IconNumbers,
  IconPhone,
  IconQrcode,
  IconSearch,
  IconTicket,
  IconUser,
  IconUserCheck,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import QRCode from 'react-qr-code';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Scanner } from '@yudiel/react-qr-scanner';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import {
  createGrandAccessOperator,
  createInvitationActionOperator,
  getAvailableCardOperator,
  getInvitationCode,
  getInvitationOperatorRelated,
} from 'src/customs/api/operator';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import LprImage from '../../../assets/images/products/picture_lpr.png';
import FRImage from '../../../assets/images/products/picture_fr.png';
import SearchVisitorDialog from './Dialog/SearchVisitorDialog';
import DetailVisitorDialog from './Dialog/DetailVisitorDialog';
import Swal from 'sweetalert2';
const OperatorView = () => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const secdrawerWidth = 320;
  const { token } = useSession();

  // 🔔 Dummy data Alarm dan History
  const alarms = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Alarm #${i + 1}`,
    message: `Beacon ${100 + i} memasuki area terlarang.`,
    time: `2025-10-21 ${10 + i}:00`,
    type: i % 2 === 0 ? 'Critical' : 'Warning',
  }));

  const histories = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Event #${i + 1}`,
    message: `Beacon ${200 + i} keluar dari area ${i % 3 === 0 ? 'A1' : 'B2'}.`,
    time: `2025-10-21 ${8 + i}:15`,
  }));

  const [invitationCode, setInvitationCode] = useState<any[]>([]);

  //
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [permissionAccess, setPermissionAccess] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [openDetailSearching, setOpenDetailSearching] = useState(false);
  const handleOpenScanQR = () => setOpenDialogIndex(1);
  const [visitorStatus, setVisitorStatus] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [openChooseCardDialog, setOpenChooseCardDialog] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [availableCards, setAvailableCards] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [relatedVisitors, setRelatedVisitors] = useState<
    {
      id: string;
      name: string;
      selfie_image: string;
      organization: string;
      visitor_number: string;
      is_driving: boolean;
      agenda: string;
      visitor_period_start: string;
      visitor_period_end: string;
    }[]
  >([]);
  // Tambahkan di atas (bersama useState lain)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const elem = containerRef.current;

    if (!elem) return;

    if (!isFullscreen) {
      // masuk fullscreen
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if ((elem as any).webkitRequestFullscreen) (elem as any).webkitRequestFullscreen();
      else if ((elem as any).msRequestFullscreen) (elem as any).msRequestFullscreen();
      setIsFullscreen(true);
    } else {
      // keluar fullscreen
      if (document.exitFullscreen) document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
      setIsFullscreen(false);
    }
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
  useEffect(() => {}, [token]);

  const resetSelections = () => {
    // setSelectedInvitations([]);
    setSelectedCards([]);
    // setTableKey((k) => k + 1); // ← paksa remount DynamicTable
  };

  const [selectedInvitations, setSelectedInvitations] = useState<any[]>([]);

  const handleCloseChooseCard = () => {
    setOpenChooseCardDialog(false);
    resetSelections();
  };

  const handleChooseCard = () => {
    if (!invitationCode.length) {
      setSnackbarMsg('No visitor data found. Please scan QR first.');
      setSnackbarType('info');
      setSnackbarOpen(true);
      return;
    }

    setSelectedCards([]);
    setOpenChooseCardDialog(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAvailableCardOperator(token as string);
        setAvailableCards(res?.collection ?? []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [token]);

  const filteredCards = availableCards.filter((card) =>
    [card.remarks, card.card_number, card.card_mac]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleToggleCard = (cardNumber: string) => {
    setSelectedCards((prev) => {
      const normalized = String(cardNumber);

      // 🔵 SINGLE MODE → hanya satu yang aktif
      if (prev.includes(normalized)) {
        return [];
      }
      return [normalized];
    });
  };

  const handleSubmitQRCode = async (value: string) => {
    try {
      const res = await getInvitationCode(token as string, value);
      const data = res.collection?.data ?? [];

      if (data.length === 0) {
        setSnackbarMsg('Your code does not exist.');
        setSnackbarType('error');
        setSnackbarOpen(true);
        return;
      }
      const invitation = data[0];
      const invitationId = invitation.id;

      // ✅ Ambil data related visitor
      const relatedRes = await getInvitationOperatorRelated(invitationId, token as string);
      const relatedData = relatedRes.collection ?? [];
      const mappedVisitors = relatedData.map((v: any) => ({
        id: v.id ?? '-',
        name: v.visitor?.name ?? '-',
        selfie_image: v.selfie_image ?? '-',
        visitor_period_start: v.visitor_period_start ?? '-',
        visitor_period_end: v.visitor_period_end ?? '-',
        agenda: v.agenda ?? '-',
        is_driving: v.is_driving ?? '-',
        organization: v.visitor?.organization ?? '-',
        visitor_number: v.visitor_number ?? '-',
      }));
      console.log('mapped visitor : ', mappedVisitors);

      setRelatedVisitors(mappedVisitors);
      setInvitationCode(data);
      handleCloseScanQR();

      setSnackbarMsg('Kode Akses ditemukan.');
      setSnackbarType('success');
      setSnackbarOpen(true);
    } catch (e) {
      console.error('Error fetching invitation code:', e);
      setSnackbarMsg('Your code does not exist.');
      setSnackbarType('error');
      setSnackbarOpen(true);
    }
  };
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return (
      moment
        .utc(dateStr) // data asal UTC
        .tz('Asia/Jakarta') // ubah ke zona waktu Jakarta
        .format('DD MMM YYYY, HH:mm') + ' WIB'
    );
  };

  type Row = {
    id: string;
    visitor?: string;
    card: string | React.ReactNode | null;
    trx_visitor_id?: string | null;
    assigned_card_number?: string | null;
    assigned_card_remarks?: string | null;
  };

  const [rows, setRows] = useState<Row[]>([]);

  const assignedByCard = useMemo(() => {
    const m = new Map<string, string | number>();
    rows.forEach((r: any) => {
      if (r.assigned_card_number) {
        m.set(String(r.assigned_card_number), r.id);
      }
    });
    return m;
  }, [rows]);

  const flatDeep = (x: any): any[] => (Array.isArray(x) ? x.flat(Infinity) : [x]);

  const normalizeIdsDeep = (payload: any): number[] => {
    const flat = flatDeep(payload);
    const ids = flat
      .map((v) => (typeof v === 'object' && v !== null ? Number(v.id) : Number(v)))
      .filter((n) => Number.isFinite(n) && n > 0);
    // dedupe
    return Array.from(new Set(ids));
  };

  const selectedIdSet = useMemo(() => {
    return new Set(normalizeIdsDeep(selectedInvitations).map(String));
  }, [selectedInvitations]);

  const availableVisibleCards = useMemo(() => {
    return filteredCards.filter((c) => {
      const holder = assignedByCard.get(String(c.card_number));
      // singkirkan hanya jika dipegang orang lain
      return !(holder && !selectedIdSet.has(String(holder)));
    });
  }, [filteredCards, assignedByCard, selectedIdSet]);

  const availableCount = availableVisibleCards.length;

  const handleConfirmChooseCards = async () => {
    try {
      if (!selectedCards.length) {
        setSnackbarMsg('Please choose at least one card.');
        setSnackbarType('info');
        setSnackbarOpen(true);
        return;
      }

      // 🔵 SINGLE GRANT
      const trxVisitorId = invitationCode[0]?.id;

      if (!trxVisitorId) {
        setSnackbarMsg('Missing visitor ID.');
        setSnackbarType('error');
        setSnackbarOpen(true);
        return;
      }

      for (const cardNumber of selectedCards) {
        const payload = {
          card_number: String(cardNumber),
          trx_visitor_id: trxVisitorId,
        };
        console.log('🚀 Grant Access Payload:', payload);
        await createGrandAccessOperator(token as string, payload);
      }

      setSnackbarMsg(`Successfully choosed ${selectedCards.length} card(s).`);
      setSnackbarType('success');

      setSnackbarOpen(true);
      setInvitationCode((prev) => {
        if (!prev.length) return prev;
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          card: [
            {
              ...updated[0].card[0],
              card_number: selectedCards[0],
            },
          ],
        };
        return updated;
      });
      handleCloseChooseCard();
    } catch (err) {
      console.error('❌ Grant error:', err);
      setSnackbarMsg('Failed to grant card(s).');
      setSnackbarType('error');
      setSnackbarOpen(true);
    }
  };

  const handleClearAll = () => {
    // Reset input & search
    setQrValue('');
    setSearch('');
    setQrMode('manual');
    setHasDecoded(false);

    // Reset hasil visitor
    setInvitationCode([]);
    setRelatedVisitors([]);

    // Reset dialog & tab
    setOpen(false);
    setOpenDialogIndex(null);
    setOpenDetailSearching(false);
    setTabValue(0);

    // Reset kamera & torch
    setFacingMode('environment');
    setTorchOn(false);

    // Kalau kamu pakai redux:
    // dispatch(resetVisitorState());

    console.log('✅ All data cleared!');
  };

  const confirmCheckIn = async (action: 'Checkin' | 'Checkout' | 'Block' | 'Unblock') => {
    const actionLabelMap: Record<string, string> = {
      Checkin: 'check in',
      Checkout: 'check out',
      Block: 'block this visitor',
      Unblock: 'unblock this visitor',
    };

    let reason = '';

    try {
      // 🔹 Munculkan backdrop dulu
      // setLoadingAccess(true);

      // beri waktu React render backdrop dulu
      // await new Promise((resolve) => setTimeout(resolve, 200));

      // 🔹 Block & Unblock minta alasan
      if (action === 'Block' || action === 'Unblock') {
        const { value: inputReason } = await Swal.fire({
          title: action === 'Block' ? 'Block Visitor' : 'Unblock Visitor',
          text:
            action === 'Block'
              ? 'Please provide a reason for blocking this visitor:'
              : 'Please provide a reason for unblocking this visitor:',
          input: 'text',
          inputPlaceholder: 'Enter reason...',
          inputAttributes: {
            maxlength: '200',
            autocapitalize: 'off',
            autocorrect: 'off',
          },
          showCancelButton: true,
          confirmButtonText: action === 'Block' ? 'Block' : 'Unblock',
          confirmButtonColor: action === 'Block' ? '#000' : '#4caf50',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value || value.trim().length < 3) {
              return 'Reason must be at least 3 characters long.';
            }
            return null;
          },
        });

        if (!inputReason) {
          setLoadingAccess(false);
          return;
        }

        reason = inputReason.trim();
      }

      // 🔹 Aksi lain → konfirmasi biasa
      else {
        const confirm = await Swal.fire({
          title: `Do you want to ${actionLabelMap[action]}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#4caf50',
          customClass: {
            title: 'swal2-title-custom',
            htmlContainer: 'swal2-text-custom',
            popup: 'swal2-dialog-override',
          },
        });

        if (!confirm.isConfirmed) {
          setLoadingAccess(false);
          return;
        }
      }

      setLoadingAccess(true);

      // 🔥 Kirim ke API
      const res = await createInvitationActionOperator(token as string, invitationCode[0].id, {
        action,
        reason,
      });

      console.log('✅ Action Response:', res);
      setVisitorStatus(action);

      setSnackbarMsg(`${action} successfully.`);
      setSnackbarType('success');
      setSnackbarOpen(true);
    } catch (e) {
      console.error('❌ Error createInvitationActionOperator:', e);
      setSnackbarMsg(`Failed to ${action}.`);
      setSnackbarType('error');
      setSnackbarOpen(true);
    } finally {
      setTimeout(() => {
        setLoadingAccess(false);
      }, 800);
    }
  };

  return (
    <PageContainer
      title={!isFullscreen ? 'Operator View' : undefined}
      description={!isFullscreen ? 'Alarm and History Monitor' : undefined}
    >
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          // flexDirection: mdUp ? 'row' : 'column',
          flexDirection: { xs: 'column', md: 'row' },
          backgroundColor: '#fff',
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          // position: 'relative',
        }}
      >
        {/* LEFT SIDEBAR */}
        <Box
          sx={{
            width: { xs: '100%', md: secdrawerWidth },
            minWidth: { md: secdrawerWidth },
            maxWidth: { md: secdrawerWidth },
            flexShrink: 0,
            p: 2,
            borderRight: { md: '1px solid #eee' },
            borderTop: { xs: '1px solid #eee', md: 'none' },
            order: { xs: 2, md: 0 },
            backgroundColor: '#fff',

            // 🧠 perbaikan di sini:
            overflowY: { md: 'auto', xs: 'visible' }, // biar ikut scroll di mobile
            maxHeight: { md: '100%', xs: 'unset' }, // hapus batas tinggi di mobile
          }}
        >
          {/* Section: Alarm */}
          <Typography variant="h6" mb={1}>
            🔔 Alarm
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Box display="flex" flexDirection="column" gap={1}>
            {alarms.map((alarm) => (
              <Card
                key={alarm.id}
                sx={{
                  borderLeft: `4px solid ${alarm.type === 'Critical' ? '#FF3B3B' : '#FFC107'}`,
                  boxShadow: 'none',
                  borderRadius: 2,
                  paddingBottom: 0,
                }}
              >
                <CardContent sx={{ p: 0, pb: '0 !important' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {alarm.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {alarm.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    {alarm.time}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Section: History */}

          <Typography variant="h6" mt={3} mb={1}>
            🕒 History
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Box display="flex" flexDirection="column" gap={1}>
            {histories.map((history) => (
              <Card
                key={history.id}
                sx={{
                  borderLeft: '4px solid #5D87FF',
                  boxShadow: 'none',
                  borderRadius: 2,
                  paddingBottom: 0,
                }}
              >
                <CardContent sx={{ p: 0, pb: '0 !important' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {history.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {history.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    {history.time}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* RIGHT CONTENT */}
        <Box flexGrow={1} p={3} sx={{ overflow: 'auto' }}>
          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid size={{ sm: 6, md: 9 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search Visitor"
                value={''}
                onClick={() => setOpen(true)}
                //   onChange={(e) => setSearch(e.target.value)}
                //   onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        onClick={() => setOpen(true)}
                        edge="start"
                        color="inherit"
                        sx={{}}
                      >
                        <IconSearch size={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ md: 3 }}>
              <Box
                display="flex"
                gap={1}
                alignItems="center"
                flexWrap={'wrap'}
                justifyContent={'flex-start'}
              >
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<IconX size={18} />}
                  onClick={handleClearAll}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.2,
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<IconHistory size={18} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.2,
                  }}
                >
                  History
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<IconQrcode size={18} />}
                  onClick={handleOpenScanQR}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                    background: 'linear-gradient(135deg, #5D87FF 0%, #4169E1 100%)',
                    boxShadow: '0 2px 6px rgba(93, 135, 255, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4169E1 0%, #3657D6 100%)',
                    },
                  }}
                >
                  Scan
                </Button>
                <IconButton
                  onClick={toggleFullscreen}
                  sx={{
                    backgroundColor: '#5D87FF',
                    color: 'white',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    '&:hover': { backgroundColor: '#4B6EE2' },
                  }}
                >
                  <IconArrowsMaximize
                    size={20}
                    style={{
                      transform: isFullscreen ? 'rotate(45deg)' : 'none', // efek visual toggle
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2} alignItems="stretch">
            {/* ✅ Tambahkan alignItems="stretch" */}
            <Grid
              container
              spacing={2}
              size={{ xs: 12, lg: 9 }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch', // ✅ ini juga agar FR & LPR sejajar tinggi
              }}
            >
              {/* 🧩 Card FR */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card
                  sx={{
                    borderRadius: 2,
                    height: '100%', // ✅ ini penting
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '90%',
                    }}
                  >
                    <img src={FRImage} alt="FR" style={{ width: 350, height: 280 }} />
                  </CardContent>
                  <CardActions
                    sx={{
                      justifyContent: 'center',
                      borderTop: '1px solid #eee',
                      py: 1,
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
                      {invitationCode[0]?.visitor?.name ||
                        'No visitor data found. Please scan QR first.'}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>

              {/* 🧩 Card LPR */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card
                  sx={{
                    borderRadius: 2,
                    height: '100%', // ✅ samakan tinggi
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '90%',
                    }}
                  >
                    <img src={LprImage} alt="LPR" />
                  </CardContent>
                  <CardActions
                    sx={{
                      justifyContent: 'center',
                      borderTop: '1px solid #eee',
                      py: 1,
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
                      {invitationCode[0]?.vehicle_plate_number ||
                        'No visitor data found. Please scan QR first.'}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
            {/* 🧩 Card QR Code (kanan) */}
            <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  borderRadius: 2,
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center', // ⬅️ vertikal tengah
                  alignItems: 'center', // ⬅️ horizontal tengah
                  p: 2,
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: 220, // tinggi tetap untuk menjaga layout stabil
                      mb: 2,
                    }}
                  >
                    {invitationCode[0]?.visitor_number ? (
                      <QRCode
                        size={200}
                        value={invitationCode[0].visitor_number}
                        viewBox="0 0 256 256"
                        style={{
                          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'white',
                        }}
                      />
                    ) : (
                      <Box textAlign="center" color="text.secondary">
                        <IconCards size={48} style={{ opacity: 0.4, marginBottom: 8 }} />
                        <Typography variant="body1" fontWeight={500}>
                          No QR Available
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          Scan a visitor to show QR code
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box mt={2}>
                    <Typography variant="h6" fontWeight="bold" mb={1}>
                      Number
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={1}>
                      {invitationCode[0]?.number || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" mb={1}>
                      Invitation Code
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={1}>
                      {invitationCode[0]?.invitation_code || '-'}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                    <Typography variant="h6" fontWeight="bold">
                      Status
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Match
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} mt={3}>
            <Grid
              size={{ xs: 12, lg: 4.5 }}
              sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 1, borderRadius: 2 }}
            >
              <Card sx={{ boxShadow: 'none', p: 1 }}>
                <CardContent sx={{ boxShadow: 'none', p: 0 }}>
                  {/* Tabs */}
                  <Tabs
                    value={tabValue}
                    onChange={(e, newVal) => setTabValue(newVal)}
                    variant="fullWidth"
                  >
                    <Tab label="Info" />
                    <Tab label="Visit Information" />
                    <Tab label="Purpose Visit" />
                  </Tabs>

                  {/* Tab Panels */}
                  {tabValue === 0 && (
                    <Box sx={{ mt: 2 }}>
                      {/* Grid Info Visitor */}
                      <Grid container rowSpacing={4} columnSpacing={2} mt={1}>
                        {/* Email */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconBrandGmail />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Email</CustomFormLabel>
                              <Typography
                                sx={{
                                  wordBreak: 'break-word',
                                  overflowWrap: 'anywhere',
                                  whiteSpace: 'normal',
                                }}
                              >
                                {invitationCode[0]?.visitor?.email || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Phone */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconPhone />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Phone</CustomFormLabel>
                              <Typography
                                sx={{
                                  wordBreak: 'break-word',
                                  overflowWrap: 'anywhere',
                                  whiteSpace: 'normal',
                                }}
                              >
                                {invitationCode[0]?.visitor?.phone || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Address */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconHome />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Address</CustomFormLabel>
                              <Typography
                                sx={{
                                  wordBreak: 'break-word',
                                  overflowWrap: 'anywhere',
                                  whiteSpace: 'normal',
                                }}
                              >
                                {invitationCode[0]?.visitor?.address || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Gender */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconGenderMale />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Gender</CustomFormLabel>
                              <Typography>{invitationCode[0]?.visitor?.gender || '-'}</Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Organization */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconBuildingSkyscraper />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                                Organization
                              </CustomFormLabel>
                              <Typography
                                sx={{
                                  wordBreak: 'break-word',
                                  overflowWrap: 'anywhere',
                                  whiteSpace: 'normal',
                                }}
                              >
                                {invitationCode[0]?.visitor?.organization || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Card */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box
                            display={'flex'}
                            justifyContent={'space-between'}
                            flexWrap={'wrap'}
                            alignItems={'center'}
                          >
                            <Box display="flex" gap={2} alignItems="flex-start" flexWrap={'wrap'}>
                              <IconCards />
                              <Box>
                                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Card </CustomFormLabel>
                              </Box>
                            </Box>
                            <Box>
                              {!invitationCode[0]?.card || invitationCode[0]?.card.length === 0 ? (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={handleChooseCard}
                                  sx={{ mt: 0.5 }}
                                >
                                  Choose Card
                                </Button>
                              ) : (
                                <Typography>{invitationCode[0]?.card[0]?.card_number}</Typography>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {tabValue === 1 && (
                    <Box sx={{ mt: 2 }}>
                      <Grid container rowSpacing={4} columnSpacing={2}>
                        {/* Group Code */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconUsersGroup />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Group Code</CustomFormLabel>
                              <Typography>{invitationCode[0]?.group_code || '-'}</Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Group Name */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconUser />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Group Name</CustomFormLabel>
                              <Typography>{invitationCode[0]?.group_name || '-'}</Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Visitor Number */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconNumbers />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                                Visitor Number
                              </CustomFormLabel>
                              <Typography>{invitationCode[0]?.visitor_number || '-'}</Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Invitation Code */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconTicket />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                                Invitation Code
                              </CustomFormLabel>
                              <Typography>{invitationCode[0]?.invitation_code || '-'}</Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Visitor Status */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconCheckupList />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                                Visitor Status
                              </CustomFormLabel>
                              <Typography>{invitationCode[0]?.visitor_status || '-'}</Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Vehicle Type */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconCar />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                                Vehicle Type
                              </CustomFormLabel>
                              <Typography>{invitationCode[0]?.vehicle_type || '-'}</Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Vehicle Plate No. */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconLicense />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                                Vehicle Plate No.
                              </CustomFormLabel>
                              <Typography>
                                {invitationCode[0]?.vehicle_plate_number || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {tabValue === 2 && (
                    <Box sx={{ mt: 2 }}>
                      <Grid container rowSpacing={4} columnSpacing={2}>
                        {/* Agenda */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconCalendarEvent />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0 }}>Agenda</CustomFormLabel>
                              <Typography>{invitationCode[0]?.agenda || '-'}</Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* PIC Host */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconUserCheck />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0 }}>PIC Host</CustomFormLabel>
                              <Typography>{invitationCode[0]?.host_name || '-'}</Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Period Start */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconCalendarTime />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0 }}>Period Start</CustomFormLabel>
                              {formatDateTime(invitationCode[0]?.visitor_period_start) ?? '-'}
                            </Box>
                          </Box>
                        </Grid>

                        {/* Period End */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconCalendarEvent />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0 }}>Period End</CustomFormLabel>
                              <Typography>
                                {formatDateTime(invitationCode[0]?.visitor_period_end) ?? '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Registered Site */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconMapPin />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0 }}>
                                Registered Site
                              </CustomFormLabel>
                              <Typography>{invitationCode[0]?.site_place_name || '-'}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
                {invitationCode.length > 0 && invitationCode[0]?.visitor_number && (
                  <CardActions sx={{ justifyContent: 'center', mt: 2 }}>
                    {(() => {
                      const status = visitorStatus ?? invitationCode[0]?.visitor_status;

                      if (!['Checkin', 'Checkout', 'Block', 'Unblock'].includes(status)) {
                        return (
                          <>
                            <Button
                              variant="contained"
                              color="inherit"
                              onClick={() => confirmCheckIn('Checkin')}
                              startIcon={<IconCheck />}
                            >
                              Completed
                            </Button>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => confirmCheckIn('Checkin')}
                              startIcon={<IconLogin2 />}
                            >
                              Check In
                            </Button>
                            <Button
                              variant="contained"
                              sx={{ backgroundColor: '#000' }}
                              onClick={() => confirmCheckIn('Block')}
                              startIcon={<IconForbid2 />}
                            >
                              Block
                            </Button>
                          </>
                        );
                      }

                      if (status === 'Checkin') {
                        return (
                          <Box display="flex" gap={1}>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => confirmCheckIn('Checkout')}
                              startIcon={<IconLogout />}
                            >
                              Check Out
                            </Button>
                            <Button
                              variant="contained"
                              sx={{ backgroundColor: '#000' }}
                              onClick={() => confirmCheckIn('Block')}
                              startIcon={<IconForbid2 />}
                            >
                              Block
                            </Button>
                          </Box>
                        );
                      }

                      if (status === 'Checkout') {
                        return (
                          <Box display="flex" gap={1}>
                            <Button
                              variant="contained"
                              sx={{ backgroundColor: '#000' }}
                              onClick={() => confirmCheckIn('Block')}
                              startIcon={<IconForbid2 />}
                            >
                              Block
                            </Button>
                          </Box>
                        );
                      }

                      if (status === 'Block') {
                        return (
                          <Button
                            variant="contained"
                            sx={{
                              backgroundColor: '#f44336',
                              '&:hover': { backgroundColor: '#d32f2f' },
                            }}
                            onClick={() => confirmCheckIn('Unblock')}
                            startIcon={<IconBan />}
                          >
                            Unblock
                          </Button>
                        );
                      }

                      if (status === 'Unblock') {
                        return (
                          <Button
                            variant="contained"
                            sx={{ backgroundColor: '#000' }}
                            onClick={() => confirmCheckIn('Block')}
                            startIcon={<IconForbid2 />}
                          >
                            Block
                          </Button>
                        );
                      }

                      return null;
                    })()}
                  </CardActions>
                )}
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 4.5 }}>
              <Box>
                <Card sx={{ maxHeight: '100%', height: '400px', overflow: 'auto' }}>
                  <CardHeader title="Related Visitors" style={{ p: '0 !important' }} />
                  <CardContent sx={{ p: 0, pb: '0 !important' }}>
                    {relatedVisitors.map((visitor, index) => {
                      const isDriving = visitor.is_driving === true;
                      const isScanned =
                        visitor.visitor_number &&
                        invitationCode[0]?.visitor_number &&
                        visitor.visitor_number === invitationCode[0]?.visitor_number;

                      return (
                        <React.Fragment key={visitor.id || index}>
                          <ListItem
                            sx={{
                              px: 1,
                              py: 1.5,
                              borderBottom:
                                index !== relatedVisitors.length - 1 ? '1px solid #eee' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            {/* Kiri: Avatar + Info */}
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                // src={`${axiosInstance2}/cdn` + visitor.selfie_image}
                                src={`http://192.168.1.116:8000/cdn` + visitor.selfie_image}
                                alt={visitor.name}
                                sx={{ width: 45, height: 45 }}
                              />
                              <Box>
                                <Typography variant="h6" fontWeight="bold">
                                  {visitor.name || '-'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                  {visitor.organization || '-'}
                                </Typography>
                              </Box>
                            </Box>

                            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                              <Box display="flex" gap={1} flexDirection={'column'}>
                                {isDriving && (
                                  <Box
                                    sx={{
                                      backgroundColor: '#4CAF50',
                                      color: 'white',
                                      fontWeight: 600,
                                      borderRadius: '6px',
                                      px: 1,
                                      py: 0.25,
                                      fontSize: '0.75rem',
                                      minWidth: 20,
                                      textAlign: 'center',
                                    }}
                                  >
                                    P
                                  </Box>
                                )}

                                {isScanned && (
                                  <Box
                                    sx={{
                                      backgroundColor: '#1976D2', // biru
                                      color: 'white',
                                      fontWeight: 600,
                                      borderRadius: '6px',
                                      px: 1,
                                      py: 0.25,
                                      fontSize: '0.75rem',
                                      minWidth: 20,
                                      textAlign: 'center',
                                    }}
                                  >
                                    S
                                  </Box>
                                )}
                              </Box>
                              <Checkbox />
                            </Box>
                          </ListItem>

                          {/* Info tambahan bawah tiap visitor */}
                          <ListItemText
                            disableTypography
                            sx={{
                              pl: 9,
                              pb: 1.5,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                            primary={
                              <>
                                <Typography variant="body1" fontWeight="medium">
                                  {visitor.agenda || '-'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {`${formatDateTime(
                                    visitor.visitor_period_start,
                                  )} - ${formatDateTime(visitor.visitor_period_end)}`}
                                </Typography>
                              </>
                            }
                          />
                        </React.Fragment>
                      );
                    })}
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, lg: 3 }} sx={{ height: '100%' }}>
              <Grid container direction="column" spacing={2} sx={{ height: '100%', flexGrow: 1 }}>
                {/* Card Atas - Visitor Name */}
                <Grid sx={{ flex: 1, display: 'flex' }}>
                  <Card
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '190px',
                      maxHeight: '100%',
                    }}
                  >
                    <CardContent sx={{ flex: 1, p: 0, overflowY: 'auto', overflowX: 'hidden' }}>
                      <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Faceimage</CustomFormLabel>
                      {invitationCode[0]?.selfie_image ? (
                        <img
                          src={`http://192.168.1.116:8000/cdn${invitationCode[0].selfie_image}`}
                          alt="Faceimage"
                          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                      ) : null}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid sx={{ flex: 1, display: 'flex' }}>
                  <Card
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '190px',
                      maxHeight: '100%',
                    }}
                  >
                    <CardContent sx={{ flex: 1, p: 0, overflowY: 'auto', overflowX: 'hidden' }}>
                      <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>KTP</CustomFormLabel>
                      {invitationCode[0]?.identity_image ? (
                        <img
                          src={`http://192.168.1.116:8000/cdn${invitationCode[0].identity_image}`}
                          alt="Faceimage"
                          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                      ) : null}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Detail Searching */}
      <DetailVisitorDialog
        open={openDetailSearching}
        onClose={() => setOpenDetailSearching(false)}
        visitorData={invitationCode}
      />

      {/* Search Visitor */}
      <SearchVisitorDialog
        open={open}
        onClose={() => setOpen(false)}
        onSearch={() => setOpenDetailSearching(true)}
      />

      {/* Scan QR Visitor */}
      <Dialog fullWidth maxWidth="sm" open={openDialogIndex === 1} onClose={handleCloseScanQR}>
        <DialogTitle display="flex">
          Scan QR Visitor
          <IconButton
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={handleCloseScanQR}
          >
            <IconX />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent>
          {/* Toggle mode */}
          <Box display="flex" gap={1} mb={2}>
            <Button
              variant={qrMode === 'manual' ? 'contained' : 'outlined'}
              onClick={() => setQrMode('manual')}
              size="small"
            >
              Manual
            </Button>
            <Button
              variant={qrMode === 'scan' ? 'contained' : 'outlined'}
              onClick={() => {
                setHasDecoded(false);
                setQrMode('scan');
              }}
              size="small"
            >
              Scan Kamera
            </Button>
          </Box>

          {/* MODE: MANUAL */}
          {qrMode === 'manual' && (
            <>
              <TextField
                fullWidth
                label=""
                variant="outlined"
                placeholder="Enter your code"
                size="small"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
              />
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      try {
                        setIsSubmitting(true);
                        await handleSubmitQRCode(qrValue);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={!qrValue || isSubmitting} // 🔒 disable kalau kosong atau sedang loading
                    startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
                  >
                    {isSubmitting ? 'Submit...' : 'Submit'}
                  </Button>
                </Box>
              </Box>
            </>
          )}

          {/* MODE: SCAN */}
          {qrMode === 'scan' && (
            <>
              <Box
                ref={scanContainerRef}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'black',
                  aspectRatio: '3 / 4', // proporsional untuk mobile
                }}
              >
                <Scanner
                  key={scannerKey}
                  constraints={{ facingMode }}
                  onScan={async (result: any) => {
                    if (!result) return;
                    if (hasDecoded) return;

                    console.log('📸 QR scan raw result:', result);
                    setHasDecoded(true);

                    let value = '';
                    if (typeof result === 'string') value = result;
                    else if (Array.isArray(result)) value = result[0]?.rawValue || '';
                    else if (typeof result === 'object')
                      value = result.rawValue || JSON.stringify(result);

                    console.log('✅ Extracted QR value:', value);
                    setQrValue(value);

                    try {
                      setIsSubmitting(true);
                      await handleSubmitQRCode(value); // ✅ panggil langsung
                      // setOpenDetailQRCode(true); // tampilkan hasil di dialog
                      setOpenDialogIndex(null);
                    } catch (err) {
                      console.error('❌ Error saat submit QR:', err);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  onError={(error: any) => {
                    console.error('❌ QR Scanner error:', error?.message || error);
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      border: 'none !important',
                    },
                  }}
                />
                <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <Box
                    sx={{
                      // ukuran kotak scan (responsif)
                      '--scanSize': { xs: '70vw', sm: '370px' },

                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 'var(--scanSize)',
                      height: 'var(--scanSize)',
                      transform: 'translate(-50%, -50%)',

                      // ini yang bikin area luar gelap, tengah tetap terang
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                      borderRadius: 2, // 0 jika mau siku
                      outline: '2px solid rgba(255,255,255,0.18)',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        '& .corner': {
                          position: 'absolute',
                          width: 50,
                          height: 50,
                          border: '3px solid #00e5ff',
                        },
                        '& .tl': { top: 0, left: 0, borderRight: 'none', borderBottom: 'none' },
                        '& .tr': { top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' },
                        '& .bl': { bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' },
                        '& .br': { bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' },
                      }}
                    >
                      <Box className="corner tl" />
                      <Box className="corner tr" />
                      <Box className="corner bl" />
                      <Box className="corner br" />
                    </Box>

                    {/* Laser animasi (bergerak di dalam kotak) */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 10,
                        right: 10,
                        height: 2,
                        top: 0,
                        background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
                        animation: 'scanLine 2s linear infinite',
                        '@keyframes scanLine': {
                          '0%': { transform: 'translateY(0)' },
                          '100%': { transform: 'translateY(calc(var(--scanSize) - 2px))' },
                        },
                      }}
                    />
                  </Box>
                </Box>
                {/* Kontrol: Flip & Torch */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 8,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Button
                    onClick={() =>
                      setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'))
                    }
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.6)' }}
                    startIcon={<FlipCameraAndroidIcon fontSize="small" />}
                  >
                    Flip
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        const video = scanContainerRef.current?.querySelector(
                          'video',
                        ) as HTMLVideoElement | null;
                        const stream = video?.srcObject as MediaStream | null;
                        const track = stream?.getVideoTracks()?.[0];
                        const caps = track?.getCapabilities?.() as any;
                        if (track && caps?.torch) {
                          await track.applyConstraints({
                            advanced: [{ torch: !torchOn }] as any,
                          });
                          setTorchOn((t) => !t);
                        } else {
                          console.log('Torch not supported on this device.');
                        }
                      } catch (e) {
                        console.log('Torch toggle error:', e);
                      }
                    }}
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.6)' }}
                    startIcon={
                      torchOn ? <FlashOnIcon fontSize="small" /> : <FlashOffIcon fontSize="small" />
                    }
                  >
                    Torch
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Choose Card */}
      <Dialog
        open={openChooseCardDialog}
        onClose={() => setOpenChooseCardDialog(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Choose Card</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenChooseCardDialog(false)}
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
          {/* Search */}
          <Box mb={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search card"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Grid list of cards */}
          <Grid container spacing={2}>
            {filteredCards.map((card) => {
              const isChosen = selectedCards.includes(card.card_number);

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.id}>
                  <Paper
                    onClick={() => handleToggleCard(card.card_number)}
                    sx={(theme) => ({
                      p: 2,
                      borderRadius: 2,
                      position: 'relative',
                      height: 280,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isChosen ? theme.palette.primary.main : 'divider',
                      boxShadow: isChosen ? theme.shadows[8] : theme.shadows[2],
                      backgroundColor: isChosen ? theme.palette.primary.light : 'background.paper',
                      transition: theme.transitions.create(
                        ['transform', 'box-shadow', 'border-color', 'background-color'],
                        {
                          duration: theme.transitions.duration.shorter,
                        },
                      ),
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: theme.shadows[6],
                      },
                    })}
                  >
                    {/* Konten kartu */}
                    <Box
                      flexGrow={1}
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography variant="body1" fontWeight={600}>
                        {card.card_number}
                      </Typography>
                      <Typography variant="h1" color="text.secondary">
                        {card.remarks || '-'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {card.card_mac || '-'}
                      </Typography>
                    </Box>

                    <Typography variant="body1">{card.name}</Typography>

                    {/* Checkbox */}
                    <FormControlLabel
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      control={
                        <Checkbox
                          checked={isChosen}
                          onChange={() => handleToggleCard(card.card_number)}
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Footer */}
          <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" flexDirection="column" gap={0.5}>
              {/* <Typography variant="body2">
                        Selected Card: {selectedCards.length > 0 ? selectedCards[0] : '-'}
                      </Typography> */}
              <Typography variant="body2">
                Cards chosen: {selectedCards.length} / {availableCount}
              </Typography>
            </Box>

            <Box display="flex" gap={1}>
              <Button onClick={handleCloseChooseCard} color="secondary">
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={selectedCards.length === 0}
                onClick={handleConfirmChooseCards}
              >
                Choose
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default OperatorView;
