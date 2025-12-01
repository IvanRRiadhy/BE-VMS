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
  Tooltip,
  Select,
} from '@mui/material';
import { Box, useMediaQuery, useTheme, width } from '@mui/system';
// import { t } from 'i18next';
import moment from 'moment-timezone';
import backgroundnodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import infoPic from 'src/assets/images/backgrounds/info_pic.png';
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
  IconClipboard,
  IconClock,
  IconCreditCard,
  IconForbid2,
  IconGenderMale,
  IconHome,
  IconInfoCircle,
  IconKey,
  IconLicense,
  IconLogin2,
  IconLogout,
  IconMapPin,
  IconMapPinCheck,
  IconNumbers,
  IconParking,
  IconPhone,
  IconQrcode,
  IconQuestionMark,
  IconReport,
  IconSearch,
  IconTicket,
  IconTimeDuration0,
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  createGiveAccessOperator,
  createGrandAccessOperator,
  createInvitationActionOperator,
  createMultipleGrantAccess,
  createMultipleInvitationActionOperator,
  createSubmitCompletePraMultiple,
  extendPeriodOperator,
  getAvailableCardOperator,
  getInvitationCode,
  getInvitationOperatorRelated,
  getPermissionOperator,
  getTodayVisitingPurpose,
} from 'src/customs/api/operator';
import { BASE_URL, axiosInstance2 } from 'src/customs/api/interceptor';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import LprImage from 'src/assets/images/products/pic_lpr.png';
import FRImage from 'src/assets/images/products/pic_fr.png';
import SearchVisitorDialog from './Dialog/SearchVisitorDialog';
import DetailVisitorDialog from './Dialog/DetailVisitorDialog';
import Swal from 'sweetalert2';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { getDetailInvitationForm } from 'src/customs/api/visitor';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import {
  CreateVisitorRequest,
  CreateVisitorRequestSchema,
  FormVisitor,
  SectionPageVisitor,
} from 'src/customs/api/models/Admin/Visitor';
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
import {
  getAllSite,
  getRegisteredSite,
  getVisitorEmployee,
  getAllVisitorType,
  updateExtend,
} from 'src/customs/api/admin';
import Webcam from 'react-webcam';
import FormDialogInvitation from '../Employee/FormDialogInvitation';
import FormDialogPraregist from './Dialog/FormDialogPraregist';
import CameraUpload from './Components/CameraUpload';
import { showSwal } from 'src/customs/components/alerts/alerts';
import FormWizardAddVisitor from './Invitation/FormWizardAddVisitor';
import FormWizardAddInvitation from './Invitation/FormWizardAddInvitation';
import ScanQrVisitorDialog from './Dialog/ScanQrVisitorDialog';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import SelectRegisteredSiteDialog from './Dialog/SelectRegisteredSiteDialog';
import VisitingPurposeDialog from './Dialog/VisitingPurposeDialog';
import SwiperComponent from './Components/SwiperComponent';
import InfoDialog from './Dialog/InfoDialog';
import ExtendVisitDialog from './Dialog/ExtendVisitDialog';
import { useTranslation } from 'react-i18next';
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
// dayjs.locale('id');
const OperatorView = () => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const secdrawerWidth = 320;
  const { token } = useSession();
  const { t } = useTranslation();

  // 🔔 Dummy data Alarm dan History
  const alarms = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Alarm #${i + 1}`,
    message: `Beacon ${100 + i} memasuki area terlarang.`,
    time: `2025-10-21 ${10 + i}:00`,
    type: i % 2 === 0 ? 'Critical' : 'Warning',
  }));

  const dataImage = [infoPic, infoPic, infoPic];

  const histories = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Event #${i + 1}`,
    message: `Beacon ${200 + i} keluar dari area ${i % 3 === 0 ? 'A1' : 'B2'}.`,
    time: `2025-10-21 ${8 + i}:15`,
  }));

  const [invitationCode, setInvitationCode] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [wizardKey, setWizardKey] = useState(0);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
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
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [uploadMethods, setUploadMethods] = useState<Record<string, 'file' | 'camera'>>({});
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [openAccessData, setOpenAccessData] = useState(false);
  const [accessData, setAccessData] = useState<any[]>([]);
  const [selectedActionAccess, setSelectedActionAccess] = useState<string | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [openExtendVisit, setOpenExtendVisit] = useState(false);
  const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180];
  const [loading, setLoading] = useState(false);
  const [openFillForm, setOpenFillForm] = useState(false);
  const [fillFormData, setFillFormData] = useState<any[]>([]);
  const [fillFormActiveStep, setFillFormActiveStep] = useState(0);
  const [fillFormGroupedPages, setFillFormGroupedPages] = useState<any>({});
  const [fillFormDataVisitor, setFillFormDataVisitor] = useState<any[]>([]);
  const [dataVisitor, setDataVisitor] = useState<{ question_page: SectionPageVisitor[] }[]>([]);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [flowTarget, setFlowTarget] = useState<'invitation' | 'preReg' | null>(null);
  const [siteData, setSiteData] = useState<any[]>([]);
  const [openDialogInfo, setOpenDialogInfo] = useState(false);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });

  const [dialogContainer, setDialogContainer] = useState<HTMLElement | null>(null);
  const [hidePageContainer, setHidePageContainer] = useState(false);
  useEffect(() => {
    const handleBrowserFullscreen = () => {
      const isBrowserFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isBrowserFullscreen);

      // jika user fullscreen manual (F11)
      if (isBrowserFullscreen) {
        setHidePageContainer(true);
      } else {
        setHidePageContainer(false);
      }
    };

    document.addEventListener('fullscreenchange', handleBrowserFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleBrowserFullscreen);
  }, []);

  function getColorByName(name: string) {
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);

    return `hsl(${hue}, 70%, 55%)`; // solid warna, tidak gradient
  }

  useEffect(() => {
    if (containerRef.current) {
      setDialogContainer(containerRef.current);
    }
  }, [containerRef]);

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMinutes) return;
    if (!selectedVisitors || selectedVisitors.length === 0) {
      setSnackbarMsg('No visitor selected.');
      setSnackbarType('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoadingAccess(true);
      const payload = {
        id: selectedVisitors[0],
        period: selectedMinutes,
        apply_to_all: applyToAll,
      };

      console.log('📤 Sending extend payload:', payload);

      await extendPeriodOperator(token as string, payload);

      // ✅ update UI lokal
      setRelatedVisitors((prev) =>
        prev.map((v) =>
          selectedVisitors.includes(v.id)
            ? {
                ...v,
                extend_visitor_period: (v.extend_visitor_period ?? 0) + selectedMinutes,
              }
            : v,
        ),
      );

      setInvitationCode((prev) =>
        prev.map((item) =>
          selectedVisitors.includes(item.id)
            ? {
                ...item,
                extend_visitor_period: (item.extend_visitor_period ?? 0) + selectedMinutes,
              }
            : item,
        ),
      );

      showSwal('success', `Visit extended by ${selectedMinutes} minutes`);
      setOpenExtendVisit(false);
      setSelectedMinutes(null);
    } catch (error: any) {
      console.error('❌ Error extending visit:', error);

      // default message jika tidak ada response
      let msg = 'Failed to extend visit.';
      let status = null;

      // jika ada response dari backend
      if (error.response && error.response.data) {
        msg = error.response.data.msg || error.response.data.message || msg;
        status = error.response.data.status;
      }

      setSnackbarMsg(msg);
      setSnackbarType('error');
      setSnackbarOpen(true);
    } finally {
      setTimeout(() => setLoadingAccess(false), 600);
    }
  };

  const handleSuccess = async () => {
    setSelectedSite(null);
    setFormDataAddVisitor((prev: any) => ({
      ...prev,
      registered_site: '', // reset registered site
    }));
    // setRefreshTrigger((prev) => prev + 1);
    handleCloseDialog();
    await fetchTodayVisitingPurpose();
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await getVisitorEmployee(token as string);
      setAllVisitorEmployee(res?.collection ?? []);
    };
    fetchData();
  }, [token]);

  const [tableKey, setTableKey] = useState(0);
  const [nextDialogOpen, setNextDialogOpen] = useState(false);
  const handleCloseGrantDialog = () => {
    setNextDialogOpen(false);
    setSelectedInvitations([]);
    setSelectedCards([]);
  };

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
      extend_visitor_period: number;
      visitor_status: string;
      block_by: string;
      is_block: boolean;
    }[]
  >([]);

  // useEffect(() => {
  //   const handleFullscreenChange = () => {
  //     setIsFullscreen(!!document.fullscreenElement);
  //   };
  //   document.addEventListener('fullscreenchange', handleFullscreenChange);
  //   return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  // }, []);

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

  const handleCloseDialog = () => {
    localStorage.removeItem('unsavedVisitorData');
    setSelectedSite(null);
    // setOpenDialog(false);
    setFormDataAddVisitor(CreateVisitorRequestSchema.parse({}));
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    setOpenDialogIndex(null);
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

  const resetSelections = () => {
    setSelectedCards([]);
  };

  const [selectedInvitations, setSelectedInvitations] = useState<any[]>([]);

  const handleSelectInvitation = (payload: Row[]) => {
    console.group('onCheckedChange');
    console.log('raw payload (rows):', payload);
    console.groupEnd();

    setSelectedInvitations(payload); // langsung array of row
  };

  const handleCloseChooseCard = () => {
    setOpenChooseCardDialog(false);
    resetSelections();
  };

  const handleChooseCard = async () => {
    if (!invitationCode.length) {
      setSnackbarMsg('No visitor data found. Please scan QR first.');
      setSnackbarType('info');
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoadingAccess(true); // ⏳ Mulai loading

      // const invitationId = invitationCode?.[0]?.id;
      // if (invitationId) {
      //   await fetchRelatedVisitorsByInvitationId(invitationId);
      // }

      // Pastikan daftar kartu dikosongkan (opsional)
      setSelectedCards([]);

      setOpenChooseCardDialog(true); // 🔓 Buka modal setelah data selesai diambil
    } catch (error) {
      console.error('❌ Gagal mengambil data visitor:', error);
      setSnackbarMsg('Failed to fetch visitor data. Please try again.');
      setSnackbarType('error');
      setSnackbarOpen(true);
    } finally {
      setTimeout(() => setLoadingAccess(false), 200); // ✅ Hentikan loading setelah sedikit jeda
    }
  };

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

    if (openChooseCardDialog) {
      fetchData(); // ✅ refresh setiap kali dialog dibuka
    }
  }, [token, openChooseCardDialog]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getRegisteredSite(token as string);
      // const response = await getAllSite(token as string);
      setSiteData(response.collection);
    };
    fetchData();
  }, []);

  const fetchAvailableCards = async () => {
    const res = await getAvailableCardOperator(token as string);
    setAvailableCards(res.collection);
  };

  const filteredCards = availableCards.filter((card) =>
    [card.remarks, card.card_number, card.card_mac]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleToggleCard = (cardNumber: string) => {
    setSelectedCards((prev) => {
      const normalized = String(cardNumber);
      const maxCards = selectedVisitors.length || 1;

      // Jika sudah dipilih → hapus dari array
      if (prev.includes(normalized)) {
        return prev.filter((c) => c !== normalized);
      }

      // Jika sudah mencapai batas maksimal
      if (prev.length >= maxCards) {
        setSnackbarMsg(`You can only select up to ${maxCards} card${maxCards > 1 ? 's' : ''}.`);
        setSnackbarType('info');
        setSnackbarOpen(true);
        return prev; // tidak menambahkan kartu baru
      }

      // Jika masih bisa → tambahkan
      return [...prev, normalized];
    });
  };

  const [currentAction, setCurrentAction] = useState<'Checkin' | 'Checkout' | null>(null);
  const [showExtendButton, setShowExtendButton] = useState(false);
  const [actionButton, setActionButton] = useState<any | null>(null);

  const handleOpenAction = (value: string) => {
    setActionButton(value);
    setOpenDialogIndex(1);
  };

  const handleActionClick = (action: 'Checkin' | 'Checkout') => {
    setCurrentAction(action);
    setOpenDialogIndex(1);
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

      setInvitationCode(data);
      setVisitorStatus(data[0]?.visitor_status ?? null);
      setSelectedVisitorNumber(data[0]?.visitor_number ?? null);
      setScannedVisitorNumber(data[0]?.visitor_number ?? null);

      await fetchRelatedVisitorsByInvitationId(invitationId);

      if (currentAction) {
        setSelectedVisitors([invitationId]);
        await handleConfirmStatus(currentAction);
        setCurrentAction(null);
        handleCloseScanQR();
        return;
      }

      if (actionButton == 'extend') {
        setSelectedVisitors([invitationId]);
        setOpenExtendVisit(true);
        setActionButton(null);
        handleCloseScanQR();
        return;
      } else if (actionButton == 'card') {
        setSelectedVisitors([invitationId]);
        handleChooseCard();
        setActionButton(null);
        handleCloseScanQR();
        return;
      } else if (actionButton == 'access') {
        setSelectedVisitors([invitationId]);
        setOpenAccessData(true);
        setActionButton(null);
        handleCloseScanQR();
        return;
      }

      setInvitationCode((prev) =>
        prev.map((inv) => {
          if (inv.id?.toLowerCase() !== invitationId.toLowerCase()) return inv;
          const matchedVisitor = relatedVisitors.find(
            (v) => v.id?.toLowerCase() === invitationId.toLowerCase(),
          );
          return matchedVisitor ? { ...inv, card: matchedVisitor.card ?? [] } : inv;
        }),
      );

      const accessList = Array.isArray(invitation.access) ? invitation.access : [invitation.access];
      // console.log('🧩 accessList:', accessList);

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
          disabled: !perm,
        };
      });

      // console.log('🧩 mergedAccess:', mergedAccess);
      setAccessData([...mergedAccess]);
      if (invitation?.id) {
        setSelectedVisitors((prev) => {
          if (!prev.includes(invitation.id)) {
            const updated = [...prev, invitation.id];
            return updated;
          }
          return prev;
        });
      }
      handleCloseScanQR();

      showSwal('success', 'Code scanned successfully.');
      setShowExtendButton(true);
    } catch (e) {
      // setSnackbarMsg('Your code does not exist.');
      // setSnackbarType('error');
      // setSnackbarOpen(true);
      showSwal('error', 'Your code does not exist.');
    }
  };

  useEffect(() => {
    if (!relatedVisitors.length) return;

    // Pastikan hanya ID yang masih ada di data baru yang tetap dipilih
    setSelectedVisitors((prevSelected) =>
      prevSelected.filter((id) => relatedVisitors.some((v) => v.id === id)),
    );
  }, [relatedVisitors]);

  const [allAccessData, setAllAccessData] = useState<any[]>([]);

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
      extend_visitor_period: v.extend_visitor_period ?? 0,
      visitor_number: v.visitor_number ?? '-',
      email: v.visitor?.email ?? '-',
      phone: v.visitor?.phone ?? '-',
      gender: v.visitor?.gender ?? '-',
      address: v.visitor?.address ?? '-',
      visitor_status: v.visitor_status ?? '-',
      // card: (v.card ?? []).map((c: any) => c.card_number),
      card: v.card ?? [],
      is_praregister_done: v.is_praregister_done ?? false,
      access: v.access ?? [],
      block_by: v.block_by ?? null,
      is_block: v.is_block ?? false,
    }));

    setInvitationCode((prev) =>
      prev.map((inv) => {
        const updatedVisitor = mappedVisitors.find(
          (v: any) =>
            v.id?.toLowerCase() === inv.id?.toLowerCase() ||
            v.trx_visitor_id?.toLowerCase?.() === inv.id?.toLowerCase(),
        );

        if (!updatedVisitor) return inv;

        return {
          ...inv,
          // 🔹 tambahkan update image agar UI langsung berubah
          selfie_image: updatedVisitor.selfie_image,
          identity_image: updatedVisitor.identity_image,
          // 🔹 update field status lainnya juga
          // is_praregister_done: updatedVisitor.is_praregister_done,
          // visitor_status: updatedVisitor.visitor_status,
          // block_by: updatedVisitor.block_by,
          // is_block: updatedVisitor.is_block,
          card: updatedVisitor.card?.length > 0 ? updatedVisitor.card : inv.card ?? [],
        };
      }),
    );

    setRelatedVisitors(mappedVisitors);
    console.log('related visitor', mappedVisitors);

    // 🔹 Gabungkan semua access dari semua visitor
    const allAccess = relatedData.flatMap((v: any) =>
      (v.access ?? []).map((a: any) => ({
        id: a.id ?? '-',
        trx_visitor_id: (a.trx_visitor_id || v.id)?.toLowerCase(), // ✅ pastikan lowercase
        access_control_id: a.access_control_id?.toLowerCase(),
        access_control_name: a.access_control_name ?? '-',
        visitor_give_access: a.visitor_give_access ?? 0,
        early_access: !!a.early_access,
      })),
    );

    // console.log('🧩 allAccessData from related visitors:', allAccess);
    setAllAccessData(allAccess);
    // Set visitor pertama sebagai default
    // if (relatedData.length > 0) {
    //   const firstVisitorId = relatedData[0].id?.toLowerCase();
    //   setSelectedVisitors([firstVisitorId]);
    // }
    if (relatedData.length > 0 && selectedVisitors.length === 0) {
      const firstVisitorId = relatedData[0].id?.toLowerCase();
      setSelectedVisitors([firstVisitorId]);
    }
  };

  const formatDateTime = (dateStr?: string, extendMinutes?: number) => {
    if (!dateStr) return '-';

    const baseTime = moment.utc(dateStr);

    // Tambahkan menit hanya kalau ada extend
    if (extendMinutes && extendMinutes > 0) {
      baseTime.add(extendMinutes, 'minutes');
    }

    return baseTime
      .tz(moment.tz.guess()) // ✅ ubah ke zona waktu lokal user
      .format('DD MMM YYYY, HH:mm');
  };

  type Row = {
    id: string;
    visitor?: string;
    card: string | React.ReactNode | null;
    trx_visitor_id?: string | null;
    assigned_card_number?: string | null;
    assigned_card_remarks?: string | null;
  };

  const [searchKeyword, setSearchKeyword] = useState('');

  const [rows, setRows] = useState<Row[]>([]);

  const filteredRows = useMemo(() => {
    if (!searchKeyword) return rows;
    return rows.filter((r) => r.visitor?.toLowerCase().includes(searchKeyword.toLowerCase()));
  }, [rows, searchKeyword]);

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

      // if (!selectedVisitors.length) {
      //   setSnackbarMsg('No visitor selected.');
      //   setSnackbarType('info');
      //   setSnackbarOpen(true);
      //   return;
      // }

      setLoadingAccess(true);

      const alreadyHasCard: string[] = [];
      const successAssigned: string[] = [];
      let response: any = null;

      if (selectedVisitors.length > 1) {
        // 🧩 Multiple visitor (batch)
        const dataPayload: { card_number: string; trx_visitor_id: string }[] = [];
        const pairCount = Math.min(selectedVisitors.length, selectedCards.length);

        for (let i = 0; i < pairCount; i++) {
          const visitorId = selectedVisitors[i];
          const cardNumber = selectedCards[i];
          const visitor = relatedVisitors.find(
            (v) => v.id?.toLowerCase() === visitorId.toLowerCase(),
          );
          if (!visitor) continue;

          if (visitor.card && visitor.card.length > 0) {
            alreadyHasCard.push(visitor.name || visitorId);
            continue;
          }

          dataPayload.push({ card_number: String(cardNumber), trx_visitor_id: visitorId });
          successAssigned.push(visitor.name || visitorId);
        }

        if (dataPayload.length === 0) {
          setSnackbarMsg('All selected visitors already have a card.');
          setSnackbarType('info');
          setSnackbarOpen(true);
          setLoadingAccess(false);
          return;
        }

        response = await createMultipleGrantAccess(token as string, { data: dataPayload });
      } else {
        // 🧍 Single visitor (selected OR scanned)
        const visitorId = invitationCode[0]?.id;

        if (!visitorId) {
          setSnackbarMsg('No visitor found to assign card.');
          setSnackbarType('info');
          setSnackbarOpen(true);
          setLoadingAccess(false);
          return;
        }

        const visitor = relatedVisitors.find(
          (v) => v.id?.toLowerCase() === visitorId.toLowerCase(),
        );

        if (!visitor) {
          setSnackbarMsg('Visitor not found.');
          setSnackbarType('error');
          setSnackbarOpen(true);
          setLoadingAccess(false);
          return;
        }

        if (visitor.card && visitor.card.length > 0) {
          alreadyHasCard.push(visitor.name || visitorId);
        } else {
          for (const cardNumber of selectedCards) {
            const payload = {
              card_number: String(cardNumber),
              trx_visitor_id: visitorId,
            };

            response = await createGrandAccessOperator(token as string, payload);
            console.log('response:', JSON.stringify(payload, null, 2));
          }

          successAssigned.push(visitor.name || visitorId);
        }
      }

      // 🔁 Refresh visitors setelah semua selesai
      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        await fetchRelatedVisitorsByInvitationId(invitationId);
      }

      await fetchAvailableCards();

      if (response?.collection && response.collection.length > 0) {
        const messages = response.collection.map((item: any) => item.message).join(', ');
        // setSnackbarMsg(`⚠️ ${messages}`);
        // setSnackbarType('error');
        showSwal('error', `${messages}`);
        // setSnackbarOpen(true);
        setLoadingAccess(false);
        return;
      }

      // handleCloseChooseCard();
      const uniqueAssigned = Array.from(new Set(successAssigned));
      const uniqueSkipped = Array.from(new Set(alreadyHasCard));

      // 🧾 Build final message
      let message = '';

      if (uniqueAssigned.length > 0) {
        message += `Successfully assigned ${uniqueAssigned.length} card(s):\n`;

        // 🧩 Fallback kalau selectedVisitors kosong → pakai invitationCode
        const visitorListForMessage =
          selectedVisitors.length > 0 ? selectedVisitors : invitationCode?.map((i) => i.id) || [];

        message += visitorListForMessage
          .map((visitorId, idx) => {
            const visitor = relatedVisitors.find(
              (v) => v.id?.toLowerCase() === visitorId?.toLowerCase(),
            );
            const cardNumber = selectedCards[idx] || selectedCards[0] || '-';

            if (visitor && !alreadyHasCard.includes(visitor.name || visitorId)) {
              return `• ${visitor.name || visitorId} - (Card: ${cardNumber})`;
            }
            return null;
          })
          .filter(Boolean)
          .join('\n');
      }

      if (uniqueSkipped.length > 0) {
        message +=
          (message ? '\n\n' : '') +
          `⚠️ Some visitors were skipped because they already have an assigned card:\n` +
          uniqueSkipped.map((v) => `• ${v}`).join('\n');
      }

      // If no success or skipped, show generic
      if (!message) {
        message = 'No cards were assigned.';
      }

      // Show Snackbar
      showSwal('success', message);
      // setSnackbarMsg(message);
      // setSnackbarType(uniqueAssigned.length > 0 ? 'success' : 'info');
      // setSnackbarOpen(true);

      setInvitationCode((prev) => {
        if (!prev || prev.length === 0) return prev;

        return prev.map((inv) =>
          selectedVisitors.some((vId) => vId.toLowerCase() === inv.id?.toLowerCase())
            ? {
                ...inv,
                card: [
                  {
                    ...(inv.card?.[0] || {}),
                    card_number: selectedCards[0],
                  },
                ],
              }
            : inv,
        );
      });

      handleCloseChooseCard();
    } catch (err) {
      console.error('Assign card error:', err);
      setSnackbarMsg('Failed to assign card(s).');
      setSnackbarType('error');
      setSnackbarOpen(true);
    } finally {
      setTimeout(() => setLoadingAccess(false), 600);
    }
  };

  const handleClearAll = () => {
    setQrValue('');
    setSearch('');
    setQrMode('manual');
    setHasDecoded(false);
    setInvitationCode([]);
    setRelatedVisitors([]);
    setOpen(false);
    setOpenDialogIndex(null);
    setOpenDetailSearching(false);
    setTabValue(0);
    setFacingMode('environment');
    setTorchOn(false);
  };

  const handleConfirmStatus = async (action: 'Checkin' | 'Checkout' | 'Block' | 'Unblock') => {
    const id = selectedVisitorId ?? invitationCode?.[0]?.id;
    const actionLabelMap: Record<string, string> = {
      Checkin: 'check in',
      Checkout: 'check out',
      Block: 'block this visitor',
      Unblock: 'unblock this visitor',
    };

    let reason = '';

    try {
      if (action === 'Block' || action === 'Unblock') {
        const { value: inputReason } = await Swal.fire({
          imageUrl: '/assets/images/BI_Logo.png',
          imageWidth: 80,
          imageHeight: 80,
          imageAlt: 'BI Logo',
          target: containerRef.current,
          title: action === 'Block' ? 'Block Visitor' : 'Unblock Visitor',
          text:
            action === 'Block'
              ? 'Please provide a reason for blocking this visitor:'
              : 'Please provide a reason for unblocking this visitor:',
          input: 'text',
          inputPlaceholder: 'Enter reason...',
          inputAttributes: { maxlength: '200' },
          showCloseButton: true,
          showCancelButton: true,
          confirmButtonText: action,
          confirmButtonColor: action === 'Block' || action === 'Unblock' ? '#000' : '#000',
          cancelButtonText: 'Cancel',
          reverseButtons: true,
          customClass: {
            title: 'swal2-title-custom',
            popup: 'swal-popup-custom',
            closeButton: 'swal-close-red',
          },
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
          imageUrl: '/assets/images/BI_Logo.png',
          imageWidth: 80,
          imageHeight: 80,
          imageAlt: 'BI Logo',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          showCloseButton: true,
          target: containerRef.current,
          confirmButtonColor: '#4caf50',
          reverseButtons: true,
          customClass: {
            title: 'swal2-title-custom',
            popup: 'swal-popup-custom',
            closeButton: 'swal-close-red',
          },
        });

        if (!confirm.isConfirmed) return;
      }

      setLoadingAccess(true);
      const res = await createInvitationActionOperator(token as string, id!, {
        action,
        reason,
      });

      console.log('✅ Action Response:', res);

      setRelatedVisitors((prev) =>
        prev.map((v) =>
          v.id === selectedVisitorId
            ? {
                ...v,
                visitor_status: action,
                is_block: action === 'Block' ? true : action === 'Unblock' ? false : v.is_block,
              }
            : v,
        ),
      );

      setInvitationCode((prev) => {
        if (!prev.length) return prev;
        const updated = {
          ...prev[0],
          visitor_status: action,
          is_block: action === 'Block' ? true : action === 'Unblock' ? false : prev[0].is_block,
          visitor: {
            ...prev[0].visitor,
            visitor_status: action,
            is_block:
              action === 'Block' ? true : action === 'Unblock' ? false : prev[0].visitor?.is_block,
          },
        };
        return [JSON.parse(JSON.stringify(updated))];
      });

      setSelectedVisitors((prev) => {
        if (!selectedVisitorId) return prev; // prevent undefined
        if (!prev.includes(selectedVisitorId)) {
          return [...prev, selectedVisitorId];
        }
        return prev;
      });

      setVisitorStatus(action);

      // 🔹 Refetch background sync (after small delay)
      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        const previousSelected = [...selectedVisitors];
        const previousSelectedId = selectedVisitorId;

        await new Promise((r) => setTimeout(r, 600));
        await fetchRelatedVisitorsByInvitationId(invitationId);

        setSelectedVisitors(previousSelected);
        setSelectedVisitorId(previousSelectedId);
      }
      showSwal('success', `${action} successfully.`);
    } catch (e: any) {
      const message =
        e?.response?.data?.msg ??
        e?.response?.data?.message ??
        e?.message ??
        'Failed to update visitor status.';

      showSwal('error', message);
    } finally {
      // setTimeout(() => {
      setLoadingAccess(false);
      // }, 600);
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
        // console.log('✅ Berhasil hapus file CDN:', currentUrl);
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
        block_by: visitor.block_by ?? null,
        is_block: visitor.is_block ?? false,
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

      setLoadingAccess(true);

      handleOpenFillFormDialog(validToFill.map((v) => v.id));

      setTimeout(() => {
        setLoadingAccess(false);
      }, 600);
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
        target: containerRef.current,
        reverseButtons: true,
        confirmButtonText: bulkAction === 'block' ? 'Block' : 'Unblock',
        confirmButtonColor: bulkAction === 'block' ? '#000' : '#000',
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

      setInvitationCode((prev) => {
        if (!prev.length) return prev;

        const currentVisitorId = prev[0]?.visitor?.id || prev[0]?.id;
        const updated = validForApi.find((v) => v.id === currentVisitorId);
        if (!updated) return prev;

        // 🔹 Tentukan status baru
        let newStatus = updated.visitor_status;
        if (bulkAction === 'checkin') newStatus = 'Checkin';
        else if (bulkAction === 'checkout') newStatus = 'Checkout';
        else if (bulkAction === 'block') newStatus = 'Block';
        else if (bulkAction === 'unblock') newStatus = 'Unblock';

        // 🔹 Tentukan nilai is_block baru
        let newIsBlock = prev[0]?.is_block ?? null;
        if (bulkAction === 'block') newIsBlock = 1;
        else if (bulkAction === 'unblock') newIsBlock = null;

        return [
          {
            ...prev[0],
            visitor_status: newStatus,
            is_block: newIsBlock,
            visitor: {
              ...prev[0].visitor,
              visitor_status: newStatus,
              is_block: newIsBlock,
            },
          },
        ];
      });

      // 🧾 Buat pesan hasil akhir per visitor
      const resultMessages = selectedData.map((v) => {
        const status = v.visitor_status;
        const done = v.is_praregister_done;

        switch (bulkAction) {
          case 'checkin':
            if (!done) return `${v.name} doesn't do preregistration, please do it first.`;
            if (status === 'Checkin') return `${v.name} already Check in before.`;
            if (status === 'Preregis') return ` ${v.name} successfully Check In.`;
            return `${v.name} cannot  Checkin because status is ${status}.`;

          case 'checkout':
            if (status === 'Checkin') return ` ${v.name} successfully Check Out.`;
            if (status === 'Preregis')
              return `${v.name} haven't completed pre-registration yet. Please fill out the form first.`;
            if (status === 'Checkout') return ` ${v.name} already Check Out before.`;
            return `${v.name}  cannot Checkin because status is ${status}. `;

          case 'block':
            return ` ${v.name} successfully block.`;

          case 'unblock':
            return `${v.name} successfully unblock.`;

          default:
            return `${v.name} dilewati.`;
        }
      });

      // 🔔 Tampilkan semua pesan sekaligus di snackbar
      showSwal('success', resultMessages.join('\n'));
      // setSnackbarMsg(resultMessages.join('\n'));
      // setSnackbarType('info');
      // setSnackbarOpen(true);

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
      console.error('Multiple Action Failed:', error);
      toast('Failed to perform multiple action', 'error');
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

  // 🧮 Set hasil aksi
  let actions = new Set<string>();

  // ===================================================
  // 🧩 1️⃣ SINGLE SELECTION
  // ===================================================
  if (selectedData.length === 1) {
    const v = selectedData[0];
    // console.log('tes', v);

    // Jika visitor belum pra-register → tampilkan Fill Form
    if (v?.visitor_status === 'Preregis' && !v?.is_praregister_done) {
      actions.add('fill_form');
    }

    // Tambahkan aksi berdasarkan status
    (statusActions[v?.visitor_status as string] || []).forEach((a: any) => actions.add(a));

    // Untuk Preregis yang sudah pra-register → tambahkan checkin dan block
    if (v?.visitor_status === 'Preregis' && v?.is_praregister_done) {
      actions.add('checkin');
      actions.add('block');
    }

    // const isBlocked = !!(v?.is_block || v?.block_by);
    const isBlocked = !!v?.is_block;

    if (v?.visitor_status === 'Checkin' && isBlocked) {
      actions.delete('block');
      actions.add('unblock');
      actions.delete('checkout');
    }

    if (isBlocked) {
      actions.add('unblock');
      actions.delete('block');
    }
  } else if (selectedData.length > 1) {
    // // 🔸 Jika ada Preregis yang belum pra-register
    const baseStatusActions: Record<string, string[]> = {
      Checkin: ['checkout', 'block'],
      Checkout: ['block'],
      Block: ['unblock'],
      Unblock: ['block'],
    };

    const actionArrays = selectedData.map((v) => {
      const status = v?.visitor_status;
      const isBlocked = !!v?.is_block;
      const isPreregis = status === 'Preregis';

      if (isPreregis && !v?.is_praregister_done) return ['fill_form'];
      if (isPreregis && v?.is_praregister_done) return ['checkin', 'block'];
      if (isBlocked) return ['unblock'];

      return baseStatusActions[status as string] || [];
    });

    // 🔹 Ambil semua action (union)
    const union = Array.from(new Set(actionArrays.flat()));

    // 🔹 Tambahkan hasil union ke set actions
    union.forEach((a) => actions.add(a));
  }
  if (actions.size === 0) {
    actions.add('fill_form');
  }

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

  const asStr = (v: any) => (v == null ? '' : String(v));
  const sameField = (a: any, b: any) =>
    (a?.custom_field_id && b?.custom_field_id && a.custom_field_id === b.custom_field_id) ||
    (a?.remarks &&
      b?.remarks &&
      String(a.remarks).toLowerCase() === String(b.remarks).toLowerCase());

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

  const [applyToAll, setApplyToAll] = useState(false);

  const handleApplyToAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setApplyToAll(checked);
    console.log('✅ Apply to another visitor:', checked);
  };

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

    const isDrivingField = fillFormDataVisitor
      ?.flatMap((v) => v.question_page)
      ?.flatMap((q) => q.form || [])
      ?.find((f) => f.remarks === 'is_driving');

    const isDriving =
      isDrivingField?.answer_text === 'true' || isDrivingField?.answer_text === true;

    // 🔥 Hide field kendaraan jika belum pilih "Yes"
    if (!isDriving && ['vehicle_type', 'vehicle_plate'].includes(field.remarks)) {
      return null;
    }
    const isVehicleField = ['vehicle_type', 'vehicle_plate'].includes(field.remarks);
    if (!isDriving && isVehicleField) {
      return null; // tidak render apapun (label + input hilang)
    }

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
                inputVal.length < 3 ? 'Enter at least 3 characters to search.' : 'Not found'
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
                SelectProps={{
                  MenuProps: {
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        zIndex: 20000,
                      },
                    },
                  },
                }}
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

          if (field.remarks === 'is_driving' || field.remarks === 'is_employee') {
            const options = [
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ];
            const currentValue = field.answer_text ?? '';

            return (
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={currentValue}
                  row
                  sx={{ minWidth: 130 }}
                  onChange={(e) => {
                    onChange(index, 'answer_text', e.target.value);

                    setFillFormDataVisitor((prev) => {
                      return [...prev];
                    });
                  }}
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
                onChange={(url) => {
                  console.log('📸 [DEBUG] onChange CameraUpload:', {
                    field: field.remarks,
                    url,
                    sectionIdx: fillFormActiveStep,
                  });

                  onChange(index, 'answer_file', url);
                }}
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
                    {uploadNames[key] ?? ''}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
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
          );
        }

        case 12: {
          const key = opts?.uniqueKey ?? String(index);
          return (
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              gap={1.5}
              width="100%"
              sx={{ maxWidth: 400 }}
            >
              <TextField
                select
                size="small"
                value={uploadMethods[key] || 'file'}
                onChange={(e) => handleUploadMethodChange(key, e.target.value)}
                fullWidth
                sx={{
                  width: { xs: '100%', md: '200px' },
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

                  {(field.answer_file || uploadNames[key]) && (
                    <Box mt={0.5} display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {uploadNames[key] ?? field.answer_file?.split('/').pop() ?? ''}
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
      <Box
        sx={{
          overflow: 'auto',
          width: '100%',
        }}
      >
        {showLabel && (!isVehicleField || isDriving) && (
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            {field.long_display_text}
          </Typography>
        )}
        {renderInput()}
      </Box>
    );
  };

  const [selectedAccessIds, setSelectedAccessIds] = useState<string[]>([]);

  const getAllowedActions = (status: number, earlyAccess: boolean) => {
    if (earlyAccess) {
      switch (status) {
        case 0:
          return ['Revoke', 'Block'];
        case 1:
          return [];
        case 2:
        case 3:
          return [];
        default:
          return [];
      }
    }

    switch (status) {
      case 0:
        return ['Grant'];
      case 1:
        return ['Revoke', 'Block'];
      case 2:
        return [];
      case 3:
        return [];
      default:
        return [];
    }
  };

  const getAllowedActionsByPermission = (accessId: string, permissionAccess: any[]) => {
    const perm = permissionAccess.find(
      (p) => p.access_control_id?.toLowerCase() === accessId.toLowerCase(),
    );

    if (!perm) return [];

    const actions: string[] = [];
    if (perm.can_grant) actions.push('Grant');
    if (perm.can_revoke) actions.push('Revoke');
    if (perm.can_block) actions.push('Block');

    return actions;
  };

  const getAllowedActionsForAccessId = (
    accessId: string,
    selectedVisitorIds: string[],
    allAccessData: any[],
    permissionAccess: any[],
  ) => {
    const records = allAccessData.filter(
      (a) =>
        a.access_control_id?.toLowerCase() === accessId.toLowerCase() &&
        selectedVisitorIds.some(
          (v) =>
            v.toLowerCase() === a.trx_visitor_id?.toLowerCase() ||
            v.toLowerCase() === a.trxVisitorId?.toLowerCase(),
        ),
    );

    if (!records.length) return [];

    const perVisitorActions = records.map((r) =>
      getAllowedActions(r.visitor_give_access ?? 0, !!r.early_access),
    );

    // hasil intersection semua visitor
    const commonActions = perVisitorActions.reduce(
      (acc, cur) => acc.filter((x) => cur.includes(x)),
      perVisitorActions[0] || [],
    );

    // 🔹 Batasi lagi berdasarkan permission operator
    const permissionActions = getAllowedActionsByPermission(accessId, permissionAccess);

    // ✅ ambil irisan antar dua array
    return commonActions.filter((action) => permissionActions.includes(action));
  };

  const getAllowedActionsForMultiple = (
    selectedIds: string[],
    selectedVisitorIds: string[],
    allAccessData: any[],
    permissionAccess: any[],
  ) => {
    if (!selectedIds.length || !selectedVisitorIds.length) return [];

    const actionsList = selectedIds.map((id) =>
      getAllowedActionsForAccessId(id, selectedVisitorIds, allAccessData, permissionAccess),
    );

    return actionsList.reduce(
      (acc, curr) => acc.filter((x) => curr.includes(x)),
      actionsList[0] || [],
    );
  };

  const allowedActions = useMemo(() => {
    if (!selectedAccessIds.length || !selectedVisitors.length) return [];

    // 🟢 Jika lebih dari satu visitor → batasi juga oleh permission
    if (selectedVisitors.length > 1) {
      const allActions = ['Grant', 'Revoke', 'Block'];

      // Batasi berdasar permission operator
      const permissionActions = selectedAccessIds.flatMap((id) =>
        getAllowedActionsByPermission(id, permissionAccess),
      );

      // ambil irisan semua permission
      const commonPermissionActions = allActions.filter((a) =>
        permissionActions.every((perm) => perm.includes(a)),
      );

      return commonPermissionActions;
    }

    return getAllowedActionsForMultiple(
      selectedAccessIds,
      selectedVisitors,
      accessData,
      permissionAccess,
    );
  }, [selectedAccessIds, selectedVisitors, accessData, permissionAccess]);

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

      const selected = relatedVisitors.filter((v) => selectedVisitors.includes(v.id));

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
      const result = await createSubmitCompletePraMultiple(token as string, payload);
      showSwal('success', 'Successfully Pra Register!');
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

  useEffect(() => {
    if (!selectedVisitors.length) {
      setAccessData([]);
      return;
    }

    // Ambil semua access milik visitor terpilih (case-insensitive)
    const filtered = allAccessData.filter((a) =>
      selectedVisitors.some((id) => id.toLowerCase() === a.trx_visitor_id?.toLowerCase()),
    );

    // 🔹 Gabungkan access berdasarkan access_control_id, tapi simpan semua visitor-nya
    const mergedAccess = Object.values(
      filtered.reduce((acc: any, curr: any) => {
        const key = curr.access_control_id;
        if (!acc[key]) {
          acc[key] = {
            ...curr,
            visitors: [curr.trx_visitor_id],
          };
        } else {
          acc[key].visitors.push(curr.trx_visitor_id);

          // Ambil visitor_give_access dengan prioritas tertinggi (block > revoke > grant > none)
          acc[key].visitor_give_access = Math.max(
            acc[key].visitor_give_access ?? 0,
            curr.visitor_give_access ?? 0,
          );

          // Jika salah satu early_access = true, tandai true
          acc[key].early_access = acc[key].early_access || curr.early_access;
        }
        return acc;
      }, {}),
    );

    // console.log('🎯 Merged accessData (multi visitor-aware):', mergedAccess);
    setAccessData(mergedAccess);
  }, [selectedVisitors, allAccessData]);

  const validateMultiVisitorAccess = (
    accessId: string,
    visitorIds: string[],
    allAccessData: any[],
    relatedVisitors: any[],
    action: 'grant' | 'revoke' | 'block' | 'no_action' | 'unblock',
  ) => {
    const validVisitors: { visitorId: string; name: string; accessName: string }[] = [];
    const invalidVisitors: {
      visitorId: string;
      name: string;
      reason: string;
      accessName: string;
    }[] = [];
    const actionText = action.toUpperCase();

    visitorIds.forEach((visitorId) => {
      const record = allAccessData.find(
        (a) =>
          a.access_control_id?.toLowerCase() === accessId.toLowerCase() &&
          (a.trx_visitor_id?.toLowerCase() === visitorId.toLowerCase() ||
            a.trxVisitorId?.toLowerCase() === visitorId.toLowerCase()),
      );

      const visitorName =
        relatedVisitors.find((v) => v.id?.toLowerCase() === visitorId.toLowerCase())?.name ||
        `Visitor ${visitorId.slice(0, 6)}`;

      if (!record) {
        invalidVisitors.push({
          visitorId,
          name: visitorName,
          accessName: '-',
          reason: 'no access found',
        });
        return;
      }

      const { visitor_give_access, access_control_name, early_access } = record;

      // 🚫 Sudah revoke/block → skip
      if ((visitor_give_access === 2 || visitor_give_access === 3) && action !== 'unblock') {
        invalidVisitors.push({
          visitorId,
          name: visitorName,
          accessName: access_control_name,
          reason: 'already revoked/blocked',
        });
        return;
      }

      // 🚫 early_access → tidak bisa grant
      if (early_access && action === 'grant') {
        invalidVisitors.push({
          visitorId,
          name: visitorName,
          accessName: access_control_name,
          reason: 'early access, cannot grant',
        });
        return;
      }

      // 🚫 belum grant → tidak bisa revoke/block (kecuali early_access)
      if (
        (action === 'revoke' || action === 'block') &&
        visitor_give_access === 0 &&
        !early_access
      ) {
        invalidVisitors.push({
          visitorId,
          name: visitorName,
          accessName: access_control_name,
          reason: `not granted yet`,
        });
        return;
      }

      // 🚫 sudah grant → tidak bisa grant lagi
      if (action === 'grant' && visitor_give_access === 1) {
        invalidVisitors.push({
          visitorId,
          name: visitorName,
          accessName: access_control_name,
          reason: 'already granted',
        });
        return;
      }

      // ✅ Valid
      validVisitors.push({
        visitorId,
        name: visitorName,
        accessName: access_control_name,
      });
    });

    // 💬 Format pesan simple tapi informatif
    const lines: string[] = [];

    validVisitors.forEach((v) => {
      lines.push(`✅ ${v.name} (${v.accessName}): ${actionText}`);
    });

    invalidVisitors.forEach((v) => {
      lines.push(`⚠️ ${v.name} (${v.accessName}): Skipped (${v.reason})`);
    });

    return {
      validVisitors: validVisitors.map((v) => v.visitorId),
      invalidVisitors: invalidVisitors.map((v) => v.visitorId),
      message: lines.join('\n') || null,
    };
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

        // ✅ Visitor yang relevan diambil dari row.visitors (bukan hanya selectedVisitors)
        // const targetVisitors = row.visitors ?? selectedVisitors;
        const targetVisitors = allAccessData
          .filter(
            (a) =>
              a.access_control_id?.toLowerCase() === accessControlId.toLowerCase() &&
              selectedVisitors.some((v) => v.toLowerCase() === a.trx_visitor_id?.toLowerCase()),
          )
          .map((a) => a.trx_visitor_id?.toLowerCase());

        console.log(targetVisitors);

        // Jalankan validasi
        const { validVisitors, invalidVisitors, message } = validateMultiVisitorAccess(
          accessControlId,
          targetVisitors,
          allAccessData,
          relatedVisitors,
          action,
        );

        // if (message) {
        //   setSnackbarMsg(message);
        //   setSnackbarType(
        //     validVisitors.length && invalidVisitors.length
        //       ? 'info'
        //       : validVisitors.length
        //       ? 'success'
        //       : 'error',
        //   );
        //   setSnackbarOpen(true);
        // }

        if (!validVisitors.length) {
          setSnackbarMsg(message || 'No valid visitors to process.');
          setSnackbarType('error');
          setSnackbarOpen(true);
          resolve();
          return;
        }

        if (invalidVisitors.length) {
          setSnackbarMsg(
            '⚠️ Some visitors cannot perform this action:\n' + invalidVisitors.join('\n'),
          );
          setSnackbarType('info');
          setSnackbarOpen(true);
        }

        // 📨 Payload hanya untuk valid visitors
        const payload = {
          data_access: validVisitors.map((visitorId) => ({
            access_control_id: accessControlId,
            trx_visitor_id: visitorId,
            action: actionCode,
          })),
        };

        console.log('📦 Final Payload:', payload);

        const res = await createGiveAccessOperator(token as string, payload);
        console.log('✅ Access Action Response:', JSON.stringify(res, null, 2));

        const backendMsg =
          res?.collection?.[0] || res?.msg || res?.message || 'Action executed successfully.';

        setSnackbarMsg(`✅ ${backendMsg}`);
        setSnackbarType('success');
        setSnackbarOpen(true);

        // 🟢 Update accessData agar sinkron di UI
        setAccessData((prev) =>
          prev.map((a) =>
            validVisitors.includes(a.trx_visitor_id) && a.access_control_id === accessControlId
              ? { ...a, visitor_give_access: actionCode }
              : a,
          ),
        );

        setAllAccessData((prev) =>
          prev.map((a) =>
            validVisitors.includes(a.trx_visitor_id) && a.access_control_id === accessControlId
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

        setSnackbarMsg(`${backendMsg}`);
        setSnackbarType('error');
        setSnackbarOpen(true);
        resolve();
      } finally {
        setTimeout(() => setLoadingAccess(false), 600);
      }
    });
  };

  const activeVisitor =
    relatedVisitors.find((v) => v.id === selectedVisitorId) || invitationCode[0];

  const activeSelfie =
    activeVisitor?.selfie_image &&
    activeVisitor?.selfie_image !== '-' &&
    activeVisitor?.selfie_image !== ''
      ? `${BASE_URL}/cdn${activeVisitor.selfie_image}`
      : null;

  const activeKTP =
    activeVisitor?.identity_image &&
    activeVisitor?.identity_image !== '-' &&
    activeVisitor?.identity_image !== ''
      ? `${BASE_URL}/cdn${activeVisitor.identity_image}`
      : null;

  const [todayVisitingPurpose, setTodayVisitingPurpose] = useState<any[]>([]);
  // // const [todayVisitingPurpose, setTodayVisitingPurpose] = useState<any[]>([
  // //   { id: 'E54ADE95-1C51-4C51-9C26-9ED0A1C1A001', name: 'Visitor', count: 4 },
  // //   { id: '9AD65124-7251-4E11-8C48-79A2F1370002', name: 'Meeting', count: 12 },
  // //   { id: '1470E3A4-6EC1-4F5F-AE2C-43AD51360003', name: 'Delivery', count: 6 },
  // //   { id: 'FA8918BC-6E44-4DF8-BEE8-096F6D850004', name: 'Courier', count: 2 },
  // //   { id: 'C3A4601B-4F6B-48CA-9727-7C0B90490005', name: 'Maintenance', count: 8 },
  // //   { id: 'A72151C5-5214-4F3C-9D21-366DF0F70006', name: 'Guest', count: 3 },
  // // ]);
  // const moreItems = todayVisitingPurpose.slice(5);

  const [openMore, setOpenMore] = useState(false);
  const handleOpenMore = () => setOpenMore(true);

  const fetchTodayVisitingPurpose = async () => {
    try {
      const res = await getTodayVisitingPurpose(token as string);
      setTodayVisitingPurpose(res?.collection || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTodayVisitingPurpose();
    }
  }, [token]);

  const handle = useFullScreenHandle();

  return (
    <PageContainer title={'Operator View'} description={'Alarm and History Monitor'}>
      <FullScreen handle={handle}>
        <Box
          ref={containerRef}
          sx={{
            display: 'flex',
            // flexDirection: mdUp ? 'row' : 'column',
            flexDirection: { xs: 'column', md: 'row' },
            backgroundColor: '#fff',
            height: isFullscreen ? '100vh' : { lg: '100%', xs: '100%' },
            width: '100%',
            padding: '0 !important',
            // overflow: 'hidden',
            position: 'relative',
            overflow: 'visible',
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
            // p={3}
            sx={{
              overflow: isFullscreen ? 'auto' : 'hidden',
              display: 'flex',
              padding: '10px',
              flexDirection: 'column',
              // justifyContent: 'space-between',
              height: isFullscreen ? '100vh' : 'auto',
            }}
          >
            <Grid container spacing={1} mb={0}>
              <Grid size={{ xs: 12, sm: 12, xl: 10.5 }}>
                <CustomTextField
                  fullWidth
                  size="small"
                  placeholder="Search Visitor"
                  onClick={() => setOpenSearch(true)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton
                          onClick={() => setOpen(true)}
                          edge="start"
                          color="inherit"
                          sx={{ cursor: 'pointer' }}
                        >
                          <IconSearch size={20} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, xl: 1.5 }}>
                <Box
                  display="flex"
                  gap={0.5}
                  alignItems="center"
                  // flexWrap={'wrap'}
                  justifyContent={'flex-start'}
                >
                  <Tooltip
                    title="Clear data information"
                    placement="top"
                    arrow
                    slotProps={{
                      tooltip: {
                        sx: {
                          fontSize: '1rem',
                          padding: '8px 14px',
                        },
                      },
                      popper: {
                        container: containerRef.current,
                      },
                    }}
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
                  </Tooltip>
                  <Tooltip
                    title="Information Guide Operator"
                    placement="top"
                    arrow
                    slotProps={{
                      tooltip: {
                        sx: {
                          fontSize: '1rem',
                          padding: '8px 14px',
                        },
                      },
                      popper: {
                        container: containerRef.current,
                      },
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<IconInfoCircle size={25} />}
                      onClick={() => setOpenDialogInfo(true)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.2,
                      }}
                    >
                      Info
                    </Button>
                  </Tooltip>

                  <Tooltip
                    title="Tap to toggle Fullscreen"
                    placement="top"
                    arrow
                    slotProps={{
                      tooltip: {
                        sx: {
                          fontSize: '1rem',
                          padding: '8px 14px',
                        },
                      },
                      popper: {
                        container: containerRef.current,
                      },
                    }}
                  >
                    <IconButton
                      // onClick={toggleFullscreen}
                      onClick={() => {
                        if (isFullscreen) {
                          handle.exit();
                        } else {
                          handle.enter();
                        }
                      }}
                      sx={{
                        backgroundColor: '#5D87FF',
                        color: 'white',
                        borderRadius: 1,
                        width: 36,
                        height: 36,
                        '&:hover': { backgroundColor: '#4B6EE2' },
                      }}
                    >
                      <IconArrowsMaximize
                        size={20}
                        style={{
                          transform: isFullscreen ? 'rotate(45deg)' : 'none',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>

            <Grid
              container
              spacing={2}
              alignItems="stretch"
              // sx={{
              //   flex: isFullscreen ? 1 : 'unset',
              //   minHeight: 0,
              // }}
            >
              <Grid
                container
                spacing={2}
                size={{ xs: 12 }}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  height: '100%',
                  flexWrap: 'wrap',
                }}
              >
                {/* 🧩 Card FR */}
                <Grid size={{ xs: 12, lg: 4.5 }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      height: '100%',
                      maxHeight: isFullscreen ? '50vh' : { xs: '100%', sm: '100%', xl: '450px' },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        flexDirection: { xs: 'row', xl: 'row' },
                        maxHeight: isFullscreen ? '100%' : { xs: '100%', xl: '350px' },
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          maxHeight: '100%',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={FRImage}
                          alt="FR"
                          style={{
                            width: '100%',
                            maxWidth: '400px',
                            height: 'auto',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          maxHeight: '100%',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={LprImage}
                          alt="FR"
                          style={{
                            width: '100%',
                            maxWidth: '400px',
                            height: 'auto',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: 15,
                          }}
                        />
                      </Box>
                    </CardContent>
                    <CardActions
                      sx={{
                        justifyContent: 'center',
                        borderTop: '1px solid #eee',
                        py: 1,
                        mt: 1,
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

                {/* Visiting Purpose*/}
                <Grid
                  size={{ xs: 12, lg: 4.5 }}
                  sx={{
                    display: 'flex',
                    justifyContent: isFullscreen ? 'center' : 'flex-start',
                    alignItems: isFullscreen ? 'center' : 'stretch',
                    overflow: isFullscreen ? 'auto' : 'hidden',
                  }}
                >
                  <Card
                    sx={{
                      borderRadius: 2,
                      height: '100%',
                      maxHeight: isFullscreen
                        ? { xs: '100%', sm: '100%', lg: '80%', xl: '100%' }
                        : { xs: '100%', sm: '100%', xl: '450px' },
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      overflow: isFullscreen ? 'auto' : 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 0,
                        paddingBottom: '0 !important',
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid
                          size={{ xs: 12, xl: 7 }}
                          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                        >
                          <Tooltip
                            title="Scan QR to search data visitor"
                            placement="top"
                            arrow
                            slotProps={{
                              tooltip: {
                                sx: {
                                  fontSize: '1rem',
                                  padding: '8px 14px',
                                },
                              },
                            }}
                          >
                            <Button
                              variant="contained"
                              startIcon={<IconQrcode size={25} />}
                              onClick={handleOpenScanQR}
                              size="large"
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
                                width: '100%',
                                height: '55px',
                                p: 0,
                              }}
                            >
                              <Typography variant="h5" color="white">
                                Scan
                              </Typography>
                            </Button>
                          </Tooltip>
                          {todayVisitingPurpose.length === 0 ? (
                            <Card
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)',
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {/* <IconInbox size={46} color="#90A4AE" /> */}
                              <img src={backgroundnodata} alt="No Data" height="100" width="100%" />
                              <Typography
                                variant="h5"
                                fontWeight={600}
                                color="text.secondary"
                                mt={3}
                              >
                                {t('no_visit_today')}
                              </Typography>
                            </Card>
                          ) : (
                            <>
                              <Grid size={{ xs: 12 }}></Grid>
                              {todayVisitingPurpose.slice(0, 5).map((item) => (
                                <>
                                  <Card
                                    key={item.id}
                                    sx={{
                                      p: 1,
                                      borderRadius: 1,
                                      // background: 'linear-gradient(135deg, #5D87FF 0%, #4169E1 100%)',
                                      background: getColorByName(item.name),
                                      boxShadow: '0 6px 14px rgba(93, 135, 255, 0.3)',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 10px 18px rgba(93, 135, 255, 0.45)',
                                      },
                                      mb: 0,
                                    }}
                                  >
                                    <CardContent
                                      sx={{
                                        px: 2,
                                        paddingTop: '0 !important',
                                        paddingBottom: '0 !important',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                        color="white"
                                        sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                                      >
                                        {item.name}
                                      </Typography>
                                      <Typography variant="h5" fontWeight="bold" color="white">
                                        {item.count}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </>
                              ))}
                              {todayVisitingPurpose.length > 5 && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={handleOpenMore}
                                  sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                  Show All
                                </Button>
                              )}
                              <VisitingPurposeDialog
                                open={openMore}
                                onClose={() => setOpenMore(false)}
                                data={todayVisitingPurpose}
                              />
                            </>
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, xl: 5 }}>
                          <Grid container spacing={isFullscreen ? 3 : 1.5}>
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Pra Register Visitor"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                      zIndex: 9999999,
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<IconClipboard size={25} />}
                                  onClick={() => setOpenPreRegistration(true)}
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,

                                    boxShadow: '0 2px 6px rgba(0, 200, 83, 0.4)',
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                    backgroundColor: '#',
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Pra Register
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Invitation Visitor"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<IconUser size={25} />}
                                  onClick={() => setOpenDialogIndex(2)}
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,

                                    boxShadow: '0 2px 6px rgba(0, 200, 83, 0.4)',
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                    backgroundColor: '',
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Invitation
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>
                            {/* Checkin */}
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Checkin Visitor"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<IconCheck size={25} />}
                                  onClick={() => handleActionClick('Checkin')}
                                  // color="success"
                                  size="large"
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,

                                    boxShadow: '0 2px 6px rgba(0, 200, 83, 0.4)',
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                    backgroundColor: '#22C55E',
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Checkin
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>

                            {/* Checkout */}
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Checkout Visitor"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<IconX size={25} />}
                                  onClick={() => handleActionClick('Checkout')}
                                  size="large"
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,
                                    background: 'linear-gradient(135deg, #FF5252 0%, #D50000 100%)',
                                    boxShadow: '0 2px 6px rgba(255, 82, 82, 0.4)',
                                    '&:hover': {
                                      background:
                                        'linear-gradient(135deg, #D50000 0%, #B71C1C 100%)',
                                    },
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Checkout
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>

                            {/* Card */}
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Choose Card"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<IconCards size={28} />}
                                  onClick={() => handleOpenAction('card')}
                                  size="large"
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,
                                    background: 'linear-gradient(135deg, #AB47BC 0%, #6A1B9A 100%)',
                                    boxShadow: '0 2px 6px rgba(171, 71, 188, 0.4)',
                                    '&:hover': {
                                      background:
                                        'linear-gradient(135deg, #8E24AA 0%, #4A148C 100%)',
                                    },
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Card
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>

                            {/* Access */}
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Access Control"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<IconKey size={25} />}
                                  onClick={() => handleOpenAction('access')}
                                  size="large"
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,
                                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                    boxShadow: '0 2px 6px rgba(255, 152, 0, 0.4)',
                                    '&:hover': {
                                      background:
                                        'linear-gradient(135deg, #FB8C00 0%, #E65100 100%)',
                                    },
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Access
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>

                            {/* Parking */}
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Parking Information"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<IconParking size={25} />}
                                  onClick={handleOpenScanQR}
                                  size="large"
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,
                                    background: '#00ACC1',
                                    boxShadow: '0 2px 6px rgba(0, 172, 193, 0.4)',

                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Parking
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>

                            {/* Report */}
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Report Information"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<IconReport size={25} />}
                                  onClick={handleOpenScanQR}
                                  size="large"
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,
                                    background: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
                                    boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                                    '&:hover': {
                                      background:
                                        'linear-gradient(135deg, #546E7A 0%, #37474F 100%)',
                                    },
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Report
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Extend time"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem', // <<< ukuran teks tooltip
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<IconClock size={25} />}
                                  onClick={() => handleOpenAction('extend')}
                                  // color="info"
                                  size="large"
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,
                                    boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                                    background: 'linear-gradient(135deg, #FFE082 0%, #FFCA28 100%)',
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Extend
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Action for arrival visitor"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem', // <<< ukuran teks tooltip
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<IconMapPinCheck size={25} />}
                                  onClick={handleOpenScanQR}
                                  size="large"
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,
                                    boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                    backgroundColor: '#10B981',
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Arrival
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Blacklist Visitor"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem', // <<< ukuran teks tooltip
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<IconUser size={25} />}
                                  onClick={handleOpenScanQR}
                                  size="large"
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,
                                    boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                    backgroundColor: '#000',
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Blacklist
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Tooltip
                                title="Whitelist Visitor"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem', // <<< ukuran teks tooltip
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<IconUser size={25} />}
                                  onClick={handleOpenScanQR}
                                  size="large"
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,
                                    boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                                    zIndex: 999,
                                    width: '100%',
                                    height: '55px',
                                    p: 0,
                                    backgroundColor: 'gray',
                                  }}
                                >
                                  <Typography variant="h5" color="white">
                                    Whitelist
                                  </Typography>
                                </Button>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Side Right QR Code */}
                <Grid size={{ xs: 12, lg: 3 }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      height: '100%',
                      width: '100%',
                      maxHeight: isFullscreen ? '100%' : { xs: '100%', sm: '100%', xl: '450px' },
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
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
                          minHeight: 150,
                          mb: 0,
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
                              No QR/Card Available
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
                      <Divider sx={{ my: 1 }} />
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
            </Grid>

            <Grid
              container
              spacing={2}
              mt={1}
              sx={{
                flex: isFullscreen ? 1 : 'unset',
                minHeight: 0,
              }}
            >
              <Grid
                size={{ xs: 12, lg: 4.5 }}
                sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 1, borderRadius: 2 }}
              >
                <Card
                  sx={{
                    boxShadow: 'none',
                    p: 1,
                    height: '450px',
                    maxHeight: isFullscreen ? '100%' : '450px',
                  }}
                >
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
                              // alignItems={'center'}
                            >
                              <Box display="flex" gap={2} alignItems="flex-start" flexWrap={'wrap'}>
                                <IconCards />
                                <Box>
                                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Card</CustomFormLabel>
                                </Box>
                              </Box>
                              <Box>
                                {!invitationCode || invitationCode.length === 0 ? (
                                  <></>
                                ) : invitationCode[0]?.card && invitationCode[0].card.length > 0 ? (
                                  invitationCode[0].card[0]?.card_number?.trim() ? (
                                    <Box>
                                      <Typography sx={{ fontWeight: 600 }}>
                                        {invitationCode[0].card[0].card_number}
                                      </Typography>

                                      {/* {invitationCode[0]?.tracking_ble?.length > 0 &&
                                      invitationCode[0].tracking_ble[0]?.visitor_give_access ===
                                        0 && (
                                        <Button
                                          sx={{ mt: 1 }}
                                          variant="contained"
                                          color="primary"
                                          startIcon={<IconSend width={18} />}
                                        >
                                          Send Tracking
                                        </Button>
                                      )} */}
                                    </Box>
                                  ) : (
                                    <></>
                                  )
                                ) : invitationCode[0]?.visitor_status === 'Checkin' ? (
                                  // ✅ Tampilkan tombol "Choose Card" hanya kalau sudah Checkin
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={handleChooseCard}
                                    sx={{ mt: 0.5 }}
                                  >
                                    Choose Card
                                  </Button>
                                ) : (
                                  <></>
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
                                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                                  Group Code
                                </CustomFormLabel>
                                <Typography>{invitationCode[0]?.group_code || '-'}</Typography>
                              </Box>
                            </Box>
                          </Grid>

                          {/* Group Name */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box display="flex" gap={2} alignItems="flex-start">
                              <IconUser />
                              <Box>
                                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                                  Group Name
                                </CustomFormLabel>
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
                                <CustomFormLabel sx={{ mt: 0, mb: 0 }}>
                                  Period Start
                                </CustomFormLabel>
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
                                  {formatDateTime(
                                    invitationCode[0]?.visitor_period_end,
                                    invitationCode[0]?.extend_visitor_period,
                                  )}
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
                        // Tentukan sumber visitor
                        const selectedVisitor =
                          relatedVisitors.find(
                            (v) => v.visitor_number === invitationCode[0]?.visitor_number,
                          ) ||
                          relatedVisitors.find((v) => v.visitor_number === selectedVisitorNumber);

                        if (
                          selectedVisitor &&
                          (selectedVisitor.is_praregister_done == null ||
                            selectedVisitor.is_praregister_done === false)
                        ) {
                          return (
                            <Button
                              variant="contained"
                              color="primary"
                              size="large"
                              onClick={() => handleView(selectedVisitor.id)}
                            >
                              Fill Form
                            </Button>
                          );
                        }

                        const data = invitationCode[0];
                        const status = data?.visitor_status;
                        const isBlocked = !!data?.is_block;
                        const blockBy = data?.block_by ?? null;

                        if (
                          !selectedVisitor ||
                          selectedVisitor.is_praregister_done == null ||
                          selectedVisitor.is_praregister_done === false
                        ) {
                          return null;
                        }
                        if (!['Checkin', 'Checkout', 'Block', 'Unblock'].includes(status || '')) {
                          return (
                            <Box display="flex" gap={1}>
                              <Tooltip
                                title="Check In"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="large"
                                  onClick={() => handleConfirmStatus('Checkin')}
                                  startIcon={<IconLogin2 />}
                                >
                                  Check In
                                </Button>
                              </Tooltip>
                              <Tooltip
                                title="Block"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="large"
                                  sx={{ backgroundColor: '#000' }}
                                  onClick={() => handleConfirmStatus('Block')}
                                  startIcon={<IconForbid2 />}
                                >
                                  Block
                                </Button>
                              </Tooltip>
                            </Box>
                          );
                        }

                        if (status === 'Checkin' && !isBlocked) {
                          return (
                            <Box display="flex" gap={1}>
                              <Tooltip
                                title="Check Out"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="large"
                                  onClick={() => handleConfirmStatus('Checkout')}
                                  startIcon={<IconLogout />}
                                >
                                  Check Out
                                </Button>
                              </Tooltip>
                              <Tooltip
                                title="Block"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="large"
                                  sx={{ backgroundColor: '#000' }}
                                  onClick={() => handleConfirmStatus('Block')}
                                  startIcon={<IconForbid2 />}
                                >
                                  Block
                                </Button>
                              </Tooltip>
                            </Box>
                          );
                        }
                        if (status === 'Checkout' && !isBlocked) {
                          return (
                            <Box display="flex" gap={1}>
                              <Tooltip
                                title="Block Visitor"
                                placement="top"
                                arrow
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '1rem',
                                      padding: '8px 14px',
                                    },
                                  },
                                  popper: {
                                    container: containerRef.current,
                                  },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="large"
                                  sx={{ backgroundColor: '#000' }}
                                  onClick={() => handleConfirmStatus('Block')}
                                  startIcon={<IconForbid2 />}
                                >
                                  Block
                                </Button>
                              </Tooltip>
                            </Box>
                          );
                        }

                        if (isBlocked) {
                          return (
                            <Tooltip
                              title="Unblock"
                              placement="top"
                              arrow
                              slotProps={{
                                tooltip: {
                                  sx: {
                                    fontSize: '1rem',
                                    padding: '8px 14px',
                                  },
                                },
                                popper: {
                                  container: containerRef.current,
                                },
                              }}
                            >
                              <Button
                                variant="contained"
                                size="large"
                                sx={{
                                  backgroundColor: '#f44336',
                                  '&:hover': { backgroundColor: '#d32f2f' },
                                }}
                                onClick={() => handleConfirmStatus('Unblock')}
                                startIcon={<IconBan />}
                              >
                                Unblock
                              </Button>
                            </Tooltip>
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
                    maxHeight: isFullscreen ? '100%' : '530px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    overflow: 'auto',
                  }}
                >
                  <Box display="flex" justifyContent="space-between">
                    <CardHeader title="Related Visitors" sx={{ p: 0 }} />
                    <Tooltip
                      title="Click and Select more than 1 visitor"
                      slotProps={{
                        tooltip: {
                          sx: {
                            fontSize: '1rem',
                            padding: '8px 14px',
                          },
                        },
                        popper: {
                          container: containerRef.current,
                        },
                      }}
                    >
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
                    </Tooltip>
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
                            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                              <Box display="flex" gap={1} flexDirection={'column'}>
                                {isDriving && (
                                  <Tooltip
                                    title="Parking"
                                    arrow
                                    slotProps={{
                                      tooltip: {
                                        sx: {
                                          fontSize: '1rem',
                                          padding: '8px 14px',
                                        },
                                      },
                                      popper: {
                                        container: containerRef.current,
                                      },
                                    }}
                                  >
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
                                        cursor: 'default',
                                      }}
                                    >
                                      P
                                    </Box>
                                  </Tooltip>
                                )}

                                {isScanned && (
                                  <Tooltip
                                    title="Scanned"
                                    arrow
                                    slotProps={{
                                      tooltip: {
                                        sx: {
                                          fontSize: '1rem',
                                          padding: '8px 14px',
                                        },
                                      },
                                      popper: {
                                        container: containerRef.current,
                                      },
                                    }}
                                  >
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
                                        cursor: 'default',
                                      }}
                                    >
                                      S
                                    </Box>
                                  </Tooltip>
                                )}
                              </Box>
                              <Checkbox
                                checked={selectedVisitors.includes(visitor.id)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;

                                  setSelectedVisitors((prev) => {
                                    if (selectMultiple) {
                                      if (isChecked) {
                                        const updated = Array.from(new Set([...prev, visitor.id]));
                                        return updated;
                                      } else {
                                        const updated = prev.filter((id) => id !== visitor.id);
                                        return updated;
                                      }
                                    } else {
                                      if (isChecked) {
                                        handleSelectRelatedVisitor(visitor);
                                        return [visitor.id];
                                      } else {
                                        return [];
                                      }
                                    }
                                  });
                                }}
                              />
                            </Box>
                          </ListItem>

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
                            <Typography
                              variant="body1"
                              fontWeight="medium"
                              sx={{ lineHeight: 1.3 }}
                            >
                              {visitor.agenda || '-'}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ lineHeight: 1.2 }}
                            >
                              {`${formatDateTime(visitor.visitor_period_start)} - ${formatDateTime(
                                visitor.visitor_period_end,
                                visitor.extend_visitor_period,
                              )}`}
                            </Typography>
                          </Box>
                          <Divider sx={{ my: 1 }} />
                        </React.Fragment>
                      );
                    })}
                  </CardContent>
                  <CardActions sx={{ overflow: 'visible' }}>
                    <Divider />
                    <Box
                      display={'flex'}
                      gap={2}
                      width={'100%'}
                      sx={{ mt: 2, justifyContent: 'space-between' }}
                      flexWrap={'wrap'}
                    >
                      <Box display="flex" gap={1} ref={containerRef}>
                        <Select
                          sx={{ width: '150px' }}
                          value={bulkAction}
                          onChange={(e: any) => setBulkAction(e.target.value)}
                          MenuProps={{
                            disablePortal: true,
                            container: containerRef.current,
                          }}
                        >
                          {availableActions.map((action) => (
                            <MenuItem key={action.value} value={action.value}>
                              {action.label}
                            </MenuItem>
                          ))}
                        </Select>

                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ width: '100px' }}
                          disabled={!bulkAction || selectedVisitors.length === 0}
                          onClick={handleApplyBulkAction}
                        >
                          {loadingAccess ? <CircularProgress size={24} color="inherit" /> : 'Apply'}
                        </Button>
                      </Box>
                      {invitationCode.length > 0 && (
                        <Box
                          display={'flex'}
                          gap={0.5}
                          alignItems={'center'}
                          justifyContent={'flex-end'}
                        >
                          <Tooltip
                            title="Extend Time"
                            placement="top"
                            arrow
                            slotProps={{
                              tooltip: {
                                sx: {
                                  fontSize: '1rem',
                                  padding: '8px 14px',
                                },
                              },
                              popper: {
                                container: containerRef.current,
                              },
                            }}
                          >
                            <Button
                              variant="contained"
                              onClick={() => setOpenExtendVisit(true)}
                              startIcon={<IconClock size={18} />}
                              sx={{
                                color: '#fff',
                                // warna ketika AKTIF
                                background: !relatedVisitors.some(
                                  (v) =>
                                    selectedVisitors.includes(v.id) &&
                                    v.visitor_status === 'Checkin',
                                )
                                  ? undefined
                                  : 'linear-gradient(135deg, #FFE082 0%, #FFCA28 100%)',

                                // style khusus ketika DISABLED
                                '&.Mui-disabled': {
                                  background: '#BDBDBD !important', // abu2
                                  color: '#FFFFFF !important',
                                  opacity: 0.8,
                                },
                              }}
                              disabled={
                                !(
                                  // invitationCode?.[0]?.visitor_status === 'Checkin' ||
                                  relatedVisitors.some(
                                    (v) =>
                                      selectedVisitors.includes(v.id) &&
                                      v.visitor_status === 'Checkin',
                                  )
                                )
                              }
                            >
                              Extend
                            </Button>
                          </Tooltip>
                          <Tooltip
                            title="Card"
                            placement="top"
                            arrow
                            slotProps={{
                              tooltip: {
                                sx: {
                                  fontSize: '1rem',
                                  padding: '8px 14px',
                                },
                              },
                              popper: {
                                container: containerRef.current,
                              },
                            }}
                          >
                            <Button
                              sx={{
                                background: 'linear-gradient(135deg, #AB47BC 0%, #6A1B9A 100%)',
                                color: '#fff',
                              }}
                              onClick={handleChooseCard}
                              startIcon={<IconCreditCard size={18} />}
                            >
                              Card
                            </Button>
                          </Tooltip>

                          <Tooltip
                            title="Access Control"
                            placement="top"
                            arrow
                            slotProps={{
                              tooltip: { sx: { fontSize: '1rem', padding: '8px 14px' } },
                              popper: {
                                container: containerRef.current,
                              },
                            }}
                          >
                            <Button
                              sx={{
                                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                color: '#fff',
                              }}
                              onClick={() => setOpenAccessData(true)}
                              startIcon={<IconKey size={18} />}
                            >
                              Access
                            </Button>
                          </Tooltip>
                        </Box>
                      )}
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
                        height: { xs: '100%', md: '100%' },
                        maxHeight: '100%',
                      }}
                    >
                      <CardContent
                        sx={{
                          flex: 1,
                          p: 0,
                          overflow: 'hidden',
                          pb: '0 ! important',
                        }}
                      >
                        <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Faceimage</CustomFormLabel>

                        {activeSelfie ? (
                          <img
                            src={activeSelfie}
                            alt="Face Image"
                            style={{
                              width: '100%',
                              height: isFullscreen ? '100%' : '175px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              objectFit: isFullscreen ? 'cover' : 'cover',
                              objectPosition: 'center center',
                              display: 'block',
                            }}
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            // height={isFullscreen ? '100%' : '175px'}
                            height={isFullscreen ? '100%' : { xs: '200px', md: '100%' }}
                            sx={{
                              borderRadius: '8px',
                              backgroundColor: '#f9f9f9',
                              color: '#888',
                              fontStyle: 'italic',

                              fontSize: '0.9rem',
                            }}
                          >
                            No Face Image
                          </Box>
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
                          // overflowY: 'auto',
                          overflow: 'hidden',
                          pb: '0 ! important',
                        }}
                      >
                        <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Identity Image</CustomFormLabel>
                        {activeKTP ? (
                          <img
                            src={activeKTP}
                            alt="Identity Image"
                            style={{
                              width: '100%',
                              height: isFullscreen ? '100%' : '175px',
                              borderRadius: '8px',
                              objectFit: isFullscreen ? 'cover' : 'cover',
                            }}
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            height={isFullscreen ? '100%' : { xs: '200px', md: '100%' }}
                            sx={{
                              borderRadius: '8px',
                              backgroundColor: '#f9f9f9',
                              color: '#888',
                              fontStyle: 'italic',
                              fontSize: '0.9rem',
                            }}
                          >
                            No Face Image
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          <SearchVisitorDialog
            open={openSearch}
            onClose={() => setOpenSearch(false)}
            onSearch={(data) => {
              setVisitorData(data);
              setOpenDetail(true); // langsung buka detail
            }}
            container={containerRef.current}
          />
          {/* Dialog Detail */}
          <DetailVisitorDialog
            open={openDetail}
            onClose={() => setOpenDetail(false)}
            visitorData={visitorData}
            container={containerRef.current ?? undefined}
          />
          {/* Scan QR Visitor */}
          <ScanQrVisitorDialog
            open={openDialogIndex === 1}
            onClose={handleCloseScanQR}
            handleSubmitQRCode={handleSubmitQRCode}
            container={containerRef.current ?? undefined}
            onOpenInvitation={() => setOpenDialogIndex(2)}
          />
          {/* Choose Card */}
          <Dialog
            open={openChooseCardDialog}
            onClose={() => setOpenChooseCardDialog(false)}
            fullWidth
            maxWidth="lg"
            container={containerRef.current}
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

              <Grid container spacing={2}>
                {filteredCards.map((card) => {
                  const isChosen = selectedCards.includes(card.card_number);
                  const isLimitReached =
                    selectedCards.length >= (selectedVisitors.length || 1) && !isChosen;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.id}>
                      <Paper
                        onClick={() => {
                          handleToggleCard(card.card_number);
                        }}
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
                          backgroundColor: isChosen
                            ? theme.palette.primary.light
                            : 'background.paper',
                          transition: theme.transitions.create(
                            ['transform', 'box-shadow', 'border-color', 'background-color'],
                            {
                              duration: theme.transitions.duration.shorter,
                            },
                          ),
                          '&:hover': {
                            transform: isLimitReached ? 'none' : 'translateY(-3px)',
                            boxShadow: isLimitReached ? theme.shadows[1] : theme.shadows[6],
                          },
                        })}
                      >
                        <Box
                          flexGrow={1}
                          display="flex"
                          flexDirection="column"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h1" color="text.secondary" mt={2}>
                            {card.remarks || '-'}
                          </Typography>

                          <Box
                            display="flex"
                            justifyContent="space-between"
                            width="100%"
                            maxWidth={300}
                            mt={1}
                          >
                            <Typography variant="body1" fontWeight={600}>
                              Card
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {card.card_number || '-'}
                            </Typography>
                          </Box>

                          <Box
                            display="flex"
                            justifyContent="space-between"
                            width="100%"
                            maxWidth={300}
                            flexWrap={'wrap'}
                            gap={1}
                          >
                            <Typography variant="body1" fontWeight={600}>
                              BLE
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {card.card_mac || '-'}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="body1">{card.name}</Typography>

                        <FormControlLabel
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          control={
                            <Checkbox
                              checked={isChosen}
                              disabled={!isChosen}
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

              <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" flexDirection="column" gap={0.5}>
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
          {/* Fill Form Pra regist Multiple*/}
          <Dialog
            open={openFillForm}
            onClose={() => setOpenFillForm(false)}
            fullWidth
            maxWidth={false}
            PaperProps={{
              sx: {
                width: '100vw',
              },
            }}
            container={containerRef.current}
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
                              fontSize: '0.9rem !important',
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
                        const isDrivingField = fillFormDataVisitor
                          ?.flatMap((v) => v.question_page)
                          ?.flatMap((q) => q.form || [])
                          ?.find((f) => f.remarks === 'is_driving');

                        const isDriving =
                          isDrivingField?.answer_text === 'true' ||
                          isDrivingField?.answer_text === true;
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
                                      )
                                        .filter(
                                          (f: any) =>
                                            // pakai visitor pertama sebagai acuan visual header
                                            fillFormDataVisitor[0]?.question_page?.[
                                              fillFormActiveStep
                                            ]?.form?.find(
                                              (x: any) =>
                                                x.remarks === 'is_driving' &&
                                                x.answer_text === 'true',
                                            ) ||
                                            !['vehicle_type', 'vehicle_plate'].includes(f.remarks),
                                        )
                                        .map((f: any, i: any) => (
                                          <TableCell key={i}>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                              {f.long_display_text}
                                            </Typography>
                                          </TableCell>
                                        ))}
                                    </TableRow>
                                  </TableHead>

                                  <TableBody>
                                    {fillFormDataVisitor.length > 0 ? (
                                      fillFormDataVisitor.map((group, gIdx) => {
                                        const page =
                                          group.question_page?.[fillFormActiveStep] ?? section;
                                        if (!page) return null;

                                        // 🟢 CARI is_driving milik visitor ini
                                        const isDrivingField = page.form?.find(
                                          (f: any) => f.remarks === 'is_driving',
                                        );
                                        const isDriving =
                                          isDrivingField?.answer_text === 'true' ||
                                          isDrivingField?.answer_text === true;

                                        return (
                                          <TableRow key={gIdx}>
                                            {page.form
                                              ?.filter(
                                                (field: any) =>
                                                  isDriving ||
                                                  !['vehicle_type', 'vehicle_plate'].includes(
                                                    field.remarks,
                                                  ),
                                              )
                                              .map((field: any) => {
                                                // ✅ FIX 1: cari index sebenarnya berdasarkan remarks (bukan fIdx)
                                                const formIdx = page.form.findIndex(
                                                  (x: any) => x.remarks === field.remarks,
                                                );

                                                return (
                                                  // ✅ FIX 2: gunakan remarks sebagai key, bukan fIdx
                                                  <TableCell key={field.remarks}>
                                                    {renderFieldInput(
                                                      field,
                                                      formIdx, // ✅ pakai index real
                                                      (idx, fieldKey, value) => {
                                                        setFillFormDataVisitor((prev) => {
                                                          // ✅ FIX 3: deep clone agar state tetap konsisten
                                                          const next = structuredClone(prev);
                                                          const s = fillFormActiveStep;

                                                          // ✅ FIX 4: update berdasarkan remarks, bukan index mentah
                                                          const targetIdx = next[
                                                            gIdx
                                                          ].question_page[s].form.findIndex(
                                                            (x: any) => x.remarks === field.remarks,
                                                          );
                                                          if (targetIdx === -1) return prev;

                                                          next[gIdx].question_page[s].form[
                                                            targetIdx
                                                          ] = {
                                                            ...next[gIdx].question_page[s].form[
                                                              targetIdx
                                                            ],
                                                            [fieldKey]: value,
                                                          };
                                                          return next;
                                                        });
                                                      },
                                                      undefined,
                                                      {
                                                        showLabel: false,
                                                        uniqueKey: `${fillFormActiveStep}:${gIdx}:${field.remarks}`, // ✅ pakai remarks
                                                      },
                                                    )}
                                                  </TableCell>
                                                );
                                              })}
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
                                      {
                                        showLabel: false,
                                        uniqueKey: `${fillFormActiveStep}:${idx}`,
                                      },
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
                <Button
                  variant="contained"
                  onClick={() => {
                    setFillFormActiveStep((p) => p + 1);
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={handleSubmitPramultiple}>
                  Submit
                </Button>
              )}
            </DialogActions>
          </Dialog>
          {/* Submit Praregister */}
          <Dialog
            open={openDialogInvitation}
            onClose={() => setOpenDialogInvitation(false)}
            fullWidth
            maxWidth="xl"
            container={containerRef.current}
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
            {loading ? (
              <DialogContent
                dividers
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 400,
                }}
              >
                <CircularProgress />
              </DialogContent>
            ) : (
              <DialogContent dividers>
                {selectedInvitationId ? (
                  <FormDialogPraregist
                    id={selectedInvitationId ?? invitationCode?.[0]?.id}
                    onClose={() => setOpenDialogInvitation(false)}
                    onSubmitted={async (formId?: string) => {
                      setOpenDialogInvitation(false);
                      const targetId = formId ?? selectedInvitationId ?? invitationCode?.[0]?.id;
                      if (!targetId) return;
                      await fetchRelatedVisitorsByInvitationId(targetId);
                    }}
                    onSubmitting={setSubmitting}
                    containerRef={containerRef.current}
                  />
                ) : (
                  <Typography variant="body2" textAlign="center" color="text.secondary">
                    No invitation selected.
                  </Typography>
                )}
              </DialogContent>
            )}
          </Dialog>
          {/* Access */}
          <Dialog
            open={openAccessData}
            onClose={() => setOpenAccessData(false)}
            fullWidth
            maxWidth="md"
            container={containerRef.current}
          >
            <DialogTitle>Select Access</DialogTitle>
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
              <DynamicTable
                data={accessData.map(({ trx_visitor_id, visitors, ...rest }) => rest)}
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

                    if (
                      !allowedActions.includes(
                        selectedActionAccess.charAt(0).toUpperCase() +
                          selectedActionAccess.slice(1),
                      )
                    ) {
                      setSnackbarMsg(
                        `Action "${selectedActionAccess}" is not allowed for selected access.`,
                      );
                      setSnackbarType('info');
                      setSnackbarOpen(true);
                      return;
                    }

                    for (const id of selectedAccessIds) {
                      const row = accessData.find(
                        (r) =>
                          r.access_control_id?.toLowerCase() === id.toLowerCase() &&
                          selectedVisitors.some(
                            (v) =>
                              v.toLowerCase() === r.trx_visitor_id?.toLowerCase() ||
                              v.toLowerCase() === r.trxVisitorId?.toLowerCase(),
                          ),
                      );

                      if (!row) {
                        continue;
                      }

                      await handleAccessAction(row, selectedActionAccess.toLowerCase() as any);
                    }
                    setSelectedActionAccess('');
                  }}
                  sx={{ mb: 0, mt: 2 }}
                  disabled={!selectedActionAccess || allowedActions.length === 0}
                >
                  Apply
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
          {/* Extend Visit */}
          <ExtendVisitDialog
            open={openExtendVisit}
            onClose={() => setOpenExtendVisit(false)}
            container={containerRef.current}
            durationOptions={durationOptions}
            selectedMinutes={selectedMinutes}
            setSelectedMinutes={setSelectedMinutes}
            applyToAll={applyToAll}
            onApplyToAllChange={handleApplyToAllChange}
            onSubmit={handleExtend}
          />

          {/* Create Invitation */}
          <Dialog
            fullWidth
            // maxWidth="xl"
            maxWidth={false}
            PaperProps={{
              sx: {
                width: '100vw',
              },
            }}
            open={openInvitationVisitor}
            onClose={handleCloseDialog}
            keepMounted
            container={containerRef.current ?? undefined}
          >
            <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
              Add Invitation Visitor
              <IconButton
                aria-label="close"
                onClick={() => {
                  handleCloseDialog();
                }}
              >
                <IconX />
              </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <FormWizardAddVisitor
                key={wizardKey}
                formData={formDataAddVisitor}
                setFormData={setFormDataAddVisitor}
                // edittingId={edittingId}
                onSuccess={handleSuccess}
                containerRef={containerRef}
              />
            </DialogContent>
          </Dialog>

          {/* Create Pra Registration */}
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
            onClose={handleCloseDialog}
            container={containerRef.current ?? undefined}
          >
            <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
              Add Pra Registration
              <IconButton
                aria-label="close"
                onClick={() => {
                  handleCloseDialog();
                }}
              >
                <IconX />
              </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ paddingTop: '0px' }}>
              <br />
              <FormWizardAddInvitation
                key={wizardKey}
                formData={formDataAddVisitor}
                setFormData={setFormDataAddVisitor}
                onSuccess={handleSuccess}
                containerRef={containerRef ?? null}
              />
            </DialogContent>
          </Dialog>

          {/* Registered Site */}
          <Dialog
            open={openDialogIndex === 2}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="sm"
            container={containerRef.current ?? undefined}
          >
            <DialogTitle
              display="flex"
              justifyContent={'space-between'}
              alignItems="center"
              // sx={{
              //   background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(99,102,241,0.08))',
              // }}
            >
              Select Registered Site
              <IconButton
                aria-label="close"
                onClick={() => {
                  handleCloseDialog();
                }}
              >
                <IconX />
              </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <CustomFormLabel sx={{ marginTop: 0 }}>Registered Site</CustomFormLabel>
              <Autocomplete
                fullWidth
                options={siteData}
                getOptionLabel={(o) => o.name || ''}
                value={selectedSite}
                onChange={(_, nv) => {
                  setSelectedSite(nv);
                  setFormDataAddVisitor((prev) => ({
                    ...prev,
                    registered_site: nv?.id || '',
                  }));
                }}
                slotProps={{
                  popper: {
                    container: containerRef.current,
                  },
                }}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                renderInput={(params) => <TextField {...params} label="" />}
              />
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (!selectedSite) {
                      toast('Minimal pilih 1 Registered Site.', 'warning');
                      return;
                    }
                    setFormDataAddVisitor((prev) => ({
                      ...prev,
                      registered_site: selectedSite.id,
                    }));
                    setOpenDialogIndex(null);

                    setOpenInvitationVisitor(true);
                  }}
                  color="primary"
                >
                  Next
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
          {/* <SelectRegisteredSiteDialog
            open={openDialogIndex === 2}
            onClose={handleCloseDialog}
            siteData={siteData}
            selectedSite={selectedSite}
            setSelectedSite={setSelectedSite}
            setFormDataAddVisitor={setFormDataAddVisitor as any}
            setOpenInvitationVisitor={setOpenInvitationVisitor}
            container={containerRef ?? null}
          /> */}

          <InfoDialog
            open={openDialogInfo}
            onClose={() => setOpenDialogInfo(false)}
            data={dataImage}
            container={containerRef ?? null}
          />

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
                  whiteSpace: 'pre-line',
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
                zIndex: 999999,
                position: 'fixed',
                margin: '0 auto',
              }}
              open={loadingAccess}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </Portal>
        </Box>
      </FullScreen>
    </PageContainer>
  );
};

export default OperatorView;
