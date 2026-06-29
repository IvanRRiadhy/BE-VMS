import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Grid2 as Grid,
  Typography,
  Divider,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Checkbox,
  FormControlLabel,
  MenuItem,
  AlertColor,
  Autocomplete,
  FormControl,
  RadioGroup,
  Radio,
  Portal,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import { Box, useMediaQuery, useTheme } from '@mui/system';
import moment from 'moment-timezone';
import backgroundnodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import infoPic from 'src/assets/images/backgrounds/info_pic.png';
import { IconX } from '@tabler/icons-react';
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
  getUpComingPurpose,
  getUpComingVisitors,
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
import CameraUpload from 'src/customs/components/camera/CameraUpload';
import { showSwal } from 'src/customs/components/alerts/alerts';
import FormWizardAddVisitor from 'src/customs/pages/Operator/Invitation/FormWizardAddVisitor';
import FormWizardAddInvitation from 'src/customs/pages/Operator/Invitation/FormWizardAddInvitation';
import ScanQrVisitorDialog from 'src/customs/pages/Operator/Dialog/ScanQrVisitorDialog';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import InfoDialog from 'src/customs/pages/Operator/Dialog/InfoDialog';
import ExtendVisitDialog from 'src/customs/pages/Operator/Dialog/ExtendVisitDialog';
import { useTranslation } from 'react-i18next';
import BlacklistVisitorDialog from 'src/customs/pages/Operator/Dialog/BlacklistVisitorDialog';
import ListVisitorDialog from 'src/customs/pages/Operator/Dialog/ListVisitorDialog';
import TriggeredAccessDialog from 'src/customs/pages/Operator/Dialog/TriggeredAccessDialog';
import DetailVisitingPurpose from 'src/customs/pages/Operator/Dialog/DetailVisitingPurpose';
import SwipeCardDialog from 'src/customs/pages/Operator/Dialog/SwipeCardDialog';
import SwipeAccessDialog from 'src/customs/pages/Operator/Dialog/SwipeAccessDialog';
import { useDebounce } from 'src/hooks/useDebounce';
import PrintDialog from 'src/customs/pages/Operator/Dialog/PrintDialog';
import PrintDialogBulk from 'src/customs/pages/Operator/Dialog/PrintDialogBluk';
import { returnCard } from 'src/customs/api/Admin/SwapCard';
import SwipeCardNoCodeDialog from 'src/customs/pages/Operator/Dialog/SwipeCardNoCodeDialog';
import InvitationQrCard from 'src/customs/pages/Operator/Components/InvitationQrCard';
import VisitorSearchInput from 'src/customs/pages/Operator/Components/VisitorSearchInput';
import OperatorToolbar from 'src/customs/pages/Operator/Components/OperatorToolbar';
import VisitorImage from 'src/customs/pages/Operator/Components/VisitorImage';
import ReturnCardDialog from 'src/customs/pages/Operator/Dialog/ReturnCardDialog';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import ParkingDialog from 'src/customs/pages/Operator/Dialog/ParkingDialog';
import ActionPanelCard from 'src/customs/pages/Operator/Components/ActionPanelCard';
import FillPraregistrationGroup from 'src/customs/pages/Operator/Invitation/components/FillPraregistrationGroup';
import GrantAccessDialog from 'src/customs/pages/Operator/Dialog/GrantAccessDialog';
import LprVisitorCard from 'src/customs/pages/Operator/Components/LprVisitorCard';
import ChooseCardDialog from 'src/customs/pages/Operator/Dialog/ChooseCardDialog';
import { usePermission } from 'src/hooks/usePermission';
import VisitorDetailCard from 'src/customs/pages/Operator/Components/VisitorDetailCard';
import FillPraregistrationSingle from 'src/customs/pages/Operator/Invitation/components/FillPraregistrationSingle';
import VisitorListCard from 'src/customs/pages/Operator/Dialog/VisitorListCard';
import usePrintBadgeConfig from 'src/hooks/usePrintBadge';
import useInvitationVisitorType from 'src/hooks/useInvitationVisitorType';
import useDataPermission from 'src/hooks/useDataPermission';
import usePermissionOperator from 'src/hooks/usePermissionOperator';
import useAvailableCardOperator from 'src/hooks/useAvailableCardOperator';
import useInvitationSite from 'src/hooks/useInvitationSite';
import useRegisteredSiteOperator from 'src/hooks/useRegisteredSiteOperator';
import useInvitationHost from 'src/hooks/useInvitationHost';
import { useInvitationVisitorEmployee } from 'src/hooks/useInvitationVisitorEmployee';
// import useInvitationVisitorEmployee from 'src/hooks/useInvitationVisitorEmployee';

