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
  ListItem,
  CardActions,
  Avatar,
  CardHeader,
  Checkbox,
  FormControlLabel,
  MenuItem,
  AlertColor,
  Autocomplete,
  FormControl,
  RadioGroup,
  Radio,
  Tooltip,
  Select,
  Portal,
  Snackbar,
  Alert,
} from '@mui/material';
import { Box, useMediaQuery, useTheme } from '@mui/system';
import moment from 'moment-timezone';
import backgroundnodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import infoPic from 'src/assets/images/backgrounds/info_pic.png';
import { IconClock, IconCreditCard, IconPrinter, IconSearch, IconX } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import { useSession } from 'src/customs/contexts/SessionContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  createGiveAccessOperator,
  createGrandAccessOperator,
  createInvitationActionOperator,
  createMultipleGrantAccess,
  createMultipleInvitationActionOperator,
  createOperatorBlacklist,
  createSubmitCompletePraMultiple,
  extendPeriodOperator,
  getAvailableCardOperator,
  getInvitationCode,
  getInvitationOperatorRelated,
  getPermissionOperator,
  getTodayVisitingPurpose,
} from 'src/customs/api/operator';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import LprImage from 'src/assets/images/products/pic_lpr.png';
import SearchVisitorDialog from './Dialog/SearchVisitorDialog';
import DetailVisitorDialog from './Dialog/DetailVisitorDialog';
import Swal from 'sweetalert2';
import { getDetailInvitationForm } from 'src/customs/api/visitor';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import {
  CreateVisitorRequest,
  CreateVisitorRequestSchema,
  FormVisitor,
} from 'src/customs/api/models/Admin/Visitor';
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CameraUpload from './Components/CameraUpload';
import { showSwal } from 'src/customs/components/alerts/alerts';
import FormWizardAddVisitor from './Invitation/FormWizardAddVisitor';
import FormWizardAddInvitation from './Invitation/FormWizardAddInvitation';
import ScanQrVisitorDialog from './Dialog/ScanQrVisitorDialog';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import InfoDialog from './Dialog/InfoDialog';
import ExtendVisitDialog from './Dialog/ExtendVisitDialog';
import { useTranslation } from 'react-i18next';
import BlacklistVisitorDialog from './Dialog/BlacklistVisitorDialog';
import ListVisitorDialog from './Dialog/ListVisitorDialog';
import TriggeredAccessDialog from './Dialog/TriggeredAccessDialog';
import DetailVisitingPurpose from './Dialog/DetailVisitingPurpose';
import SwipeCardDialog from './Dialog/SwipeCardDialog';
import SwipeAccessDialog from './Dialog/SwipeAccessDialog';
import { useDebounce } from 'src/hooks/useDebounce';
import PrintDialog from './Dialog/PrintDialog';
import { getPrintBadgeConfig } from 'src/customs/api/Admin/PrintBadge';
import PrintDialogBulk from './Dialog/PrintDialogBluk';
import { getRegisteredSiteOperator, returnCard, swapCard } from 'src/customs/api/Admin/SwapCard';
import SwipeCardNoCodeDialog from './Dialog/SwipeCardNoCodeDialog';
import InvitationQrCard from './Components/InvitationQrCard';
import VisitorSearchInput from './Components/VisitorSearchInput';
import OperatorToolbar from './Components/OperatorToolbar';
import VisitorImage from './Components/VisitorImage';
import ReturnCardDialog from './Dialog/ReturnCardDialog';
import GlobalBackdropLoading from './Components/GlobalBackdrop';
import AccessDialog from './Dialog/AccessDialog';
import ParkingDialog from './Dialog/ParkingDialog';
import ActionPanelCard from './Components/ActionPanelCard';
import {
  getInvitationSite,
  getInvitationVisitorEmployee,
  getInvitationVisitorHost,
  getInvitationVisitorType,
} from 'src/customs/api/Admin/InvitationData';
import FillPraregistrationGroup from './Invitation/components/FillPraregistrationGroup';
import GrantAccessDialog from './Dialog/GrantAccessDialog';
import LprVisitorCard from './Components/LprVisitorCard';
import ChooseCardDialog from './Dialog/ChooseCardDialog';
import { getPermission } from 'src/customs/api/users';
import { usePermission } from 'src/hooks/usePermission';
import VisitorDetailCard from './Components/VisitorDetailCard';
import FillPraregistrationSingle from './Invitation/components/FillPraregistrationSingle';

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.locale('id');
const OperatorView = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const { token } = useSession();
  const { t } = useTranslation();

  const dataImage = [infoPic];
  const [invitationCode, setInvitationCode] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [wizardKey, setWizardKey] = useState(0);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openInvitationVisitor, setOpenInvitationVisitor] = useState(false);
  const [permissionAccess, setPermissionAccess] = useState<any[]>([]);
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
  const [accessData, setAccessData] = useState<any[]>([]);
  const [selectedActionAccess, setSelectedActionAccess] = useState<string | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [openExtendVisit, setOpenExtendVisit] = useState(false);
  const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180];
  const [openFillForm, setOpenFillForm] = useState(false);
  const [fillFormData, setFillFormData] = useState<any[]>([]);
  const [fillFormActiveStep, setFillFormActiveStep] = useState(0);
  const [fillFormGroupedPages, setFillFormGroupedPages] = useState<any>({});
  const [fillFormDataVisitor, setFillFormDataVisitor] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [openDialogInfo, setOpenDialogInfo] = useState(false);
  const [openSwipeDialog, setOpenSwipeDialog] = useState(false);
  const [selectedInvitations, setSelectedInvitations] = useState<any[]>([]);
  const [openSwipeAccess, setOpenSwipeAccess] = useState(false);
  const handle = useFullScreenHandle();
  const [currentAction, setCurrentAction] = useState<'Checkin' | 'Checkout' | null>(null);
  const [actionButton, setActionButton] = useState<any | null>(null);
  const [visitorCards, setVisitorCards] = useState<any[]>([]);
  const [returnCardNumber, setReturnCardNumber] = useState('');
  const [openListVisitor, setOpenListVisitor] = useState(false);
  const [openBlacklistVisitor, setOpenBlacklistVisitor] = useState(false);
  const [openTriggeredAccess, setOpenTriggeredAccess] = useState(false);
  const [registerSiteOperator, setRegisterSiteOperator] = useState<string>('');
  const [registeredSite, setRegisteredSite] = useState<any[]>([]);
  const [openSwipeDialogNoInvitation, setOpenSwipeDialogNoInvitation] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedKeyword = useDebounce(searchKeyword, 300);
  const [focusTarget, setFocusTarget] = useState<'old' | 'new' | null>(null);
  const oldCardRef = useRef<HTMLInputElement | null>(null);
  const newCardRef = useRef<HTMLInputElement | null>(null);
  const [currentAccessVisitor, setCurrentAccessVisitor] = useState<any>(null);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [dialogContainer, setDialogContainer] = useState<HTMLElement | null>(null);
  const [hidePageContainer, setHidePageContainer] = useState(false);
  const [invitationDetail, setInvitationDetail] = useState<any>([]);
  const [questionPageTemplate, setQuestionPageTemplate] = useState<any[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);
  const [openPreviewPrint, setOpenPreviewPrint] = useState(false);
  const [openBulkPrint, setOpenBulkPrint] = useState(false);
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
  const [sitesOperator, setSitesOperator] = useState<any[]>([]);
  const [printData, setPrintData] = useState<any>(null);
  const [resetStep, setResetStep] = useState(0);
  const [openRevokeDialog, setOpenRevokeDialog] = useState(false);
  const [openReturnCard, setOpenReturnCard] = useState(false);
  const [openParking, setOpenParking] = useState(false);
  const [openVehicle, setOpenVehicle] = useState(false);

  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });

  const [swipePayload, setSwipePayload] = useState<any | null>(null);

  const [dataDummyAccess, setDataDummyAccess] = useState<any[]>([
    {
      id: '1',
      site: 'SCP 3A',
    },
    {
      id: '2',
      site: 'SPU 2B',
    },
    {
      id: '3',
      site: 'SPU 1D',
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getInvitationSite(token as string);
        const filteredSites =
          res?.collection?.filter((site: any) => site.can_visited === true) ?? [];
        setSitesOperator(filteredSites);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRegisteredSiteOperator(token as string);

        const firstSite = res?.collection?.[0];
        setRegisterSiteOperator(firstSite?.id ?? '');
        // console.log('res register site', firstSite.id);
        setRegisteredSite(res?.collection ?? []);
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

  const sendToScanner = (payload: any) => {
    socketRef.current?.send(JSON.stringify(payload));
  };

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      const res = await getPrintBadgeConfig(token);
      setPrintData(res?.collection ?? []);
    };

    fetchData();
  }, [token]);

  const currentUsedCards = useMemo(() => {
    if (!Array.isArray(visitorCards)) return [];

    return visitorCards
      .filter(
        (c) =>
          (c.is_swapcard == false || c.is_swapcard == true) &&
          c.card_type !== 'Barcode' &&
          c.current_used === true,
      )
      .sort((a, b) => Number(a.current_used) - Number(b.current_used));
  }, [visitorCards]);

  useEffect(() => {
    setSelectedCards([]);
  }, [selectedVisitorId]);

  const handleSwipeCardSubmit = async (
    value: string,
    type: string,
    visitor: any,
    isLastVisitor: boolean,
    visitorIndex: number,
  ) => {
    setLoadingAccess(true);
    try {
      // const selectedCardNumber = selectedCards[visitorIndex];
      const selectedCardNumber = selectedCards[0];
      const selectedCard = filteredCards.find((c) => c.card_number === selectedCardNumber);

      if (!selectedCard) {
        showSwal('error', 'Card not found');
        return;
      }

      const hasSwappedCard = visitor?.card?.some((c: any) => c.is_swapcard);

      const payload = {
        card_number: selectedCard.card_number,
        trx_visitor_id: visitor.id,
        description: `Give card number ${selectedCard.card_number} from ${registerSiteOperator}`,
        swap_card_from_card: value,
        swap_type: type,
        swap_card_from_site_id: registerSiteOperator,
        is_swapcard: true,
        registerd_site_id: registerSiteOperator,
      };

      console.log('SWAP PAYLOAD', payload);

      if (!hasSwappedCard) {
        console.log('FIRST SWIPE', payload);
        await createGrandAccessOperator(token as string, payload);
        showSwal('success', 'Card swaped successfully!');
        setOpenChooseCardDialog(false);
        setSearchTerm('');
        await fetchRelatedVisitorsByInvitationId(invitationId as string);
      } else {
        // setSwipePayload(payload);
        setSwipePayload([payload]);
        setCurrentAccessVisitor(visitor);
        setOpenSwipeAccess(true);
      }

      setOpenSwipeDialog(false);
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to swipe card');
    } finally {
      setLoadingAccess(false);
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
          'Give card number ' + newCardData.card_number + ' from ' + registerSiteOperator,
        // swap_card_from_card: oldCardData.card_number,
        swap_card_from_site_id: registerSiteOperator,
        swap_type: isSwap ? 'CardAccess' : 'Other',
        is_swapcard: isSwap,
        registered_site_id: registerSiteOperator,
      };

      if (isSwap) {
        payload.swap_card_from_card = oldCardData.card_number;
        payload.swap_card_from_site_id = registerSiteOperator;
      }

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
    const hasSwappedBefore = visitorCards.some((c) => c.is_swapcard === true);

    if (hasSwappedBefore) {
      setOpenSwipeDialog(true);
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

  const [permission, setPermission] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const [vtRes, purposeRes, permissionRes] = await Promise.allSettled([
          getInvitationVisitorType(token),
          getTodayVisitingPurpose(token),
          getPermission(token),
        ]);

        if (vtRes.status === 'fulfilled') {
          setVisitorType(vtRes.value?.collection ?? []);
        } else {
        }

        if (purposeRes.status === 'fulfilled') {
          setTodayVisitingPurpose(purposeRes.value?.collection ?? []);
        } else {
        }

        if (permissionRes.status === 'fulfilled') {
          setPermission(permissionRes.value?.collection ?? {});
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  const permissionHook = usePermission(permission);

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
      toast('Please select visitor first.', 'info');
      return;
    }

    try {
      setLoadingAccess(true);
      const payload = {
        id: selectedVisitors[0],
        period: selectedMinutes,
        apply_to_all: applyToAll,
      };

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
      let msg = 'Failed to extend visit.';

      if (error.response && error.response.data) {
        msg = error.response.data.msg || error.response.data.message || msg;
        status = error.response.data.status;
      }
      toast(msg, 'error');
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

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [siteRes, employeeRes, allVisitorEmployee] = await Promise.all([
          getInvitationSite(token),
          // getAllSite(token),
          getInvitationVisitorHost(token),
          // getVisitorEmployee(token),
          getInvitationVisitorEmployee(token),
        ]);

        setSites(siteRes?.collection ?? []);
        setEmployee(employeeRes?.collection ?? []);
        setAllVisitorEmployee(allVisitorEmployee?.collection ?? []);
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
      nda: string;
    }[]
  >([]);

  const uploadFileToCDN = async (file: File | Blob): Promise<string | null> => {
    const formData = new FormData();

    const filename = file instanceof File && file.name ? file.name : 'selfie.png';
    console.log('filename', filename);
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
    if (!selectedVisitors.length) {
      toast('Please select a visitor first.', 'info');
      return;
    }

    try {
      setLoadingAccess(true);
      setSelectedCards([]);

      const visitor = relatedVisitors.find(
        (v) => v.id?.toLowerCase() === selectedVisitors[0]?.toLowerCase(),
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

  const findCard = (cardNumber: string) =>
    availableCards.find((c) => String(c.card_number).trim() === String(cardNumber).trim());

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
        toast(`You can only select up to ${maxCards} cards.`, 'info');
        return prev;
      }

      return [...prev, normalized];
    });
  };

  const handleEnableEditing = () => {
    const confirmed = Swal.fire({
      title: 'Enable Editing',
      text: 'Are you sure you want to enable editing? ',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      showCloseButton: true,
    });
  };

  const handleOpenAction = (value: string) => {
    setActionButton(value);

    const hasInvitation = invitationCode.length > 0 && relatedVisitors.length > 0;
    if (value === 'card') {
      if (!hasInvitation) {
        setOpenSwipeDialogNoInvitation(true);
      } else {
        // setOpenChooseCardDialog(true);
        handleChooseCard();
      }
      return;
    }

    if (value === 'enable' && invitationCode.length > 0 && relatedVisitors.length > 0) {
      handleEnableEditing();
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

  const handleActionBlacklist = async () => {
    const id = selectedVisitorId ?? invitationCode?.[0]?.visitor_id;

    if (!id) {
      // toast('Please select visitor first.', 'warning');
      setOpenDialogIndex(1);
      return;
    }

    await handleBlacklistStatus(id);
  };

  const [invitationId, setInvitationId] = useState<string | null>(null);

  const handleSubmitQRCode = async (value: string) => {
    try {
      const res = await getInvitationCode(token as string, value);
      const data = res.collection?.data ?? [];

      if (data.length === 0) {
        toast('Your code does not exist.', 'error');
        return;
      }

      const invitation = data[0];
      setInvitationId(invitation.id);
      const invitationId = invitation.id;

      setInvitationCode(data);
      setVisitorStatus(data[0]?.visitor_status ?? null);
      setSelectedVisitorNumber(data[0]?.visitor_number ?? null);
      setScannedVisitorNumber(data[0]?.visitor_number ?? null);

      setSelectedVisitors([]);

      await fetchRelatedVisitorsByInvitationId(invitationId);
      const freshVisitors = await getInvitationOperatorRelated(invitationId, token as string);
      const scannedNumber = data[0]?.visitor_number;

      const matchedIds = freshVisitors.collection
        ?.filter((v: any) => v.visitor_number === scannedNumber)
        .map((v: any) => v.id?.toLowerCase())
        .filter(Boolean);

      setSelectedVisitors(matchedIds ?? []);

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

      // const resAccess = await getInvitationAccessControl(token as string);
      // const rowsAccess = resAccess.collection.map((item: any) => ({
      //   id: item.Id,
      //   name: item.Name ?? '-',
      //   description: item.Description ?? '-',
      // }));
      // console.log('resAccess', resAccess);
      // setAccessData(resAccess.collection ?? []);
      // setAccessData(rowsAccess ?? []);

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

      showSwal('success', 'Code scanned successfully.', 3000);
    } catch (e) {
      showSwal('error', 'Your code does not exist.', 3000);
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
      organization: v.visitor_organization_name ?? '-',
      extend_visitor_period: v.extend_visitor_period ?? 0,
      visitor_number: v.visitor_number ?? '-',
      email: v.visitor_email ?? '-',
      phone: v.visitor_phone ?? '-',
      gender: v.visitor_gender ?? '-',
      address: v.visitor_address ?? '-',
      invitation_code: v.invitation_code ?? '-',
      visitor_status: v.visitor_status ?? '-',
      visitor_identity_id: v.visitor_identity_id ?? '-',
      visitor_code: v.visitor_code ?? '-',
      vehicle_plate_number: v.vehicle_plate_number ?? '-',
      vehicle_type: v.vehicle_type ?? '-',
      group_code: v.visitor_group_code ?? '-',
      group_name: v.group_name ?? '-',
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

    setAllAccessData(allAccess);
    // setAccessData(allAccess);
  };

  const formatDateTime = (dateStr?: string, extendMinutes?: number) => {
    if (!dateStr) return '-';

    const baseTime = moment.utc(dateStr);

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
      [v.name].filter(Boolean).some((field) => field.toLowerCase().includes(keyword)),
    );
  }, [relatedVisitors, debouncedKeyword]);

  const visitorsForSwipe = useMemo(() => {
    return relatedVisitors.filter((v) => selectedVisitors.includes(v.id));
  }, [relatedVisitors, selectedVisitors]);

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
      // toast('Visible cards cleared.', 'info');
    } else {
      const toAdd = visible.slice(0, cappedCount);
      setSelectedCards(toAdd);
      toast(`Selected ${toAdd.length} card(s).`, 'success');
    }
  };

  const pairVisitorsWithCards = (visitorIds: string[], cards: (string | number)[]) => {
    return visitorIds.map((visitorId, idx) => ({
      visitorId,
      cardNumber: cards[idx],
    }));
  };

  const handleConfirmChooseCards = async () => {
    try {
      if (!selectedCards.length) {
        toast('Please choose at least one card.', 'info');
        return;
      }

      setLoadingAccess(true);

      const visitorIds =
        selectedVisitors.length > 0 ? selectedVisitors : [invitationCode?.[0]?.id].filter(Boolean);

      const visitor = relatedVisitors.find(
        (v) => v.id?.toLowerCase() === visitorIds[0]?.toLowerCase(),
      );

      // const currentUsed = visitor?.card?.find((c: any) => c.current_used === true);
      const currentUsed = (visitor?.card as any[])?.find(
        (c) => c.current_used === true && c.is_swap == true,
      );

      if (currentUsed) {
        const pairs = pairVisitorsWithCards(visitorIds, selectedCards);

        const payloads = pairs.map(({ visitorId, cardNumber }) => ({
          card_number: String(cardNumber),
          trx_visitor_id: visitorId,
          description: `Give card number ${cardNumber} from ${registerSiteOperator}`,
          swap_card_from_card: currentUsed?.card_number ?? null,
          swap_card_from_card_id: currentUsed?.id ?? null,
          swap_card_from_site_id: registerSiteOperator,
          is_swapcard: false,
          swap_type: 'Other',
          registered_site_id: registerSiteOperator,
        }));
        // console.log('payloads', payloads);

        setSwipePayload(payloads);
        setCurrentAccessVisitor(visitor);
        setOpenSwipeAccess(true);
        return;
      }

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
            description: `Give card number ${cardNumber} from ${registerSiteOperator}`,
            swap_card_from_card: currentUsed?.card_number ?? null,
            swap_card_from_card_id: currentUsed?.id ?? null,
            swap_card_from_site_id: registerSiteOperator,
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

      setVisitorCards((prev) =>
        prev.map((card) => {
          if (selectedCards.includes(card.card_number)) {
            return {
              ...card,
              current_used: true,
            };
          }

          return {
            ...card,
            current_used: false,
          };
        }),
      );

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
      showSwal('error', err?.response?.data?.msg || 'Failed to assign card(s).');
    } finally {
      setTimeout(() => setLoadingAccess(false), 600);
    }
  };

  const handleClearAll = () => {
    setInvitationCode([]);
    setRelatedVisitors([]);
    setOpen(false);
    setOpenDialogIndex(null);
    setTorchOn(false);
    setActionButton('');
  };

  const handleBlacklistStatus = async (id: string) => {
    try {
      const res = await Swal.fire({
        icon: 'warning',
        target: containerRef.current,
        title: 'Blacklist Visitor',
        text: 'Please provide a reason for blacklist this visitor',
        input: 'text',
        inputPlaceholder: 'Enter reason...',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        reverseButtons: true,
        cancelButtonText: 'No',
        confirmButtonColor: '#16a34a',
        preConfirm: (value) => {
          if (!value) {
            toast('Please provide a reason for blacklist this visitor.', 'info');
            return false;
          }
          return value;
        },
      });

      if (!res.isConfirmed) return;

      if (!res.value) {
        toast('Please provide a reason for blacklist this visitor.', 'info');
        return;
      }

      const payload = {
        visitor_id: id,
        action: 'blacklist',
        reason: res.value,
      };

      await createOperatorBlacklist(token as string, payload);

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

      const payload: any = { action };

      // console.log('payload', payload);

      if (reason) {
        payload.reason = reason;
      }

      await createInvitationActionOperator(token as string, id!, payload);

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
      setLoadingAccess(false);
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

  const handleSelectRelatedVisitor = (visitor: any) => {
    if (selectMultiple) {
      setSelectedVisitors((prev) =>
        prev.includes(visitor.id) ? prev.filter((id) => id !== visitor.id) : [...prev, visitor.id],
      );
      return;
    }
    setSelectedVisitors([visitor.id]);
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

        const isAffected = validForApi.some((v) => v.id === currentVisitorId);
        if (!isAffected) return prev;

        let newStatus = prev[0].visitor_status;

        if (bulkAction === 'checkin') newStatus = 'Checkin';
        else if (bulkAction === 'checkout') newStatus = 'Checkout';
        else if (bulkAction === 'block') newStatus = 'Block';
        else if (bulkAction === 'unblock') newStatus = 'Preregis';

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
      const parkingSrc = nonDocSections.find((s) => s.name.toLowerCase().includes('vehicle'));
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
      // console.log('firstResult', firstResult);
      const questionPagesTemplate = firstResult?.collection?.question_page ?? [];
      // console.log('questionPagesTemplate', questionPagesTemplate);

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
    const renderInput = () => {
      switch (field.field_type) {
        case 0: // Text
          return (
            <CustomTextField
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
            <CustomTextField
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
            <CustomTextField
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

            // case 'site_place':
            //   options = [{ value: sitePlaceId, name: sitePlaceName }];
            //   break;

            case 'site_place':
              options = sitePlaceName
                ? [
                    {
                      value: field.answer_text || sitePlaceId,
                      name: sitePlaceName,
                    },
                  ]
                : [];
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
              // value={
              //   options.find(
              //     (opt: { value: string; name: string }) =>
              //       opt.value?.toLowerCase?.() === field.answer_text?.toLowerCase?.(),
              //   ) || null
              // }
              value={
                options.find(
                  (opt: { value: string; name: string }) => opt.value === field.answer_text,
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
            <CustomTextField
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
              { value: '0', name: 'Female' },
              { value: '1', name: 'Male' },
              { value: '2', name: 'Prefer not to say' },
            ];

            const value = field.answer_text != null ? String(field.answer_text) : '';

            return (
              <CustomTextField
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
              </CustomTextField>
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
            <CustomTextField
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
            </CustomTextField>
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
            <CustomTextField
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
    console.log('perm', perm);

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
    if (!selectedAccessIds.length) return [];

    if (selectedVisitors.length > 1) {
      const allActions = ['Grant', 'Revoke', 'Block'];

      const permissionActions = selectedAccessIds.map((id) =>
        getAllowedActionsByPermission(id, permissionAccess),
      );

      const commonPermissionActions = allActions.filter((action) =>
        permissionActions.every((permList) => permList.includes(action)),
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
          registered_site_id: registerSiteOperator,
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

                  const fieldPayload: any = {
                    sort: templateField.sort ?? fIdx,
                    short_name: templateField.short_name,
                    long_display_text: templateField.long_display_text,
                    field_type: templateField.field_type,
                    is_primary: !!templateField.is_primary,
                    is_enable: !!templateField.is_enable,
                    mandatory: !!templateField.mandatory,
                    remarks: templateField.remarks,
                    visitor_form_type: 1,
                  };

                  if (answer_text !== null && answer_text !== '') {
                    fieldPayload.answer_text = answer_text;
                  }

                  if (answer_datetime) {
                    fieldPayload.answer_datetime = answer_datetime;
                  }

                  if (answer_file) {
                    fieldPayload.answer_file = answer_file;
                  }

                  return fieldPayload;
                }),
              })),
            },
          ],
        };
      });

      const payload = { list_group: dataList };
      console.log('Final Payload (MULTI-VISITOR FIXED):', JSON.stringify(payload, null, 2));
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
      // console.error('❌ Submit error:', error);
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

  // cmd
  // useEffect(() => {
  //   if (!selectedVisitors.length) {
  //     setAccessData([]);
  //     return;
  //   }

  //   const filtered = allAccessData.filter((a) =>
  //     selectedVisitors.some((id) => id.toLowerCase() === a.trx_visitor_id?.toLowerCase()),
  //   );

  //   const mergedAccess = Object.values(
  //     filtered.reduce((acc: any, curr: any) => {
  //       const key = curr.access_control_id;
  //       if (!acc[key]) {
  //         acc[key] = {
  //           ...curr,
  //           visitors: [curr.trx_visitor_id],
  //         };
  //       } else {
  //         acc[key].visitors.push(curr.trx_visitor_id);

  //         acc[key].visitor_give_access = Math.max(
  //           acc[key].visitor_give_access ?? 0,
  //           curr.visitor_give_access ?? 0,
  //         );

  //         acc[key].early_access = acc[key].early_access || curr.early_access;
  //       }
  //       return acc;
  //     }, {}),
  //   );

  //   setAccessData(mergedAccess);
  // }, [selectedVisitors]);

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

      if ((visitor_give_access === 2 || visitor_give_access === 3) && action !== 'unblock') {
        invalidVisitors.push({
          visitorId,
          name: visitorName,
          accessName: access_control_name,
          reason: 'already revoked/blocked',
        });
        return;
      }

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
      lines.push(`${v.name} (${v.accessName}): ${actionText}`);
    });

    invalidVisitors.forEach((v) => {
      lines.push(`${v.name} (${v.accessName}): Skipped (${v.reason})`);
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

        const targetVisitors = allAccessData
          .filter(
            (a) =>
              a.access_control_id?.toLowerCase() === accessControlId.toLowerCase() &&
              selectedVisitors.some((v) => v.toLowerCase() === a.trx_visitor_id?.toLowerCase()),
          )
          .map((a) => a.trx_visitor_id?.toLowerCase());

        const { validVisitors, invalidVisitors, message } = validateMultiVisitorAccess(
          accessControlId,
          targetVisitors,
          allAccessData,
          relatedVisitors,
          action,
        );

        if (!validVisitors.length) {
          toast(message || 'No valid visitors to process.', 'error');
          resolve();
          return;
        }

        if (invalidVisitors.length) {
          toast('Some visitors cannot perform this action:\n' + invalidVisitors.join('\n'), 'info');
          resolve();
          return;
        }

        const payload = {
          data_access: validVisitors.map((visitorId) => ({
            access_control_id: accessControlId,
            trx_visitor_id: visitorId,
            action: actionCode,
          })),
        };

        console.log('Final Payload:', payload);

        const res = await createGiveAccessOperator(token as string, payload);
        console.log('Access Action Response:', JSON.stringify(res, null, 2));

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
          'Failed to execute action.';

        showSwal('error', backendMsg);
        resolve();
      } finally {
        setTimeout(() => setLoadingAccess(false), 600);
      }
    });
  };

  // const activeVisitor = useMemo(() => {
  //   if (selectedVisitorId) {
  //     const visitor = relatedVisitors.find((v) => v.id === selectedVisitorId);
  //     if (visitor) return visitor;
  //   }

  //   return relatedVisitors?.[0] ?? invitationCode?.[0] ?? null;
  // }, [selectedVisitorId, relatedVisitors, invitationCode]);

  const activeVisitor = useMemo(() => {
    if (selectedVisitorId) {
      return relatedVisitors.find((v) => v.id === selectedVisitorId);
    }

    return relatedVisitors?.[0] ?? null;
  }, [selectedVisitorId, relatedVisitors]);

  const getCdnUrl = (path?: string) => {
    if (!path || path === '-' || path.trim() === '') return null;

    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${axiosInstance2.defaults.baseURL}/cdn${cleanPath}`;
  };

  const activeSelfie = getCdnUrl(activeVisitor?.selfie_image);
  const activeKTP = getCdnUrl(activeVisitor?.identity_image);
  const activeBarcode = getCdnUrl(activeVisitor?.nda);

  const [todayVisitingPurpose, setTodayVisitingPurpose] = useState<any[]>([]);
  const [visitorType, setVisitorType] = useState<any[]>([]);
  const [openMore, setOpenMore] = useState(false);
  const handleOpenMore = () => setOpenMore(true);
  const [vtLoading, setVTLoading] = useState(false);

  const fetchTodayVisitingPurpose = async () => {
    try {
      const res = await getTodayVisitingPurpose(token as string);
      setTodayVisitingPurpose(res?.collection || []);
    } catch (err) {
      console.error(err);
    }
  };

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
        registered_site_id: registerSiteOperator
      };

      console.log('return card payload', payload);
      await returnCard(token as string, payload);
      showSwal('success', 'Succesfully returned card');
      setOpenReturnCard(false);
      setReturnCardNumber('');
      // await fetchAvailableCards?.();
    } catch (error: any) {
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
    setOpenChooseCardDialog(false);
    setSearchTerm('');
  };

  const parkingData = [
    { id: 1, vehicle_type: 'Car', vehicle_plate_number: 'BG 817 AS' },
    { id: 2, vehicle_type: 'Motorcycle', vehicle_plate_number: 'B 1512 AA' },
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
            <Grid container spacing={1} mb={0} alignItems="center">
              <Grid size={{ xs: 12, md: 7.5, lg: 8.2, xl: 9 }}>
                <VisitorSearchInput
                  onOpenSearch={() => setOpenSearch(true)}
                  onClear={handleClearAll}
                  containerRef={containerRef as any}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4.5, lg: 3.8, xl: 3 }}>
                <OperatorToolbar
                  registeredSite={registeredSite}
                  selectedSite={registerSiteOperator}
                  onChangeSite={setRegisterSiteOperator}
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
                {/* Card FR */}
                <Grid
                  size={{ xs: 12, lg: 4.5 }}
                  sx={{ border: '1px solid #e0e0e0', borderRadius: '15px' }}
                >
                  <LprVisitorCard
                    LprImage={LprImage}
                    todayVisitingPurpose={todayVisitingPurpose}
                    invitationCode={invitationCode}
                    isFullscreen={isFullscreen}
                    lgUp={lgUp}
                    openMore={openMore}
                    setOpenMore={setOpenMore}
                    handleOpenMore={handleOpenMore}
                    handleOpenDetailVistingPurpose={handleOpenDetailVistingPurpose}
                    getColorByName={getColorByName}
                    backgroundnodata={backgroundnodata}
                    t={t}
                  />
                </Grid>

                {/* Visiting Purpose*/}
                <ActionPanelCard
                  permission={permissionHook}
                  isFullscreen={isFullscreen}
                  handleOpenScanQR={handleOpenScanQR}
                  handleActionClick={handleActionClick as any}
                  handleOpenAction={handleOpenAction}
                  handlePrint={handlePrint}
                  handleActionBlacklist={handleActionBlacklist as any}
                  setOpenPreRegistration={setOpenPreRegistration}
                  setOpenInvitationVisitor={setOpenInvitationVisitor}
                  setOpenReturnCard={setOpenReturnCard}
                />

                {/* Side Right QR Code */}
                <Grid
                  size={{ xs: 12, lg: 3 }}
                  // sx={{
                  //   display: 'flex',
                  //   flexDirection: 'column',
                  //   height: '100%',
                  // }}
                >
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
              <VisitorDetailCard
                invitationCode={invitationCode}
                activeVisitor={activeVisitor}
                relatedVisitors={relatedVisitors}
                selectedVisitorNumber={selectedVisitorNumber}
                permissionHook={permissionHook}
                containerRef={containerRef}
                handleChooseCard={handleChooseCard}
                handleConfirmStatus={handleConfirmStatus}
                handleView={handleView}
              />

              {/* Related Visitor */}
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
                  <Box display="flex" justifyContent="space-between" flexWrap={'nowrap'} gap={1}>
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
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                // src={activeSelfie || undefined}
                                src={getCdnUrl(visitor.selfie_image) || undefined}
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
                          Apply
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
                          {permissionHook.canExtend && (
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
                          )}
                          {permissionHook.canCardIssuance && (
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
                                  // lineHeight: 1.2,
                                  textAlign: 'center',
                                }}
                                onClick={handleChooseCard}
                                startIcon={<IconCreditCard size={18} />}
                              >
                                Card Issuance
                              </Button>
                            </Tooltip>
                          )}
                          {/* 
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
                          </Tooltip> */}
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

              <Grid
                size={{ xs: 12, lg: 3 }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
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
          <ChooseCardDialog
            open={openChooseCardDialog}
            onClose={() => {
              setOpenChooseCardDialog(false);
              setSearchTerm('');
            }}
            containerRef={containerRef}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isChecked={isChecked}
            isIndeterminate={isIndeterminate}
            handleSelectAll={handleSelectAll}
            capacity={capacity}
            currentUsedCards={currentUsedCards}
            selectedCards={selectedCards}
            handleToggleCard={handleToggleCard}
            filteredCards={filteredCards}
            selectedVisitors={selectedVisitors}
            availableCount={availableCount}
            handleOpenSwipeDialog={handleOpenSwipeDialog}
            handleConfirmChooseCards={handleConfirmChooseCards}
            setOpenRevokeDialog={setOpenRevokeDialog}
          />
          {/* Dialog Swipe Card */}
          <SwipeCardDialog
            open={openSwipeDialog}
            onClose={handleCloseSwipeDialog}
            onSubmit={handleSwipeCardSubmit}
            invitationId={invitationId}
            visitors={visitorsForSwipe}
            loading={setLoadingAccess}
            currentVisitorIndex={currentVisitorIndex}
            setCurrentVisitorIndex={setCurrentVisitorIndex}
          />

          {/* Dialog Swipe Access */}
          <SwipeAccessDialog
            open={openSwipeAccess}
            onClose={handleCloseSwipeAccess}
            data={sitesOperator}
            payload={swipePayload}
            invitationId={invitationId as string}
            visitor={currentAccessVisitor}
            setLoadingAccess={setLoadingAccess}
            onSuccessRefresh={() => fetchRelatedVisitorsByInvitationId(invitationId as string)}
          />

          {/* Dialog QR Access Issuance */}
          <GrantAccessDialog
            open={openRevokeDialog}
            onClose={() => setOpenRevokeDialog(false)}
            invitationCode={invitationCode}
            selectedCards={selectedCards}
            handleToggleCard={handleToggleCard}
            dataDummyAccess={dataDummyAccess}
            formatDateTime={formatDateTime}
          />

          {/* Fill Form Pra regist Multiple*/}
          <FillPraregistrationGroup
            open={openFillForm}
            onClose={() => setOpenFillForm(false)}
            containerRef={containerRef}
            fillFormData={fillFormData}
            fillFormActiveStep={fillFormActiveStep}
            setFillFormActiveStep={setFillFormActiveStep}
            fillFormDataVisitor={fillFormDataVisitor}
            setFillFormDataVisitor={setFillFormDataVisitor}
            loadingAccess={loadingAccess}
            handleSubmitPramultiple={handleSubmitPramultiple}
            renderFieldInput={renderFieldInput}
            getSectionType={getSectionType}
            formsOf={formsOf}
          />
          {/* Submit Praregister */}
          <FillPraregistrationSingle
            open={openDialogInvitation}
            onClose={() => setOpenDialogInvitation(false)}
            loadingAccess={loadingAccess}
            selectedInvitationId={selectedInvitationId ?? invitationCode?.[0]?.id}
            invitationCode={invitationCode}
            containerRef={containerRef.current}
            fetchRelatedVisitorsByInvitationId={fetchRelatedVisitorsByInvitationId}
            registeredSite={registerSiteOperator}
          />
          {/* Access Dialog */}
          <AccessDialog
            open={openAccessData}
            onClose={() => {
              // setAction('');
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
            toast={toast}
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
                registeredSite={registerSiteOperator}
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
                registeredSite={registerSiteOperator}
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

          <Portal>
            <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              sx={{ zIndex: 9999999 }}
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
          <GlobalBackdropLoading open={loadingAccess} />
        </Box>
      </FullScreen>
    </PageContainer>
  );
};

export default OperatorView;
