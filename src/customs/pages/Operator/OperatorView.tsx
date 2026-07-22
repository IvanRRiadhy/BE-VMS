import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Grid2 as Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  AlertColor,
  Portal,
  Snackbar,
  Alert,
} from '@mui/material';
import { Box, useMediaQuery, useTheme } from '@mui/system';
import moment from 'moment-timezone';
import backgroundnodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import infoPic from 'src/assets/images/backgrounds/info_pic.png';
import { IconX } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
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
import frImage from 'src/assets/images/products/pic_fr.webp';
import SearchVisitorDialog from './Dialog/SearchVisitorDialog';
import DetailVisitorDialog from './Dialog/DetailVisitorDialog';
import Swal from 'sweetalert2';
import { getDetailInvitationForm } from 'src/customs/api/visitor';
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
import { showReasonDialog, showSwal } from 'src/customs/components/alerts/alerts';
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
import VisitorSearchInput from 'src/customs/pages/Operator/Components/VisitorSearchInput';
import OperatorToolbar from 'src/customs/pages/Operator/Components/OperatorToolbar';
import VisitorImage from 'src/customs/pages/Operator/Components/VisitorImage';
import ReturnCardDialog from 'src/customs/pages/Operator/Dialog/ReturnCardDialog';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import ParkingDialog from 'src/customs/pages/Operator/Dialog/ParkingDialog';
import ActionPanelCard from 'src/customs/pages/Operator/Components/ActionPanelCard';
import FillPraregistrationGroup from 'src/customs/pages/Operator/Invitation/components/FillPraregistrationGroup';
import GrantAccessDialog from 'src/customs/pages/Operator/Dialog/GrantAccessDialog';
import ChooseCardDialog from 'src/customs/pages/Operator/Dialog/ChooseCardDialog';
import { usePermission } from 'src/hooks/UserGroup/usePermission';
import VisitorDetailCard from 'src/customs/pages/Operator/Components/VisitorDetailCard';
import FillPraregistrationSingle from 'src/customs/pages/Operator/Invitation/components/FillPraregistrationSingle';
import VisitorListCard from 'src/customs/pages/Operator/Dialog/VisitorListCard';
import usePrintBadgeConfig from 'src/hooks/PrintBadge/usePrintBadge';
import useInvitationVisitorType from 'src/hooks/Invitation/useInvitationVisitorType';
import useDataPermission from 'src/hooks/Operator/useDataPermission';
import usePermissionOperator from 'src/hooks/Operator/usePermissionOperator';
import useAvailableCardOperator from 'src/hooks/Operator/useAvailableCardOperator';
import useInvitationSite from 'src/hooks/Invitation/useInvitationSite';
import useRegisteredSiteOperator from 'src/hooks/Operator/useRegisteredSiteOperator';
import useInvitationHost from 'src/hooks/Invitation/useInvitationHost';
import { useInvitationVisitorEmployee } from 'src/hooks/Invitation/useInvitationVisitorEmployee';
import VisitorInformation from './Components/VisitorInformation';
import HostInformation from './Components/HostInformation';
import ConfirmUnsavedDialog from '../admin/components/ConfirmUnsavedDialog';
import Footer from './Components/Footer';
import { getConfig } from 'src/config';

type DocumentType = 'CardAccess' | 'Other';
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.locale('id');
type Row = {
  id: string;
  visitor?: string;
  card: string | React.ReactNode | null;
  trx_visitor_id?: string | null;
  assigned_card_number?: string | null;
  assigned_card_remarks?: string | null;
};

type CardActionType = 'Swipe' | 'Give';

