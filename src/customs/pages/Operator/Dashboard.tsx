import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Tab,
  Snackbar,
  Alert,
  Tabs,
  TextField,
  Typography,
  Portal,
  FormControlLabel,
  Checkbox,
  Paper,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { Box } from '@mui/system';

import {
  IconArrowAutofitRight,
  IconBan,
  IconBrandGmail,
  IconBuildingSkyscraper,
  IconCalendarTime,
  IconCamera,
  IconCar,
  IconCards,
  IconCheckupList,
  IconCircleOff,
  IconForbid2,
  IconGenderMale,
  IconHome,
  IconLicense,
  IconLogin,
  IconLogin2,
  IconLogout,
  IconMapPin,
  IconNumbers,
  IconSearch,
  IconTicket,
  IconUser,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import moment from 'moment-timezone';
import LprImage from 'src/assets/images/products/pic_lpr.png';
import FRImage from 'src/assets/images/products/pic_fr.png';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import CloseIcon from '@mui/icons-material/Close';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { IconPhone } from '@tabler/icons-react';
import { IconCalendarEvent } from '@tabler/icons-react';
import { IconUserCheck } from '@tabler/icons-react';
import Fade from '@mui/material/Fade';
import {
  createGiveAccessOperator,
  createGrandAccessOperator,
  createInvitationActionOperator,
  createMultipleGrantAccess,
  createMultipleInvitationActionOperator,
  getAvailableCardOperator,
  getInvitationCode,
  getInvitationOperatorRelated,
} from 'src/customs/api/operator';
import { Item } from 'src/customs/api/models/Operator/Invitation';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import Swal from 'sweetalert2';
import { getPermissionOperator } from '../../api/operator';
import { axiosInstance2, BASE_URL } from 'src/customs/api/interceptor';
import { useNavigate } from 'react-router-dom';

const DashboardOperator = () => {
  const cards = [
    { title: 'Check In', icon: IconLogin, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Check Out', icon: IconLogout, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Block', icon: IconCircleOff, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Denied', icon: IconBan, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  ];

  const navigate = useNavigate();

  const [permissionAccess, setPermissionAccess] = useState<any[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [openCheckin, setOpenCheckin] = useState(false);
  const [openRelated, setOpenRelated] = useState(false);

  const { token } = useSession();

  // ✅ state untuk buka tutup dialog QR
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDetailQRCode, setOpenDetailQRCode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  // QR Scanner state
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [invitationCode, setInvitationCode] = useState<Item[]>([]);
  const [selectedInvitations, setSelectedInvitations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [openChooseCardDialog, setOpenChooseCardDialog] = useState(false);

  const handleOpenScanQR = () => setOpenDialogIndex(1);
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

  // 🧩 Dummy data untuk tabel Access
  const [accessData, setAccessData] = useState<any[]>([]);

  const [availableCards, setAvailableCards] = useState<any[]>([]);

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
      vehicle_plate_number: string;
    }[]
  >([]);

  // const [selected, setSelected] = useState<number[]>([]);
  const [scannerKey, setScannerKey] = useState(0);

  const filteredCards = availableCards.filter((card) =>
    [card.remarks, card.card_number, card.card_mac]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const [visitorStatus, setVisitorStatus] = useState<string | null>(null);
  useEffect(() => {
    if (openDetailQRCode && invitationCode[0]?.visitor_status) {
      setVisitorStatus(invitationCode[0].visitor_status);
    }
  }, [openDetailQRCode, invitationCode]);

  const [selectedActionAccess, setSelectedActionAccess] = useState<string | null>(null);

  type Row = {
    id: string;
    visitor?: string;
    card: string | React.ReactNode | null;
    trx_visitor_id?: string | null;
    assigned_card_number?: string | null;
    assigned_card_remarks?: string | null;
  };
  const [rows, setRows] = useState<Row[]>([]);

  const [searchKeyword, setSearchKeyword] = useState('');



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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAvailableCardOperator(token as string);
        setAvailableCards(res?.collection ?? []);
      } catch (e) {
        console.error('❌ Error fetching available cards:', e);
      }
    };

    fetchData();
  }, [token]);


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

      if (data.length > 1) {
        const invitation = data[0];
        const invitationId = invitation.id;
        const relatedRes = await getInvitationOperatorRelated(invitationId, token as string);
        const relatedData = relatedRes.collection ?? [];
        // const mappedVisitors = relatedData.map((v: any) => ({
        //   id: v.id ?? '-',
        //   name: v.visitor?.name ?? '-',
        //   avatar: '',
        //   vehicle_plate_number: v.vehicle_plate_number ?? '-',
        //   visitor_status: v.visitor_status ?? '-',
        //   card:
        //     Array.isArray(v.card) && v.card.length > 0
        //       ? { card_number: v.card[0].card_number ?? '-' }
        //       : null,
        // }));
        await fetchRelatedVisitorsByInvitationId(invitationId);

        // setRelatedVisitors(mappedVisitors);
        setInvitationCode(data);
        setVisitorStatus(data[0]?.visitor_status ?? null);

        const accessList = Array.isArray(invitation.access)
          ? invitation.access
          : [invitation.access];

        const filteredAccess = accessList.filter((a: any) =>
          permissionAccess.some((p: any) => p.access_control_id === a.access_control_id),
        );

        const mergedAccess = filteredAccess.map((a: any) => {
          const perm = permissionAccess.find(
            (p: any) => p.access_control_id === a.access_control_id,
          );

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

        setAccessData(mergedAccess);
        setOpenRelated(true);
        return;
      }
      const invitation = data[0];
      const invitationId = invitation.id;

      // ✅ Ambil data related visitor
      const relatedRes = await getInvitationOperatorRelated(invitationId, token as string);
      const relatedData = relatedRes.collection ?? [];
      // const mappedVisitors = relatedData.map((v: any) => ({
      //   id: v.id ?? '-',
      //   name: v.visitor?.name ?? '-',
      //   avatar: v.selfie_image,
      //   vehicle_plate_number: v.vehicle_plate_number ?? '-',
      //   visitor_status: v.visitor_status ?? '-',
      //   card:
      //     Array.isArray(v.card) && v.card.length > 0
      //       ? { card_number: v.card[0].card_number ?? '-' }
      //       : null,
      // }));

      // setRelatedVisitors(mappedVisitors);
      await fetchRelatedVisitorsByInvitationId(invitationId);
      setInvitationCode(data);
      setVisitorStatus(data[0]?.visitor_status ?? null);

      const accessList = Array.isArray(invitation.access) ? invitation.access : [invitation.access];

      const filteredAccess = accessList.filter((a: any) =>
        permissionAccess.some((p: any) => p.access_control_id === a.access_control_id),
      );

      const mergedAccess = filteredAccess.map((a: any) => {
        const perm = permissionAccess.find((p: any) => p.access_control_id === a.access_control_id);

        // 🧩 Jika tidak ditemukan, tetap tampil tapi semua izin false
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

      setAccessData(mergedAccess);

      setOpenDetailQRCode(true);
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleCards = availableVisibleCards.map((c) => String(c.card_number));
      const capacity = selectedInvitations.length;
      const toAdd = visibleCards.slice(0, capacity);
      setSelectedCards(toAdd);
    } else {
      setSelectedCards([]);
    }
  };

  const isMultipleVisitor = relatedVisitors.length > 1;

  const handleToggleCard = (cardNumber: string) => {
    setSelectedCards((prev) => {
      const normalized = String(cardNumber);

      // Kalau single visitor, tetap sama kayak dulu
      if (!isMultipleVisitor) {
        if (prev.includes(normalized)) {
          return [];
        }
        return [normalized];
      }

      // 🟢 MULTIPLE MODE
      if (prev.includes(normalized)) {
        // Unselect kalau diklik lagi
        return prev.filter((c) => c !== normalized);
      }

      // 🔒 Batasi jumlah kartu maksimal sesuai jumlah visitor tanpa kartu
      const visitorsWithoutCard = relatedVisitors.filter((v) => !v.card);
      const cardLimit = visitorsWithoutCard.length;

      if (prev.length >= cardLimit) {
        setSnackbarMsg(
          `You can only choose up to ${cardLimit} card${
            cardLimit > 1 ? 's' : ''
          } for ${cardLimit} visitor${cardLimit > 1 ? 's' : ''}.`,
        );
        setSnackbarType('info');
        setSnackbarOpen(true);
        return prev; // tidak menambah kartu baru
      }

      // ✅ Tambahkan kartu baru
      return [...prev, normalized];
    });
  };

  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const availableCount = availableVisibleCards.length;

  const [tableKey, setTableKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetSelections = () => {
    setSelectedInvitations([]);
    setSelectedCards([]);
    setTableKey((k) => k + 1); // ← paksa remount DynamicTable
  };

  const handleCloseChooseCard = () => {
    setOpenChooseCardDialog(false);
    resetSelections();
  };

  const cardIndex = useMemo(() => {
    const m = new Map<string, (typeof availableCards)[number]>();
    availableCards.forEach((c) => m.set(c.card_number, c));
    return m;
  }, [availableCards]);


  const handleConfirmChooseCards = async () => {
    try {
      if (!selectedCards.length) {
        setSnackbarMsg('Please choose at least one card.');
        setSnackbarType('info');
        setSnackbarOpen(true);
        return;
      }

      if (relatedVisitors.length > 1) {
        // 🟢 MULTIPLE GRANT
        const payload = {
          data: relatedVisitors.map((v, i) => ({
            trx_visitor_id: v.id,
            card_number: String(selectedCards[i]),
          })),
        };

        console.log('🚀 Multiple Grant Payload:', payload);
        const res = await createMultipleGrantAccess(token as string, payload);
        console.log('✅ Multiple Grant Response:', res);

        setSnackbarMsg(
          `Successfully granted ${selectedCards.length} cards to ${relatedVisitors.length} visitors.`,
        );
        setSnackbarType('success');
      } else {
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
      }

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

  // State untuk menyimpan mana yang terpilih
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedAction, setSelectedAction] = useState('');
  const [disabledIndexes, setDisabledIndexes] = useState<number[]>([]);



  const [selectedAccessIds, setSelectedAccessIds] = useState<string[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(false);

  const confirmCheckIn = async (action: 'Checkin' | 'Checkout' | 'Block' | 'Unblock') => {
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

  const confirmMultipleAction = async (action: 'Checkin' | 'Checkout' | 'Block' | 'Unblock') => {
    if (!selectedVisitorData.length) {
      setSnackbarMsg('Please select at least one visitor first.');
      setSnackbarType('info');
      setSnackbarOpen(true);
      return;
    }
    const actionLabelMap: Record<string, string> = {
      Checkin: 'check in',
      Checkout: 'check out',
      Block: 'block this visitor',
      Unblock: 'unblock this visitor',
    };

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

    if (!confirm.isConfirmed) return;

    try {
      // bentuk payload dari selected visitors
      const payload = {
        data: selectedVisitorData.map((v) => ({
          trx_visitor_id: v.id, // ambil dari data visitor
          action,
          reason: '', // bisa nanti tambah alasan manual
        })),
      };

      console.log('🚀 multiple action payload:', payload);

      const res = await createMultipleInvitationActionOperator(token as string, payload);
      console.log('✅ multiple action response:', res);

      setRelatedVisitors((prev) =>
        prev.map((v) => {
          const isAffected = payload.data.some((d) => d.trx_visitor_id === v.id);
          return isAffected ? { ...v, visitor_status: action } : v;
        }),
      );

      // Jika kamu juga ingin update main detail visitor
      setInvitationCode((prev) =>
        prev.map((inv) =>
          payload.data.some((d) => d.trx_visitor_id === inv.id)
            ? { ...inv, visitor_status: action }
            : inv,
        ),
      );

      setSnackbarMsg(`Successfully ${action} ${payload.data.length} visitor(s).`);
      setSnackbarType('success');
      setSnackbarOpen(true);

      setDisabledIndexes((prev) => {
        const affectedIndexes = relatedVisitors
          .map((v, i) => (payload.data.some((d) => d.trx_visitor_id === v.id) ? i : null))
          .filter((i): i is number => i !== null);

        return Array.from(new Set([...prev, ...affectedIndexes]));
      });

      // 🧹 Kosongkan selection biar clean
      setSelected([]);
    } catch (err) {
      console.error('❌ Error multiple action:', err);
      setSnackbarMsg(`Failed to ${action}.`);
      setSnackbarType('error');
      setSnackbarOpen(true);
    }
  };

  const selectedVisitorData = useMemo(() => {
    return relatedVisitors
      .filter((_, index) => selected.includes(index))
      .map((v) => ({
        id: v.id,
        name: v.name,
        vehicle_plate_number: v.vehicle_plate_number,
        visitor_status: v.visitor_status,
        card_number: Array.isArray(v.card) && v.card.length > 0 ? v.card : null,
      }));
  }, [relatedVisitors, selected]);
  const handleCloseRelated = () => {
    setOpenRelated(false);
    setQrValue('');
    setSelected([]);
  };

  const handleAccessAction = async (
    row: any,
    action: 'grant' | 'revoke' | 'block' | 'no_action' | 'unblock',
  ) => {
    const actionMap: Record<typeof action, number> = {
      no_action: 0,
      grant: 1,
      revoke: 2,
      block: 3,
      unblock: 4,
    };

    const trxVisitorId = row?.trx_visitor_id || row?.trxVisitorId || invitationCode[0]?.id;

    // ✅ Ambil ID dari row paling dulu
    const accessControlId =
      row?.access_control_id ||
      (Array.isArray(invitationCode[0]?.access)
        ? invitationCode[0].access.find((x) => x.id === row?.id)?.access_control_id
        : undefined);

    const actionCode = actionMap[action];

    if (!accessControlId) {
      console.warn('⚠️ Access control ID not found in row or fallback:', row);
      setSnackbarMsg('Access Control ID not found.');
      setSnackbarType('error');
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      data_access: [
        {
          access_control_id: accessControlId,
          action: actionCode,
          trx_visitor_id: trxVisitorId,
        },
      ],
    };

    console.log('🚀 Payload Access Action (accurate):', payload);

    try {
      setLoadingAccess(true);
      const res = await createGiveAccessOperator(token as string, payload);
      console.log('✅ Access Action Response:', res);

      setSnackbarMsg(`Access ${action} successfully.`);
      setSnackbarType('success');
      setSnackbarOpen(true);

      // // 🧩 Update UI
      // setAccessData((prev) =>
      //   prev.map((a) => {
      //     if (a.access_control_id === accessControlId || a.id === accessControlId) {
      //       const label =
      //         actionCode === 1
      //           ? 'Grant'
      //           : actionCode === 2
      //           ? 'Revoke'
      //           : actionCode === 3
      //           ? 'Block'
      //           : 'No Action';

      //       return {
      //         ...a,
      //         visitor_give_access: actionCode, // 🔥 sync ke UI
      //         // status: label,
      //       };
      //     }
      //     return { ...a };
      //   }),
      // );
      setAccessData((prev) =>
        prev.map((a) => {
          // 🔍 pastikan cocok dengan salah satu identifier
          const match =
            a.access_control_id === accessControlId ||
            a.id === accessControlId ||
            a.id === row.id ||
            a.access_control_id === row.access_control_id;

          if (match) {
            console.log(`🟢 Updating row ${a.id} (action: ${action})`);
            return {
              ...a,
              visitor_give_access: actionMap[action], // langsung sync ke nilai yang benar
            };
          }
          return a;
        }),
      );
    } catch (err: any) {
      // 🔍 Ambil pesan error dari berbagai kemungkinan lokasi, termasuk 'collection'
      const backendMsg =
        err?.response?.data?.collection?.[0] || // ✅ ambil elemen pertama dari array collection
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors.join('\n') : null) ||
        err?.message ||
        'Unknown error occurred.';

      console.warn('⚠️ Backend message parsed:', backendMsg);

      setSnackbarMsg(`${backendMsg}`);
      setSnackbarType('error');
      setSnackbarOpen(true);
    } finally {
      setTimeout(() => setLoadingAccess(false), 600);
    }
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

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return (
      moment
        .utc(dateStr) // data asal UTC
        .tz('Asia/Jakarta') // ubah ke zona waktu Jakarta
        .format('DD MMM YYYY, HH:mm') + ' WIB'
    );
  };

  const [cardLimit, setCardLimit] = useState<number | null>(null);

  const handleChooseMultipleCard = () => {
    if (!invitationCode.length) {
      setSnackbarMsg('No visitor data found. Please scan QR first.');
      setSnackbarType('info');
      setSnackbarOpen(true);
      return;
    }

    // 🔍 Hitung visitor yang BELUM punya kartu
    const visitorsWithoutCard = relatedVisitors.filter((v) => !v.card);

    const maxCards = visitorsWithoutCard.length;

    if (maxCards === 0) {
      setSnackbarMsg('All selected visitors already have cards assigned.');
      setSnackbarType('info');
      setSnackbarOpen(true);
      return;
    }

    setSelectedCards([]); // reset dulu
    setOpenChooseCardDialog(true);

    // Simpan batas kartu maksimum agar dipakai saat memilih nanti
    setCardLimit(maxCards);
  };

  const getActionCode = (action: string) => {
    switch (action) {
      case 'Grant':
        return 1;
      case 'Revoke':
        return 2;
      case 'Block':
        return 3;
      default:
        return 0;
    }
  };

  const confirmMultipleAccessAction = async () => {
    if (!selectedActionAccess) {
      setSnackbarMsg('Please select an access action.');
      setSnackbarType('info');
      setSnackbarOpen(true);
      return;
    }

    const actionCode = getActionCode(selectedActionAccess);

    // ✅ Ambil access yang diceklis dari tabel kanan
    const chosenAccess = accessData.filter((a: any) =>
      selectedAccessIds.includes(a.access_control_id),
    );

    // ✅ Ambil visitor yang diceklis dari daftar kiri
    const selectedVisitors = relatedVisitors.filter((_, i) => selected.includes(i));

    if (selectedVisitors.length === 0) {
      setSnackbarMsg('Please select at least one visitor.');
      setSnackbarType('info');
      setSnackbarOpen(true);
      return;
    }

    if (chosenAccess.length === 0) {
      setSnackbarMsg('Please select at least one access.');
      setSnackbarType('info');
      setSnackbarOpen(true);
      return;
    }

    // ✅ Pastikan hanya access yang diizinkan sesuai permission
    const validAccess = chosenAccess.filter((a: any) => {
      const action = selectedActionAccess.toLowerCase();
      if (action === 'grant') return a.can_grant;
      if (action === 'revoke') return a.can_revoke;
      if (action === 'block') return a.can_block;
      if (action === 'unblock') return true;
      return false;
    });

    if (validAccess.length === 0) {
      setSnackbarMsg('No permitted access items for this action.');
      setSnackbarType('info');
      setSnackbarOpen(true);
      return;
    }

    // 🚀 Buat kombinasi Visitor × Access
    const data_access: any[] = [];
    for (const visitor of selectedVisitors) {
      for (const access of validAccess) {
        data_access.push({
          access_control_id: access.access_control_id, // ✅ dari access yang dipilih
          action: actionCode,
          trx_visitor_id: visitor.id, // ✅ dari visitor, bukan access
        });
      }
    }

    const payload = { data_access };
    console.log('🚀 Payload Checkin Give Access (MULTI FIXED):', payload);

    try {
      setLoadingAccess(true);
      const res = await createGiveAccessOperator(token as string, payload);
      console.log('✅ Response from checkin-give-access:', res);

      setSnackbarMsg(
        `Successfully applied ${selectedActionAccess} to ${data_access.length} combination(s).`,
      );
      setSnackbarType('success');
      setSnackbarOpen(true);
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
    } finally {
      setLoadingAccess(false);
    }
  };

 
  const getAllowedActions = (visitor_give_access: number): string[] => {
    switch (visitor_give_access) {
      case 0:
        return ['Grant'];
      case 1:
        return ['Revoke', 'Block'];
      case 2:
        return ['Grant'];
      case 3:
        return [];
      default:
        return [];
    }
  };

  // Gabungkan beberapa visitor_give_access menjadi intersection
  const getAllowedActionsForMultiple = (selectedIds: string[]) => {
    if (!selectedIds.length) return [];

    const actionsList = selectedIds.map((id) => {
      const access = accessData.find((a) => a.access_control_id === id);
      return getAllowedActions(access?.visitor_give_access ?? 0);
    });

    // Ambil irisan antar semua access yang dipilih
    return actionsList.reduce((acc, curr) => acc.filter((x) => curr.includes(x)));
  };

  const allowedActions = useMemo(() => {
    if (selectedAccessIds.length === 0) return [];
    return getAllowedActionsForMultiple(selectedAccessIds);
  }, [selectedAccessIds, accessData]);

  return (
  
      <Container title="Dashboard">
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 12 }}>
            <Grid container spacing={2}>
              {/* Kolom kiri (dua tabel vertikal) */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <DynamicTable
                    height={420}
                    isHavePagination
                    overflowX="auto"
                    data={[]}
                    isHaveChecked={false}
                    isHaveAction={false}
                    isHaveHeaderTitle
                    titleHeader="Visitor Arrival"
                  />

                  <DynamicTable
                    height={420}
                    isHavePagination
                    overflowX="auto"
                    data={[]}
                    isHaveChecked={false}
                    isHaveAction={false}
                    isHaveHeaderTitle
                    titleHeader="Extended Request"
                  />
                </Box>
              </Grid>

              {/* Kolom kanan (panel panjang ke bawah) */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Box
                  sx={{
                    height: '100%',
                    // minHeight: 860, // sesuai tinggi gabungan dua tabel (420 + 420 + gap)
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 2,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    gap: 2,
                  }}
                >
                  <Grid
                    container
                    spacing={0}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Kolom LPR */}
                    <Grid
                      size={{ xs: 12, lg: 6 }}
                      sx={{
                        borderRight: { lg: '1px solid #e0e0e0' },
                        borderBottom: { xs: '1px solid #e0e0e0', lg: 'none' },
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" textAlign="center">
                        LPR
                      </Typography>

                      {/* Frame Gambar */}
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 420,
                          height: 300,
                          // border: '3px solid #1976d2', // biru elegan seperti frame kamera
                          borderRadius: 2,
                          overflow: 'hidden',
                          position: 'relative',
                          boxShadow: 2,
                          backgroundColor: '#fff', // latar belakang hitam seperti CCTV feed
                        }}
                      >
                        <Box
                          component="img"
                          src={LprImage}
                          alt="LPR Preview"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 1,
                            opacity: 0.95,
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Kolom Faceimage */}
                    <Grid
                      size={{ xs: 12, lg: 6 }}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          textAlign: 'center', // biar teks tetap di tengah
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          Face Image
                        </Typography>

                        <IconArrowAutofitRight
                          onClick={() => navigate('/operator/view')}
                          style={{
                            position: 'absolute',
                            right: 0, // ujung kanan
                            top: '50%', // sejajar secara vertikal
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            width: '30px',
                            height: '30px',
                            backgroundColor: '#5D87FF',
                            padding: '2px',
                            color: 'white',
                            borderRadius: '50%',
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 420,
                          height: 300,
                          // border: '3px solid #1976d2', // biru elegan seperti frame kamera
                          borderRadius: 2,
                          overflow: 'hidden',
                          position: 'relative',
                          boxShadow: 2,
                          backgroundColor: '#fff', // latar belakang hitam seperti CCTV feed
                        }}
                      >
                        <Box
                          component="img"
                          src={FRImage}
                          alt="LPR Preview"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 1,
                            opacity: 0.95,
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <DynamicTable
                    height={420}
                    isHavePagination
                    overflowX="auto"
                    data={[]}
                    isHaveChecked={false}
                    isHaveAction={false}
                    isHaveHeaderTitle
                    titleHeader="Data Arrival"
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
  
        <Portal>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
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
            }}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarType}
              variant="filled"
              sx={{ width: '100%' }}
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
              color: 'primary',
            }}
            open={loadingAccess}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </Portal>
      </Container>
  );
};

export default DashboardOperator;
