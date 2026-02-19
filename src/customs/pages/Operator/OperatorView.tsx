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
  CardHeader,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
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
import { Box, Stack, useMediaQuery, useTheme } from '@mui/system';
import moment from 'moment-timezone';
import backgroundnodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import infoPic from 'src/assets/images/backgrounds/info_pic.png';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBan,
  IconCards,
  IconClipboard,
  IconClock,
  IconCreditCard,
  IconDoor,
  IconForbid2,
  IconKey,
  IconLogin,
  IconLogout,
  IconMapPinCheck,
  IconParking,
  IconPrinter,
  IconQrcode,
  IconSearch,
  IconSwipe,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
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
} from 'src/customs/api/models/Admin/Visitor';
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers';
import dayjs, { Dayjs, tz } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
  getAllSite,
  getAllVisitorType,
  getRegisteredSite,
  getVisitorEmployee,
} from 'src/customs/api/admin';
import FormDialogPraregist from './Dialog/FormDialogPraregist';
import CameraUpload from './Components/CameraUpload';
import { showSwal } from 'src/customs/components/alerts/alerts';
import FormWizardAddVisitor from './Invitation/FormWizardAddVisitor';
import FormWizardAddInvitation from './Invitation/FormWizardAddInvitation';
import ScanQrVisitorDialog from './Dialog/ScanQrVisitorDialog';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import VisitingPurposeDialog from './Dialog/VisitingPurposeDialog';
import InfoDialog from './Dialog/InfoDialog';
import ExtendVisitDialog from './Dialog/ExtendVisitDialog';
import { useTranslation } from 'react-i18next';
import VisitorDetailTabs from './Components/VisitorDetailTabs';
import BlacklistVisitorDialog from './Dialog/BlacklistVisitorDialog';
import ListVisitorDialog from './Dialog/ListVisitorDialog';
import TriggeredAccessDialog from './Dialog/TriggeredAccessDialog';
import DetailVisitingPurpose from './Dialog/DetailVisitingPurpose';
import SwipeCardDialog from './Dialog/SwipeCardDialog';
import SwipeAccessDialog from './Dialog/SwipeAccessDialog';
import { useDebounce } from 'src/hooks/useDebounce';
import PrintDialog from './Dialog/PrintDialog';
import { getPrintBadgeConfig } from 'src/customs/api/models/Admin/PrintBadge';
import PrintDialogBulk from './Dialog/PrintDialogBluk';
import {
  getRegisteredSiteOperator,
  getSiteAccessOperator,
  returnCard,
  swapCard,
} from 'src/customs/api/models/Admin/SwapCard';
import SwipeCardNoCodeDialog from './Dialog/SwipeCardNoCodeDialog';
import InvitationQrCard from './Components/InvitationQrCard';
import FRLPRCard from './Components/FRLPRCard';
import VisitorSearchInput from './Components/VisitorSearchInput';
import OperatorToolbar from './Components/OperatorToolbar';
import VisitorImage from './Components/VisitorImage';
import ReturnCardDialog from './Dialog/ReturnCardDialog';
import SnackbarOperator from './Components/SnackbarOperator';
import GlobalBackdropLoading from './Components/GlobalBackdrop';
import RegisteredSiteDialog from './Dialog/RegisteredSiteAccessDialog';
import RegisteredSiteAccessDialog from './Dialog/RegisteredSiteAccessDialog';
import AccessDialog from './Dialog/AccessDialog';
import { useQuery } from '@tanstack/react-query';
import ParkingDialog from './Dialog/ParkingDialog';
import WhiteListDialog from './Dialog/WhiteListDialog';
import VehicleDialog from './Dialog/VehicleDialog';

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
// dayjs.locale('id');
const OperatorView = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const { token } = useSession();
  const { t } = useTranslation();

  const dataImage = [infoPic];
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
  const [openDetailVisitingPurpose, setOpenDetailVistingPurpose] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [openAccessData, setOpenAccessData] = useState(false);
  const [openRegisteredSite, setOpenRegisteredSiteDialog] = useState(false);
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
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [siteData, setSiteData] = useState<any[]>([]);
  const [openDialogInfo, setOpenDialogInfo] = useState(false);
  const [openSwipeDialog, setOpenSwipeDialog] = useState(false);
  const [selectedInvitations, setSelectedInvitations] = useState<any[]>([]);
  const [openSwipeAccess, setOpenSwipeAccess] = useState(false);
  const handle = useFullScreenHandle();
  const [visitorDocuments, setVisitorDocuments] = useState<any[]>([]);
  const [currentAction, setCurrentAction] = useState<'Checkin' | 'Checkout' | null>(null);
  const [currentActionBlacklist, setCurrentActionBlacklist] = useState<'Blacklist' | null>(null);
  const [showExtendButton, setShowExtendButton] = useState(false);
  const [actionButton, setActionButton] = useState<any | null>(null);
  const [visitorCards, setVisitorCards] = useState<any[]>([]);
  const [returnCardNumber, setReturnCardNumber] = useState('');
  const [openListVisitor, setOpenListVisitor] = useState(false);
  const [openBlacklistVisitor, setOpenBlacklistVisitor] = useState(false);
  const [openTriggeredAccess, setOpenTriggeredAccess] = useState(false);
  const [registerSiteOperator, setRegisterSiteOperator] = useState<any>({});
  const [openSwipeDialogNoInvitation, setOpenSwipeDialogNoInvitation] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedKeyword = useDebounce(searchKeyword, 300);
  const [focusTarget, setFocusTarget] = useState<'old' | 'new' | null>(null);
  const oldCardRef = useRef<HTMLInputElement | null>(null);
  const newCardRef = useRef<HTMLInputElement | null>(null);
  const [siteRegistered, setSiteRegistered] = useState<any[]>([]);
  const [action, setAction] = useState<'grant' | 'revoke' | ''>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSiteAccessOperator(token as string);

        const sites = Array.isArray(res?.collection)
          ? res.collection.map((x: any) => x.site).filter(Boolean)
          : [];

        setSiteRegistered(sites);
      } catch (error) {
        console.log(error);
        setSiteRegistered([]);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRegisteredSiteOperator(token as string);
        setRegisterSiteOperator(res?.collection ?? {});
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [token]);

  const generateUUIDv4 = () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return [...bytes]
      .map((b, i) =>
        [4, 6, 8, 10].includes(i)
          ? '-' + b.toString(16).padStart(2, '0')
          : b.toString(16).padStart(2, '0'),
      )
      .join('');
  };

  const handleOpenBlacklistVisitor = () => setOpenBlacklistVisitor(true);
  const handleCloseBlacklistVisitor = () => setOpenBlacklistVisitor(false);
  const handleOpenListVisitor = () => setOpenListVisitor(true);
  const handleOpenVehicle = () => setOpenVehicle(true);
  const handleCloseListVisitor = () => setOpenListVisitor(false);
  const handleCloseTriggeredAcceess = () => setOpenTriggeredAccess(false);

  const [wsPayload, setWsPayload] = useState<any>(null);
  const wsImageQueueRef = useRef<string[]>([]);
  const wsOcrQueueRef = useRef<string[]>([]);
  const [tick, forceTick] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);

  // Webscoket
  // useEffect(() => {
  //   const socket = new WebSocket('ws://localhost:8081/ws/');
  //   socketRef.current = socket;

  //   socket.onopen = () => {
  //     console.log('🟢 WS connected');
  //   };

  //   socket.onmessage = (event) => {
  //     const data = event.data;
  //     console.log('data', data);

  //     if (typeof data === 'string' && data.includes('|data:image')) {
  //       wsImageQueueRef.current.push(data);
  //     } else {
  //       wsOcrQueueRef.current.push(data);
  //     }

  //     forceTick((v) => v + 1);
  //   };

  //   socket.onerror = (e) => console.error('🔴 WS error', e);
  //   socket.onclose = () => console.warn('⚠️ WS closed');

  //   return () => socket.close();
  // }, []);

  const sendToScanner = (payload: any) => {
    socketRef.current?.send(JSON.stringify(payload));
  };

  const [printData, setPrintData] = useState<any>(null);
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      const res = await getPrintBadgeConfig(token);
      setPrintData(res?.collection ?? []);
    };

    fetchData();
  }, [token]);

  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });

  const [swipePayload, setSwipePayload] = useState<{
    value: string;
    type: string;
  } | null>(null);

  const [uiCurrentUsedCardNo, setUiCurrentUsedCardNo] = useState<string | null>(null);

  const currentUsedCard = useMemo(() => {
    if (uiCurrentUsedCardNo) {
      return visitorCards.find((c) => c.card_number === uiCurrentUsedCardNo);
    }

    return visitorCards.find((c) => c.current_used && c.card_type !== 'Barcode');
  }, [visitorCards, uiCurrentUsedCardNo]);

  // const [swapPayloads, setSwapPayloads] = useState<any[]>([]);

  // const handleSwipeCardSubmit = async (value: string, type: string, visitor: any) => {
  //   try {
  //     const selectedCard = filteredCards.find((c) => c.card_number === selectedCards[0]);
  //     console.log('selectedCard', selectedCard);

  //     const currentUsedCard = visitorCards.find((c) => c.current_used === true);

  //     console.log('currentUsedCard', currentUsedCard);

  //     if (!selectedCard || !currentUsedCard) {
  //       showSwal('error', 'Invalid card data for swap');
  //       return;
  //     }

  //     const payload = {
  //       card_number: selectedCard.card_number,
  //       trx_visitor_id: invitationId,
  //       description:
  //         'Give card number ' + selectedCard.card_number + ' from ' + registerSiteOperator.id,
  //       swap_card_from_card: value,
  //       // trx_card_id: generateUUIDv4(),
  //       // swap_card_from_card_id: null,
  //       swap_card_from_site_id: registerSiteOperator.user_id,
  //       swap_type: type,
  //       is_swapcard: true,
  //     };

  //     // kalau lebih dari 1 visitor pakai ini createMultipleGrantAccess
  //     //   {
  //     // "data": [
  //     //     {
  //     //         "card_number": "30285",
  //     //         "trx_visitor_id": "CAE31043-C78C-4AF6-92B9-17C318D90093",
  //     //         "description": "",
  //     //         "trx_card_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // trx_card_awal
  //     //         "swap_card_from_card": "", // nomor kartu
  //     //         "swap_card_from_card_id": null, // isi dengan id kartu
  //     //         "swap_card_from_site_id": "", // isi dengan id site yg dituju awal
  //     //         "swap_type": "NIK", // NIK, KTP , DriverLicense, Passport, CardAccess, Face, NDA, Other
  //     //         "swap_card_in": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  // isi dengan id lokasi swipe kartu atau site
  //     //         "swap_card_in_name": "lobby 1"
  //     //     },

  //     console.log('SWAP PAYLOAD', payload);

  //     // call API
  //     // await createGrandAccessOperator(token as string, payload);

  //     setUiCurrentUsedCardNo(selectedCard.card_number);

  //     setOpenChooseCardDialog(false);
  //     setOpenSwipeDialog(false);
  //     setOpenSwipeAccess(true);
  //     setSelectedCards([]);
  //     setTimeout(() => {
  //       showSwal('success', 'Card swaped successfully!');
  //     }, 600);
  //     setTimeout(() => {
  //       fetchRelatedVisitorsByInvitationId(invitationId as string);
  //       fetchAvailableCards?.();
  //     }, 300);
  //   } catch (err: any) {
  //     const backendMsg = err?.response?.data?.msg;
  //     showSwal('error', backendMsg || 'Failed to swipe card');
  //   }
  // };

  // v1
  // const handleSwipeCardSubmit = async (
  //   value: string,
  //   type: string,
  //   visitor: any,
  //   isLastVisitor: boolean,
  //   visitorIndex: number,
  // ) => {
  //   try {
  //     // const selectedCard = filteredCards.find((c) => c.card_number === selectedCards[0]);
  //     const selectedCardNumber = selectedCards[visitorIndex];
  //     const selectedCard = filteredCards.find((c) => c.card_number === selectedCardNumber);

  //     const currentUsedCard = visitorCards.find((c) => c.current_used === true);

  //     if (!selectedCard || !currentUsedCard) {
  //       showSwal('error', 'Invalid card data for swap');
  //       return;
  //     }

  //     const payloadItem = {
  //       card_number: selectedCard.card_number,
  //       trx_visitor_id: visitor.id, // 🔥 FIX PENTING
  //       description: `Give card number ${selectedCard.card_number} from ${registerSiteOperator.id}`,
  //       swap_card_from_card: value,
  //       swap_card_from_site_id: registerSiteOperator.user_id,
  //       swap_type: type,
  //       is_swapcard: true,
  //     };

  //     // 🔥 KUMPULKAN PAYLOAD
  //     setSwapPayloads((prev) => {
  //       const next = [...prev, payloadItem];

  //       console.log('paylod', next);

  //       if (isLastVisitor) {
  //         (async () => {
  //           try {
  //             // if (next.length === 1) {
  //             //   await createGrandAccessOperator(token as string, next[0]);
  //             // } else {
  //             //   await createMultipleGrantAccess(token as string, {
  //             //     data: next,
  //             //   });
  //             // }

  //             showSwal('success', 'Card swaped successfully!');
  //             // setUiCurrentUsedCardNo(selectedCard.card_number);
  //             setSwapPayloads([]);
  //             // setSelectedCards([]);
  //             // setOpenChooseCardDialog(false);
  //             // setOpenSwipeDialog(false);
  //             setOpenSwipeAccess(true);

  //             // fetchRelatedVisitorsByInvitationId(invitationId as string);
  //             // fetchAvailableCards?.();
  //           } catch (err: any) {
  //             showSwal('error', err?.response?.data?.msg || 'Failed to swipe card');
  //           }
  //         })();
  //       }

  //       return next;
  //     });
  //   } catch (err: any) {
  //     showSwal('error', err?.response?.data?.msg || 'Failed to swipe card');
  //   }
  // };

  const [currentAccessVisitor, setCurrentAccessVisitor] = useState<any>(null);

  const handleSwipeCardSubmit = async (
    value: string,
    type: string,
    visitor: any,
    isLastVisitor: boolean,
    visitorIndex: number,
  ) => {
    const selectedCardNumber = selectedCards[visitorIndex];
    const selectedCard = filteredCards.find((c) => c.card_number === selectedCardNumber);

    if (!selectedCard) {
      showSwal('error', 'Card not found');
      return;
    }

    try {
      await createGrandAccessOperator(token as string, {
        card_number: selectedCard.card_number,
        trx_visitor_id: visitor.id,
        description: `Give card number ${selectedCard.card_number} from ${registerSiteOperator.id}`,
        swap_card_from_card: value,
        swap_type: type,
        swap_card_from_site_id: registerSiteOperator.user_id,
        is_swapcard: true,
      });

      // 🔥 SIMPAN VISITOR UNTUK ACCESS
      setCurrentAccessVisitor(visitor);

      // 🔥 TUTUP SWIPE → BUKA ACCESS
      setOpenSwipeDialog(false);
      setOpenSwipeAccess(true);
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to swipe card');
    }
  };

  type CardActionType = 'Swipe' | 'Give';

  const handleSwipeCardSubmitNoCode = async ({
    oldCardData,
    newCardData,
    actionType,
  }: {
    oldCardData: any;
    newCardData: any;
    actionType: CardActionType;
  }) => {
    try {
      setLoadingAccess(true);

      const isSwap = actionType === 'Swipe';

      const payload: any = {
        card_number: newCardData.card_number,
        description:
          'Give card number ' + newCardData.card_number + ' from ' + registerSiteOperator.id,
        // swap_card_from_card: oldCardData.card_number,
        // swap_card_from_site_id: registerSiteOperator.user_id,
        swap_type: isSwap ? 'CardAccess' : 'Other',
        is_swapcard: isSwap,
      };

      if (isSwap) {
        payload.swap_card_from_card = oldCardData.card_number;
        payload.swap_card_from_site_id = registerSiteOperator.user_id;
      }

      console.log('SWAP PAYLOAD', payload);

      await createGrandAccessOperator(token as string, payload);

      showSwal(
        'success',
        `${actionType === 'Swipe' ? 'Card swapped' : 'Card given'} successfully!`,
      );
      setOpenSwipeDialogNoInvitation(false);
    } catch (err: any) {
      const backendMsg = err?.response?.data?.msg;
      showSwal('error', backendMsg || 'Failed to swipe card');
    } finally {
      setLoadingAccess(false);
    }
  };

  const [selectedPurpose, setSelectedPurpose] = useState<any>(null);

  const handleOpenSwipeDialog = () => {
    const hasSwappedBefore = visitorCards.some((c) => c.swap_at);

    if (hasSwappedBefore) {
      setOpenRegisteredSiteDialog(true);
    } else {
      setOpenSwipeDialog(true);
    }
  };

  const handleCloseSwipeDialogNoInvitation = () => {
    setActionButton('');
    setOpenSwipeDialogNoInvitation(false);
  };

  const handleCloseSwipeDialog = () => {
    setOpenSwipeDialog(false);
  };

  const handleOpenDetailVistingPurpose = (item: any) => {
    setSelectedPurpose(item);
    setOpenDetailVistingPurpose(true);
  };

  const [dialogContainer, setDialogContainer] = useState<HTMLElement | null>(null);
  const [hidePageContainer, setHidePageContainer] = useState(false);

  // useEffect(() => {
  //   // Pastikan socket hanya dibuat sekali
  //   const socket = new WebSocket('ws://localhost:16574/ws');

  //   socket.onopen = () => {
  //     console.log(' WebSocket connected');
  //   };

  //   socket.onerror = (err) => {
  //     console.error(' WebSocket error:', err);
  //   };

  //   socket.onmessage = (event) => {
  //     try {
  //       // Parse JSON
  //       const msg = JSON.parse(event.data);
  //       console.log(' Console client:', msg);

  //       // Cek tipe data dari server
  //       if (msg?.type === 'serial' && msg?.message) {
  //         const value = msg.message.toString().trim();
  //         console.log(' QR Value from socket:', value);

  //         //  Update ke state qrValue
  //         setQrValue(value);
  //         setLoadingAccess(true);
  //         //  Panggil handler QR langsung
  //         handleSubmitQRCode(value);

  //         //  Langsung buka detail QR dialog
  //         // setOpenDetailQRCode(true);
  //       }
  //     } catch (err) {
  //       console.error(' Failed to parse WebSocket message:', event.data, err);
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
    const handleBrowserFullscreen = () => {
      const isBrowserFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isBrowserFullscreen);

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

    return `hsl(${hue}, 70%, 55%)`;
  }

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

      let msg = 'Failed to extend visit.';
      let status = null;

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
      registered_site: '',
    }));
    // setRefreshTrigger((prev) => prev + 1);
    handleCloseDialog();
    await fetchTodayVisitingPurpose();
  };

  useEffect(() => {
    if (containerRef.current) {
      setDialogContainer(containerRef.current);
    }
  }, [containerRef]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await getVisitorEmployee(token as string);
  //     setAllVisitorEmployee(res?.collection ?? []);
  //   };
  //   fetchData();
  // }, [token]);

  const [sites, setSites] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [siteRes, employeeRes] = await Promise.all([
          getAllSite(token),
          getVisitorEmployee(token),
        ]);

        setSites(siteRes?.collection ?? []);
        setEmployee(employeeRes?.collection ?? []);
        setAllVisitorEmployee(employeeRes?.collection ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  const handleInvitationCreated = (invitationCode: string) => {
    handleSubmitQRCode(invitationCode);
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

  const [resetStep, setResetStep] = useState(0);
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

      if (!fileUrl) return null;

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

    if (trackKey) {
      setUploadNames((prev) => ({ ...prev, [trackKey]: file.name }));
      setPreviews((prev) => ({ ...prev, [trackKey]: URL.createObjectURL(file) }));
    }

    const path = await uploadFileToCDN(file);
    if (path) setAnswerFile(path);

    e.target.value = '';
  };

  const handleCloseDialog = () => {
    localStorage.removeItem('unsavedVisitorData');
    setSelectedSite(null);
    setFormDataAddVisitor(CreateVisitorRequestSchema.parse({}));
    setResetStep((prev) => prev + 1);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    setOpenDialogIndex(null);
    setActionButton('');
    setWizardKey((k) => k + 1);
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
    setActionButton(null);
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
      setLoadingAccess(true);
      setSelectedCards([]);
      const visitor = relatedVisitors.find(
        (v) => v.id?.toLowerCase() === invitationId?.toLowerCase(),
      );

      setVisitorCards(visitor?.card ?? []);
      setOpenChooseCardDialog(true);
    } catch (error) {
      showSwal('error', 'Failed to choose card');
    } finally {
      setTimeout(() => setLoadingAccess(false), 200);
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

    fetchData();
  }, [token]);

  useEffect(() => {
    if (!openSwipeDialogNoInvitation) return;

    if (focusTarget === 'old') {
      oldCardRef.current?.focus();
    }

    if (focusTarget === 'new') {
      newCardRef.current?.focus();
    }
  }, [focusTarget, openSwipeDialogNoInvitation]);

  useEffect(() => {
    if (openSwipeDialogNoInvitation) {
      setFocusTarget('old');
    }
  }, [openSwipeDialogNoInvitation]);

  // const availableCards = useMemo(
  //   () => visitorCards.filter((c) => !c.current_used && c.card_type !== 'Barcode'),
  //   [visitorCards],
  // );

  const findCard = (cardNumber: string) =>
    availableCards.find((c) => String(c.card_number).trim() === String(cardNumber).trim());

  useEffect(() => {
    const fetchData = async () => {
      const response = await getRegisteredSite(token as string);
      setSiteData(response.collection);
    };
    fetchData();
  }, [token]);

  const fetchAvailableCards = async () => {
    const res = await getAvailableCardOperator(token as string);
    setAvailableCards(res.collection);
  };

  const handleToggleCard = (cardNumber: string) => {
    setSelectedCards((prev) => {
      const normalized = String(cardNumber);
      const maxCards = selectedVisitors.length || 1;

      if (prev.includes(normalized)) {
        return prev.filter((c) => c !== normalized);
      }

      if (prev.length >= maxCards) {
        setSnackbarMsg(`You can only select up to ${maxCards} cards.`);
        setSnackbarType('info');
        setSnackbarOpen(true);
        return prev;
      }

      return [...prev, normalized];
    });
  };

  const [openReturnCard, setOpenReturnCard] = useState(false);
  const [openParking, setOpenParking] = useState(false);
  const [openVehicle, setOpenVehicle] = useState(false);

  const handleOpenAction = (value: string) => {
    setActionButton(value);

    const hasInvitation = invitationCode.length > 0 && relatedVisitors.length > 0;

    // 🟣 CARD → TIDAK PERNAH buka Scan QR
    if (value === 'card') {
      if (!hasInvitation) {
        setOpenSwipeDialogNoInvitation(true);
      } else {
        // setOpenChooseCardDialog(true); // atau handleChooseCard()
        handleChooseCard();
      }
      return;
    }

    if (value === 'access' && invitationCode.length > 0 && relatedVisitors.length > 0) {
      setOpenAccessData(true);
      return;
    }

    if (value === 'extend' && invitationCode.length > 0 && relatedVisitors.length > 0) {
      setOpenExtendVisit(true);
      return;
    }
    if (value === 'open' && invitationCode.length > 0 && relatedVisitors.length > 0) {
      setOpenTriggeredAccess(true);
      return;
    }
    if (value === 'return' && invitationCode.length > 0 && relatedVisitors.length > 0) {
      setOpenReturnCard(true);
      return;
    }
    if (value === 'parking') {
      if (!hasInvitation) {
        setOpenParking(true);
      } else {
        setOpenParking(true);
      }
      return;
    }
    setOpenDialogIndex(1);
  };

  const handleActionClick = async (action: 'Checkin' | 'Checkout') => {
    setCurrentAction(action);

    if (invitationCode.length > 0 || relatedVisitors.length > 0) {
      setSelectedVisitors([selectedVisitorId ?? invitationCode?.[0]?.id]);
      await handleConfirmStatus(action);
      setCurrentAction(null);
      return;
    }

    setOpenDialogIndex(1);
  };

  const handleActionBlacklist = async (action: 'Blacklist') => {
    setCurrentActionBlacklist(action);

    if (invitationCode.length > 0 || relatedVisitors.length > 0) {
      setSelectedVisitors([selectedVisitorId ?? invitationCode?.[0]?.id]);
      await handleBlacklistStatus(action);
      setCurrentAction(null);
      return;
    }
    setOpenDialogIndex(1);
  };

  const [invitationId, setInvitationId] = useState<string | null>(null);

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
      setInvitationId(invitation.id);
      const invitationId = invitation.id;

      setInvitationCode(data);
      setVisitorStatus(data[0]?.visitor_status ?? null);
      setSelectedVisitorNumber(data[0]?.visitor_number ?? null);
      setScannedVisitorNumber(data[0]?.visitor_number ?? null);

      await fetchRelatedVisitorsByInvitationId(invitationId);

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
      // console.log('accessList', accessList);

      const filteredAccess = accessList.filter((a: any) =>
        permissionAccess.some((p: any) => p.access_control_id === a.access_control_id),
      );
      // console.log('filteredAccess', filteredAccess);

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
      // console.log('mergedAccess', mergedAccess);

      // setAccessData([...mergedAccess]);
      setAccessData(mergedAccess);
      if (invitation?.id) {
        setSelectedVisitors((prev) => {
          if (!prev.includes(invitation.id)) {
            const updated = [...prev, invitation.id];
            return updated;
          }
          return prev;
        });
      }

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
        // handleChooseCard();
        setOpenChooseCardDialog(true);
        setActionButton(null);
        handleCloseScanQR();
        return;
      } else if (actionButton == 'access') {
        setSelectedVisitors([invitationId]);
        setOpenAccessData(true);
        setActionButton(null);
        handleCloseScanQR();
        return;
      } else if (actionButton == 'open') {
        setSelectedVisitors([invitationId]);
        setOpenTriggeredAccess(true);
        setActionButton(null);
        handleCloseScanQR();
        return;
      }
      handleCloseScanQR();

      showSwal('success', 'Code scanned successfully.');
      setShowExtendButton(true);
    } catch (e) {
      showSwal('error', 'Your code does not exist.');
    }
  };

  useEffect(() => {
    if (!relatedVisitors.length) return;

    const validIds = new Set(relatedVisitors.map((v) => v.id));

    setSelectedVisitors((prev) => prev.filter((id) => validIds.has(id)));
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
      host_name: v.host_name ?? '-',
      site_place_name: v.site_place_name ?? '-',
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
          selfie_image: updatedVisitor.selfie_image,
          identity_image: updatedVisitor.identity_image,
          card: updatedVisitor.card?.length > 0 ? updatedVisitor.card : (inv.card ?? []),
        };
      }),
    );

    setRelatedVisitors(mappedVisitors);

    const allAccess = relatedData.flatMap((v: any) =>
      (v.access ?? []).map((a: any) => ({
        id: a.id ?? '-',
        trx_visitor_id: (a.trx_visitor_id || v.id)?.toLowerCase(),
        access_control_id: a.access_control_id?.toLowerCase(),
        access_control_name: a.access_control_name ?? '-',
        visitor_give_access: a.visitor_give_access ?? 0,
        early_access: !!a.early_access,
      })),
    );
    console.log('allAccess', allAccess);

    setAllAccessData(allAccess);
    // setAccessData(allAccess);

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

    return baseTime.tz(moment.tz.guess()).format('DD MMM YYYY, HH:mm');
  };

  type Row = {
    id: string;
    visitor?: string;
    card: string | React.ReactNode | null;
    trx_visitor_id?: string | null;
    assigned_card_number?: string | null;
    assigned_card_remarks?: string | null;
  };

  const filteredVisitors = useMemo(() => {
    if (!debouncedKeyword.trim()) return relatedVisitors;

    const keyword = debouncedKeyword.toLowerCase();

    return relatedVisitors.filter((v) =>
      [v.name].filter(Boolean).some((field) => field.includes(keyword)),
    );
  }, [relatedVisitors, debouncedKeyword]);

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

  // Function & Variable Card
  const capacity = selectMultiple ? selectedVisitors.length : invitationCode.length > 0 ? 1 : 0;

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredCards = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return availableCards;

    return availableCards.filter((card) =>
      `${card.remarks ?? ''} ${card.card_number ?? ''} ${card.card_mac ?? ''}`
        .toLowerCase()
        .includes(term),
    );
  }, [availableCards, debouncedSearch]);

  useEffect(() => {
    if (!open) return;

    const t = setTimeout(() => {
      oldCardRef.current?.focus();
    }, 100);

    return () => clearTimeout(t);
  }, [open]);

  const availableVisibleCards = useMemo(() => {
    return filteredCards.filter((c) => {
      const holder = assignedByCard.get(String(c.card_number));
      return !(holder && !selectedIdSet.has(String(holder)));
    });
  }, [filteredCards, assignedByCard, selectedIdSet]);

  const visibleIds = availableVisibleCards.map((c) => String(c.card_number));
  const availableCount = availableVisibleCards.length;
  const selectedVisibleCount = visibleIds.filter((id) => selectedCards.includes(id)).length;
  const cappedCount = Math.min(visibleIds.length, capacity);
  const isChecked = cappedCount > 0 && selectedVisibleCount === cappedCount;
  const isIndeterminate = selectedVisibleCount > 0 && selectedVisibleCount < cappedCount;
  const hasSwappedBefore = visitorCards.some((c) => c.swap_at !== null);

  const handleSelectAll = () => {
    const visible = availableVisibleCards.map((c) => String(c.card_number));

    const capacity = selectMultiple ? selectedVisitors.length : invitationCode.length > 0 ? 1 : 0;

    if (capacity <= 0) {
      toast('Please select visitor first.', 'warning');
      return;
    }

    const selectedVisible = visible.filter((n) => selectedCards.includes(n));
    const cappedCount = Math.min(visible.length, capacity);

    const fullySelected = cappedCount > 0 && selectedVisible.length === cappedCount;

    if (fullySelected) {
      setSelectedCards((prev) => prev.filter((n) => !visible.includes(n)));
      toast('Visible cards cleared.', 'info');
    } else {
      const toAdd = visible.slice(0, cappedCount);
      setSelectedCards(toAdd);
      toast(`Selected ${toAdd.length} card(s).`, 'success');
    }
  };

  // const handleConfirmChooseCards = async () => {
  //   try {
  //     if (!selectedCards.length) {
  //       setSnackbarMsg('Please choose at least one card.');
  //       setSnackbarType('info');
  //       setSnackbarOpen(true);
  //       return;
  //     }

  //     setLoadingAccess(true);

  //     const alreadyHasCard: string[] = [];
  //     const successAssigned: string[] = [];
  //     let response: any = null;

  //     if (selectedVisitors.length > 1) {
  //       // 🧩 Multiple visitor (batch)
  //       const dataPayload: {
  //         card_number: string;
  //         trx_visitor_id: string;
  //         description: string;
  //         is_swapcard: boolean;
  //         swap_type: string;
  //       }[] = [];
  //       const pairCount = Math.min(selectedVisitors.length, selectedCards.length);

  //       for (let i = 0; i < pairCount; i++) {
  //         const visitorId = selectedVisitors[i];
  //         const cardNumber = selectedCards[i];
  //         const visitor = relatedVisitors.find(
  //           (v) => v.id?.toLowerCase() === visitorId.toLowerCase(),
  //         );
  //         if (!visitor) continue;

  //         dataPayload.push({
  //           card_number: String(cardNumber),
  //           trx_visitor_id: visitorId,
  //           description: 'Give card number' + cardNumber + ' from ' + registerSiteOperator.id,
  //           is_swapcard: false,
  //           swap_type: 'Other',
  //         });
  //         successAssigned.push(visitor.name || visitorId);
  //       }

  //       response = await createMultipleGrantAccess(token as string, { data: dataPayload });
  //     } else {
  //       const visitorId = invitationCode[0]?.id;

  //       if (!visitorId) {
  //         setSnackbarMsg('No visitor found to assign card.');
  //         setSnackbarType('info');
  //         setSnackbarOpen(true);
  //         setLoadingAccess(false);
  //         return;
  //       }

  //       const visitor = relatedVisitors.find(
  //         (v) => v.id?.toLowerCase() === visitorId.toLowerCase(),
  //       );

  //       if (!visitor) {
  //         setSnackbarMsg('Visitor not found.');
  //         setSnackbarType('error');
  //         setSnackbarOpen(true);
  //         setLoadingAccess(false);
  //         return;
  //       }

  //       for (const cardNumber of selectedCards) {
  //         const payload = {
  //           card_number: String(cardNumber),
  //           trx_visitor_id: visitorId,
  //           description: 'Give number card ' + cardNumber + 'from' + registerSiteOperator,
  //           swap_type: 'Other',
  //           is_swapcard: false,
  //         };

  //         response = await createGrandAccessOperator(token as string, payload);
  //         console.log('response:', JSON.stringify(payload, null, 2));
  //       }

  //       successAssigned.push(visitor.name || visitorId);
  //     }

  //     // 🔁 Refresh visitors setelah semua selesai
  //     const invitationId = invitationCode?.[0]?.id;
  //     if (invitationId) {
  //       await fetchRelatedVisitorsByInvitationId(invitationId);
  //     }

  //     await fetchAvailableCards();

  //     // if (response?.collection && response.collection.length > 0) {
  //     //   const messages = response.collection.map((item: any) => item.message).join(', ');
  //     //   // setSnackbarMsg(`⚠️ ${messages}`);
  //     //   // setSnackbarType('error');
  //     //   showSwal('error', `${messages}`);
  //     //   // setSnackbarOpen(true);
  //     //   setLoadingAccess(false);
  //     //   return;
  //     // }

  //     // give card number
  //     showSwal('success', `Successfully assigned card(s): ${selectedCards.join(', ')}`);

  //     setInvitationCode((prev) => {
  //       if (!prev || prev.length === 0) return prev;

  //       return prev.map((inv) =>
  //         selectedVisitors.some((vId) => vId.toLowerCase() === inv.id?.toLowerCase())
  //           ? {
  //               ...inv,
  //               card: [
  //                 {
  //                   ...(inv.card?.[0] || {}),
  //                   card_number: selectedCards[0],
  //                 },
  //               ],
  //             }
  //           : inv,
  //       );
  //     });

  //     handleCloseChooseCard();
  //   } catch (err: any) {
  //     console.error('Assign card error:', err);

  //     const backendMsg = err?.response?.data?.msg;

  //     if (backendMsg) {
  //       showSwal('error', backendMsg);
  //       return;
  //     }

  //     showSwal('error', 'Failed to assign card(s).');
  //   } finally {
  //     setTimeout(() => setLoadingAccess(false), 600);
  //   }
  // };

  const pairVisitorsWithCards = (visitorIds: string[], cards: (string | number)[]) => {
    return visitorIds.map((visitorId, idx) => ({
      visitorId,
      cardNumber: cards[idx] ?? cards[0],
    }));
  };

  const handleConfirmChooseCards = async () => {
    try {
      if (!selectedCards.length) {
        setSnackbarMsg('Please choose at least one card.');
        setSnackbarType('info');
        setSnackbarOpen(true);
        return;
      }

      setLoadingAccess(true);

      const visitorIds =
        selectedVisitors.length > 0 ? selectedVisitors : [invitationCode?.[0]?.id].filter(Boolean);

      if (!visitorIds.length) {
        showSwal('info', 'No visitor found to assign card.');
        return;
      }

      const pairs = pairVisitorsWithCards(visitorIds, selectedCards);

      const payloads = pairs
        .map(({ visitorId, cardNumber }) => {
          const visitor = relatedVisitors.find(
            (v) => v.id?.toLowerCase() === visitorId.toLowerCase(),
          );
          if (!visitor) return null;

          return {
            card_number: String(cardNumber),
            trx_visitor_id: visitorId,
            description: `Give card number ${cardNumber} from ${registerSiteOperator.id}`,
            is_swapcard: false,
            swap_type: 'Other',
            visitorName: visitor.name || visitorId,
          };
        })
        .filter(Boolean) as any[];

      if (!payloads.length) {
        showSwal('error', 'No valid visitor to assign card.');
        return;
      }
      if (payloads.length > 1) {
        await createMultipleGrantAccess(token as string, {
          data: payloads.map(({ visitorName, ...p }) => p),
        });
      } else {
        const { visitorName, ...payload } = payloads[0];
        await createGrandAccessOperator(token as string, payload);
      }

      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        await fetchRelatedVisitorsByInvitationId(invitationId);
      }

      await fetchAvailableCards();

      const message = payloads.map((p) => `• ${p.visitorName} (Card: ${p.card_number})`).join('\n');

      showSwal('success', `Successfully assigned card(s):\n${message}`);

      setInvitationCode((prev) =>
        prev.map((inv) => {
          const match = payloads.find(
            (p) => p.trx_visitor_id.toLowerCase() === inv.id?.toLowerCase(),
          );
          if (!match) return inv;

          return {
            ...inv,
            card: [{ ...(inv.card?.[0] || {}), card_number: match.card_number }],
          };
        }),
      );

      handleCloseChooseCard();
    } catch (err: any) {
      console.error('Assign card error:', err);
      showSwal('error', err?.response?.data?.msg || 'Failed to assign card(s).');
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

  const handleBlacklistStatus = async (action: 'Blacklist') => {
    const id = selectedVisitorId ?? invitationCode?.[0]?.id;

    if (!id) {
      showSwal('error', 'Visitor ID not found.');
      return;
    }

    try {
      const res = await Swal.fire({
        // imageUrl: '/assets/images/BI_Logo.png',
        icon: 'warning',
        imageWidth: 80,
        imageHeight: 80,
        imageAlt: 'Logo',
        target: containerRef.current,
        title: 'Blacklist Visitor',
        text: 'Are you sure you want to blacklist this visitor?',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        reverseButtons: true,
        cancelButtonText: 'No',
        confirmButtonColor: '#16a34a',
        customClass: {
          title: 'swal2-title-custom',
          popup: 'swal-popup-custom',
          closeButton: 'swal-close-red',
        },
      });

      if (!res.isConfirmed) return;

      // await blacklistVisitor(token as string, id, action);
      showSwal('success', 'Visitor has been successfully blacklisted.');
    } catch (err) {
      showSwal('error', 'Failed to blacklist visitor.');
    }
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
          // imageUrl: '/assets/images/BI_Logo.png',
          icon: 'warning',
          imageWidth: 80,
          imageHeight: 80,
          imageAlt: 'Logo',
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
          confirmButtonText: 'Yes',
          confirmButtonColor: action === 'Block' || action === 'Unblock' ? '#16a34a' : '#16a34a',
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
        const confirm = await Swal.fire({
          title: `Do you want to ${actionLabelMap[action]}?`,
          // imageUrl: '/assets/images/BI_Logo.png',
          icon: 'success',
          imageWidth: 80,
          imageHeight: 80,
          imageAlt: 'Logo',
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

      // console.log('✅ Action Response:', res);

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
        if (!selectedVisitorId) return prev;
        if (!prev.includes(selectedVisitorId)) {
          return [...prev, selectedVisitorId];
        }
        return prev;
      });

      setVisitorStatus(action);

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
    inputId: string,
  ) => {
    try {
      setRemoving((s) => ({ ...s, [inputId]: true }));
      if (currentUrl) {
        await axiosInstance2.delete(`/cdn${currentUrl}`);
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

  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };

  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);

  // Function Related Visitors

  const handleSelectRelatedVisitor = (visitor: any) => {
    if (selectMultiple) {
      setSelectedVisitors((prev) =>
        prev.includes(visitor.id) ? prev.filter((id) => id !== visitor.id) : [...prev, visitor.id],
      );
      return;
    }
    setSelectedVisitors([visitor.id]); // penting: replace
    setSelectedVisitorNumber(visitor.visitor_number);
    setSelectedVisitorId(visitor.id);

    setSelectedCards([]);

    setInvitationCode((prev) => {
      if (!prev?.length) return prev;

      return [
        {
          ...prev[0],
          visitor: {
            ...prev[0]?.visitor,
            ...visitor,
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
      ];
    });

    setVisitorStatus(visitor.visitor_status ?? '-');
  };

  const handleApplyBulkAction = async () => {
    if (!bulkAction || selectedVisitors.length === 0) return;

    const selectedData = relatedVisitors.filter((v) => selectedVisitors.includes(v.id));
    if (selectedData.length === 0) {
      toast('Tidak ada visitor yang valid.', 'warning');
      return;
    }

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

        let newStatus = updated.visitor_status;
        if (bulkAction === 'checkin') newStatus = 'Checkin';
        else if (bulkAction === 'checkout') newStatus = 'Checkout';
        else if (bulkAction === 'block') newStatus = 'Block';
        else if (bulkAction === 'unblock') newStatus = 'Unblock';

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
            return `${v.name} skip.`;
        }
      });

      showSwal('success', resultMessages.join('\n'));
      setSelectedVisitors([]);
      setBulkAction('');

      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        setTimeout(async () => {
          await fetchRelatedVisitorsByInvitationId(invitationId);
        }, 500);
      }
    } catch (error: any) {
      console.error('Multiple Action Failed:', error);
      // toast('Failed to perform multiple action', 'error');
      showSwal('error', 'Failed to perform multiple action.');
    } finally {
      setTimeout(() => setLoadingAccess(false), 600);
    }
  };

  const selectedData =
    selectMultiple && selectedVisitors.length > 0
      ? relatedVisitors.filter((v) => selectedVisitors.includes(v.id))
      : [
          relatedVisitors.find(
            (v) => (v.visitor_number || '').toString() === (selectedVisitorNumber || '').toString(),
          ),
        ].filter(Boolean);

  const statusActions: Record<string, string[]> = {
    Checkin: ['checkout', 'block'],
    Checkout: ['block'],
    Block: ['unblock'],
    Unblock: ['block'],
  };

  let actions = new Set<string>();

  if (selectedData.length === 1) {
    const v = selectedData[0];

    if (v?.visitor_status === 'Preregis' && !v?.is_praregister_done) {
      actions.add('fill_form');
    }

    (statusActions[v?.visitor_status as string] || []).forEach((a: any) => actions.add(a));

    if (v?.visitor_status === 'Preregis' && v?.is_praregister_done) {
      actions.add('checkin');
      actions.add('block');
    }
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

    const union = Array.from(new Set(actionArrays.flat()));

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

  const handleUploadMethodChange = (ukey: string, v: string) => {
    setUploadMethods((prev) => ({ ...prev, [ukey]: v as 'file' | 'camera' }));
  };

  const buildGroupSections = (sections?: any[]) => {
    const list = Array.isArray(sections) ? sections : [];

    const hasForm = list.some((s) => Array.isArray(s.form));

    if (hasForm) {
      const nonDocSections = list.filter((s) => !s.is_document);
      const docSections = list.filter((s) => s.is_document);

      const visitorInfoSrc = nonDocSections.find((s) =>
        s.name.toLowerCase().includes('visitor information'),
      );
      const parkingSrc = nonDocSections.find((s) =>
        s.name.toLowerCase().includes('parking/vehicle'),
      );
      const purposeVisitSrc = nonDocSections.find((s) =>
        s.name.toLowerCase().includes('purpose visit'),
      );

      const docForms = docSections.flatMap((d) => d.form || []);

      const makeSection = (src: any, name: string, allowMultiple = false, includeDocs = false) => {
        const baseForms = Array.isArray(src?.form)
          ? src.form.map((f: any, i: number) => ({
              ...f,
              sort: f.sort ?? i,
            }))
          : [];

        return {
          id: src?.id ?? generateUUIDv4(),
          name,
          is_document: false,
          can_multiple_used: allowMultiple,
          visit_form: includeDocs ? [...baseForms, ...docForms] : baseForms,
        };
      };

      const visitorCombinedForms = [
        ...(visitorInfoSrc?.form || []),
        ...(parkingSrc?.form || []),
        ...docForms,
      ].map((f: any, i: number) => ({ ...f, sort: f.sort ?? i }));

      const visitorGroupSection = {
        id: visitorInfoSrc?.id ?? generateUUIDv4(),
        name: 'Visitor Information (Group)',
        is_document: false,
        can_multiple_used: true,
        visit_form: visitorCombinedForms,
      };

      const purposeVisitSection = makeSection(purposeVisitSrc, 'Purpose Visit', false, false);

      return [visitorGroupSection, purposeVisitSection];
    }

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

      if (isPurposeVisit(section)) {
        if (!section?.self_only) {
          // hanya Purpose Visit global (shared)
          forms.forEach((f: any, idx: number) => {
            const existing = (section.form_answers || []).find((ans: any) => sameField(ans, f));
            single_page.push(existing ? { ...f, ...existing } : cloneFormWithEmptyAnswers(f, idx));
          });
        }
        return;
      }

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
    };
  };

  const [invitationDetail, setInvitationDetail] = useState<any>([]);
  const [questionPageTemplate, setQuestionPageTemplate] = useState<any[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);

  const handleApplyToAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setApplyToAll(checked);
  };

  const handleOpenFillFormDialog = async (visitors: any[] | string) => {
    try {
      let visitorList: any[] = [];

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

      const results = await Promise.all(
        visitorList.map((v) => getDetailInvitationForm(token as string, v.id)),
      );

      const firstResult = results[0];
      const questionPagesTemplate = firstResult?.collection?.question_page ?? [];

      setInvitationDetail(firstResult);
      setQuestionPageTemplate(questionPagesTemplate);

      const baseSections = buildGroupSections(questionPagesTemplate);
      setFillFormData(baseSections);
      setFillFormActiveStep(0);
      setFillFormGroupedPages(buildGroupedPages(baseSections));

      const visitorGroupList = results.map((res, idx) => {
        const v = visitorList[idx];
        const qPages = res?.collection?.question_page ?? [];

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
    } catch (e: any) {
      const message =
        e?.response?.data?.msg ??
        e?.response?.data?.message ??
        e?.message ??
        e?.msg ??
        'Failed to load forms';

      showSwal('error', message);
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
      f.some((x: any) => x.remarks === 'host' || x.remarks === 'agenda') &&
      !section.is_document &&
      section.can_multiple_used
    )
      return 'purpose_visit';
    if (
      f.some((x: any) => x.remarks === 'host' || x.remarks === 'agenda') &&
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
      return null;
    }

    const renderInput = () => {
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

          const hostName = invitationDetail?.collection?.host_name ?? '';
          const hostId = invitationDetail?.collection?.host ?? '';
          const sitePlaceName = invitationDetail?.collection?.site_place_name ?? '';
          const sitePlaceId = invitationDetail?.collection?.site_place ?? '';

          switch (field.remarks) {
            case 'host':
              options = [{ value: hostId, name: hostName }];
              break;

            case 'employee':
              options = allVisitorEmployee.map((emp: any) => ({
                value: emp.id,
                name: emp.name,
              }));
              break;

            case 'site_place':
              options = [{ value: sitePlaceId, name: sitePlaceName }];
              break;

            default:
              options = (field.multiple_option_fields || []).map((opt: any) =>
                typeof opt === 'object' ? opt : { value: opt, name: opt },
              );
              break;
          }
          const uniqueKey = opts?.uniqueKey ?? `${activeStep}:${index}`;
          const inputVal = inputValues[uniqueKey as any] || '';

          return (
            <Autocomplete
              size="small"
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
                  placeholder="Enter at least 3 characters to search"
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

            const currentValue = field.answer_text ?? '';

            return (
              <TextField
                select
                size="small"
                fullWidth
                value={currentValue}
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
                    const utc = newValue.utc().format();
                    onChange(index, 'answer_datetime', utc);
                  }
                }}
                format="dddd, DD MMMM YYYY, HH:mm"
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
                value={field.answer_file as string | undefined}
                onChange={(url) => {
                  onChange(index, 'answer_file', url);
                }}
              />
            );
          }
          return (
            <CameraUpload
              value={field.answer_file as string | undefined}
              onChange={(url) => onChange(index, 'answer_file', url)}
            />
          );

        case 11: {
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
                  value={field.answer_file as string | undefined}
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
          <CustomFormLabel sx={{ mb: 1 }} required={field.mandatory}>
            {field.long_display_text}
          </CustomFormLabel>
        )}
        {renderInput()}
      </Box>
    );
  };

  const [selectedAccessIds, setSelectedAccessIds] = useState<string[]>([]);

  // Allowed Actions Logic

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
    if (!accessId) return [];

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

    const commonActions = perVisitorActions.reduce(
      (acc, cur) => acc.filter((x) => cur.includes(x)),
      perVisitorActions[0] || [],
    );

    const permissionActions = getAllowedActionsByPermission(accessId, permissionAccess);

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

    if (selectedVisitors.length > 1) {
      const allActions = ['Grant', 'Revoke', 'Block'];

      const permissionActions = selectedAccessIds.flatMap((id) =>
        getAllowedActionsByPermission(id, permissionAccess),
      );

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

  // Multiple
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
      // toast('Submit gagal', 'error');
      showSwal('error', 'Failed Submit Pra Register!');
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

    const filtered = allAccessData.filter((a) =>
      selectedVisitors.some((id) => id.toLowerCase() === a.trx_visitor_id?.toLowerCase()),
    );

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

          acc[key].visitor_give_access = Math.max(
            acc[key].visitor_give_access ?? 0,
            curr.visitor_give_access ?? 0,
          );

          acc[key].early_access = acc[key].early_access || curr.early_access;
        }
        return acc;
      }, {}),
    );

    setAccessData(mergedAccess);
  }, [selectedVisitors]);

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

      if (action === 'grant' && visitor_give_access === 1) {
        invalidVisitors.push({
          visitorId,
          name: visitorName,
          accessName: access_control_name,
          reason: 'already granted',
        });
        return;
      }

      validVisitors.push({
        visitorId,
        name: visitorName,
        accessName: access_control_name,
      });
    });

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

  // Access : Grant dll
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

        const targetVisitors = allAccessData
          .filter(
            (a) =>
              a.access_control_id?.toLowerCase() === accessControlId.toLowerCase() &&
              selectedVisitors.some((v) => v.toLowerCase() === a.trx_visitor_id?.toLowerCase()),
          )
          .map((a) => a.trx_visitor_id?.toLowerCase());

        console.log(targetVisitors);

        const { validVisitors, invalidVisitors, message } = validateMultiVisitorAccess(
          accessControlId,
          targetVisitors,
          allAccessData,
          relatedVisitors,
          action,
        );

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

        showSwal('success', backendMsg);

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

        showSwal('error', backendMsg);
        resolve();
      } finally {
        setTimeout(() => setLoadingAccess(false), 600);
      }
    });
  };

  // Faceimage && Upload Identity
  const activeVisitor =
    relatedVisitors.find((v) => v.id === selectedVisitorId) || invitationCode[0];

  const activeSelfie =
    activeVisitor?.selfie_image &&
    activeVisitor?.selfie_image !== '-' &&
    activeVisitor?.selfie_image !== ''
      ? `${axiosInstance2.defaults.baseURL}/cdn${activeVisitor.selfie_image}`
      : null;

  const activeKTP =
    activeVisitor?.identity_image &&
    activeVisitor?.identity_image !== '-' &&
    activeVisitor?.identity_image !== ''
      ? `${axiosInstance2.defaults.baseURL}/cdn${activeVisitor.identity_image}`
      : null;

  const activeBarcode = activeVisitor?.nda
    ? `${axiosInstance2.defaults.baseURL}/cdn${activeVisitor.nda}`
    : null;

  const [todayVisitingPurpose, setTodayVisitingPurpose] = useState<any[]>([]);
  const [visitorType, setVisitorType] = useState<any[]>([]);
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

  const [vtLoading, setVTLoading] = useState(false);

  const fetchVisitorType = async () => {
    try {
      setVTLoading(true);
      const res = await getAllVisitorType(token as string);
      setVisitorType(res?.collection || []);
    } catch (err) {
      console.error(err);
    } finally {
      setVTLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVisitorType();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTodayVisitingPurpose();
    }
  }, [token]);

  // Print Preview
  const [openPreviewPrint, setOpenPreviewPrint] = useState(false);
  const [openBulkPrint, setOpenBulkPrint] = useState(false);

  const handlePrint = () => {
    setOpenPreviewPrint(true);
  };

  const selectedBulkVisitors = relatedVisitors.filter((v) => selectedVisitors.includes(v.id));

  const handlePrintClick = () => {
    if (selectedVisitors.length === 1) {
      setOpenPreviewPrint(true);
    } else if (selectedVisitors.length > 1) {
      setOpenBulkPrint(true);
    }
  };

  // Function Return Card
  const handleSubmitReturnCard = async () => {
    try {
      if (!returnCardNumber.trim()) {
        showSwal('warning', 'Please enter card number');
        return;
      }
      setLoadingAccess(true);

      const payload = {
        card_number: returnCardNumber.trim(),
      };

      console.log('return card payload', payload);
      await returnCard(token as string, payload);
      showSwal('success', 'Succesfully returned card');
      setOpenReturnCard(false);
      setReturnCardNumber('');
      // await fetchAvailableCards?.();
    } catch (error: any) {
      console.error(error);
      showSwal('error', error.message || 'Failed to return card');
    } finally {
      setLoadingAccess(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA'].includes(tag)) return;

      if (e.ctrlKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        handleOpenScanQR();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [currentVisitorIndex, setCurrentVisitorIndex] = useState(0);

  const handleCloseSwipeAccess = () => {
    setOpenSwipeAccess(false);

    if (currentVisitorIndex < filteredVisitors.length - 1) {
      setCurrentVisitorIndex((prev) => prev + 1);
      setOpenSwipeDialog(true);
    } else {
      showSwal('success', 'All visitors processed');
      setCurrentVisitorIndex(0);
    }
  };

  // const {
  //   data: visitorType = [],
  //   isLoading: vtLoading,
  //   isError: vtError,
  // } = useQuery({
  //   queryKey: ['visitorType', token],
  //   queryFn: async () => {
  //     if (!token) return [];
  //     const res = await getAllVisitorType(token);
  //     return res?.collection ?? [];
  //   },
  //   staleTime: 5 * 60 * 1000,
  //   gcTime: 30 * 60 * 1000,
  //   refetchOnWindowFocus: false,
  //   enabled: !!token,
  // });

  const parkingData = [
    { id: 1, vehicle_type: 'Car', vehicle_plate_number: 'BG 817 AS' },
    { id: 2, vehicle_type: 'Motorcycle', vehicle_plate_number: 'B 1512 AA' },
  ];

  const vehicleData = [
    { id: 1, visitor_type: 'Visitor', vehicle_type: 'Car', vehicle_plate_number: 'BG 817 AS' },
    { id: 2, visitor_type: 'Visitor', vehicle_type: 'Car', vehicle_plate_number: 'AA 817 AS' },
    { id: 3, visitor_type: 'Visitor', vehicle_type: 'Car', vehicle_plate_number: 'B 817 AS' },
    // { id: 2, vehicle_type: 'Motorcycle', sum: 2 },
  ];

  const [openWhiteList, setOpenWhiteList] = useState(false);

  const whiteListData = [
    {
      id: 1,
      name: 'John Doe',
      gender: 'Male',
      phone: '0892312312',
      email: 'JohnDoe@gmail.com',
      identity_id: '1234567890',
      organization: 'Oap Corp',
    },
  ];

  return (
    <PageContainer title={'Operator View'} description={'Operator View'}>
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

            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* RIGHT CONTENT */}
          <Box
            flexGrow={1}
            sx={{
              overflow: isFullscreen ? 'auto' : 'hidden',
              display: 'flex',
              padding: '10px',
              flexDirection: 'column',

              height: isFullscreen ? '100vh' : 'auto',
            }}
          >
            <Grid container spacing={1} mb={0}>
              <Grid size={{ xs: 12, sm: 12, lg: 9 }}>
                <VisitorSearchInput onOpenSearch={() => setOpenSearch(true)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, lg: 3 }}>
                <OperatorToolbar
                  onClear={handleClearAll}
                  onOpenList={handleOpenListVisitor}
                  onOpenBlacklist={handleOpenBlacklistVisitor}
                  onOpenInfo={() => setOpenDialogInfo(true)}
                  onOpenVehicle={handleOpenVehicle}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => (isFullscreen ? handle.exit() : handle.enter())}
                  containerRef={containerRef as any}
                />
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
                  flexWrap: 'wrap',
                }}
              >
                {/* 🧩 Card FR */}
                <Grid
                  size={{ xs: 12, lg: 4.5 }}
                  sx={{ border: '1px solid #e0e0e0', borderRadius: '15px' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: isFullscreen ? 'center' : 'flex-start',
                      // alignItems: isFullscreen ? 'center' : 'start',
                      alignItems: 'start',
                      gap: '5px',
                      padding: '20px',
                      flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' },
                      // overflow: isFullscreen ? 'auto' : 'hidden',
                    }}
                  >
                    <Card
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        height: '100%',
                        maxHeight: isFullscreen ? '50vh' : { xs: '100%', sm: '100%', xl: '400px' },
                        // border: '1px solid #e0e0e0',
                        boxShadow: 'none !important',
                        backgroundColor: 'none !important',
                        py: '0 !important',
                        px: { xs: '0', lg: '10px' },
                      }}
                    >
                      <CardContent
                        sx={{
                          // p: 1,
                          padding: '0 !important',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          flexDirection: { xs: 'row', md: 'row', lg: 'row', xl: 'row' },
                          maxHeight: isFullscreen ? '100%' : { xs: '100%', xl: '300px' },
                          overflow: 'hidden',
                          boxShadow: 'none !important',
                          backgroundColor: 'none !important',
                        }}
                      >
                        {/* LPR Image */}
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
                          {LprImage ? (
                            <img
                              src={LprImage}
                              alt="LPR"
                              style={{
                                width: '100%',
                                // maxWidth: '400px',
                                height: '100%',
                                minHeight: '300px',
                                maxHeight: lgUp ? '400px' : '300px',
                                objectFit: 'cover',
                                borderRadius: '15px',
                              }}
                            />
                          ) : (
                            <Typography color="text.secondary">No LPR image</Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                    {todayVisitingPurpose.length === 0 ? (
                      <Card
                        sx={{
                          flex: 1,
                          p: 3,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)',
                          textAlign: 'center',
                          maxHeight: isFullscreen ? '100%' : { xs: '100%', xl: '300px' },
                          height: { xs: '100%', sm: '100%', xl: '290px' },
                          minHeight: { xs: '100%', sm: '300px', xl: '300px' },
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CardContent>
                          <img src={backgroundnodata} alt="No Data" height="100" width="100%" />
                          <Typography variant="h5" fontWeight={600} color="text.secondary" mt={3}>
                            {t('no_visit_today')}
                          </Typography>
                        </CardContent>
                      </Card>
                    ) : (
                      <Stack spacing={2} sx={{ flex: 1 }}>
                        {todayVisitingPurpose.slice(0, 5).map((item) => (
                          <Card
                            onClick={() => handleOpenDetailVistingPurpose(item)}
                            key={item.id}
                            sx={{
                              flex: 1,
                              height: 'auto',
                              minHeight: 0,
                              p: 0,
                              borderRadius: 1,
                              background: getColorByName(item.name),
                              boxShadow: '0 6px 14px rgba(93, 135, 255, 0.3)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 10px 18px rgba(93, 135, 255, 0.45)',
                              },
                              cursor: 'pointer',
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
                                height: '50px',
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
                      </Stack>
                    )}
                  </Box>
                  <Box
                    sx={{
                      justifyContent: 'center',
                      borderTop: '1px solid #eee',
                      py: 1,
                      mt: 0,
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
                      {invitationCode[0]?.visitor?.name ||
                        'No visitor data found. Please scan QR first.'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Visiting Purpose*/}
                <Grid
                  size={{ xs: 12, lg: 4.5 }}
                  sx={{
                    display: 'flex',
                    justifyContent: isFullscreen ? 'center' : 'flex-start',
                    alignItems: isFullscreen ? 'center' : 'stretch',
                    // overflow: isFullscreen ? 'auto' : 'hidden',
                  }}
                >
                  <Card
                    sx={{
                      borderRadius: 2,
                      height: '100%',
                      maxHeight: isFullscreen
                        ? { xs: '100%', sm: '100%', lg: '80%', xl: '100%' }
                        : { xs: '100%', sm: '100%', xl: '400px' },
                      border: '1px solid #e0e0e0',
                      overflow: isFullscreen ? 'auto' : 'hidden',
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

                          <Box display={'flex'} mt={0.5} gap={1}>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<IconClipboard size={25} />}
                              onClick={() => setOpenPreRegistration(true)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 2.5,

                                // boxShadow: '0 2px 6px rgba(0, 200, 83, 0.4)',
                                zIndex: 999,
                                width: '100%',
                                height: '50px',
                                p: 0,
                                backgroundColor: '#',
                              }}
                            >
                              <Typography variant="h6" color="white">
                                Pra Register
                              </Typography>
                            </Button>

                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<IconUser size={25} />}
                              onClick={() => setOpenInvitationVisitor(true)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 2.5,
                                // boxShadow: '0 2px 6px rgba(0, 200, 83, 0.4)',
                                zIndex: 999,
                                width: '100%',
                                height: '50px',
                                p: 0,
                              }}
                            >
                              <Typography variant="h6" color="white">
                                Invitation
                              </Typography>
                            </Button>
                          </Box>

                          <Grid container spacing={isFullscreen ? 1 : 1.5}>
                            {/* Checkin */}
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Button
                                variant="contained"
                                startIcon={<IconLogin size={25} />}
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
                                  height: '50px',
                                  p: 0,
                                  backgroundColor: '#22C55E',
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Checkin
                                </Typography>
                              </Button>
                            </Grid>
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Button
                                variant="contained"
                                startIcon={<IconLogout size={25} />}
                                onClick={() => handleActionClick('Checkout')}
                                size="large"
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 2.5,
                                  background: 'linear-gradient(135deg, #FF5252 0%, #D50000 100%)',
                                  boxShadow: '0 2px 6px rgba(255, 82, 82, 0.4)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #D50000 0%, #B71C1C 100%)',
                                  },
                                  zIndex: 999,
                                  width: '100%',
                                  height: '50px',
                                  p: 0,
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Checkout
                                </Typography>
                              </Button>
                            </Grid>
                            {/* Card */}
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Button
                                variant="contained"
                                startIcon={<IconCards size={28} />}
                                onClick={() => handleOpenAction('card')}
                                size="large"
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,

                                  px: '10px !important',
                                  background: 'linear-gradient(135deg, #AB47BC 0%, #6A1B9A 100%)',
                                  boxShadow: '0 2px 6px rgba(171, 71, 188, 0.4)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #8E24AA 0%, #4A148C 100%)',
                                  },
                                  zIndex: 999,
                                  width: '100%',
                                  height: '50px',
                                  p: 0,
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Card Issuance
                                </Typography>
                              </Button>
                            </Grid>

                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Button
                                variant="contained"
                                startIcon={<IconCards size={28} />}
                                onClick={() => setOpenReturnCard(true)}
                                size="large"
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: '10px !important',

                                  background: 'linear-gradient(135deg, #1E88E5 0%, #3949AB 100%)',
                                  boxShadow: '0 2px 6px rgba(171, 71, 188, 0.4)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #1E88E5 0%, #3949AB 100%)',
                                  },
                                  zIndex: 999,
                                  width: '100%',
                                  height: '50px',
                                  p: 0,
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Card Return
                                </Typography>
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid size={{ xs: 12, xl: 5 }}>
                          <Grid container spacing={isFullscreen ? 1.5 : 1.5}>
                            {/* Access */}
                            <Grid size={{ xs: 6, lg: 6 }}>
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
                                    background: 'linear-gradient(135deg, #FB8C00 0%, #E65100 100%)',
                                  },
                                  zIndex: 999,
                                  width: '100%',
                                  height: '50px',
                                  p: 0,
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Access
                                </Typography>
                              </Button>
                            </Grid>

                            {/* Parking */}
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Button
                                variant="contained"
                                startIcon={<IconParking size={25} />}
                                onClick={() => handleOpenAction('parking')}
                                size="large"
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 2.5,
                                  background: '#00ACC1',
                                  boxShadow: '0 2px 6px rgba(0, 172, 193, 0.4)',
                                  zIndex: 999,
                                  width: '100%',
                                  height: '50px',
                                  p: 0,
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Parking
                                </Typography>
                              </Button>
                            </Grid>

                            {/* Report */}
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Button
                                variant="contained"
                                startIcon={<IconDoor size={25} />}
                                // onClick={handleOpenTriggeredAccess}
                                onClick={() => handleOpenAction('open')}
                                size="large"
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 2.5,
                                  background: 'brown',
                                  boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                                  '&:hover': {
                                    background: 'brown',
                                  },
                                  zIndex: 999,
                                  width: '100%',
                                  height: '50px',
                                  p: 0,
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Open
                                </Typography>
                              </Button>
                            </Grid>
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Button
                                variant="contained"
                                startIcon={<IconClock size={25} />}
                                onClick={() => handleOpenAction('extend')}
                                size="large"
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 2.5,
                                  boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                                  background: 'linear-gradient(135deg, #FFE082 0%, #FFCA28 100%)',
                                  zIndex: 999,
                                  width: '100%',
                                  height: '50px',
                                  p: 0,
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Extend
                                </Typography>
                              </Button>
                            </Grid>
                            <Grid size={{ xs: 6, lg: 6 }}>
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
                                  height: '50px',
                                  p: 0,
                                  backgroundColor: '#10B981',
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Arrival
                                </Typography>
                              </Button>
                            </Grid>
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Button
                                variant="contained"
                                size="large"
                                sx={{
                                  background: '#5f5f5f',
                                  '&:hover': { backgroundColor: '#5f5f5f' },
                                  marginLeft: 0,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 2.5,
                                  zIndex: 999,
                                  width: '100%',
                                  height: '50px',
                                }}
                                onClick={handlePrint}
                                startIcon={<IconPrinter size={25} />}
                              >
                                Print
                              </Button>
                            </Grid>
                            <Grid size={{ xs: 6, lg: 6 }}>
                              <Button
                                variant="contained"
                                startIcon={<IconUser size={25} />}
                                // onClick={handleOpenScanQR}
                                onClick={() => handleActionBlacklist('Blacklist')}
                                size="large"
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 2.5,
                                  boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                                  zIndex: 999,
                                  width: '100%',
                                  height: '50px',
                                  p: 0,
                                  backgroundColor: '#000',
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Blacklist
                                </Typography>
                              </Button>
                            </Grid>
                            {/* <Grid size={{ xs: 6, lg: 6 }}>
                              <Button
                                variant="contained"
                                startIcon={<IconUser size={25} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenWhiteList(true);
                                }}
                                size="large"
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 2.5,
                                  boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                                  zIndex: 999,
                                  width: '100%',
                                  height: '50px',
                                  p: 0,
                                  backgroundColor: 'gray',
                                }}
                              >
                                <Typography variant="h6" color="white">
                                  Whitelist
                                </Typography>
                              </Button>
                            </Grid> */}
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Side Right QR Code */}
                <Grid size={{ xs: 12, lg: 3 }}>
                  <InvitationQrCard invitationCode={invitationCode} isFullscreen={isFullscreen} />
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
                alignItems: 'stretch',
              }}
            >
              <Grid
                size={{ xs: 12, lg: 4.5 }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  p: 1,
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Card
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'none',
                    p: 1,
                    minHeight: 450,
                  }}
                >
                  <CardContent sx={{ boxShadow: 'none', p: 0 }}>
                    <VisitorDetailTabs
                      invitationCode={invitationCode}
                      handleChooseCard={handleChooseCard}
                    />
                  </CardContent>
                  {invitationCode.length > 0 && invitationCode[0]?.visitor_number && (
                    <>
                      <CardActions
                        sx={{ justifyContent: 'center', mt: 2, flexWrap: 'wrap', gap: 1 }}
                      >
                        {(() => {
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
                                    // color="#21c45d"
                                    size="large"
                                    onClick={() => handleConfirmStatus('Checkin')}
                                    startIcon={<IconLogin />}
                                    sx={{ backgroundColor: '#21c45d' }}
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
                      {/* Barcode */}
                      <Box>
                        {activeBarcode && (
                          <img
                            src={activeBarcode}
                            alt="Barcode"
                            style={{ width: '100%', height: '135px', objectFit: 'cover' }}
                          />
                        )}
                      </Box>
                    </>
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
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Box display="flex" justifyContent="space-between">
                    <CardHeader title="Related Visitors" sx={{ p: 0 }} />
                    <Box display={'flex'} gap={1}>
                      <FormControl sx={{ width: '100%' }}>
                        <CustomTextField
                          fullWidth
                          size="medium"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          placeholder="Search Visitor"
                          sx={{ mb: 0, width: '100%', p: 0 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <IconSearch fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>
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
                                setSelectedVisitors([]);
                              }}
                            />
                          }
                          label="Select Multiple"
                          labelPlacement="end"
                          sx={{ marginRight: 0, width: '250px' }}
                        />
                      </Tooltip>
                    </Box>
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
                    {filteredVisitors.map((visitor, index) => {
                      const isDriving = visitor.is_driving === true;
                      const isScanned =
                        visitor.visitor_number &&
                        scannedVisitorNumber &&
                        visitor.visitor_number === scannedVisitorNumber;

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
                                src={`${axiosInstance2.defaults.baseURL}/cdn${visitor.selfie_image}`}
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
                  <CardActions sx={{ overflow: 'visible', p: '0' }}>
                    <Divider />
                    <Box
                      display={'flex'}
                      gap={1}
                      width={'100%'}
                      sx={{ mt: 2, justifyContent: 'space-between', marginLeft: '0 !important' }}
                      flexWrap={theme.breakpoints.down('lg') ? 'nowrap' : 'wrap'}
                    >
                      <Box
                        display="flex"
                        gap={1}
                        ref={containerRef}
                        sx={{ marginLeft: '0 !important' }}
                      >
                        <Select
                          sx={{ width: '130px', height: '40px' }}
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
                          sx={{ width: '80px', height: '40px' }}
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
                          justifyContent={lgUp ? 'flex-end' : 'start'}
                          flexWrap={lgUp ? 'nowrap' : 'wrap'}
                          // sx={{ px: 1}}
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

                                background: !relatedVisitors.some(
                                  (v) =>
                                    selectedVisitors.includes(v.id) &&
                                    v.visitor_status === 'Checkin',
                                )
                                  ? undefined
                                  : 'linear-gradient(135deg, #FFE082 0%, #FFCA28 100%)',

                                '&.Mui-disabled': {
                                  background: '#BDBDBD !important',
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
                                textWrap: 'wrap',
                                whiteSpace: 'normal',
                                lineHeight: 1.2,
                                textAlign: 'center',
                              }}
                              onClick={handleChooseCard}
                              startIcon={<IconCreditCard size={18} />}
                            >
                              Card Issuance
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
                          <Tooltip
                            title="Print Badge"
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
                                backgroundColor: '#5f5f5f',
                                color: '#fff',
                                '&:hover': {
                                  backgroundColor: '#5f5f5f',
                                },
                              }}
                              onClick={handlePrintClick}
                              startIcon={<IconPrinter size={18} />}
                            >
                              Print
                            </Button>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 3 }} sx={{ height: '100%' }}>
                <VisitorImage
                  faceImage={activeSelfie}
                  identityImage={activeKTP}
                  isFullscreen={isFullscreen}
                />
              </Grid>
            </Grid>
          </Box>
          {/* Print */}
          <PrintDialogBulk
            open={openBulkPrint}
            onClose={() => setOpenBulkPrint(false)}
            visitors={selectedBulkVisitors}
            printData={printData}
          />
          <PrintDialog
            open={openPreviewPrint}
            onClose={() => setOpenPreviewPrint(false)}
            invitationData={invitationCode[0]}
            printData={printData}
          />
          {/* Detail Purpose */}
          <DetailVisitingPurpose
            open={openDetailVisitingPurpose}
            onClose={() => setOpenDetailVistingPurpose(false)}
            data={selectedPurpose}
          />
          {/* Search Visitor */}
          <SearchVisitorDialog
            open={openSearch}
            onClose={() => setOpenSearch(false)}
            onSearch={(data) => {
              setVisitorData(data);
              setOpenDetail(true);
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
          <BlacklistVisitorDialog
            open={openBlacklistVisitor}
            onClose={handleCloseBlacklistVisitor}
          />
          {/* List Visitor */}
          <ListVisitorDialog open={openListVisitor} onClose={handleCloseListVisitor} />
          {/* Open */}
          <TriggeredAccessDialog open={openTriggeredAccess} onClose={handleCloseTriggeredAcceess} />
          {/* Dialog Swipe No Code */}
          <SwipeCardNoCodeDialog
            open={openSwipeDialogNoInvitation}
            onClose={handleCloseSwipeDialogNoInvitation}
            findCard={findCard}
            showSwal={showSwal}
            setSnackbar={setSnackbar}
            onSubmit={handleSwipeCardSubmitNoCode}
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
              onClick={() => {
                setOpenChooseCardDialog(false);
                setActionButton('');
              }}
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

              <Box mb={2} onClick={(e) => e.stopPropagation()}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      indeterminate={isIndeterminate}
                      onChange={handleSelectAll}
                      disabled={capacity === 0}
                    />
                  }
                  label="Select All"
                />
              </Box>

              {currentUsedCard && (
                <>
                  <Grid container spacing={2} mb={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Paper
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
                          border: '2px solid',
                          borderColor: theme.palette.warning.main,
                          backgroundColor: theme.palette.warning.light,
                          boxShadow: theme.shadows[6],
                        })}
                      >
                        <Box
                          flexGrow={1}
                          display="flex"
                          flexDirection="column"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h1" color="text.secondary" mt={1}>
                            {currentUsedCard.card_number}
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
                            <Typography variant="body1">{currentUsedCard.card_number}</Typography>
                          </Box>

                          <Box
                            display="flex"
                            justifyContent="space-between"
                            width="100%"
                            maxWidth={300}
                            flexWrap="wrap"
                            gap={1}
                          >
                            <Typography variant="body1" fontWeight={600}>
                              BLE
                            </Typography>
                            <Typography variant="body1">
                              {currentUsedCard.card_mac || '-'}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="body1">{currentUsedCard.name}</Typography>

                        <Typography variant="body2" color="warning.main" fontWeight={600}>
                          Swipe Card (Last Used Card)
                        </Typography>

                        <FormControlLabel
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          control={
                            <Checkbox
                              checked={selectedCards.includes(currentUsedCard.card_number)}
                              // disabled={!isChosen}
                              onChange={() => handleToggleCard(currentUsedCard.card_number)}
                            />
                          }
                          label=""
                          sx={{ m: 0 }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                  <Divider sx={{ mb: 2 }} />
                </>
              )}

              <Grid container spacing={2}>
                {filteredCards.map((card) => {
                  const isChosen = selectedCards.includes(card.card_number);
                  const isLimitReached =
                    selectedCards.length >= (selectedVisitors.length || 1) && !isChosen;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.id}>
                      <Paper
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
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
                              // disabled={!isChosen}
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
                <Box display="flex" flexDirection="row" gap={1}>
                  <Typography variant="body1">
                    Cards chosen: {selectedCards.length} / {availableCount} |
                  </Typography>
                  <Typography variant="body1">
                    {/* You selected <b>{selectedVisitors.length || 1}</b> visitor(s). */}
                    Maximum cards allowed: <b>{selectedVisitors.length || 1}</b>
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                fullWidth
                variant="contained"
                // disabled={selectedCards.length === 0}
                onClick={handleOpenSwipeDialog}
                color="warning"
                sx={{ fontSize: '16px' }}
                startIcon={<IconSwipe />}
                disabled={!!currentUsedCard && selectedCards.includes(currentUsedCard.card_number)}
              >
                Swipe
              </Button>
              <Button
                fullWidth
                variant="contained"
                // disabled={selectedCards.length === 0}
                onClick={handleConfirmChooseCards}
                color="primary"
                sx={{ fontSize: '16px' }}
                startIcon={<IconCards />}
              >
                Give
              </Button>
            </DialogActions>
          </Dialog>
          {/* Dialog Swipe */}
          <SwipeCardDialog
            open={openSwipeDialog}
            onClose={handleCloseSwipeDialog}
            onSubmit={handleSwipeCardSubmit}
            invitationId={invitationId}
            visitors={filteredVisitors}
            loading={setLoadingAccess}
            currentVisitorIndex={currentVisitorIndex}
            setCurrentVisitorIndex={setCurrentVisitorIndex}
          />
          {/* Dialog Choose registered Site Access Site */}
          <RegisteredSiteAccessDialog
            open={openRegisteredSite}
            onClose={() => {
              setSelectedSite(null);
              setOpenRegisteredSiteDialog(false);
              setAction('');
            }}
            siteRegistered={siteRegistered}
            selectedSite={selectedSite}
            setSelectedSite={setSelectedSite}
            action={action}
            setAction={setAction}
            containerRef={containerRef.current}
            onSubmit={(action: 'grant' | 'revoke', site) => {
              console.log(action, site);
            }}
          />
          {/* Dialog Swipe Access */}
          <SwipeAccessDialog
            open={openSwipeAccess}
            onClose={handleCloseSwipeAccess}
            data={accessData}
            payload={swipePayload}
            invitationId={invitationId as string}
            visitor={currentAccessVisitor}
          />
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
                      console.log('section', sectionType);
                      if (sectionType === 'visitor_information_group') {
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
                                            <CustomFormLabel required={f.mandatory == true}>
                                              {f.long_display_text}
                                            </CustomFormLabel>
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
                                                const formIdx = page.form.findIndex(
                                                  (x: any) => x.remarks === field.remarks,
                                                );

                                                return (
                                                  <TableCell key={field.remarks}>
                                                    {renderFieldInput(
                                                      field,
                                                      formIdx,
                                                      (idx, fieldKey, value) => {
                                                        setFillFormDataVisitor((prev) => {
                                                          const next = structuredClone(prev);
                                                          const s = fillFormActiveStep;

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
                                                        uniqueKey: `${fillFormActiveStep}:${gIdx}:${field.remarks}`,
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
                                  <Box sx={{ pointerEvents: 'none', opacity: 0.6 }}>
                                    {renderFieldInput(f, idx, () => {}, undefined, {
                                      showLabel: false,
                                      uniqueKey: `${fillFormActiveStep}:${idx}`,
                                    })}
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
                startIcon={<IconArrowLeft />}
              >
                Back
              </Button>
              {fillFormActiveStep < fillFormData.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    setFillFormActiveStep((p) => p + 1);
                  }}
                  endIcon={<IconArrowRight />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitPramultiple}
                  disabled={loadingAccess}
                >
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
            <DialogTitle>Fill Pra Registration Form</DialogTitle>
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
          {/* Access Dialog */}
          <AccessDialog
            open={openAccessData}
            onClose={() => {
              setAction('');
              setOpenAccessData(false);
            }}
            containerRef={containerRef.current || null}
            accessData={accessData}
            selectedVisitors={selectedVisitors}
            allowedActions={allowedActions}
            selectedAccessIds={selectedAccessIds}
            setSelectedAccessIds={setSelectedAccessIds}
            selectedActionAccess={selectedActionAccess || ''}
            setSelectedActionAccess={setSelectedActionAccess}
            handleAccessAction={handleAccessAction}
            setSnackbarOpen={setSnackbarOpen}
            setSnackbarMsg={setSnackbarMsg}
            setSnackbarType={setSnackbarType}
          />
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
            // keepMounted
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
                // key={wizardKey}
                formData={formDataAddVisitor}
                setFormData={setFormDataAddVisitor}
                onSuccess={handleSuccess}
                containerRef={containerRef}
                fullscreenHandle={handle}
                resetStep={resetStep}
                onInvitationCreated={handleInvitationCreated}
                ws={{
                  imageQueue: wsImageQueueRef,
                  ocrQueue: wsOcrQueueRef,
                  send: sendToScanner,
                }}
                // ws={ws}
                setWsPayload={setWsPayload}
                registeredSite={registerSiteOperator.user_id}
                forceTick={tick}
                visitorType={visitorType}
                sites={sites}
                employee={employee}
                allVisitorEmployee={allVisitorEmployee}
                vtLoading={vtLoading}
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
                visitorType={visitorType}
                sites={sites}
                employee={employee}
                allVisitorEmployee={allVisitorEmployee}
                vtLoading={vtLoading}
              />
            </DialogContent>
          </Dialog>

          {/* Parking /Vehicle Dialog */}
          <ParkingDialog
            open={openParking}
            onClose={() => {
              setActionButton('');
              setOpenParking(false);
            }}
            data={parkingData}
          />

          <VehicleDialog
            open={openVehicle}
            onClose={() => {
              setActionButton('');
              setOpenVehicle(false);
              console.log('vehicle');
            }}
            data={vehicleData}
          />

          <WhiteListDialog
            open={openWhiteList}
            onClose={() => setOpenWhiteList(false)}
            data={whiteListData}
          />

          {/* Info Dialog */}
          <InfoDialog
            open={openDialogInfo}
            onClose={() => setOpenDialogInfo(false)}
            data={dataImage}
            container={containerRef ?? null}
          />
          <ReturnCardDialog
            open={openReturnCard}
            value={returnCardNumber}
            loading={loadingAccess}
            onClose={() => setOpenReturnCard(false)}
            onChange={setReturnCardNumber}
            onSubmit={handleSubmitReturnCard}
          />

          <SnackbarOperator
            open={snackbarOpen}
            message={snackbarMsg}
            severity={snackbarType}
            onClose={() => setSnackbarOpen(false)}
          />
          <GlobalBackdropLoading open={loadingAccess} />
        </Box>
      </FullScreen>
    </PageContainer>
  );
};

export default OperatorView;
