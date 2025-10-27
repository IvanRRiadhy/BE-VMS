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
  Snackbar,
  Portal,
  Alert,
  Backdrop,
  MenuItem,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Stepper,
  Step,
  StepLabel,
  TableContainer,
  TableHead,
  DialogActions,
  AlertColor,
  FormGroup,
  Autocomplete,
  FormControl,
  RadioGroup,
  Radio,
} from '@mui/material';
import { Box, useMediaQuery, useTheme, width } from '@mui/system';
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
  IconTrash,
  IconUser,
  IconUserCheck,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import QRCode from 'react-qr-code';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Scanner } from '@yudiel/react-qr-scanner';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import {
  createGiveAccessOperator,
  createGrandAccessOperator,
  createInvitationActionOperator,
  createMultipleInvitationActionOperator,
  createSubmitCompletePraMultiple,
  getAvailableCardOperator,
  getInvitationCode,
  getInvitationOperatorRelated,
  getPermissionOperator,
} from 'src/customs/api/operator';
import { BASE_URL, axiosInstance2 } from 'src/customs/api/interceptor';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import LprImage from '../../../assets/images/products/pic_lpr.png';
import FRImage from '../../../assets/images/products/pic_fr.png';
import SearchVisitorDialog from './Dialog/SearchVisitorDialog';
import DetailVisitorDialog from './Dialog/DetailVisitorDialog';
import Swal from 'sweetalert2';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { Check } from '@mui/icons-material';
import { getDetailInvitationForm } from 'src/customs/api/visitor';
import { FormVisitor, SectionPageVisitor } from 'src/customs/api/models/Admin/Visitor';
// import CameraUpload from 'src/customs/components/camera/CameraUpload';
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers';
import dayjs, { Dayjs, tz } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import HistoryDialog from './Dialog/HistoryDialog';
import { getVisitorEmployee } from 'src/customs/api/admin';
import Webcam from 'react-webcam';
import FormDialogInvitation from '../Employee/FormDialogInvitation';
import FormDialogPraregist from './Dialog/FormDialogPraregist';
import CameraUpload from './Components/CameraUpload';
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.locale('id');
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
  const [selectedVisitorNumber, setSelectedVisitorNumber] = useState<string | null>(null);
  const [scannedVisitorNumber, setScannedVisitorNumber] = useState<string | null>(null);
  const [selectMultiple, setSelectMultiple] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVisitors, setSelectedVisitors] = useState<string[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState('');
  const [removing, setRemoving] = React.useState<Record<string, boolean>>({});
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = React.useState(0);
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [uploadMethods, setUploadMethods] = useState<Record<string, 'file' | 'camera'>>({});
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [openAccessData, setOpenAccessData] = useState(false);
  const [accessData, setAccessData] = useState<any[]>([]);
  const [selectedActionAccess, setSelectedActionAccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getVisitorEmployee(token as string);
      setAllVisitorEmployee(res?.collection ?? []);
    };
    fetchData();
  }, [token]);

  const [relatedVisitors, setRelatedVisitors] = useState<
    {
      id: string;
      name: string;
      selfie_image: string;
      identity_image: string;
      organization: string;
      visitor_number: string;
      is_driving: boolean;
      agenda: string;
      visitor_period_start: string;
      visitor_period_end: string;
      email: string;
      is_praregister_done: boolean;
      phone: string;
      gender: string;
      card: string[];
      visitor_status: string;
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

  const uploadFileToCDN = async (file: File | Blob): Promise<string | null> => {
    const formData = new FormData();

    const filename = file instanceof File && file.name ? file.name : 'selfie.png';
    formData.append('file_name', filename);
    formData.append('file', file, filename);
    formData.append('path', 'visitor');

    try {
      const response = await axiosInstance2.post('/cdn/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = response.data?.collection?.file_url;
      console.log('CDN Response File URL:', fileUrl);

      if (!fileUrl) return null;

      // Tambahkan protokol jika belum ada
      return fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const handleFileChangeForField = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setAnswerFile: (url: string) => void,
    trackKey?: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // tampilkan preview lokal dulu (supaya user melihat langsung)
    if (trackKey) {
      setUploadNames((prev) => ({ ...prev, [trackKey]: file.name }));
      setPreviews((prev) => ({ ...prev, [trackKey]: URL.createObjectURL(file) }));
    }

    const path = await uploadFileToCDN(file);
    if (path) setAnswerFile(path);
    // reset input agar bisa pilih file yg sama lagi
    e.target.value = '';
  };

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

  // useEffect(() => {
  //   // Pastikan socket hanya dibuat sekali
  //   const socket = new WebSocket('ws://localhost:16574/ws');

  //   socket.onopen = () => {
  //     console.log('✅ WebSocket connected');
  //   };

  //   socket.onerror = (err) => {
  //     console.error('❌ WebSocket error:', err);
  //   };

  //   socket.onmessage = (event) => {
  //     try {
  //       // Parse JSON
  //       const msg = JSON.parse(event.data);
  //       console.log('💬 Console client:', msg);

  //       // Cek tipe data dari server
  //       if (msg?.type === 'serial' && msg?.message) {
  //         const value = msg.message.toString().trim();
  //         console.log('📩 QR Value from socket:', value);

  //         // 🔥 Update ke state qrValue
  //         setQrValue(value);
  //         setLoadingAccess(true);
  //         // 🔥 Panggil handler QR langsung
  //         handleSubmitQRCode(value);

  //         // 🔥 Langsung buka detail QR dialog
  //         // setOpenDetailQRCode(true);
  //       }
  //     } catch (err) {
  //       console.error('⚠️ Failed to parse WebSocket message:', event.data, err);
  //     } finally {
  //       setTimeout(() => setLoadingAccess(false), 600);
  //     }
  //   };

  //   socket.onclose = () => {
  //     console.warn('🔌 WebSocket disconnected');
  //   };

  //   // cleanup saat komponen unmount
  //   return () => {
  //     socket.close();
  //   };
  // }, [token]);
  useEffect(() => {
    const fetchDataPermission = async () => {
      try {
        const res = await getPermissionOperator(token as string);
        setPermissionAccess(res?.collection ?? []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDataPermission();
  }, [token]);

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

      await fetchRelatedVisitorsByInvitationId(invitationId);
      setInvitationCode(data);
      setVisitorStatus(data[0]?.visitor_status ?? null);
      setSelectedVisitorNumber(data[0]?.visitor_number ?? null);
      setScannedVisitorNumber(data[0]?.visitor_number ?? null);
      const accessList = Array.isArray(invitation.access) ? invitation.access : [invitation.access];

      const filteredAccess = accessList.filter((a: any) =>
        permissionAccess.some((p: any) => p.access_control_id === a.access_control_id),
      );

      const mergedAccess = filteredAccess.map((a: any) => {
        const perm = permissionAccess.find((p: any) => p.access_control_id === a.access_control_id);
        return {
          // ...a,
          id: a.id,
          name: a.access_control_name ?? '-',
          access_control_id: a.access_control_id,
          early_access: a.early_access,
          visitor_give_access: a.visitor_give_access,
          can_grant: perm?.can_grant ?? false,
          can_revoke: perm?.can_revoke ?? false,
          can_block: perm?.can_block ?? false,
        };
      });

      console.log('🧩 mergedAccess:', mergedAccess);
      setAccessData(mergedAccess);
      handleCloseScanQR();

      setSnackbarMsg('Code scanned successfully.');
      setSnackbarType('success');
      setSnackbarOpen(true);
    } catch (e) {
      console.error('Error fetching invitation code:', e);
      setSnackbarMsg('Your code does not exist.');
      setSnackbarType('error');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    if (!relatedVisitors.length) return;

    // Pastikan hanya ID yang masih ada di data baru yang tetap dipilih
    setSelectedVisitors((prevSelected) =>
      prevSelected.filter((id) => relatedVisitors.some((v) => v.id === id)),
    );
  }, [relatedVisitors]);

  const fetchRelatedVisitorsByInvitationId = async (invitationId: string) => {
    const relatedRes = await getInvitationOperatorRelated(invitationId, token as string);
    const relatedData = relatedRes.collection ?? [];

    const mappedVisitors = relatedData.map((v: any) => ({
      id: v.id ?? '-',
      name: v.visitor?.name ?? '-',
      selfie_image: v.selfie_image ?? '-',
      identity_image: v.identity_image ?? '-',
      visitor_period_start: v.visitor_period_start ?? '-',
      visitor_period_end: v.visitor_period_end ?? '-',
      agenda: v.agenda ?? '-',
      is_driving: v.is_driving ?? '-',
      organization: v.visitor?.organization ?? '-',
      visitor_number: v.visitor_number ?? '-',
      email: v.visitor?.email ?? '-',
      phone: v.visitor?.phone ?? '-',
      gender: v.visitor?.gender ?? '-',
      address: v.visitor?.address ?? '-',
      visitor_status: v.visitor_status ?? '-',
      // card: (v.card ?? []).map((c: any) => c.card_number),
      card: v.card ?? [],
      is_praregister_done: v.is_praregister_done ?? false,
    }));

    setRelatedVisitors(mappedVisitors);
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

  // const handleConfirmChooseCards = async () => {
  //   try {
  //     if (!selectedCards.length) {
  //       setSnackbarMsg('Please choose at least one card.');
  //       setSnackbarType('info');
  //       setSnackbarOpen(true);
  //       return;
  //     }

  //     const trxVisitorId = selectedVisitorId;

  //     if (!trxVisitorId) {
  //       setSnackbarMsg('Missing visitor ID.');
  //       setSnackbarType('error');
  //       setSnackbarOpen(true);
  //       return;
  //     }

  //     // 🟢 Aktifkan loading sebelum proses dimulai
  //     setLoadingAccess(true);

  //     // 🔥 Kirim semua kartu ke API
  //     for (const cardNumber of selectedCards) {
  //       const payload = {
  //         card_number: String(cardNumber),
  //         trx_visitor_id: trxVisitorId,
  //       };
  //       console.log('🚀 Grant Access Payload:', payload);
  //       await createGrandAccessOperator(token as string, payload);
  //     }

  //     setSnackbarMsg(`Successfully assigned ${selectedCards.length} card(s).`);
  //     setSnackbarType('success');
  //     setSnackbarOpen(true);

  //     // 🟢 Refetch data visitor agar sinkron
  //     // await fetchRelatedVisitorsByInvitationId(invitationCode[0]?.invitation_id);

  //     // setRelatedVisitors((prev) => {
  //     //   const currentVisitor = prev.find((v) => v.id === trxVisitorId);
  //     //   if (currentVisitor) {
  //     //     setInvitationCode((prevCode) => {
  //     //       if (!prevCode.length) return prevCode;
  //     //       const updated = [...prevCode];
  //     //       updated[0] = {
  //     //         ...updated[0],
  //     //         card: currentVisitor.card ?? [],
  //     //       };
  //     //       return updated;
  //     //     });
  //     //   }
  //     //   return prev;
  //     // });

  //     // Optional: juga refresh invitation detail kalau UI di kanan perlu update kartu
  //     // const updatedDetail = await getInvitationDetail(invitationCode[0]?.id, token);
  //     // setInvitationCode([updatedDetail.collection]);

  //     handleCloseChooseCard();
  //   } catch (err) {
  //     console.error('❌ Grant error:', err);
  //     setSnackbarMsg('Failed to assign card(s).');
  //     setSnackbarType('error');
  //     setSnackbarOpen(true);
  //   } finally {
  //     // 🔴 Pastikan loading dimatikan setelah proses selesai (sukses/gagal)
  //     setTimeout(() => setLoadingAccess(false), 500);
  //   }
  // };

  const handleConfirmChooseCards = async () => {
    try {
      if (!selectedCards.length) {
        setSnackbarMsg('Please choose at least one card.');
        setSnackbarType('info');
        setSnackbarOpen(true);
        return;
      }

      const trxVisitorId = selectedVisitorId;

      if (!trxVisitorId) {
        setSnackbarMsg('Missing visitor ID.');
        setSnackbarType('error');
        setSnackbarOpen(true);
        return;
      }

      // 🟢 Aktifkan loading
      setLoadingAccess(true);

      // 🔥 Kirim semua kartu ke API
      for (const cardNumber of selectedCards) {
        const payload = {
          card_number: String(cardNumber),
          trx_visitor_id: trxVisitorId,
        };
        console.log('🚀 Grant Access Payload:', payload);
        await createGrandAccessOperator(token as string, payload);
      }

      // ✅ Tampilkan feedback sukses
      setSnackbarMsg(`Successfully assigned ${selectedCards.length} card(s).`);
      setSnackbarType('success');
      setSnackbarOpen(true);

      // 🟩 1️⃣ Update data lokal supaya UI langsung berubah (instan UX)
      setRelatedVisitors((prev) =>
        prev.map((v) =>
          v.id === trxVisitorId
            ? {
                ...v,
                card: selectedCards, // ⬅️ langsung array of card_number
              }
            : v,
        ),
      );

      // 🟦 2️⃣ Update juga invitationCode agar panel kanan ikut berubah
      setInvitationCode((prev) => {
        if (!prev.length) return prev;
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          card: selectedCards.map((c) => ({ card_number: c })),
        };
        return updated;
      });

      // 🟨 3️⃣ Refetch dari server agar 100% sinkron dengan data real
      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        console.log('🔄 Refetching visitors after card assignment:', invitationId);
        await fetchRelatedVisitorsByInvitationId(invitationId);
      }

      // ✅ Tutup dialog choose card
      handleCloseChooseCard();
    } catch (err) {
      console.error('❌ Grant error:', err);
      setSnackbarMsg('Failed to assign card(s).');
      setSnackbarType('error');
      setSnackbarOpen(true);
    } finally {
      // 🔴 Matikan loading dengan jeda halus
      setTimeout(() => setLoadingAccess(false), 500);
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

  const handleConfirmStatus = async (action: 'Checkin' | 'Checkout' | 'Block' | 'Unblock') => {
    const actionLabelMap: Record<string, string> = {
      Checkin: 'check in',
      Checkout: 'check out',
      Block: 'block this visitor',
      Unblock: 'unblock this visitor',
    };

    let reason = '';

    try {
      // 🔹 Ask reason for Block/Unblock
      if (action === 'Block' || action === 'Unblock') {
        const { value: inputReason } = await Swal.fire({
          title: action === 'Block' ? 'Block Visitor' : 'Unblock Visitor',
          text:
            action === 'Block'
              ? 'Please provide a reason for blocking this visitor:'
              : 'Please provide a reason for unblocking this visitor:',
          input: 'text',
          inputPlaceholder: 'Enter reason...',
          inputAttributes: { maxlength: '200' },
          showCancelButton: true,
          confirmButtonText: action,
          confirmButtonColor: action === 'Block' ? '#000' : '#4caf50',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value || value.trim().length < 3) {
              return 'Reason must be at least 3 characters long.';
            }
            return null;
          },
        });

        if (!inputReason) return;
        reason = inputReason.trim();
      } else {
        // 🔹 Normal confirm dialog
        const confirm = await Swal.fire({
          title: `Do you want to ${actionLabelMap[action]}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#4caf50',
        });

        if (!confirm.isConfirmed) return;
      }

      setLoadingAccess(true);

      // 🔥 API call
      const res = await createInvitationActionOperator(token as string, selectedVisitorId!, {
        action,
        reason,
      });

      console.log('✅ Action Response:', res);

      // 🔹 Update local data immediately (for instant UI)
      setRelatedVisitors((prev) =>
        prev.map((v) => (v.id === selectedVisitorId ? { ...v, visitor_status: action } : v)),
      );

      setInvitationCode((prev) =>
        prev.length
          ? [
              {
                ...prev[0],
                visitor_status: action,
                visitor: {
                  ...prev[0].visitor,
                  visitor_status: action,
                },
              },
            ]
          : prev,
      );

      setVisitorStatus(action);

      // 🔹 Refetch background sync (after small delay)
      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        setTimeout(async () => {
          await fetchRelatedVisitorsByInvitationId(invitationId);
        }, 300);
      }

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
      }, 600);
    }
  };

  const formsOf = (section: any) =>
    Array.isArray(section?.['visit_form']) ? section['visit_form'] : [];
  const handleRemoveFileForField = async (
    currentUrl: string,
    setAnswerFile: (url: string) => void,
    inputId: string, // <- pakai key yg sama dengan id input
  ) => {
    try {
      setRemoving((s) => ({ ...s, [inputId]: true }));
      if (currentUrl) {
        await axiosInstance2.delete(`/cdn${currentUrl}`);
        console.log('✅ Berhasil hapus file CDN:', currentUrl);
      }

      setAnswerFile('');
      setPreviews((p) => ({ ...p, [inputId]: null }));
      setUploadNames((n) => {
        const { [inputId]: _, ...rest } = n;
        return rest;
      });
      const el = document.getElementById(inputId) as HTMLInputElement | null;
      if (el) el.value = '';
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setRemoving((s) => ({ ...s, [inputId]: false }));
    }
  };
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor; // 'success' | 'info' | 'warning' | 'error'
  }>({ open: false, message: '', severity: 'info' });

  // 3) helper supaya snackbar pasti muncul walau pesannya sama
  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };

  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);

  const handleSelectRelatedVisitor = (visitor: any) => {
    // 🟢 Update visitor aktif yang ditampilkan
    setSelectedVisitorNumber(visitor.visitor_number);
    setSelectedVisitorId(visitor.id);
    console.log('selected id ', selectedVisitorId);

    // 🔄 Update invitationCode agar tab info & visit ikut berubah
    setInvitationCode([
      {
        ...invitationCode[0],
        visitor: {
          ...invitationCode[0]?.visitor, // simpan semua field lama
          ...visitor, // timpa field yang ada di related visitor
        },
        visitor_number: visitor.visitor_number,
        visitor_period_start: visitor.visitor_period_start,
        visitor_period_end: visitor.visitor_period_end,
        agenda: visitor.agenda,
        selfie_image: visitor.selfie_image || null,
        identity_image: visitor.identity_image || null,
        card: visitor.card ?? [],
        visitor_status: visitor.visitor_status ?? '-',
      },
    ]);

    setVisitorStatus(visitor.visitor_status ?? '-');
  };

  const handleApplyBulkAction = async () => {
    if (!bulkAction || selectedVisitors.length === 0) return;

    const selectedData = relatedVisitors.filter((v) => selectedVisitors.includes(v.id));
    if (selectedData.length === 0) {
      toast('Tidak ada visitor yang valid.', 'warning');
      return;
    }

    // 🟩 Fill Form → buka dialog Stepper
    if (bulkAction === 'fill_form') {
      const validToFill = selectedData.filter(
        (v) => !v.is_praregister_done && v.visitor_status === 'Preregis',
      );

      if (validToFill.length === 0) {
        toast('Tidak ada visitor yang perlu mengisi form.', 'info');
        return;
      }

      handleOpenFillFormDialog(validToFill.map((v) => v.id));
      return;
    }

    const validActions = ['checkin', 'checkout', 'block', 'unblock'];
    if (!validActions.includes(bulkAction)) return;

    // 🧠 Filter visitor yang betul-betul dikirim ke API
    const validForApi = selectedData.filter((v) => {
      const status = v.visitor_status?.toLowerCase();
      switch (bulkAction) {
        case 'checkin':
          return v.is_praregister_done && status === 'preregis';
        case 'checkout':
          return status === 'checkin';
        case 'block':
        case 'unblock':
          return true;
        default:
          return false;
      }
    });

    // 🔸 Ambil reason jika Block/Unblock
    let reason = '';
    if (bulkAction === 'block' || bulkAction === 'unblock') {
      const { value: inputReason } = await Swal.fire({
        title: bulkAction === 'block' ? 'Block Visitors' : 'Unblock Visitors',
        text:
          bulkAction === 'block'
            ? 'Please provide a reason for blocking these visitors:'
            : 'Please provide a reason for unblocking these visitors:',
        input: 'text',
        inputPlaceholder: 'Enter reason...',
        inputAttributes: { maxlength: '200' },
        showCancelButton: true,
        confirmButtonText: bulkAction === 'block' ? 'Block' : 'Unblock',
        confirmButtonColor: bulkAction === 'block' ? '#000' : '#4caf50',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value || value.trim().length < 3) {
            return 'Reason must be at least 3 characters long.';
          }
          return null;
        },
      });

      if (!inputReason) return;
      reason = inputReason.trim();
    }

    const payload = {
      data: validForApi.map((v) => ({
        trx_visitor_id: v.id,
        action: bulkAction,
        reason,
      })),
    };

    try {
      setLoadingAccess(true);

      if (validForApi.length > 0) {
        await createMultipleInvitationActionOperator(token as string, payload);
      }

      // 🔄 Update state lokal (optimistic)
      setRelatedVisitors((prev) =>
        prev.map((v) => {
          const valid = validForApi.some((vv) => vv.id === v.id);
          if (valid) {
            let newStatus = v.visitor_status;
            if (bulkAction === 'checkin') newStatus = 'Checkin';
            else if (bulkAction === 'checkout') newStatus = 'Checkout';
            else if (bulkAction === 'block') newStatus = 'Block';
            else if (bulkAction === 'unblock') newStatus = 'Unblock';

            return { ...v, visitor_status: newStatus, is_praregister_done: true };
          }
          return v;
        }),
      );

      // 🧾 Buat pesan hasil akhir per visitor
      const resultMessages = selectedData.map((v) => {
        const status = v.visitor_status;
        const done = v.is_praregister_done;

        switch (bulkAction) {
          case 'checkin':
            if (!done)
              return `⚠️ ${v.name} belum melakukan pra-registrasi, isi form terlebih dahulu.`;
            if (status === 'Checkin') return `✅ ${v.name} sudah Check In sebelumnya.`;
            if (status === 'Preregis') return `✅ ${v.name} berhasil Check In.`;
            return `⚠️ ${v.name} tidak bisa Checkin karena status telah ${status}.`;

          case 'checkout':
            if (status === 'Checkin') return `✅ ${v.name} berhasil Check Out.`;
            if (status === 'Preregis')
              return `⚠️ ${v.name} belum melakukan pra-registrasi, isi form terlebih dahulu.`;
            if (status === 'Checkout') return `✅ ${v.name} sudah Check Out sebelumnya.`;
            return `⚠️ ${v.name} belum Check In, jadi tidak bisa Check Out.`;

          case 'block':
            return `✅ ${v.name} berhasil diblokir.`;

          case 'unblock':
            return `✅ ${v.name} berhasil di-unblock.`;

          default:
            return `${v.name} dilewati.`;
        }
      });

      // 🔔 Tampilkan semua pesan sekaligus di snackbar
      setSnackbarMsg(resultMessages.join('\n'));
      setSnackbarType('info');
      setSnackbarOpen(true);

      // Reset
      setSelectedVisitors([]);
      setBulkAction('');

      // Refetch background
      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        setTimeout(async () => {
          await fetchRelatedVisitorsByInvitationId(invitationId);
        }, 500);
      }
    } catch (error: any) {
      console.error('❌ Multiple Action Failed:', error);
      toast('Gagal melakukan aksi massal. Coba lagi.', 'error');
    } finally {
      setTimeout(() => setLoadingAccess(false), 600);
    }
  };

  // 🧩 Ambil data visitor terpilih
  const selectedData =
    selectMultiple && selectedVisitors.length > 0
      ? relatedVisitors.filter((v) => selectedVisitors.includes(v.id))
      : [
          relatedVisitors.find(
            (v) => (v.visitor_number || '').toString() === (selectedVisitorNumber || '').toString(),
          ),
        ].filter(Boolean);

  // 🧠 Mapping aksi berdasarkan visitor_status
  const statusActions: Record<string, string[]> = {
    Checkin: ['checkout', 'block'],
    Checkout: ['block'],
    Block: ['unblock'],
    Unblock: ['block'],
  };

  // 🧩 Ambil semua status unik
  const statuses = new Set(selectedData.map((v: any) => v.visitor_status));

  // 🟩 Cek kondisi praregister
  const hasPreregis = selectedData.some((v: any) => v.visitor_status === 'Preregis');
  const preregTrue = selectedData.some((v: any) => v.is_praregister_done === true);
  const preregFalse = selectedData.some((v: any) => v.is_praregister_done === false);

  // 🧮 Set hasil aksi
  let actions = new Set<string>();

  // ===================================================
  // 🧩 1️⃣ SINGLE SELECTION
  // ===================================================
  if (selectedData.length === 1) {
    const v = selectedData[0];

    // Jika visitor belum pra-register → tampilkan Fill Form
    if (v?.visitor_status === 'Preregis' && !v?.is_praregister_done === false) {
      actions.add('fill_form');
    }

    // Tambahkan aksi berdasarkan status
    (statusActions[v?.visitor_status as string] || []).forEach((a: any) => actions.add(a));

    // Untuk Preregis yang sudah pra-register → tambahkan checkin dan block
    if (v?.visitor_status === 'Preregis' && v?.is_praregister_done === true) {
      actions.add('checkin');
      actions.add('block');
    }
  }

  // ===================================================
  // 🧩 2️⃣ MULTIPLE SELECTION
  // ===================================================
  else if (selectedData.length > 1) {
    // 🔸 Jika ada Preregis yang belum pra-register
    if (hasPreregis && preregFalse) {
      actions.add('fill_form');
    }

    // 🔸 Jika ada yang sudah pra-register (boleh checkin/block)
    if (hasPreregis && preregTrue) {
      actions.add('checkin');
      actions.add('block');
    }

    // 🔸 Gabungkan semua kemungkinan aksi lain (Checkin, Block, dsb.)
    for (const status of statuses) {
      (statusActions[status] || []).forEach((a) => actions.add(a));
    }
  }

  // ===================================================
  // 🧩 3️⃣ Fallback (tidak ada aksi valid)
  // ===================================================
  if (actions.size === 0) {
    actions.add('fill_form'); // minimal fallback
  }

  // ===================================================
  // 🏷️ Dropdown Display Map
  // ===================================================
  const labelMap: Record<string, string> = {
    fill_form: 'Fill Form',
    checkin: 'Check In',
    checkout: 'Check Out',
    block: 'Block',
    unblock: 'Unblock',
  };

  // 🧾 Siapkan untuk dropdown
  const availableActions = [...actions].map((a) => ({
    label: labelMap[a] || a,
    value: a,
  }));

  // ============================================================
  // 🧩 State & handler
  // ============================================================
  const [openFillForm, setOpenFillForm] = useState(false);
  const [fillFormData, setFillFormData] = useState<any[]>([]);
  const [fillFormActiveStep, setFillFormActiveStep] = useState(0);
  const [fillFormGroupedPages, setFillFormGroupedPages] = useState<any>({});
  const [fillFormDataVisitor, setFillFormDataVisitor] = useState<any[]>([]);
  const [dataVisitor, setDataVisitor] = useState<{ question_page: SectionPageVisitor[] }[]>([]);

  const sanitizeRemarks = (r?: string | null) => {
    const v = (r ?? '').trim().toLowerCase();
    return v === 'indentity_id' ? 'identity_id' : v;
  };

  const REQUIRED_VI = ['name', 'email', 'organization'] as const;
  const hasVIFields = (s?: any) => {
    const r = new Set(
      formsOf(s)
        .map((f: any) => sanitizeRemarks(f?.remarks))
        .filter(Boolean),
    );
    return REQUIRED_VI.every((x) => r.has(x));
  };
  const pickVisitorInfoSingle = (sections: any[] = []) =>
    sections.find((s) => !s?.is_document && !s?.can_multiple_used && hasVIFields(s));

  const pickPurposeVisit = (sections: any[] = []) =>
    sections.find(
      (s) =>
        !s?.is_document &&
        formsOf(s).some((f: any) =>
          ['host', 'agenda', 'site_place', 'visitor_period_start', 'visitor_period_end'].includes(
            sanitizeRemarks(f?.remarks),
          ),
        ),
    );

  const cloneForms = (forms?: any[]) =>
    Array.isArray(forms)
      ? forms.map((f, idx) => ({
          ...f,
          sort: f.sort ?? idx,
          foreign_id: asStr(f.foreign_id),
          answer_text: '',
          answer_datetime: '',
          answer_file: '',
          multiple_option_fields: Array.isArray(f.multiple_option_fields)
            ? f.multiple_option_fields.map((opt: any) =>
                typeof opt === 'object' ? { ...opt } : opt,
              )
            : [],
        }))
      : [];

  const handleUploadMethodChange = (ukey: string, v: string) => {
    setUploadMethods((prev) => ({ ...prev, [ukey]: v as 'file' | 'camera' }));
  };

  const buildGroupSections = (sections?: any[]) => {
    const list = Array.isArray(sections) ? sections : [];

    // Cek apakah data datang dari API (punya `form`)
    const hasForm = list.some((s) => Array.isArray(s.form));

    if (hasForm) {
      // Pisahkan dokumen dan non-dokumen
      const nonDocSections = list.filter((s) => !s.is_document);
      const docSections = list.filter((s) => s.is_document);

      // Ambil sumber Visitor Info, Parking, dan Purpose Visit
      const visitorInfoSrc = nonDocSections.find((s) =>
        s.name.toLowerCase().includes('visitor information'),
      );
      const parkingSrc = nonDocSections.find((s) =>
        s.name.toLowerCase().includes('parking/vehicle'),
      );
      const purposeVisitSrc = nonDocSections.find((s) =>
        s.name.toLowerCase().includes('purpose visit'),
      );

      // Gabungkan form dokumen
      const docForms = docSections.flatMap((d) => d.form || []);

      // Utility untuk buat section
      const makeSection = (src: any, name: string, allowMultiple = false, includeDocs = false) => {
        const baseForms = Array.isArray(src?.form)
          ? src.form.map((f: any, i: number) => ({
              ...f,
              sort: f.sort ?? i,
            }))
          : [];

        return {
          id: src?.id ?? crypto.randomUUID(),
          name,
          is_document: false,
          can_multiple_used: allowMultiple,
          visit_form: includeDocs ? [...baseForms, ...docForms] : baseForms,
        };
      };

      // 🔹 Gabungkan Visitor Info + Parking + Dokumen jadi 1 group
      const visitorCombinedForms = [
        ...(visitorInfoSrc?.form || []),
        ...(parkingSrc?.form || []),
        ...docForms,
      ].map((f: any, i: number) => ({ ...f, sort: f.sort ?? i }));

      const visitorGroupSection = {
        id: visitorInfoSrc?.id ?? crypto.randomUUID(),
        name: 'Visitor Information (Group)',
        is_document: false,
        can_multiple_used: true,
        visit_form: visitorCombinedForms,
      };

      // 🔹 Purpose Visit tetap terpisah
      const purposeVisitSection = makeSection(purposeVisitSrc, 'Purpose Visit', false, false);

      return [visitorGroupSection, purposeVisitSection];
    }

    // fallback jika bukan data dari API (misal dari template visitor_type)
    return [
      {
        Id: 'visitor_info_group',
        sort: 0,
        name: 'Visitor Information (Group)',
        is_document: false,
        can_multiple_used: true,
        visit_form: [],
      },
      {
        Id: 'purpose_visit',
        sort: 1,
        name: 'Purpose Visit',
        is_document: false,
        can_multiple_used: false,
        visit_form: [],
      },
    ];
  };

  const DOC_REMARKS = new Set(['selfie_image', 'identity_image', 'nda']);

  const asStr = (v: any) => (v == null ? '' : String(v));

  const sameField = (a: any, b: any) =>
    (a?.custom_field_id && b?.custom_field_id && a.custom_field_id === b.custom_field_id) ||
    (a?.remarks &&
      b?.remarks &&
      String(a.remarks).toLowerCase() === String(b.remarks).toLowerCase());

  const pickAns = (f: any) => {
    const o: any = {};
    if (f?.answer_text) o.answer_text = f.answer_text;
    if (f?.answer_datetime) o.answer_datetime = f.answer_datetime;
    if (f?.answer_file) o.answer_file = f.answer_file;
    return o;
  };

  const isPurposeVisit = (section: any) => {
    if (section?.is_document) return false;
    const forms = formsOf(section);
    const PV = new Set([
      'host',
      'agenda',
      'site_place',
      'visitor_period_start',
      'visitor_period_end',
    ]);
    return forms.some((f: any) => PV.has((f?.remarks ?? '').trim().toLowerCase()));
  };

  const cloneFormWithEmptyAnswers = (f: any, idx: number) => ({
    ...f,
    sort: f.sort ?? idx,
    remarks: sanitizeRemarks(f.remarks),
    foreign_id: asStr(f.foreign_id),
    answer_text: '',
    answer_datetime: '',
    answer_file: '',
    multiple_option_fields: Array.isArray(f.multiple_option_fields)
      ? f.multiple_option_fields.map((opt: any) => (typeof opt === 'object' ? { ...opt } : opt))
      : [],
  });

  const buildGroupedPages = (sections: any[] = []) => {
    const single_page: any[] = [];
    const batch_page: Record<string, any> = {};

    sections.forEach((section) => {
      const forms = formsOf(section);

      // Purpose Visit → single_page
      if (isPurposeVisit(section)) {
        if (!section?.self_only) {
          // hanya Purpose Visit global (shared)
          forms.forEach((f: any, idx: number) => {
            const existing = (section.form_answers || []).find((ans: any) => sameField(ans, f));
            single_page.push(existing ? { ...f, ...existing } : cloneFormWithEmptyAnswers(f, idx));
          });
        }
        // kalau self_only = true → biarkan kosong di groupedPages
        return;
      }

      // Non-document → batch_page (template kolom)
      if (!section?.is_document) {
        forms.forEach((f: any, idx: number) => {
          const secId = (section as any)?.id ?? (section as any)?.Id ?? null;
          const formId = (f as any)?.id ?? (f as any)?.Id ?? idx;
          const secForeign = (section as any)?.foreign_id ?? (section as any)?.foreignId ?? null;
          const formForeign = (f as any)?.foreign_id ?? (f as any)?.foreignId ?? null;
          const formCustom = (f as any)?.custom_field_id ?? (f as any)?.customFieldId ?? null;

          const resolvedForeign = formForeign ?? secForeign ?? formCustom ?? formId ?? null;

          batch_page[idx] = {
            ...cloneFormWithEmptyAnswers(f, idx),
            foreign_id: asStr(resolvedForeign),
          };
        });
      }
    });

    return {
      single_page,
      batch_page,
      // batch_rows: [{}], // ← siapkan 1 baris default
    };
  };

  const [invitationDetail, setInvitationDetail] = useState<any>([]);

  const [questionPageTemplate, setQuestionPageTemplate] = useState<any[]>([]);

  const handleOpenFillFormDialog = async (visitors: any[] | string) => {
    try {
      let visitorList: any[] = [];

      // 🔧 Normalize input jadi object[]
      if (typeof visitors === 'string') {
        const v = relatedVisitors.find((x) => x.id === visitors);
        if (v) visitorList = [v];
      } else if (Array.isArray(visitors)) {
        if (typeof visitors[0] === 'string') {
          visitorList = visitors
            .map((id) => relatedVisitors.find((x) => x.id === id))
            .filter(Boolean);
        } else {
          visitorList = visitors;
        }
      }

      if (!visitorList.length) {
        toast('No visitor selected', 'warning');
        return;
      }

      // 🔹 Ambil detail form untuk semua visitor
      const results = await Promise.all(
        visitorList.map((v) => getDetailInvitationForm(token as string, v.id)),
      );

      // 🔹 Ambil template dari visitor pertama (untuk definisi global)
      const firstResult = results[0];
      const questionPagesTemplate = firstResult?.collection?.question_page ?? [];

      setInvitationDetail(firstResult);
      setQuestionPageTemplate(questionPagesTemplate);

      // 🔹 Build Group Sections berdasarkan template pertama
      const baseSections = buildGroupSections(questionPagesTemplate);
      setFillFormData(baseSections);
      setFillFormActiveStep(0);
      setFillFormGroupedPages(buildGroupedPages(baseSections));

      // 🔹 Buat data form per visitor berdasarkan hasilnya sendiri
      const visitorGroupList = results.map((res, idx) => {
        const v = visitorList[idx];
        const qPages = res?.collection?.question_page ?? [];

        // Gunakan buildGroupSections untuk masing-masing visitor
        const builtSections = buildGroupSections(qPages);
        const wrappedSections = builtSections.map((section) => ({
          ...section,
          form: section.visit_form || [],
        }));

        return {
          visitor_id: v.id,
          visitor_name: v.name,
          question_page: structuredClone(wrappedSections),
        };
      });

      setFillFormDataVisitor(visitorGroupList);
      setOpenFillForm(true);
    } catch (error) {
      console.error('Failed to open fill form:', error);
      toast('Failed to load form', 'error');
    }
  };

  const getSectionType = (section: any) => {
    const f = formsOf(section);
    if (
      f.some((x: any) => x.remarks === 'vehicle_plate') &&
      !section.is_document &&
      !section.can_multiple_used
    )
      return 'parking';
    if (
      f.some((x: any) => x.remarks === 'host') &&
      !section.is_document &&
      section.can_multiple_used
    )
      return 'purpose_visit';
    if (
      f.some((x: any) => x.remarks === 'host') &&
      !section.is_document &&
      !section.can_multiple_used
    )
      return 'purpose_visit';
    if (
      f.some((x: any) => x.remarks === 'nda') &&
      section.is_document &&
      !section.can_multiple_used
    )
      return 'nda';
    if (
      f.some((x: any) => x.remarks === 'identity_image') &&
      section.is_document &&
      !section.can_multiple_used
    )
      return 'identity_image';
    if (
      f.some((x: any) => x.remarks === 'selfie_image') &&
      section.is_document &&
      !section.can_multiple_used
    )
      return 'selfie_image';
    if (!section.is_document && !section.can_multiple_used) return 'visitor_information';
    if (!section.is_document && section.can_multiple_used) return 'visitor_information_group';
  };

  const renderFieldInput = (
    field: FormVisitor,
    index: number,
    onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void,
    onDelete?: (index: number) => void,
    opts?: { showLabel?: boolean; uniqueKey?: string },
  ) => {
    const showLabel = opts?.showLabel ?? true;

    const renderInput = () => {
      // const [uploadMethod, setUploadMethod] = React.useState('file'); // default file upload
      const key = opts?.uniqueKey ?? String(index);
      switch (field.field_type) {
        case 0: // Text
          return (
            <TextField
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder=""
              fullWidth
              sx={{ minWidth: 160, maxWidth: '100%' }}
            />
          );

        case 1: // Number
          return (
            <TextField
              type="number"
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder="Enter number"
              fullWidth
            />
          );

        case 2: // Email
          return (
            <TextField
              type="email"
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder=""
              fullWidth
              sx={{ minWidth: 160, maxWidth: '100%' }}
            />
          );

        case 3: {
          let options: { value: string; name: string }[] = [];

          // 🔹 Ambil value default dari payload form detail
          const hostName = invitationDetail?.collection?.host_name ?? '';
          const hostId = invitationDetail?.collection?.host ?? '';
          const sitePlaceName = invitationDetail?.collection?.site_place_name ?? '';
          const sitePlaceId = invitationDetail?.collection?.site_place ?? '';

          switch (field.remarks) {
            case 'host':
              // gunakan value dari API langsung
              options = [{ value: hostId, name: hostName }];
              break;

            case 'employee':
              options = allVisitorEmployee.map((emp: any) => ({
                value: emp.id,
                name: emp.name,
              }));
              break;

            case 'site_place':
              // gunakan value dari API langsung
              options = [{ value: sitePlaceId, name: sitePlaceName }];
              break;

            default:
              options = (field.multiple_option_fields || []).map((opt: any) =>
                typeof opt === 'object' ? opt : { value: opt, name: opt },
              );
              break;
          }

          // 🔹 Gunakan uniqueKey biar gak tabrakan antar visitor group
          const uniqueKey = opts?.uniqueKey ?? `${activeStep}:${index}`;
          const inputVal = inputValues[uniqueKey as any] || '';

          // 🔒 Disabled khusus untuk purpose visit
          const isDisabled =
            field.remarks === 'host' ||
            field.remarks === 'site_place' ||
            field.remarks === 'employee';

          return (
            <Autocomplete
              size="small"
              // disabled={isDisabled} // ✅ Disabled biar readonly
              freeSolo
              options={options}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
              inputValue={inputVal}
              onInputChange={(_, newInputValue) =>
                setInputValues((prev) => ({ ...prev, [uniqueKey]: newInputValue }))
              }
              filterOptions={(opts, state) => {
                const term = (state.inputValue || '').toLowerCase();
                if (term.length < 3) return [];
                return opts.filter((opt) => (opt.name || '').toLowerCase().includes(term));
              }}
              noOptionsText={
                inputVal.length < 3 ? 'Ketik minimal 3 karakter untuk mencari' : 'Tidak ditemukan'
              }
              value={
                options.find(
                  (opt: { value: string; name: string }) =>
                    opt.value?.toLowerCase?.() === field.answer_text?.toLowerCase?.(),
                ) || null
              }
              onChange={(_, newValue) =>
                onChange(index, 'answer_text', newValue instanceof Object ? newValue.value : '')
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Ketik minimal 3 karakter"
                  fullWidth
                  sx={{ minWidth: 160 }}
                />
              )}
            />
          );
        }

        case 4: // Date
          return (
            <TextField
              type="date"
              size="small"
              value={field.answer_datetime}
              onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
              fullWidth
            />
          );

        case 5: // Radio
          if (field.remarks === 'gender') {
            const options = [
              { value: '1', name: 'Male' },
              { value: '0', name: 'Female' },
              { value: '2', name: 'Prefer not to say' },
            ];

            const value = field.answer_text != null ? String(field.answer_text) : '';

            return (
              <TextField
                select
                size="small"
                fullWidth
                sx={{ width: 160 }}
                value={value}
                onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              >
                {options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.name}
                  </MenuItem>
                ))}
              </TextField>
            );
          }
          if (field.remarks === 'vehicle_type') {
            const options = [
              { value: 'car', label: 'Car' },
              { value: 'bus', label: 'Bus' },
              { value: 'motor', label: 'Motor' },
              { value: 'bicycle', label: 'Bicycle' },
              { value: 'truck', label: 'Truck' },
              { value: 'private_car', label: 'Private Car' },
              { value: 'other', label: 'Other' },
            ];

            // gunakan string kosong jika belum ada nilai
            const currentValue = field.answer_text ?? '';

            return (
              <TextField
                select
                size="small"
                fullWidth
                value={currentValue} // ✅ wajib ada agar bisa memilih
                onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="" disabled>
                  Select Vehicle Type
                </MenuItem>
                {options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            );
          }

          if (field.remarks === 'is_driving') {
            const options = [
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ];

            const currentValue = field.answer_text ?? ''; // kosong jika belum ada jawaban

            return (
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={currentValue}
                  onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                  row
                  sx={{ minWidth: 130 }}
                >
                  {options.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={opt.value}
                      control={<Radio size="small" />}
                      label={opt.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            );
          }

          return (
            <TextField
              select
              size="small"
              value={field.answer_text || ''}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              fullWidth
            >
              {field.multiple_option_fields?.map((opt: any) => (
                <MenuItem key={opt.id} value={opt.value}>
                  {opt.name}
                </MenuItem>
              ))}
            </TextField>
          );

        case 6:
          if (field.remarks === 'is_employee') {
            const options = Array.isArray(field.multiple_option_fields)
              ? field.multiple_option_fields.map((opt) => ({
                  value: String(opt.value).toLowerCase(),
                  name: opt.name,
                }))
              : [
                  { value: 'true', name: 'Yes' },
                  { value: 'false', name: 'No' },
                ];

            const currentValue = String(field.answer_text).toLowerCase();

            return (
              <Box display="flex" alignItems="center" gap={2}>
                {options.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    control={
                      <Checkbox
                        checked={currentValue === opt.value}
                        onChange={() => onChange(index, 'answer_text', opt.value)}
                      />
                    }
                    label={opt.name}
                  />
                ))}
              </Box>
            );
          }

          // fallback default (checkbox tunggal)
          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.answer_text)}
                  onChange={(e) => onChange(index, 'answer_text', e.target.checked)}
                />
              }
              label=""
            />
          );

        // fallback default checkbox single

        case 8: // Time
          return (
            <TextField
              type="time"
              size="small"
              value={field.answer_datetime}
              onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
              fullWidth
            />
          );

        case 9: //Datetimepicker
          return (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
              <DateTimePicker
                value={field.answer_datetime ? dayjs(field.answer_datetime) : null}
                ampm={false}
                onChange={(newValue) => {
                  if (newValue) {
                    const utc = newValue.utc().format(); // hasil: 2025-08-05T10:00:00Z
                    onChange(index, 'answer_datetime', utc);
                  }
                }}
                format="ddd, DD - MMM - YYYY, HH:mm"
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          );

        case 10: // Camera
          if (field.remarks === 'selfie_image') {
            return (
              <CameraUpload
                value={field.answer_file}
                onChange={(url) => onChange(index, 'answer_file', url)}
              />
            );
          }
          return (
            <CameraUpload
              value={field.answer_file}
              onChange={(url) => onChange(index, 'answer_file', url)}
            />
          );

        case 11: {
          // File upload (PDF / NDA)
          // const inputId = `pdf-${opts?.uniqueKey ?? index}`;
          const key = opts?.uniqueKey ?? String(index);
          const fileUrl = (field as any).answer_file as string | undefined;
          return (
            <Box>
              <label htmlFor={key}>
                <Box
                  sx={{
                    border: '2px dashed #90caf9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    borderRadius: 2,
                    p: 0.5,
                    textAlign: 'center',
                    backgroundColor: '#f5faff',
                    cursor: 'pointer',
                    width: '100%',
                    minWidth: 160,
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
                  <Typography variant="subtitle1">Upload File</Typography>
                </Box>
              </label>

              <input
                id={key}
                type="file"
                accept="*"
                hidden
                // onChange={handlePDFUploadFor(index, onChange)
                onChange={(e) =>
                  handleFileChangeForField(
                    e as React.ChangeEvent<HTMLInputElement>,
                    (url) => onChange(index, 'answer_file', url),
                    key,
                  )
                }
              />

              {fileUrl && (
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" noWrap>
                    {/* {fileUrl.split('/').pop()} */}
                    {uploadNames[key] ?? ''}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      handleRemoveFileForField(
                        (field as any).answer_file,
                        (url) => onChange(index, 'answer_file', url), // kosongkan state
                        key, // reset <input id=key>
                      )
                    }
                  >
                    <IconX size={16} />
                  </IconButton>
                </Box>
              )}
            </Box>
          );
        }

        case 12: {
          const key = opts?.uniqueKey ?? String(index);
          return (
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'column', md: 'row' }} // ⬅️ stack on mobile
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              gap={1.5}
              width="100%" // ⬅️ let it adapt instead of fixed width
              sx={{ maxWidth: 400 }}
            >
              <TextField
                select
                size="small"
                value={uploadMethods[key] || 'file'}
                onChange={(e) => handleUploadMethodChange(key, e.target.value)}
                fullWidth
                sx={{
                  width: { xs: '100%', md: '200px' }, // full on mobile
                }}
              >
                <MenuItem value="file">Choose File</MenuItem>
                <MenuItem value="camera">Take Photo</MenuItem>
              </TextField>

              {(uploadMethods[key] || 'file') === 'camera' ? (
                <CameraUpload
                  value={field.answer_file}
                  onChange={(url) => onChange(index, 'answer_file', url)}
                />
              ) : (
                <Box sx={{ width: { xs: '100%', md: '200px' } }}>
                  <label htmlFor={key}>
                    <Box
                      sx={{
                        border: '2px dashed #90caf9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        borderRadius: 2,
                        p: 0.5,
                        textAlign: 'center',
                        backgroundColor: '#f5faff',
                        cursor: 'pointer',
                        width: '100%',
                        transition: '0.2s',
                        '&:hover': { backgroundColor: '#e3f2fd' },
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
                      <Typography variant="subtitle1" sx={{ fontSize: { xs: 13, md: 14 } }}>
                        Upload File
                      </Typography>
                    </Box>
                  </label>

                  <input
                    id={key}
                    type="file"
                    accept="*"
                    hidden
                    onChange={(e) =>
                      handleFileChangeForField(
                        e as React.ChangeEvent<HTMLInputElement>,
                        (url) => onChange(index, 'answer_file', url),
                        key,
                      )
                    }
                  />

                  {!!(field as any).answer_file && (
                    <Box
                      mt={0.5}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ overflow: 'hidden' }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        {uploadNames[key] ?? ''}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={!!removing[key]}
                        onClick={() =>
                          handleRemoveFileForField(
                            (field as any).answer_file,
                            (url) => onChange(index, 'answer_file', url),
                            key,
                          )
                        }
                      >
                        <IconX size={16} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          );
        }
        default:
          return (
            <TextField
              size="small"
              value={field.long_display_text}
              onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
              placeholder="Enter value"
              fullWidth
            />
          );
      }
    };

    return (
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        {showLabel && (
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            {field.long_display_text}
          </Typography>
        )}
        {renderInput()}
      </Box>
    );
  };

  // const handleSubmitPramultiple = async () => {
  //   try {
  //     // if (!invitationDetail || !fillFormDataVisitor.length) {
  //     //   toast('Form belum lengkap', 'warning');
  //     //   return;
  //     // }

  //     // if (!questionPageTemplate.length) {
  //     //   toast('Template question_page belum dimuat', 'error');
  //     //   return;
  //     // }

  //     if(loadingAccess) return;
  //     setLoadingAccess(true);

  //     const tzFromApi =
  //       invitationDetail.collection?.tz ||
  //       invitationDetail.collection?.site_place_data?.timezone ||
  //       'Asia/Jakarta';

  //     const visitorType =
  //       invitationDetail.collection?.visitor_type ||
  //       invitationDetail.collection?.visitor_type_data?.id;
  //     const siteId =
  //       invitationDetail.collection?.site_place || invitationDetail.collection?.site_place_data?.id;
  //     const isGroup = invitationDetail.collection?.is_group ?? true;

  //     // 🟢 Ambil visitor yang dipilih
  //     const selected = relatedVisitors.filter((v) => selectedVisitors.includes(v.id));

  //     // 🔁 Bangun ulang setiap visitor berdasarkan index-nya di fillFormDataVisitor
  //     const dataList = selected.map((visitor, gIdx) => {
  //       const visitorGroup = fillFormDataVisitor[gIdx];
  //       const visitorSections = visitorGroup?.question_page ?? [];

  //       return {
  //         trx_visitor_id: visitor.id,
  //         visitor_type: visitorType,
  //         type_registered: 1,
  //         is_group: isGroup,
  //         tz: tzFromApi,
  //         // registered_site: siteId,
  //         registered_site: '',
  //         data_visitor: [
  //           {
  //             question_page: questionPageTemplate.map((templateSection: any) => ({
  //               id: templateSection.id,
  //               sort: templateSection.sort ?? 0,
  //               name: templateSection.name,
  //               status: 0,
  //               is_document: !!templateSection.is_document,
  //               can_multiple_used: !!templateSection.can_multiple_used,
  //               self_only: templateSection.self_only ?? false,
  //               foreign_id: templateSection.foreign_id ?? '',
  //               form: (templateSection.form || []).map((templateField: any, fIdx: number) => {
  //                 const remark = templateField.remarks?.toLowerCase();
  //                 let answer_text: string | null = null;
  //                 let answer_datetime: string | null = null;
  //                 let answer_file: string | null = null;

  //                 for (const groupSection of visitorSections) {
  //                   const foundField = groupSection.form.find(
  //                     (f: any) => f.remarks?.toLowerCase() === remark,
  //                   );
  //                   if (foundField) {
  //                     answer_text = foundField.answer_text ?? null;
  //                     answer_datetime = foundField.answer_datetime ?? null;

  //                     if (foundField.field_type >= 10) {
  //                       answer_file =
  //                         foundField.answer_file ??
  //                         foundField.answer_text ??
  //                         foundField.answer_datetime ??
  //                         null;
  //                     }

  //                     if (
  //                       ['nda', 'selfie_image', 'identity_image'].includes(
  //                         foundField.remarks?.toLowerCase(),
  //                       )
  //                     ) {
  //                       answer_file =
  //                         foundField.answer_file ??
  //                         foundField.answer_text ??
  //                         foundField.answer_datetime ??
  //                         null;
  //                     }

  //                     break;
  //                   }
  //                 }

  //                 return {
  //                   sort: templateField.sort ?? fIdx,
  //                   short_name: templateField.short_name,
  //                   long_display_text: templateField.long_display_text,
  //                   field_type: templateField.field_type,
  //                   is_primary: !!templateField.is_primary,
  //                   is_enable: !!templateField.is_enable,
  //                   mandatory: !!templateField.mandatory,
  //                   remarks: templateField.remarks,
  //                   // custom_field_id: templateField.custom_field_id,
  //                   // multiple_option_fields: templateField.multiple_option_fields || [],
  //                   visitor_form_type: 1,
  //                   answer_text,
  //                   answer_datetime,
  //                   answer_file,
  //                 };
  //               }),
  //             })),
  //           },
  //         ],
  //       };
  //     });

  //     const payload = { list_group: dataList };
  //     console.log('✅ Final Payload (MULTI-VISITOR FIXED):', JSON.stringify(payload, null, 2));

  //     const result = await createSubmitCompletePraMultiple(token as string, payload);
  //     toast('Successfully submit praregister', 'success');
  //     console.log('✅ Submit success:', result);
  //     setOpenFillForm(false);
  //   } catch (error) {
  //     console.error('❌ Submit error:', error);
  //     toast('Submit gagal', 'error');
  //   }finally{
  //     setTimeout(() => {
  //       setLoadingAccess(false);
  //     }, 500);
  //   }
  // };

  const [selectedAccessIds, setSelectedAccessIds] = useState<string[]>([]);

  useEffect(() => {
    console.table(
      accessData.map((a) => ({
        name: a.access_control_name,
        status: a.visitor_give_access,
        early: a.early_access,
        allowed: getAllowedActions(a.visitor_give_access, a.early_access),
      })),
    );
  }, [accessData]);

  // fungsi dasar (seperti sebelumnya)
  const getAllowedActions = (status: number, earlyAccess: boolean) => {
    if (earlyAccess) {
      if (status === 2 || status === 3) return []; // already revoked/blocked -> no action
      return ['Revoke', 'Block']; // early access: only these (if not already 2/3)
    }

    switch (status) {
      case 0:
        return ['Grant'];
      case 1:
        return ['Revoke', 'Block'];
      case 2:
        return ['Grant', 'Block'];
      case 3:
        return [];
      default:
        return [];
    }
  };

  // Ambil allowed actions untuk satu access_control_id tapi memperhitungkan semua selectedVisitors
  const getAllowedActionsForAccessId = (
    accessId: string,
    selectedVisitorIds: string[],
    allAccessData: any[],
  ) => {
    // ambil semua record yang cocok access_control_id dan trx_visitor_id ada di selectedVisitorIds
    const records = allAccessData.filter(
      (a) =>
        a.access_control_id === accessId &&
        selectedVisitorIds.includes(a.trx_visitor_id ?? a.trxVisitorId),
    );

    if (!records.length) return []; // tidak ada record => tidak boleh apa-apa

    // untuk tiap visitor record, hitung allowed actions
    const perVisitorActions = records.map((r) =>
      getAllowedActions(r.visitor_give_access ?? 0, !!r.early_access),
    );

    // ambil intersection dari semua perVisitorActions
    return perVisitorActions.reduce((acc, cur) => acc.filter((x) => cur.includes(x)));
  };

  // Ambil allowed actions final untuk beberapa access_control_id yang terpilih
  const getAllowedActionsForMultiple = (selectedIds: string[], selectedVisitorIds: string[]) => {
    if (!selectedIds.length || !selectedVisitorIds.length) return [];

    const actionsList = selectedIds.map((id) =>
      getAllowedActionsForAccessId(id, selectedVisitorIds, accessData),
    );

    if (!actionsList.length) return [];

    return actionsList.reduce((acc, curr) => acc.filter((x) => curr.includes(x)));
  };

  // Memoized result — pastikan dependencynya lengkap
  const allowedActions = useMemo(() => {
    if (selectedAccessIds.length === 0 || selectedVisitors.length === 0) return [];
    return getAllowedActionsForMultiple(selectedAccessIds, selectedVisitors);
  }, [selectedAccessIds, selectedVisitors, accessData]);

  const handleSubmitPramultiple = async () => {
    try {
      if (loadingAccess) return;
      setLoadingAccess(true);

      const tzFromApi =
        invitationDetail.collection?.tz ||
        invitationDetail.collection?.site_place_data?.timezone ||
        'Asia/Jakarta';

      const visitorType =
        invitationDetail.collection?.visitor_type ||
        invitationDetail.collection?.visitor_type_data?.id;
      const siteId =
        invitationDetail.collection?.site_place || invitationDetail.collection?.site_place_data?.id;
      const isGroup = invitationDetail.collection?.is_group ?? true;

      // 🟢 Ambil visitor yang dipilih
      const selected = relatedVisitors.filter((v) => selectedVisitors.includes(v.id));

      // 🔁 Bangun ulang setiap visitor berdasarkan index-nya di fillFormDataVisitor
      const dataList = selected.map((visitor, gIdx) => {
        const visitorGroup = fillFormDataVisitor[gIdx];
        const visitorSections = visitorGroup?.question_page ?? [];

        return {
          trx_visitor_id: visitor.id,
          visitor_type: visitorType,
          type_registered: 1,
          is_group: isGroup,
          tz: tzFromApi,
          registered_site: '',
          data_visitor: [
            {
              question_page: questionPageTemplate.map((templateSection: any) => ({
                id: templateSection.id,
                sort: templateSection.sort ?? 0,
                name: templateSection.name,
                status: 0,
                is_document: !!templateSection.is_document,
                can_multiple_used: !!templateSection.can_multiple_used,
                self_only: templateSection.self_only ?? false,
                foreign_id: templateSection.foreign_id ?? '',
                form: (templateSection.form || []).map((templateField: any, fIdx: number) => {
                  const remark = templateField.remarks?.toLowerCase();
                  let answer_text: string | null = null;
                  let answer_datetime: string | null = null;
                  let answer_file: string | null = null;

                  for (const groupSection of visitorSections) {
                    const foundField = groupSection.form.find(
                      (f: any) => f.remarks?.toLowerCase() === remark,
                    );
                    if (foundField) {
                      answer_text = foundField.answer_text ?? null;
                      answer_datetime = foundField.answer_datetime ?? null;

                      if (foundField.field_type >= 10) {
                        answer_file =
                          foundField.answer_file ??
                          foundField.answer_text ??
                          foundField.answer_datetime ??
                          null;
                      }

                      if (
                        ['nda', 'selfie_image', 'identity_image'].includes(
                          foundField.remarks?.toLowerCase(),
                        )
                      ) {
                        answer_file =
                          foundField.answer_file ??
                          foundField.answer_text ??
                          foundField.answer_datetime ??
                          null;
                      }

                      break;
                    }
                  }

                  return {
                    sort: templateField.sort ?? fIdx,
                    short_name: templateField.short_name,
                    long_display_text: templateField.long_display_text,
                    field_type: templateField.field_type,
                    is_primary: !!templateField.is_primary,
                    is_enable: !!templateField.is_enable,
                    mandatory: !!templateField.mandatory,
                    remarks: templateField.remarks,
                    visitor_form_type: 1,
                    answer_text,
                    answer_datetime,
                    answer_file,
                  };
                }),
              })),
            },
          ],
        };
      });

      const payload = { list_group: dataList };
      console.log('✅ Final Payload (MULTI-VISITOR FIXED):', JSON.stringify(payload, null, 2));

      // 🔵 Submit ke API
      const result = await createSubmitCompletePraMultiple(token as string, payload);
      toast('Successfully submit praregister', 'success');
      console.log('✅ Submit success:', result);

      // 🟩 Update lokal biar langsung terlihat (UX cepat)
      setRelatedVisitors((prev) =>
        prev.map((v) =>
          selectedVisitors.includes(v.id)
            ? {
                ...v,
                is_praregister_done: true,
                visitor_status: 'Preregis',
              }
            : v,
        ),
      );

      // 🟦 Ambil ulang data dari server agar 100% sinkron
      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        console.log('🔄 Refetching visitors for invitation:', invitationId);
        await fetchRelatedVisitorsByInvitationId(invitationId);
      }

      setOpenFillForm(false);
      // setSelectedVisitors([]);
      // setSelectMultiple(false);
    } catch (error) {
      console.error('❌ Submit error:', error);
      toast('Submit gagal', 'error');
    } finally {
      setTimeout(() => {
        setLoadingAccess(false);
      }, 500);
    }
  };

  const [openDialogInvitation, setOpenDialogInvitation] = useState(false);

  const handleView = async (id: string) => {
    setSelectedInvitationId(id);
    setOpenDialogInvitation(true);
  };
  const validateMultiVisitorAccess = (
    accessId: string,
    selectedVisitorIds: string[],
    allAccessData: any[],
    action: 'grant' | 'revoke' | 'block' | 'no_action' | 'unblock',
  ) => {
    const invalidVisitors: string[] = [];
    const actionText = action.toUpperCase();

    selectedVisitorIds.forEach((visitorId) => {
      const record = allAccessData.find(
        (a) =>
          (a.trx_visitor_id === visitorId || a.trxVisitorId === visitorId) &&
          a.access_control_id === accessId,
      );

      if (!record) {
        invalidVisitors.push(`${visitorId} (no record found)`);
        return;
      }

      const { visitor_give_access, access_control_name } = record;

      // 🚫 Tidak boleh aksi kalau sudah revoke atau block
      if (visitor_give_access === 2 || visitor_give_access === 3) {
        invalidVisitors.push(`${access_control_name || visitorId} (already revoked/blocked)`);
      }

      // 🚫 Sudah grant → tidak bisa grant lagi
      if (action === 'grant' && visitor_give_access === 1) {
        invalidVisitors.push(`${access_control_name || visitorId} (already granted)`);
      }

      // 🚫 Belum grant → tidak bisa revoke atau block
      if ((action === 'revoke' || action === 'block') && visitor_give_access === 0) {
        invalidVisitors.push(`${access_control_name || visitorId} (not granted yet)`);
      }
    });

    console.log('');

    if (invalidVisitors.length) {
      return `⚠️ Some visitors cannot perform ${actionText}:\n${invalidVisitors.join('\n')}`;
    }

    return null;
  };

  const handleAccessAction = async (
    row: any,
    action: 'no_action' | 'grant' | 'revoke' | 'block' | 'unblock',
  ): Promise<void> => {
    return new Promise(async (resolve) => {
      const actionMap = { no_action: 0, grant: 1, revoke: 2, block: 3, unblock: 4 };
      const accessControlId = row?.access_control_id || row?.id;
      const actionCode = actionMap[action];

      try {
        setLoadingAccess(true);
        const payload = {
          data_access: selectedVisitors.map((visitorId) => ({
            access_control_id: accessControlId,
            trx_visitor_id: visitorId,
            action: actionCode,
          })),
        };

        const res = await createGiveAccessOperator(token as string, payload);
        console.log('✅ Access Action Response:', res);

        const backendMsg =
          res?.collection?.[0] || res?.msg || res?.message || 'Action executed successfully.';

        setSnackbarMsg(`✅ ${backendMsg}`);
        setSnackbarType('success');
        setSnackbarOpen(true);

        // 🟢 Update accessData di sini
        setAccessData((prev) =>
          prev.map((a) =>
            selectedVisitors.includes(a.trx_visitor_id) && a.access_control_id === accessControlId
              ? { ...a, visitor_give_access: actionCode }
              : a,
          ),
        );

        resolve();
      } catch (err: any) {
        console.error('❌ Access Action Error:', err);
        const backendMsg =
          err?.response?.data?.collection?.[0] ||
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Unknown error occurred.';

        setSnackbarMsg(`❌ Failed to ${action.toUpperCase()}: ${backendMsg}`);
        setSnackbarType('error');
        setSnackbarOpen(true);
        resolve(); // pastikan tetap resolve agar loop lanjut
      } finally {
        setTimeout(() => setLoadingAccess(false), 600);
      }
    });
  };

  //   const handleAccessAction = async (
  //     row: any,
  //     action: 'grant' | 'revoke' | 'block' | 'no_action' | 'unblock',
  //   ) => {
  //     const actionMap = { no_action: 0, grant: 1, revoke: 2, block: 3, unblock: 4 };
  //     const accessControlId = row?.access_control_id || row?.id;
  //     const actionCode = actionMap[action];

  //     if (!accessControlId) {
  //       setSnackbarMsg('Access Control ID not found.');
  //       setSnackbarType('error');
  //       setSnackbarOpen(true);
  //       return;
  //     }

  //     if (!selectedVisitors.length) {
  //       setSnackbarMsg('Please select at least one visitor first.');
  //       setSnackbarType('info');
  //       setSnackbarOpen(true);
  //       return;
  //     }

  //     // ✅ Validasi kombinasi multi-visitor
  //     // const validationError = validateMultiVisitorAccess(
  //     //   accessControlId,
  //     //   selectedVisitors,
  //     //   accessData,
  //     //   action,
  //     // );

  //     // if (validationError) {
  //     //   setSnackbarMsg(validationError);
  //     //   setSnackbarType('error');
  //     //   setSnackbarOpen(true);
  //     //   return;
  //     // }

  //     const payload = {
  //       data_access: selectedVisitors.map((visitorId) => ({
  //         access_control_id: accessControlId,
  //         trx_visitor_id: visitorId,
  //         action: actionCode,
  //       })),
  //     };

  //     console.log('🚀 Payload Access Action:', payload);

  //     try {
  //       setLoadingAccess(true);
  //       const res = await createGiveAccessOperator(token as string, payload);
  //       console.log('✅ Access Action Response:', res);

  //       setSnackbarMsg(`✅ ${action.toUpperCase()} executed successfully for selected visitors.`);
  //       setSnackbarType('success');
  //       setSnackbarOpen(true);

  //       // 🟢 Update accessData agar UI sync
  //  setAccessData((prev) =>
  //    prev.map((a) => {
  //      const match =
  //        selectedVisitors.includes(a.trx_visitor_id) && a.access_control_id === accessControlId;

  //      if (match) {
  //        // update visitor_give_access sesuai action baru
  //        const actionMap = { grant: 1, revoke: 2, block: 3 };
  //        const newStatus = actionMap[action as keyof typeof actionMap] ?? a.visitor_give_access;

  //        console.log(
  //          `🔄 Updated ${a.access_control_name}: visitor_give_access ${a.visitor_give_access} → ${newStatus}`,
  //        );

  //        return { ...a, visitor_give_access: newStatus };
  //      }

  //      return a;
  //    }),
  //  );
  //     } catch (err: any) {
  //       console.error('❌ Access Action Error:', err);

  //       // 🔍 Ambil pesan error dari berbagai kemungkinan lokasi, termasuk 'collection'
  //       const backendMsg =
  //         err?.response?.data?.collection?.[0] || // ✅ ambil elemen pertama dari array collection
  //         err?.response?.data?.message ||
  //         err?.response?.data?.msg ||
  //         err?.response?.data?.error ||
  //         (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors.join('\n') : null) ||
  //         err?.message ||
  //         'Unknown error occurred.';

  //       console.warn('⚠️ Backend message parsed:', backendMsg);

  //       setSnackbarMsg(`${backendMsg}`);
  //       setSnackbarType('error');
  //       setSnackbarOpen(true);
  //     } finally {
  //       setTimeout(() => setLoadingAccess(false), 600);
  //     }
  //   };

  // const handleAccessAction = async (
  //   row: any,
  //   action: 'grant' | 'revoke' | 'block' | 'no_action' | 'unblock',
  // ) => {
  //   const actionMap: Record<typeof action, number> = {
  //     no_action: 0,
  //     grant: 1,
  //     revoke: 2,
  //     block: 3,
  //     unblock: 4,
  //   };

  //   const trxVisitorId = row?.trx_visitor_id || row?.trxVisitorId || invitationCode[0]?.id;

  //   // ✅ Ambil ID dari row paling dulu
  //   const accessControlId =
  //     row?.access_control_id ||
  //     (Array.isArray(invitationCode[0]?.access)
  //       ? invitationCode[0].access.find((x:any) => x.id === row?.id)?.access_control_id
  //       : undefined);

  //   const actionCode = actionMap[action];

  //   if (!accessControlId) {
  //     console.warn('⚠️ Access control ID not found in row or fallback:', row);
  //     setSnackbarMsg('Access Control ID not found.');
  //     setSnackbarType('error');
  //     setSnackbarOpen(true);
  //     return;
  //   }

  //   const payload = {
  //     data_access: [
  //       {
  //         access_control_id: accessControlId,
  //         action: actionCode,
  //         trx_visitor_id: trxVisitorId,
  //       },
  //     ],
  //   };

  //   console.log('🚀 Payload Access Action (accurate):', payload);

  //   try {
  //     setLoadingAccess(true);
  //     const res = await createGiveAccessOperator(token as string, payload);
  //     console.log('✅ Access Action Response:', res);

  //     setSnackbarMsg(`Access ${action} successfully.`);
  //     setSnackbarType('success');
  //     setSnackbarOpen(true);

  //     setAccessData((prev) =>
  //       prev.map((a) => {
  //         // 🔍 pastikan cocok dengan salah satu identifier
  //         const match =
  //           a.access_control_id === accessControlId ||
  //           a.id === accessControlId ||
  //           a.id === row.id ||
  //           a.access_control_id === row.access_control_id;

  //         if (match) {
  //           console.log(`🟢 Updating row ${a.id} (action: ${action})`);
  //           return {
  //             ...a,
  //             visitor_give_access: actionMap[action], // langsung sync ke nilai yang benar
  //           };
  //         }
  //         return a;
  //       }),
  //     );
  //   } catch (err) {
  //     console.error('❌ Access Action Error:', err);
  //     setSnackbarMsg(`Failed to ${action}.`);
  //     setSnackbarType('error');
  //     setSnackbarOpen(true);
  //   } finally {
  //     setTimeout(() => setLoadingAccess(false), 600);
  //   }
  // };
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
          height: isFullscreen ? '100vh' : '100vh', // ✅ kalau fullscreen pakai 100vh
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* LEFT SIDEBAR */}
        {/* <Box
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

            overflowY: { md: 'auto', xs: 'visible' },
            maxHeight: { md: '100%', xs: 'unset' },
          }}
        >
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
        </Box> */}

        {/* RIGHT CONTENT */}
        <Box
          flexGrow={1}
          p={3}
          sx={{
            overflow: 'auto',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid size={{ sm: 6, md: 9 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search Visitor"
                value={''}
                onClick={() => setOpenSearch(true)}
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
                    zIndex: 999,
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
            <Grid
              container
              spacing={2}
              size={{ xs: 12 }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch',
                height: '100%',
              }}
            >
              {/* 🧩 Card FR */}
              <Grid size={{ xs: 12, lg: 4.5 }}>
                <Card
                  sx={{
                    borderRadius: 2,
                    height: '100%',
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
                    <img src={FRImage} alt="FR" style={{ width: 400, height: 350 }} />
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
              <Grid size={{ xs: 12, lg: 4.5 }}>
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
                    <img src={LprImage} alt="LPR" style={{ width: 400, height: 350 }} />
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
              <Grid size={{ xs: 12, lg: 3 }}>
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
                      pb: '0 !important',
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
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mt="auto"
                    >
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
            {/* 🧩 Card QR Code (kanan) */}
          </Grid>

          <Grid container spacing={2} mt={3} sx={{ flexGrow: 1, height: '100%' }}>
            <Grid
              size={{ xs: 12, lg: 4.5 }}
              sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 1, borderRadius: 2 }}
            >
              <Card sx={{ boxShadow: 'none', p: 1, height: '100%' }}>
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
                                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Card</CustomFormLabel>
                              </Box>
                            </Box>
                            <Box>
                              {/* 🔍 Tentukan visitor aktif */}
                              {!invitationCode || invitationCode.length === 0 ? (
                                // 🟡 Kondisi 3: Belum ada aksi sama sekali (belum ada data invitationCode)
                                <></>
                              ) : invitationCode[0]?.card && invitationCode[0].card.length > 0 ? (
                                invitationCode[0].card[0]?.card_number?.trim() ? (
                                  // ✅ Kondisi 1: Sudah ada card_number
                                  <Typography sx={{ fontWeight: 600 }}>
                                    {invitationCode[0].card[0].card_number}
                                  </Typography>
                                ) : (
                                  // 🚫 Kondisi 2: Sudah ada card tapi belum di-scan → tombol hilang (kosong)
                                  <></>
                                )
                              ) : (
                                // 🟦 Kondisi 4: Sudah ada data invitation tapi belum ada card → tampil tombol
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={handleChooseCard}
                                  sx={{ mt: 0.5 }}
                                >
                                  Choose Card
                                </Button>
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
                  <CardActions sx={{ justifyContent: 'center', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                    {(() => {
                      const selectedVisitor = relatedVisitors.find(
                        (v) => v.visitor_number === selectedVisitorNumber,
                      );
                      if (
                        selectedVisitor?.is_praregister_done == null ||
                        selectedVisitor?.is_praregister_done === false
                      ) {
                        return (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleView(selectedVisitorId!)}
                          >
                            Fill Form
                          </Button>
                        );
                      }
                      return null;
                    })()}
                    {(() => {
                      const status = visitorStatus ?? invitationCode[0]?.visitor_status;

                      if (!['Checkin', 'Checkout', 'Block', 'Unblock'].includes(status)) {
                        return (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleConfirmStatus('Checkin')}
                              startIcon={<IconLogin2 />}
                            >
                              Check In
                            </Button>
                            <Button
                              variant="contained"
                              sx={{ backgroundColor: '#000' }}
                              onClick={() => handleConfirmStatus('Block')}
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
                            {/* <Button
                              variant="outlined"
                              color="success"
                              onClick={() => handleConfirmStatus('Checkin')}
                              startIcon={<IconCheck />}
                            >
                              Completed
                            </Button> */}
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleConfirmStatus('Checkout')}
                              startIcon={<IconLogout />}
                            >
                              Check Out
                            </Button>
                            <Button
                              variant="contained"
                              sx={{ backgroundColor: '#000' }}
                              onClick={() => handleConfirmStatus('Block')}
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
                              onClick={() => handleConfirmStatus('Block')}
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
                            onClick={() => handleConfirmStatus('Unblock')}
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
                            onClick={() => handleConfirmStatus('Block')}
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
            <Grid size={{ xs: 12, lg: 4.5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Card
                sx={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  overflow: 'auto',
                }}
              >
                <Box display="flex" justifyContent="space-between">
                  <CardHeader title="Related Visitors" sx={{ p: 0 }} />
                  <FormControlLabel
                    value="end"
                    control={
                      <Checkbox
                        checked={selectMultiple}
                        onChange={(e) => {
                          setSelectMultiple(e.target.checked);
                          setSelectedVisitors([]); // reset selected
                        }}
                      />
                    }
                    label="Select Multiple"
                    labelPlacement="end"
                  />
                </Box>
                <Divider sx={{ mt: 1 }} />

                <CardContent
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 0,
                    pb: '0 !important',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {relatedVisitors.map((visitor, index) => {
                    const isDriving = visitor.is_driving === true;
                    const isScanned =
                      visitor.visitor_number &&
                      scannedVisitorNumber &&
                      visitor.visitor_number === scannedVisitorNumber;
                    const isSelected = visitor.visitor_number === selectedVisitorNumber;

                    return (
                      <React.Fragment key={visitor.id || index}>
                        <ListItem
                          sx={{
                            px: 1,
                            py: 1.5,
                            borderBottom: index !== relatedVisitors.length - 1 ? 'none' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease',

                            '&:hover': {
                              backgroundColor: 'rgba(93,135,255,0.08)',
                            },
                          }}
                          onClick={() => handleSelectRelatedVisitor(visitor)}
                        >
                          {/* Avatar + Info */}
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              src={`${BASE_URL}/cdn${visitor.selfie_image}`}
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

                          {/* Checkbox + status */}
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
                                    textAlign: 'center',
                                  }}
                                >
                                  P
                                </Box>
                              )}

                              {isScanned && (
                                <Box
                                  sx={{
                                    backgroundColor: '#1976D2',
                                    color: 'white',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    px: 1,
                                    py: 0.25,
                                    fontSize: '0.75rem',
                                    textAlign: 'center',
                                  }}
                                >
                                  S
                                </Box>
                              )}
                            </Box>
                            <Checkbox
                              checked={selectedVisitors.includes(visitor.id)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;

                                if (selectMultiple) {
                                  if (isChecked) {
                                    setSelectedVisitors((prev) => [...prev, visitor.id]);
                                    console.log('selected ', selectedVisitors);
                                  } else {
                                    setSelectedVisitors((prev) =>
                                      prev.filter((id) => id !== visitor.id),
                                    );
                                  }
                                } else {
                                  if (isChecked) {
                                    setSelectedVisitors([visitor.id]);
                                    console.log('selected ', selectedVisitors);
                                    handleSelectRelatedVisitor(visitor);
                                  } else {
                                    setSelectedVisitors([]);
                                  }
                                }
                              }}
                            />
                          </Box>
                        </ListItem>

                        {/* Info bawah */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mt: 1,
                            px: 1,
                            gap: 0.5,
                            // borderBottom: '1px solid #eee',
                          }}
                        >
                          <Typography variant="body1" fontWeight="medium" sx={{ lineHeight: 1.3 }}>
                            {visitor.agenda || '-'}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ lineHeight: 1.2 }}
                          >
                            {`${formatDateTime(visitor.visitor_period_start)} - ${formatDateTime(
                              visitor.visitor_period_end,
                            )}`}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                      </React.Fragment>
                    );
                  })}
                </CardContent>
                <CardActions>
                  <Divider />
                  <Box
                    display={'flex'}
                    gap="3"
                    width={'100%'}
                    sx={{ mt: 2, justifyContent: 'space-between' }}
                  >
                    <Box display="flex" gap={2}>
                      <CustomSelect
                        sx={{ width: '150px' }}
                        value={bulkAction}
                        onChange={(e: any) => setBulkAction(e.target.value)}
                      >
                        {availableActions.map((action) => (
                          <MenuItem key={action.value} value={action.value}>
                            {action.label}
                          </MenuItem>
                        ))}
                      </CustomSelect>

                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ width: '100px' }}
                        disabled={!bulkAction || selectedVisitors.length === 0}
                        onClick={handleApplyBulkAction}
                      >
                        Apply
                      </Button>
                    </Box>
                    <Box display={'flex'} gap={1} alignItems={'center'}>
                      <Button variant="outlined" color="primary">
                        Card
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenAccessData(true)}
                      >
                        Access
                      </Button>
                    </Box>
                  </Box>
                </CardActions>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 3 }} sx={{ height: '100%' }}>
              <Grid container direction="column" spacing={2} sx={{ height: '100%', flexGrow: 1 }}>
                <Grid sx={{ flex: 1, display: 'flex' }}>
                  <Card
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      maxHeight: '100%',
                    }}
                  >
                    <CardContent
                      sx={{
                        flex: 1,
                        p: 0,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        pb: '0 ! important',
                      }}
                    >
                      <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Faceimage</CustomFormLabel>
                      {invitationCode[0]?.selfie_image ? (
                        <img
                          src={`${BASE_URL}/cdn${invitationCode[0].selfie_image}`}
                          alt="Faceimage"
                          style={{
                            width: '100%',
                            height: isFullscreen ? '100%' : '200px',
                            // maxHeight: '100%',
                            borderRadius: '8px',
                            objectFit: isFullscreen ? 'contain' : 'cover',
                            // overflow: 'hidden',
                          }}
                        />
                      ) : (
                        <></>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid sx={{ flex: 1, display: 'flex' }}>
                  <Card
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      maxHeight: '100%',
                    }}
                  >
                    <CardContent
                      sx={{
                        flex: 1,
                        p: 0,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        pb: '0 ! important',
                      }}
                    >
                      <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>KTP</CustomFormLabel>
                      {invitationCode[0]?.identity_image ? (
                        <img
                          src={`${BASE_URL}/cdn${invitationCode[0].identity_image}`}
                          alt="Faceimage"
                          style={{
                            width: '100%',
                            height: isFullscreen ? '100%' : '200px',
                            borderRadius: '8px',
                            objectFit: isFullscreen ? 'contain' : 'cover',
                          }}
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

      <SearchVisitorDialog
        open={openSearch}
        onClose={() => setOpenSearch(false)}
        onSearch={(data) => {
          setVisitorData(data);
          setOpenDetail(true); // langsung buka detail
        }}
      />

      {/* Dialog Detail */}
      <DetailVisitorDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        visitorData={visitorData}
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

      {/* Fill Form */}
      <Dialog
        open={openFillForm}
        onClose={() => setOpenFillForm(false)}
        fullWidth
        maxWidth={false} // penting agar tidak dibatasi ukuran default MUI
        PaperProps={{
          sx: {
            width: '100vw', // bisa ubah jadi 100vw kalau mau full
            // maxWidth: '1900px', // misal lebih besar dari xl
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>Fill Pre-Registration Form</DialogTitle>
        <IconButton
          aria-label="close"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          onClick={() => setOpenFillForm(false)}
        >
          <IconX />
        </IconButton>
        <DialogContent dividers>
          {fillFormData.length > 0 && (
            <>
              <Stepper activeStep={fillFormActiveStep} alternativeLabel sx={{ mb: 3 }}>
                {fillFormData.map((s, i) => (
                  <Step key={i}>
                    <StepLabel
                      onClick={() => setFillFormActiveStep(i)}
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontSize: '0.9rem !important', // ubah ukuran di sini, misal 16px = 1rem
                          fontWeight: 600,
                          cursor: 'pointer',
                        },
                      }}
                    >
                      {s.name}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              <Box>
                {(() => {
                  const section = fillFormData[fillFormActiveStep];
                  if (!section) return null;

                  const sectionType = getSectionType(section);
                  if (sectionType === 'visitor_information_group') {
                    // ✅ langsung reuse potongan yang kamu pakai untuk render Visitor Info Group
                    return (
                      <Grid>
                        <Box>
                          <TableContainer component={Paper} sx={{ mb: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  {(
                                    fillFormDataVisitor[0]?.question_page?.[fillFormActiveStep]
                                      ?.visit_form ||
                                    formsOf(section) ||
                                    []
                                  ).map((f: any, i: any) => (
                                    <TableCell key={i}>
                                      <Typography variant="subtitle2" fontWeight={600}>
                                        {f.long_display_text}
                                      </Typography>
                                    </TableCell>
                                  ))}
                                  {/* <TableCell align="right">Actions</TableCell> */}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {fillFormDataVisitor.length > 0 ? (
                                  fillFormDataVisitor.map((group, gIdx) => {
                                    const page =
                                      group.question_page?.[fillFormActiveStep] ?? section;
                                    if (!page) return null;
                                    return (
                                      <TableRow key={gIdx}>
                                        {page.form?.map((field: any, fIdx: number) => (
                                          <TableCell key={fIdx}>
                                            {renderFieldInput(
                                              field,
                                              fIdx,
                                              (idx, fieldKey, value) => {
                                                setFillFormDataVisitor((prev) => {
                                                  const next = [...prev];
                                                  const s = fillFormActiveStep;
                                                  next[gIdx].question_page[s].form[fIdx] = {
                                                    ...next[gIdx].question_page[s].form[fIdx],
                                                    [fieldKey]: value,
                                                  };
                                                  return next;
                                                });
                                              },
                                              undefined,
                                              {
                                                showLabel: false,
                                                uniqueKey: `${fillFormActiveStep}:${gIdx}:${fIdx}`,
                                              },
                                            )}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    );
                                  })
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={12} align="center">
                                      No visitor data. Click “Add New” to start.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Grid>
                    );
                  } else if (sectionType === 'purpose_visit') {
                    const mergedVisitForm = formsOf(section);
                    return (
                      <Grid container spacing={2} sx={{ px: 1 }}>
                        {mergedVisitForm.map((f: any, idx: number) => (
                          <Grid size={{ xs: 12 }} key={idx}>
                            <Box display="flex" flexDirection="column" gap={0.5}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {f.long_display_text}
                              </Typography>

                              {/* Semua input jadi disabled */}
                              <Box sx={{ pointerEvents: 'none', opacity: 0.6 }}>
                                {renderFieldInput(
                                  f,
                                  idx,
                                  () => {}, // disable onChange
                                  undefined,
                                  { showLabel: false, uniqueKey: `${fillFormActiveStep}:${idx}` },
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    );
                  }

                  return null;
                })()}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => setFillFormActiveStep((p) => Math.max(p - 1, 0))}
            disabled={fillFormActiveStep === 0}
          >
            Back
          </Button>
          {fillFormActiveStep < fillFormData.length - 1 ? (
            <Button variant="contained" onClick={() => setFillFormActiveStep((p) => p + 1)}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleSubmitPramultiple}>
              Submit
            </Button>
          )}
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
          {selectedInvitationId ? ( // ✅ pakai ID dari row yang di-klik
            <FormDialogPraregist
              id={selectedInvitationId}
              onClose={() => setOpenDialogInvitation(false)}
              onSubmitted={async () => {
                setOpenDialogInvitation(false);
                // setInvitationDetailVisitor([]); // optional: reload / clear
                await fetchRelatedVisitorsByInvitationId(invitationCode[0]?.id);
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

      {/* Access */}
      <Dialog
        open={openAccessData}
        onClose={() => setOpenAccessData(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Access</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenAccessData(false)}
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
          {/* <AccessDataTable visitorId={selectedVisitorIdForAccessData} /> */}
          <DynamicTable
            data={accessData}
            isHaveChecked={true}
            isHaveHeaderTitle={true}
            titleHeader="Access"
            overflowX="auto"
            isHaveAccess={true}
            onAccessAction={handleAccessAction}
            onCheckedChange={(checkedRows) => {
              const ids = checkedRows.map((r) => r.access_control_id);
              setSelectedAccessIds(ids);
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CustomSelect
              sx={{ width: '30%', p: 0, mt: 2, backgroundColor: 'white' }}
              value={selectedActionAccess}
              onChange={(e: any) => setSelectedActionAccess(e.target.value)}
              displayEmpty
              disabled={!selectedAccessIds.length}
            >
              <MenuItem value="">Select Action</MenuItem>
              <MenuItem value="grant" disabled={!allowedActions.includes('Grant')}>
                Grant
              </MenuItem>
              <MenuItem value="revoke" disabled={!allowedActions.includes('Revoke')}>
                Revoke
              </MenuItem>
              <MenuItem value="block" disabled={!allowedActions.includes('Block')}>
                Block
              </MenuItem>
            </CustomSelect>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                if (!selectedAccessIds.length || !selectedActionAccess) {
                  setSnackbarMsg('Please select rows and an action first.');
                  setSnackbarType('info');
                  setSnackbarOpen(true);
                  return;
                }

                // Jalankan handleAccessAction secara berurutan agar state tidak race
                for (const id of selectedAccessIds) {
                  const row = accessData.find((r) => r.access_control_id === id);
                  if (row) {
                    await handleAccessAction(row, selectedActionAccess.toLowerCase() as any);
                  }
                }
              }}
              sx={{ mb: 0, mt: 2 }}
              disabled={!selectedAccessIds.length || !selectedActionAccess}
            >
              Apply
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={8000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            zIndex: 99999,
            position: 'fixed',
            top: 20,
            left: 0,
            right: 0,
            margin: '0 auto',
            maxWidth: 500,
            '& .MuiPaper-root': {
              minWidth: 420,
              maxWidth: 600,
              fontSize: '1rem',
              whiteSpace: 'pre-line', // 🟢 ini penting banget
              lineHeight: 1.5,
              p: 2.5,
              borderRadius: 2,
            },
          }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarType}
            variant="filled"
            sx={{ width: '100%', fontSize: '16px', whiteSpace: 'pre-line' }}
          >
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Portal>
      <Portal>
        <Backdrop
          sx={{
            zIndex: 99999,
            position: 'fixed',
            margin: '0 auto',
          }}
          open={loadingAccess}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default OperatorView;