const OperatorView = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
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
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedVisitorNumber, setSelectedVisitorNumber] = useState<string | null>(null);
  const [scannedVisitorNumber, setScannedVisitorNumber] = useState<string | null>(null);
  const [selectMultiple, setSelectMultiple] = useState(false);
  const [selectedVisitors, setSelectedVisitors] = useState<string[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState('');
  const [openPreRegistration, setOpenPreRegistration] = useState(false);
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
  const [openDialogInvitation, setOpenDialogInvitation] = useState(false);
  const [formDataAddVisitor, setFormDataAddVisitor] = useState<CreateVisitorRequest>(
    CreateVisitorRequestSchema.parse({}),
  );
  const [swipePayload, setSwipePayload] = useState<any[]>([]);
  const parkingData = [
    { id: 1, vehicle_type: 'Car', vehicle_plate_number: 'BG 817 AS' },
    { id: 2, vehicle_type: 'Motorcycle', vehicle_plate_number: 'B 1512 AA' },
  ];
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [typeVisitor, setTypeVisitor] = useState('live');
  const [upcomingPurpose, setUpcomingPurpose] = useState<any[]>([]);
  const [upcomingVisitors, setUpcomingVisitors] = useState<any[]>([]);
  const { sitesOperator } = useInvitationSite();
  const { registeredSite, registerSiteOperator, setRegisterSiteOperator } =
    useRegisteredSiteOperator();
  const { printData } = usePrintBadgeConfig();
  const { permission, loading: loadingPermission } = useDataPermission();
  const { permissionAccess } = usePermissionOperator();
  const { availableCards, setAvailableCards } = useAvailableCardOperator();
  const { visitorType } = useInvitationVisitorType();
  const { employee } = useInvitationHost();
  const [searchHost, setSearchHost] = useState<any>('');
  const debounceSearch = useDebounce(searchHost, 400);
  const [openMore, setOpenMore] = useState(false);
  const handleOpenMore = () => setOpenMore(true);
  const [vtLoading, setVTLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor; 
  }>({ open: false, message: '', severity: 'info' });

  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };

  const { data: allVisitorEmployee = [], isLoading: isLoadingEmployee } =
    useInvitationVisitorEmployee({
      search: debounceSearch,
      start: 0,
      length: 10,
    });
  const permissionHook = usePermission(permission);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
      invited_by: string;
    }[]
  >([]);

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

      await createMultipleGrantAccess({
        data: payloads,
      });
      resetSwipeStates();
      showSwal('success', 'Cards swapped successfully!');

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
    try {
      // const selectedCardNumber = selectedCards[visitorIndex];
      // const selectedCard = filteredCards.find((c) => c.card_number === selectedCardNumber);

      const visitorSelectedCards = Array.isArray(selectedCards[visitorIndex])
        ? selectedCards[visitorIndex]
        : selectedCards;
      const currentUsed = (visitor?.card ?? []).find((c: any) => c.current_used === true);

      const currentUsedCardNumber = String(currentUsed?.card_number || '').trim();

      const newCardNumber = selectedCards[visitorIndex];

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
        // console.log('payload', JSON.stringify(newPayload, null, 2));
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
  };

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

      await createGrandAccessOperator(payload);

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

      await extendPeriodOperator(payload);

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
      // toast(msg, 'error');
      showSwal('error', msg || 'Failed to extend visit.');
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

  // useEffect(() => {
  //   if (containerRef.current) {
  //     setDialogContainer(containerRef.current);
  //   }
  // }, [containerRef]);

  const handleInvitationCreated = (invitationCode: string) => {
    handleSubmitQRCode(invitationCode);
  };

  const handleCloseDialog = () => {
    setFormDataAddVisitor(CreateVisitorRequestSchema.parse({}));
    setResetStep((prev) => prev + 1);
    setOpenInvitationVisitor(false);
    setOpenPreRegistration(false);
    setOpenDialogIndex(null);
    setActionButton('');
    setWizardKey((k) => k + 1);
    setIsFormDirty(false);
  };

  const handleRequestClose = () => {
    if (isFormDirty) {
      setConfirmDialogOpen(true);
      return;
    }

    handleCloseDialog();
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
    } catch { }
    setActionButton(null);
    setTorchOn(false);
    setOpenDialogIndex(null);
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
    const res = await getAvailableCardOperator();
    setAvailableCards(res.collection);
  };

  const handleToggleCard = (cardNumber: string) => {
    const normalized = String(cardNumber);

    setSelectedCards((prev) => {
      if (prev.includes(normalized)) {
        return prev.filter((c) => c !== normalized);
      }

      const maxSelection = selectMultiple ? selectedVisitors.length : 1;

      if (maxSelection === 1) {
        return [normalized];
      }

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

  const handleSubmitQRCode = async (value: string) => {
    try {
      const res = await getInvitationCode(value);
      const data = res.collection?.data ?? [];

      const invitation = data[0];
      setInvitationId(invitation.id);
      const invitationId = invitation.id;

      setInvitationCode(data);
      setSelectedVisitorNumber(data[0]?.visitor_number ?? null);
      setScannedVisitorNumber(data[0]?.visitor_number ?? null);

      setSelectedVisitors([]);

      await fetchRelatedVisitorsByInvitationId(invitationId);
      const freshVisitors = await getInvitationOperatorRelated(invitationId);
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
      setTypeVisitor('related');

      const matched = freshVisitors.collection.find(
        (v: any) => v.visitor_number === scannedNumber,
      );

      if (matched) {
        setSelectedVisitorId(matched.id);
        setSelectedVisitorNumber(matched.visitor_number);
        setSelectedVisitors([matched.id]);
      }
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
    const relatedRes = await getInvitationOperatorRelated(invitationId);
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
      invited_by_name: v.invited_by_name ?? '-',
      visitor_role: v.visitor_role ?? '-',
      checkout_at: v.checkout_at ?? "-",
      checkin_at: v.checkin_at ?? "-"
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
        toast(t("mustChooseOneCard"), 'info');
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
        await createMultipleGrantAccess({
          data: payloads.map(({ visitorName, ...p }) => p),
        });
      } else {
        const { visitorName = '', ...payload } = payloads[0] as {
          visitorName?: string;
        } & (typeof payloads)[0];

        await createGrandAccessOperator(payload);
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

      showSwal('success', `Successfully assigned card(s): \n${message}`);
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
      // const res = await Swal.fire({
      //   icon: 'warning',
      //   target: containerRef.current,
      //   title: 'Blacklist Visitor',
      //   text: 'Please provide a reason for blacklist this visitor',
      //   input: 'text',
      //   inputPlaceholder: 'Enter reason...',
      //   showCloseButton: true,
      //   showCancelButton: true,
      //   confirmButtonText: 'Yes',
      //   reverseButtons: true,
      //   cancelButtonText: 'No',
      //   confirmButtonColor: '#16a34a',
      //   preConfirm: (value) => {
      //     if (!value) {
      //       toast('Please provide a reason for blacklist this visitor.', 'info');
      //       return false;
      //     }
      //     return value;
      //   },
      // });

      // if (!res.isConfirmed) return;

      // if (!res.value) {
      //   toast('Please provide a reason for blacklist this visitor.', 'info');
      //   return;
      // }

      const reason = await showReasonDialog(
        'Blacklist Visitor',
        'Please provide a reason for blacklisting this visitor.',
      );

      if (!reason) return;

      const payload = {
        visitor_id: id,
        action: 'blacklist',
        reason,
      };

      await createOperatorBlacklist(payload);

      showSwal('success', 'Visitor has been successfully blacklisted.');
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to blacklist visitor.');
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

      await createInvitationActionOperator(id!, payload);

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
          visitor_name: visitor.name,
          visitor_email: visitor.email,
          visitor_phone: visitor.phone,
          visitor_gender: visitor.gender,
          visitor_identity_id: visitor.visitor_identity_id,
          visitor_organization_name: visitor.organization,
          visitor_role: visitor.visitor_role,
          visitor_type_name: visitor.visitor_type_name,
          visitor: {
            ...prev[0].visitor,
            ...visitor,
          },
          visitor_number: visitor.visitor_number,
          visitor_period_start: visitor.visitor_period_start,
          visitor_period_end: visitor.visitor_period_end,
          agenda: visitor.agenda,
          selfie_image: visitor.selfie_image,
          identity_image: visitor.identity_image,
          card: visitor.card ?? [],
          visitor_status: visitor.visitor_status,
          block_by: visitor.block_by,
          is_block: visitor.is_block,
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
      setLoadingAccess(false);
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

    // console.log('payload', payload);

    try {
      setLoadingAccess(true);

      if (validForApi.length > 0) {
        await createMultipleInvitationActionOperator(payload);
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

      const invitationId = invitationCode?.[0]?.id;
      if (invitationId) {
        setTimeout(async () => {
          await fetchRelatedVisitorsByInvitationId(invitationId);
        }, 500);
      }
      setSelectedVisitors([]);
      setBulkAction('');

      showSwal('success', resultMessages.join('\n'));
    } catch (error: any) {
      showSwal('error', error?.message || 'Failed to perform multiple action.');
    } finally {
      setLoadingAccess(false)
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

  const availableActions = [...actions].map((a) => ({
    label: labelMap[a] || a,
    value: a,
  }));

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

      const results = await Promise.all(visitorList.map((v) => getDetailInvitationForm(v.id)));
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
      // console.log('Final Payload (MULTI-VISITOR FIXED):', JSON.stringify(payload, null, 2));
      await createSubmitCompletePraMultiple(payload);
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

        const res = await createGiveAccessOperator(payload);
        // console.log('Access Action Response:', JSON.stringify(res, null, 2));
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
        showSwal('warning', t("card.inputCardNumber"));
        return;
      }
      setLoadingAccess(true);

      const payload = {
        card_number: returnCardNumber.trim(),
        registered_site_id: registerSiteOperator,
      };

      await returnCard(payload);
      showSwal('success', t("successReturnCard"));
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
    const res = await getUpComingPurpose({
      today: 'true',
      all_visitor_type: 'true',
    });

    setUpcomingPurpose(res?.collection ?? []);
  };

  useEffect(() => {
    fetchUpcomingPurpose();
  }, []);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const sortDir = 'desc';

  useEffect(() => {
    const fetchData = async () => {
      const res = await getUpComingVisitors({
        today: 'true',
        // all_visitor_type: 'true',
        visitor_type: typeof selectedPurpose?.id === 'string' ? selectedPurpose?.id : undefined,
        start: page * rowsPerPage,
        length: rowsPerPage,
        sortDir: sortDir,
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
  }, [selectedPurpose, page, rowsPerPage]);

  const filteredUpcomingVisitors = useMemo(() => {
    if (!searchKeyword.trim()) return upcomingVisitors;

    const keyword = searchKeyword.toLowerCase();

    return upcomingVisitors.filter((item: any) =>
      [
        item.name,
        item.host,
        item.organization,
        item.invitation_code,
        item.agenda,
        item.vehicle_plate_number,
        item.vehicle_type,
        item.visitor_status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [upcomingVisitors, searchKeyword]);

  const visitorsSource = typeVisitor === 'related' ? relatedVisitors : upcomingVisitors;

  const filteredVisitors = useMemo(() => {
    const keyword = debouncedKeyword.trim().toLowerCase();

    if (!keyword) return visitorsSource;

    return visitorsSource.filter((v: any) => {
      const fields =
        typeVisitor === 'related'
          ? [
            v.name,
            v.organization,
            v.host,
          ]
          : [
            v.name,
            v.organization,
            v.host,
            v.invitation_code,
            v.agenda,
            v.vehicle_plate_number,
            v.vehicle_type,
            v.visitor_status,
          ];

      return fields
        .filter(Boolean)
        .some((field) =>
          String(field).toLowerCase().includes(keyword)
        );
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
  const { WS_URL } = getConfig();

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socketRef.current = socket;

    socket.onopen = () => {
      console.log('🟢 WS connected');
    };

    socket.onerror = (err) => {
      // console.error('❌ WS error:', err);
    };

    socket.onclose = () => {
      console.warn('🔌 WS disconnected');
    };

    socket.onmessage = async (event) => {
      const raw = event.data;
      // console.log('📥 WS message:', raw);
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

  const handleSelectLiveVisitor = async (visitor: any) => {
    setSelectedVisitors([visitor.id]);

    await handleSubmitQRCode(visitor.invitation_code);
  };


  return (
    <PageContainer title={'Operator View'} description={'Operator View'}>
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          // height: isFullscreen ? '100vh' : '100%',
          height: '100%',
          width: '100%',
          position: 'relative',
          overflowY: isFullscreen ? 'hidden' : 'auto',
          // overflowX: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            // overflow: 'hidden',
          }}
        >
          <Grid container spacing={1} mb={0} alignItems={{ xs: 'center', xl: 'center' }}>
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
                onToggleFullscreen={toggleFullscreen}
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
                flexWrap: 'wrap',
              }}
            >
              <Grid
                size={{ xs: 12, lg: 4.5 }}
                sx={{
                  borderRadius: '15px',
                  // backgroundColor: '#fff',
                  gap: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <VisitorInformation
                  faceImage={activeSelfie}
                  LprImage={frImage}
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
              </Grid>

              <Grid
                size={{ xs: 12, lg: 4.5 }}
                sx={{
                  borderRadius: '15px',
                  // backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  minHeight: 0,
                }}
              >
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
                  handleSelectLiveVisitor={handleSelectLiveVisitor}
                  handleApplyBulkAction={handleApplyBulkAction}
                  handleChooseCard={handleChooseCard}
                  handlePrintClick={handlePrintClick}
                />
              </Grid>

              {/* Side Right QR Code */}
              <Grid
                size={{ xs: 12, lg: 3 }}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                <HostInformation invitationCode={invitationCode} isFullscreen={isFullscreen} />
                <VisitorImage
                  faceImage={activeSelfie}
                  identityImage={activeKTP}
                  isFullscreen={isFullscreen}
                  openMore={openMore}
                  setOpenMore={setOpenMore}
                  handleOpenMore={handleOpenMore}
                  handleOpenDetailVistingPurpose={handleOpenDetailVistingPurpose}
                  getColorByName={getColorByName}
                  todayVisitingPurpose={upcomingPurpose}
                />
              </Grid>
            </Grid>
          </Grid>
          <Footer />
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
          data={filteredUpcomingVisitors}
          purposeName={selectedPurpose}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
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
        <BlacklistVisitorDialog open={openBlacklistVisitor} onClose={handleCloseBlacklistVisitor} />
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
          // renderFieldInput={renderFieldInput}
          invitationDetail={invitationDetail}
          allVisitorEmployee={allVisitorEmployee}
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
          onClose={handleRequestClose}
          container={containerRef.current ?? undefined}
        >
          <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
            {t('add')} Invitation Visitor
            <IconButton aria-label="close" onClick={handleRequestClose}>
              <IconX />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <FormWizardAddVisitor
              formData={formDataAddVisitor}
              setFormData={setFormDataAddVisitor}
              onSuccess={handleSuccess}
              containerRef={containerRef}
              resetStep={resetStep}
              onInvitationCreated={handleInvitationCreated}
              ws={{
                imageQueue: wsImageQueueRef,
                ocrQueue: wsOcrQueueRef,
                send: sendToScanner,
              }}
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
          onClose={handleRequestClose}
          container={containerRef.current ?? undefined}
        >
          <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
            {t('add')} Pra Registration
            <IconButton aria-label="close" onClick={handleRequestClose}>
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

        <ConfirmUnsavedDialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onDiscard={() => {
            setConfirmDialogOpen(false);
            setIsFormDirty(false);
            handleCloseDialog();
          }}
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
    </PageContainer>
  );
};

export default OperatorView;