type DocumentType = 'CardAccess' | 'Other';
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
  const handleOpenScanQR = () => setOpenDialogIndex(1);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [selectedCurrentCards, setSelectedCurrentCards] = useState<Record<string, string>>({});
  const [openChooseCardDialog, setOpenChooseCardDialog] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(false);
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
  const [uploadMethods, setUploadMethods] = useState<Record<string, 'file' | 'camera'>>({});
  const [openSearch, setOpenSearch] = useState(false);
  const [openDetailVisitingPurpose, setOpenDetailVistingPurpose] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [accessData, setAccessData] = useState<any[]>([]);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [openExtendVisit, setOpenExtendVisit] = useState(false);
  const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180];
  const [openFillForm, setOpenFillForm] = useState(false);
  const [fillFormData, setFillFormData] = useState<any[]>([]);
  const [fillFormActiveStep, setFillFormActiveStep] = useState(-1);
  const [fillFormDataVisitor, setFillFormDataVisitor] = useState<any[]>([]);
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
  const [openSwipeDialogNoInvitation, setOpenSwipeDialogNoInvitation] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedKeyword = useDebounce(searchKeyword, 300);
  const [focusTarget, setFocusTarget] = useState<'old' | 'new' | null>(null);
  const oldCardRef = useRef<HTMLInputElement | null>(null);
  const newCardRef = useRef<HTMLInputElement | null>(null);
  const [currentAccessVisitor, setCurrentAccessVisitor] = useState<any>(null);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
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
  const [isSelfGroup, setIsSelfGroup] = useState<boolean | null>(null);
  const [tick, forceTick] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const [resetStep, setResetStep] = useState(0);
  const [openAccessIssuance, setAccessIssuance] = useState(false);
  const [openReturnCard, setOpenReturnCard] = useState(false);
  const [openParking, setOpenParking] = useState(false);
  const [openVehicle, setOpenVehicle] = useState(false);
  const [totalCountVisitor, setTotalCountVisitor] = useState(0);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });
  const [swipePayload, setSwipePayload] = useState<any[]>([]);
  const parkingData = [
    { id: 1, vehicle_type: 'Car', vehicle_plate_number: 'BG 817 AS' },
    { id: 2, vehicle_type: 'Motorcycle', vehicle_plate_number: 'B 1512 AA' },
  ];
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [typeVisitor, setTypeVisitor] = useState('related');
  const [upcomingPurpose, setUpcomingPurpose] = useState<any[]>([]);
  const [upcomingVisitors, setUpcomingVisitors] = useState<any[]>([]);
  const { sitesOperator } = useInvitationSite(token);
  const { registeredSite, registerSiteOperator, setRegisterSiteOperator } =
    useRegisteredSiteOperator(token);
  const { printData } = usePrintBadgeConfig(token as string);
  const { permission, loading: loadingPermission } = useDataPermission(token);
  const { permissionAccess } = usePermissionOperator(token);
  const { availableCards, setAvailableCards } = useAvailableCardOperator(token);
  const { visitorType } = useInvitationVisitorType(token);
  const { employee } = useInvitationHost(token);
  const [searchHost, setSearchHost] = useState<any>('');
  const debounceSearch = useDebounce(searchHost, 400);

  const { data: allVisitorEmployee = [], isLoading: isLoadingEmployee } =
    useInvitationVisitorEmployee(token, {
      search: debounceSearch,
      start: 0,
      length: 10,
    });
  const permissionHook = usePermission(permission);

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

  useEffect(() => {
    if (registerSiteOperator) {
      localStorage.setItem('selectedSite', registerSiteOperator);
    } else {
      localStorage.removeItem('selectedSite');
    }
  }, [registerSiteOperator]);

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

  const currentUsedCardsByVisitor = useMemo(() => {
    return relatedVisitors
      .filter((v) => selectedVisitors.includes(v.id))
      .map((visitor) => {
        const currentCards = (visitor.card ?? []).filter(
          (c: any) => c.card_type !== 'Barcode' && c.current_used === true,
        );

        return {
          visitorId: visitor.id,
          visitorName: visitor.name,
          cards: currentCards,
        };
      });
  }, [relatedVisitors, selectedVisitors]);

  const handleSubmitBatchSwipe = async (payloads: any[]) => {
    setLoadingAccess(true);

    try {
      if (!payloads.length) return;

      setOpenSwipeDialog(false);
      setOpenChooseCardDialog(false);

      await createMultipleGrantAccess(token as string, {
        data: payloads,
      });
      console.log('payloads', payloads);

      resetSwipeStates();
      showSwal('success', 'All cards swapped successfully!');

      await fetchRelatedVisitorsByInvitationId(invitationId as string);
    } catch (err: any) {
      showSwal(
        'error',
        Array.isArray(err?.response?.data?.collection)
          ? err.response.data.collection.join('\n')
          : err?.response?.data?.collection || 'Failed to swap cards',
      );
    } finally {
      setLoadingAccess(false);
    }
  };

  const resetSwipeStates = () => {
    setSelectedCards([]);
    setSwipePayload([]);
    setCurrentVisitorIndex(0);
    setSelectedCurrentCards({});
    setSearchTerm('');
    setCurrentAccessVisitor(null);
  };

  const handleSwipeCardSubmit = async (
    value: string,
    type: string,
    visitor: any,
    isLastVisitor: boolean,
    visitorIndex: number,
  ) => {
    // setLoadingAccess(true);
    try {
      // const selectedCardNumber = selectedCards[visitorIndex];
      // const selectedCard = filteredCards.find((c) => c.card_number === selectedCardNumber);

      const visitorSelectedCards = Array.isArray(selectedCards[visitorIndex])
        ? selectedCards[visitorIndex]
        : selectedCards;
      const currentUsed = (visitor?.card ?? []).find((c: any) => c.current_used === true);

      const currentUsedCardNumber = String(currentUsed?.card_number || '').trim();
      // console.log('currentUsedCardNumber', currentUsedCardNumber);

      const newCardNumber = selectedCards[visitorIndex];
      // console.log('newCardNumber', newCardNumber);

      if (!newCardNumber) {
        showSwal('error', 'New card not found');
        return;
      }

      const selectedCard = filteredCards.find(
        (c) => String(c.card_number).trim() === String(newCardNumber).trim(),
      );

      if (!selectedCard) {
        showSwal('error', 'Card not found');
        return;
      }

      const hasSwappedCard = visitor?.card?.some((c: any) => c.is_swapcard);

      const payload = {
        card_number: selectedCard.card_number,
        trx_visitor_id: visitor.id,
        description: `Give card number ${selectedCard.card_number} from ${registerSiteOperator}`,
        // swap_card_from_card: value,
        swap_card_from_card: currentUsedCardNumber,
        swap_type: type,
        swap_card_from_site_id: registerSiteOperator,
        is_swapcard: true,
        registered_site_id: registerSiteOperator,
      };

      // setSwipePayload((prev) => [...prev, payload]);

      if (!hasSwappedCard) {
        const newPayload = [...swipePayload, payload];

        setSwipePayload(newPayload);

        if (!isLastVisitor) {
          return;
        }
        await handleSubmitBatchSwipe(newPayload);
        setAvailableCards((prev) =>
          prev.map((card) => {
            const assigned = newPayload.find(
              (p) => String(p.card_number) === String(card.card_number),
            );

            if (assigned) {
              return {
                ...card,
                current_used: true,
              };
            }

            return card;
          }),
        );
        setSwipePayload([]);
        return;
      } else {
        // setSwipePayload([payload]);
        // setCurrentAccessVisitor(visitor);
        // setOpenSwipeAccess(true);
        const newPayload = [...swipePayload, payload];

        setSwipePayload(newPayload);

        if (!isLastVisitor) {
          return;
        }
        console.log('payload', JSON.stringify(newPayload, null, 2));

        await handleSubmitBatchSwipe(newPayload);

        setAvailableCards((prev) =>
          prev.map((card) => {
            const assigned = newPayload.find(
              (p) => String(p.card_number) === String(card.card_number),
            );

            if (assigned) {
              return {
                ...card,
                current_used: true,
              };
            }

            return card;
          }),
        );

        setSwipePayload([]);
      }

      setOpenSwipeDialog(false);
    } catch (err: any) {
      showSwal('error', err?.response?.data?.collection || 'Failed to swipe card');
    }

    // finally {
    //   setLoadingAccess(false);
    // }
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
  const [selectedPurpose, setSelectedPurpose] = useState<{
    id: string;
    name: string;
  } | null>(null);

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
    setSelectedPurpose({
      id: item.id,
      name: item.name,
    });
    setOpenDetailVistingPurpose(true);
  };

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
    setFormDataAddVisitor((prev: any) => ({
      ...prev,
      registered_site: '',
    }));
    handleCloseDialog();
    await fetchUpcomingPurpose();
  };

  useEffect(() => {
    if (containerRef.current) {
      setDialogContainer(containerRef.current);
    }
  }, [containerRef]);

  const handleInvitationCreated = (invitationCode: string) => {
    handleSubmitQRCode(invitationCode);
  };

  const uploadFileToCDN = async (file: File | Blob): Promise<string | null> => {
    const formData = new FormData();

    const filename = file instanceof File && file.name ? file.name : 'selfie.png';
    // console.log('filename', filename);
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
      // setPreviews((prev) => ({ ...prev, [trackKey]: URL.createObjectURL(file) }));
    }

    const path = await uploadFileToCDN(file);
    if (path) setAnswerFile(path);

    e.target.value = '';
  };

  const handleCloseDialog = () => {
    localStorage.removeItem('unsavedVisitorData');
    // setSelectedSite(null);
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
    resetSwipeStates();
    setOpenChooseCardDialog(false);
  };

  const handleChooseCard = async () => {
    if (!selectedVisitors.length) {
      toast('Please select a visitor first.', 'info');
      return;
    }

    try {
      setLoadingAccess(true);
      await fetchAvailableCards();
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

  // const handleToggleCard = (cardNumber: string) => {
  //   const normalized = String(cardNumber);

  //   setSelectedCards((prev) => {
  //     let updated: string[];

  //     if (prev.includes(normalized)) {
  //       updated = prev.filter((c) => c !== normalized);
  //     } else {
  //       updated = [...prev, normalized];
  //     }
  //     return updated;
  //   });
  // };

  const handleToggleCard = (cardNumber: string) => {
    const normalized = String(cardNumber);

    setSelectedCards((prev) => {
      // unselect
      if (prev.includes(normalized)) {
        return prev.filter((c) => c !== normalized);
      }

      const maxSelection = selectMultiple ? selectedVisitors.length : 1;

      // kalau single visitor → replace langsung
      if (maxSelection === 1) {
        return [normalized];
      }

      // multiple visitor → limit sesuai jumlah visitor
      if (prev.length >= maxSelection) {
        toast(`You can only select up to ${maxSelection} cards.`, 'info');

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

    // if (value === 'access' && invitationCode.length > 0 && relatedVisitors.length > 0) {
    //   setOpenAccessData(true);
    //   return;
    // }

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
    if (value === 'access' && invitationCode.length > 0 && relatedVisitors.length > 0) {
      setAccessIssuance(true);
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
  const lastSerialRef = useRef('');
  const serialLockRef = useRef(false);

  const handleSubmitQRCode = async (value: string) => {
    // console.log('value', value.length);
    // if (value.length < 4 || value.length > 15) {
    //   showSwal('error', 'Code must be between 6 and 10 characters.', 3000);
    //   return;
    // }
    try {
      const res = await getInvitationCode(token as string, value);
      const data = res.collection?.data ?? [];

      // if (data.length === 0) {
      //   toast('Your code does not exist.', 'error');
      //   return;
      // }

      const invitation = data[0];
      setInvitationId(invitation.id);
      const invitationId = invitation.id;

      setInvitationCode(data);
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
          // disabled: !perm,
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
        // setOpenAccessData(true);
        setAccessIssuance(true);
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

    const totalCountVisitor = relatedRes.length ?? relatedData.length ?? 0;
    setTotalCountVisitor(totalCountVisitor);

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

  // const filteredVisitors = useMemo(() => {
  //   if (!debouncedKeyword.trim()) return relatedVisitors;

  //   const keyword = debouncedKeyword.toLowerCase();

  //   return relatedVisitors.filter((v) =>
  //     [v.name].filter(Boolean).some((field) => field.toLowerCase().includes(keyword)),
  //   );
  // }, [relatedVisitors, debouncedKeyword]);

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

  // const handleSelectAll = () => {
  //   const visible = availableVisibleCards.map((c) => String(c.card_number));

  //   const capacity = selectMultiple ? selectedVisitors.length : invitationCode.length > 0 ? 1 : 0;

  //   if (capacity <= 0) {
  //     toast('Please select visitor first.', 'warning');
  //     return;
  //   }

  //   const selectedVisible = visible.filter((n) => selectedCards.includes(n));
  //   const cappedCount = Math.min(visible.length, capacity);

  //   const fullySelected = cappedCount > 0 && selectedVisible.length === cappedCount;

  //   if (fullySelected) {
  //     setSelectedCards((prev) => prev.filter((n) => !visible.includes(n)));
  //     // toast('Visible cards cleared.', 'info');
  //   } else {
  //     const toAdd = visible.slice(0, cappedCount);
  //     setSelectedCards(toAdd);
  //     toast(`Selected ${toAdd.length} card(s).`, 'success');
  //   }
  // };

  const handleSelectAll = () => {
    const maxSelection = selectMultiple ? selectedVisitors.length : 1;

    if (isChecked) {
      setSelectedCards([]);
      return;
    }

    const selectableCards = filteredCards
      .filter((card) => card.current_used !== true && card.is_used !== true)
      .slice(0, maxSelection)
      .map((card) => String(card.card_number));

    setSelectedCards(selectableCards);
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

          const currentUsed: any = (visitor.card ?? []).find((c: any) => c.current_used === true);

          return {
            card_number: String(cardNumber),
            trx_visitor_id: visitorId,
            description: `Give card number ${cardNumber} from ${registerSiteOperator}`,

            swap_card_from_card: currentUsed?.card_number ?? null,
            swap_card_from_card_id: currentUsed?.id ?? null,

            swap_card_from_site_id: registerSiteOperator,

            is_swapcard: !!currentUsed,

            swap_type: currentUsed ? 'Other' : null,

            visitorName: visitor.name || visitorId,

            registered_site_id: registerSiteOperator,
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      if (!payloads.length) {
        showSwal('error', 'No valid visitor to assign card.');
        return;
      }
      if (payloads.length > 1) {
        await createMultipleGrantAccess(token as string, {
          data: payloads.map(({ visitorName, ...p }) => p),
        });
      } else {
        const { visitorName = '', ...payload } = payloads[0] as {
          visitorName?: string;
        } & (typeof payloads)[0];

        await createGrandAccessOperator(token as string, payload);
      }

      setVisitorCards((prev) =>
        prev.map((card) => {
          const assigned = payloads.find(
            (p: any) => String(p.card_number) === String(card.card_number),
          );

          if (assigned) {
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
      const message = payloads
        .map((p: any) => `• ${p.visitorName} (Card: ${p.card_number})`)
        .join('\n');

      setInvitationCode((prev) =>
        prev.map((inv) => {
          const match = payloads.find(
            (p: any) => p.trx_visitor_id.toLowerCase() === inv.id?.toLowerCase(),
          );
          if (!match) return inv;

          return {
            ...inv,
            card: [{ ...(inv.card?.[0] || {}), card_number: match.card_number }],
          };
        }),
      );
      resetSwipeStates();
      handleCloseChooseCard();

      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        await fetchRelatedVisitorsByInvitationId(invitationId);
      }

      // await new Promise((resolve) => setTimeout(resolve, 300));
      showSwal('success', `Successfully assigned card(s):\n${message}`);
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to assign card(s).');
    } finally {
      setLoadingAccess(false);
    }
  };

  const handleClearAll = () => {
    setInvitationCode([]);
    setRelatedVisitors([]);
    setOpen(false);
    setOpenDialogIndex(null);
    setTorchOn(false);
    setActionButton('');
    setTotalCountVisitor(0);
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
      // setPreviews((p) => ({ ...p, [inputId]: null }));
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
      setFillFormActiveStep(-1);

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
                <CustomTextField
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
              <CustomTextField
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
              </CustomTextField>
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
            <CustomTextField
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
          flow: 'SubmitPraRegister',
          is_self_registered: isSelfGroup === true,
          filled_by_relationship: 'Operator',
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

                  if ([10, 11, 12].includes(templateField.field_type)) {
                    fieldPayload.answer_file = answer_file ?? null;
                  } else if (templateField.field_type === 9) {
                    fieldPayload.answer_datetime = answer_datetime ?? null;
                  } else {
                    fieldPayload.answer_text = answer_text !== '' ? (answer_text ?? null) : null;
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
      await createSubmitCompletePraMultiple(token as string, payload);
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

      setOpenFillForm(false);

      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        await fetchRelatedVisitorsByInvitationId(invitationId);
      }

      await fetchUpcomingPurpose();
    } catch (error: any) {
      showSwal(
        'error',
        error.response.data.collection || error.response.data.message || 'Failed to Pra Register!',
      );
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

        // console.log('Final Payload:', payload);

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
        const backendMsg =
          err?.response?.data?.collection?.[0] ||
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          'Failed to execute action.';

        showSwal('error', backendMsg);
        resolve();
      } finally {
        setTimeout(() => setLoadingAccess(false), 600);
      }
    });
  };

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

  const [openMore, setOpenMore] = useState(false);
  const handleOpenMore = () => setOpenMore(true);
  const [vtLoading, setVTLoading] = useState(false);

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

  const handleSubmitReturnCard = async () => {
    try {
      if (!returnCardNumber.trim()) {
        showSwal('warning', 'Please enter card number');
        return;
      }
      setLoadingAccess(true);

      const payload = {
        card_number: returnCardNumber.trim(),
        registered_site_id: registerSiteOperator,
      };
      console.log('return card payload', JSON.stringify(payload, null, 2));

      await returnCard(token as string, payload);
      showSwal('success', 'Succesfully returned card');
      setOpenReturnCard(false);
      setReturnCardNumber('');
      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        await fetchRelatedVisitorsByInvitationId(invitationId);
      }

      await fetchAvailableCards();
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
    resetSwipeStates();
    setOpenChooseCardDialog(false);
  };

  const fetchUpcomingPurpose = async () => {
    const res = await getUpComingPurpose(token as string, {
      today: 'true',
      all_visitor_type: 'true',
    });

    setUpcomingPurpose(res?.collection ?? []);
  };

  useEffect(() => {
    if (!token) return;
    fetchUpcomingPurpose();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getUpComingVisitors(token as string, {
        today: 'true',
        // all_visitor_type: 'true',
        visitor_type: typeof selectedPurpose?.id === 'string' ? selectedPurpose?.id : undefined,
      });

      const rows = res.collection.map((items: any) => ({
        id: items.id,
        name: items.visitor_name,
        host: items.host_name,
        invitation_code: items.invitation_code,
        organization: items.visitor_organization_name,
        agenda: items.agenda,
        visitor_period_start: formatDateTime(items.visitor_period_start),
        visitor_period_end: formatDateTime(items.visitor_period_end, items.extend_visitor_period),
        visitor_status: items.visitor_status,
        vehicle_type: items.vehicle_type,
        vehicle_plate_number: items.vehicle_plate_number,
      }));
      setUpcomingVisitors(rows ?? []);
    };
    fetchData();
  }, [token, selectedPurpose]);

  const visitorsSource = typeVisitor === 'related' ? relatedVisitors : upcomingVisitors;

  const filteredVisitors = useMemo(() => {
    const keyword = debouncedKeyword.toLowerCase().trim();

    if (!keyword) return visitorsSource;

    return visitorsSource.filter((v: any) => {
      if (typeVisitor === 'related') {
        return [v.name, v.organization]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(keyword));
      }

      return [v.visitor_name, v.visitor_organization_name]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
    });
  }, [visitorsSource, debouncedKeyword, typeVisitor]);

  const totalVisitors = typeVisitor === 'related' ? totalCountVisitor : upcomingVisitors.length;

  const currentUsedCard = useMemo(() => {
    if (!Array.isArray(visitorCards)) return null;

    return (
      visitorCards.find((card) => card.card_type !== 'Barcode' && card.current_used === true) ??
      null
    );
  }, [visitorCards]);

  const swipeDialogInitialValues = useMemo(() => {
    if (currentUsedCard) {
      return {
        documentType: 'CardAccess' as DocumentType,
        value: currentUsedCard.card_number ?? '',
        isDocumentTypeLocked: true,
      };
    }
    return {
      documentType: undefined,
      value: '',
      isDocumentTypeLocked: false,
    };
  }, [currentUsedCard]);

  const scanLockRef = useRef(false);
  const lastScanRef = useRef('');

  const bulkPrintingRef = useRef(false);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001/ws');

    socketRef.current = socket;

    socket.onopen = () => {
      console.log('🟢 WS connected');
    };

    socket.onerror = (err) => {
      console.error('❌ WS error:', err);
    };

    socket.onclose = () => {
      console.warn('🔌 WS disconnected');
    };

    socket.onmessage = async (event) => {
      const raw = event.data;

      console.log('📥 WS message:', raw);

      try {
        // =========================
        // IMAGE STREAM
        // =========================
        if (typeof raw === 'string' && raw.includes('|data:image')) {
          wsImageQueueRef.current.push(raw);

          forceTick((v) => v + 1);

          return;
        }

        // =========================
        // JSON EVENT
        // =========================
        const msg = JSON.parse(raw);

        console.log('💬 WS JSON:', msg);

        // =========================
        // BARCODE
        // =========================
        if (msg?.event === 'BARCODE_SCAN' && msg?.data) {
          const value = String(msg.data).trim();

          if (!value) return;
          if (scanLockRef.current) return;
          if (lastScanRef.current === value) return;

          scanLockRef.current = true;
          lastScanRef.current = value;

          try {
            await handleSubmitQRCode(value);
          } finally {
            setTimeout(() => {
              scanLockRef.current = false;
              lastScanRef.current = '';
            }, 2000);
          }

          return;
        }

        // =========================
        // OCR RESULT
        // =========================
        if (msg?.event === 'OCR_RESULT') {
          wsOcrQueueRef.current.push(msg.data);

          forceTick((v) => v + 1);

          return;
        }

        // =========================
        // PRINT RESULT
        // =========================
        if (msg?.event === 'PRINT_RESULT') {
          if (bulkPrintingRef.current) {
            return;
          }

          if (msg.success) {
            showSwal('success', 'Printed successfully');
          } else {
            showSwal('error', msg.message || 'Print failed');
          }

          return;
        }
      } catch (err) {
        console.error('⚠️ WS parse error:', err);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendWs = (payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      console.warn('WS not connected');
    }
  };

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
            padding: '5px !important',

            position: 'relative',
            overflow: 'visible',
          }}
        >
          <Box
            flexGrow={1}
            sx={{
              // overflow: isFullscreen ? 'auto' : 'hidden',
              display: 'flex',
              padding: '0px !important',
              flexDirection: 'column',
              height: isFullscreen ? '100vh' : 'auto',
            }}
          >
            <Grid container spacing={1} mb={0} alignItems={{ xs: 'start', xl: 'center' }}>
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
                <Grid
                  size={{ xs: 12, lg: 4.5 }}
                  sx={{ border: '1px solid #e0e0e0', borderRadius: '15px' }}
                >
                  <LprVisitorCard
                    LprImage={LprImage}
                    todayVisitingPurpose={upcomingPurpose}
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

                <ActionPanelCard
                  loading={loadingPermission}
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
                  setAccessIssuance={setAccessIssuance}
                />

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
                <VisitorListCard
                  isFullscreen={isFullscreen}
                  typeVisitor={typeVisitor}
                  anchorEl={anchorEl}
                  searchKeyword={searchKeyword}
                  selectMultiple={selectMultiple}
                  bulkAction={bulkAction}
                  selectedVisitors={selectedVisitors}
                  scannedVisitorNumber={scannedVisitorNumber}
                  totalVisitors={totalVisitors}
                  filteredVisitors={filteredVisitors}
                  relatedVisitors={relatedVisitors}
                  invitationCode={invitationCode}
                  availableActions={availableActions}
                  lgUp={lgUp}
                  theme={theme}
                  permissionHook={permissionHook}
                  containerRef={containerRef}
                  CustomTextField={CustomTextField}
                  getCdnUrl={getCdnUrl as (path?: string) => string}
                  formatDateTime={formatDateTime}
                  setAnchorEl={setAnchorEl}
                  setTypeVisitor={
                    setTypeVisitor as React.Dispatch<React.SetStateAction<'related' | 'live'>>
                  }
                  setSearchKeyword={setSearchKeyword}
                  setSelectMultiple={setSelectMultiple}
                  setSelectedVisitors={setSelectedVisitors}
                  setBulkAction={setBulkAction}
                  setOpenExtendVisit={setOpenExtendVisit}
                  handleSelectRelatedVisitor={handleSelectRelatedVisitor}
                  handleApplyBulkAction={handleApplyBulkAction}
                  handleChooseCard={handleChooseCard}
                  handlePrintClick={handlePrintClick}
                />
              </Grid>

              <Grid
                size={{ xs: 12, lg: 3 }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  // height: '100%',
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
            onPrint={(base64: any) => {
              sendWs({
                cmd: 'print',
                data: base64,
              });
            }}
          />
          <PrintDialog
            open={openPreviewPrint}
            onClose={() => setOpenPreviewPrint(false)}
            invitationData={invitationCode[0]}
            printData={printData}
            onPrint={(base64: any) => {
              sendWs({
                cmd: 'print',
                data: base64,
              });
            }}
          />
          {/* Detail Purpose */}
          <DetailVisitingPurpose
            open={openDetailVisitingPurpose}
            onClose={() => setOpenDetailVistingPurpose(false)}
            data={upcomingVisitors}
            purposeName={selectedPurpose}
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
            onOpenInvitation={() => {
              handleCloseScanQR();
              setOpenInvitationVisitor(true);
            }}
          />
          <BlacklistVisitorDialog
            open={openBlacklistVisitor}
            onClose={handleCloseBlacklistVisitor}
          />
          {/* List Visitor */}
          <ListVisitorDialog
            open={openListVisitor}
            onClose={handleCloseListVisitor}
            upcomingVisitors={upcomingVisitors}
          />
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

          <ChooseCardDialog
            open={openChooseCardDialog}
            onClose={() => {
              setOpenChooseCardDialog(false);
              setSearchTerm('');
            }}
            cards={availableCards}
            containerRef={containerRef}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isChecked={isChecked}
            isIndeterminate={isIndeterminate}
            handleSelectAll={handleSelectAll}
            capacity={capacity}
            currentUsedCards={currentUsedCardsByVisitor}
            selectedCards={selectedCards}
            handleToggleCard={handleToggleCard}
            filteredCards={filteredCards}
            selectedVisitors={selectedVisitors}
            availableCount={availableCount}
            handleOpenSwipeDialog={handleOpenSwipeDialog}
            handleConfirmChooseCards={handleConfirmChooseCards}
            setAccessIssuance={setAccessIssuance}
            // setSelectedCurrentCards={setSelectedCurrentCards}
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
            initialValues={swipeDialogInitialValues}
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
            open={openAccessIssuance}
            onClose={() => setAccessIssuance(false)}
            invitationCode={invitationCode}
            selectedCards={selectedCards}
            handleToggleCard={handleToggleCard}
            formatDateTime={formatDateTime}
            accessData={accessData}
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
            isSelfGroup={isSelfGroup}
            setIsSelfGroup={setIsSelfGroup}
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
            fetchUpcomingPurpose={fetchUpcomingPurpose}
            registeredSite={registerSiteOperator}
          />

          {/* Access Dialog */}
          {/* <AccessDialog
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
          /> */}

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
            maxWidth={false}
            PaperProps={{
              sx: {
                width: '100vw',
              },
            }}
            open={openInvitationVisitor}
            onClose={handleCloseDialog}
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
            <DialogContent dividers>
              <FormWizardAddVisitor
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
                sites={sitesOperator}
                employee={employee}
                allVisitorEmployee={allVisitorEmployee}
                vtLoading={vtLoading}
                enableInvitationTypeStep={true}
                search={setSearchHost}
                isLoadingEmployee={isLoadingEmployee}
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
            <DialogContent sx={{ paddingTop: '0px' }} dividers>
              <br />
              <FormWizardAddInvitation
                key={wizardKey}
                formData={formDataAddVisitor}
                setFormData={setFormDataAddVisitor}
                onSuccess={handleSuccess}
                containerRef={containerRef ?? null}
                visitorType={visitorType}
                sites={sitesOperator}
                registeredSite={registerSiteOperator}
                employee={employee}
                allVisitorEmployee={allVisitorEmployee}
                vtLoading={vtLoading}
                enableInvitationTypeStep={false}
                search={setSearchHost}
                isLoadingEmployee={isLoadingEmployee}
              />
            </DialogContent>
          </Dialog>

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
              sx={{ zIndex: 999999 }}
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
