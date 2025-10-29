import {
  Avatar,
  Button,
  Card,
  CardContent,
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
  Chip,
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
  IconArrowsMaximize,
  IconBan,
  IconBrandGmail,
  IconBrowser,
  IconBuildingSkyscraper,
  IconCalendarTime,
  IconCalendarUp,
  IconCar,
  IconCards,
  IconCheckupList,
  IconCircleOff,
  IconForbid2,
  IconGenderMale,
  IconHome,
  IconIdBadge2,
  IconLicense,
  IconLogin,
  IconLogin2,
  IconLogout,
  IconMapPin,
  IconNumbers,
  IconQrcode,
  IconSearch,
  IconTicket,
  IconUser,
  IconUsersGroup,
  IconWindowMaximize,
  IconX,
} from '@tabler/icons-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import moment from 'moment-timezone';
import LprImage from '../../../assets/images/products/pic_lpr.png';
import FRImage from '../../../assets/images/products/pic_fr.png';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import PageContainer from 'src/components/container/PageContainer';
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
  getGrantAccessOperator,
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
  const [relatedData, setRelatedData] = useState<any[]>([]);

  // const [code, setCode] = useState('');
  const [selectedInvitations, setSelectedInvitations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [openChooseCardDialog, setOpenChooseCardDialog] = useState(false);

  const handleOpenChooseCard = () => {
    if (!selectedInvitations?.length) {
      setSnackbarMsg('Please select at least one invitation first.');
      setSnackbarType('info');
      return;
    }
    setSelectedCards([]);
    setOpenChooseCardDialog(true);
  };

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

  const filteredRows = useMemo(() => {
    if (!searchKeyword) return rows;
    return rows.filter((r) => r.visitor?.toLowerCase().includes(searchKeyword.toLowerCase()));
  }, [rows]);

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

  // const handleSubmitQRCode = async () => {
  //   try {
  //     const res = await getInvitationCode(token as string, qrValue);
  //     const data = res.collection?.data ?? [];
  //     console.log(data);

  //     if (data.length === 0) {
  //       setSnackbarMsg('Your code does not exist.');
  //       setSnackbarType('error');
  //       setSnackbarOpen(true);
  //       return;
  //     }

  //     const invitation = data[0];
  //     const invitationId = invitation.id;

  //     // ✅ Ambil data related visitor
  //     const relatedRes = await getInvitationOperatorRelated(invitationId, token as string);
  //     const relatedData = relatedRes.collection ?? [];

  //     const mappedVisitors = relatedData.map((v: any) => ({
  //       id: v.id ?? '-',
  //       name: v.visitor?.name ?? '-',
  //       avatar: '',
  //       vehicle_plate_number: v.vehicle_plate_number ?? '-',
  //       visitor_status: v.visitor_status ?? '-',
  //     }));
  //     console.log('mapped visitor', mappedVisitors);

  //     setRelatedVisitors(mappedVisitors);
  //     console.log('related visitor', relatedVisitors);
  //     setInvitationCode(data);
  //     setVisitorStatus(data[0]?.visitor_status ?? null);
  //     const acc = data[0]?.access;
  //     if (acc) {A
  //       const arr = Array.isArray(acc) ? acc : [acc];
  //       const mappedAccess = arr.map((a: any) => ({
  //         id: a.id,
  //         // access_control_id: a.access_control_id,
  //         name: a.access_control_name ?? '-',
  //         early_access: a.early_access,
  //         visitor_give_access: a.visitor_give_access, // 🔥 simpan field ini!
  //         status:
  //           a.visitor_give_access === 1
  //             ? 'Grant'
  //             : a.visitor_give_access === 2
  //             ? 'Revoke'
  //             : a.visitor_give_access === 3
  //             ? 'Block'
  //             : 'No Action',
  //       }));
  //       setAccessData(mappedAccess);
  //     } else {
  //       setAccessData([]);
  //     }
  //     setOpenDetailQRCode(true);
  //     handleCloseScanQR();

  //     setSnackbarMsg('Kode Akses ditemukan.');
  //     setSnackbarType('success');
  //     setSnackbarOpen(true);
  //   } catch (e) {
  //     console.error('Error fetching invitation code:', e);
  //     setSnackbarMsg('Your code does not exist.');
  //     setSnackbarType('error');
  //     setSnackbarOpen(true);
  //   }
  // };

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

        // ==========================
        // 🔥 Merge Access vs Permission
        // ==========================
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

        console.log('🧩 mergedAccess:', mergedAccess);
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

      // ==========================
      // 🔥 Merge Access vs Permission
      // ==========================
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

      console.log('🧩 mergedAccess:', mergedAccess);
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

  // const handleConfirmChooseCards = async () => {
  //   const trxVisitorId = invitationCode[0]?.id;

  //   if (!trxVisitorId) {
  //     setSnackbarMsg('Missing visitor ID.');
  //     setSnackbarType('error');
  //     setSnackbarOpen(true);
  //     return;
  //   }

  //   if (!selectedCards.length) {
  //     setSnackbarMsg('Please choose at least one card.');
  //     setSnackbarType('info');
  //     setSnackbarOpen(true);
  //     return;
  //   }

  //   try {
  //     // 🔥 panggil API createGrandAccessOperator untuk tiap kartu terpilih
  //     for (const cardNumber of selectedCards) {
  //       const payload = {
  //         card_number: String(cardNumber),
  //         trx_visitor_id: trxVisitorId,
  //       };

  //       // 👉 log payload sebelum kirim
  //       console.log('🚀 Grant Access Payload:', payload);

  //       const res = await createGrandAccessOperator(token as string, payload);

  //       // 👉 log hasil response dari API
  //       console.log('✅ Grant Access Response:', res);
  //     }

  //     setSnackbarMsg(`Successfully assigned ${selectedCards.length} card(s).`);
  //     setSnackbarType('success');
  //     setSnackbarOpen(true);

  //     handleCloseChooseCard();
  //   } catch (err) {
  //     console.error('❌ createGrandAccessOperator error:', err);
  //     setSnackbarMsg('Failed to assign card.');
  //     setSnackbarType('error');
  //     setSnackbarOpen(true);
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

  const handleToggles = (index: number) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const [selectedAccessIds, setSelectedAccessIds] = useState<string[]>([]);

  const handleToggleAccess = (id: string) => {
    setSelectedAccessIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // const handleSubmitGiveAccess = async () => {
  //   if (!selectedAccessIds.length) {
  //     setSnackbarMsg('Please select at least one access.');
  //     setSnackbarType('info');
  //     setSnackbarOpen(true);
  //     return;
  //   }

  //   try {
  //     // Ambil data dari visitor yang sedang di-checkin
  //     const trxVisitorId = rows[0]?.trx_visitor_id;
  //     const cardNumber = rows[0]?.assigned_card_number;

  //     const payload = {
  //       data_access: selectedAccessIds.map((id) => {
  //         const accessItem = accessData.find((a) => a.id === id);
  //         return {
  //           access_control_id: accessItem?.access_control_id ?? id,
  //           action: 1,
  //           card_number: cardNumber,
  //           trx_visitor_id: trxVisitorId,
  //         };
  //       }),
  //     };

  //     console.log('🚀 Payload Give Access:', payload);

  //     const res = await createGiveAccessOperator(token as string, payload);
  //     console.log('✅ Give Access Response:', res);

  //     setSnackbarMsg('Access granted successfully.');
  //     setSnackbarType('success');
  //     setSnackbarOpen(true);
  //     setAccessDialogOpen(false);
  //   } catch (e) {
  //     console.error('❌ Give Access error:', e);
  //     setSnackbarMsg('Failed to give access.');
  //     setSnackbarType('error');
  //     setSnackbarOpen(true);
  //   }
  // };

  // const [currentSitePlace, setCurrentSitePlace] = useState<string | null>(null);
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

  // useEffect(() => {
  //   if (accessDialogOpen && currentSitePlace) {
  //     // Ambil akses site ketika dialog give access dibuka
  //     const fetchAccess = async () => {
  //       try {
  //         const res = await getGrantAccessOperator(token as string, currentSitePlace);
  //         console.log('Grant Access Data:', res);
  //         setAccessData(res.collection ?? []); // pastikan formatnya array
  //       } catch (err) {
  //         console.error('Error fetching grant access:', err);
  //         setAccessData([]);
  //       }
  //     };
  //     fetchAccess();
  //   }
  // }, [accessDialogOpen, currentSitePlace]);

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

  // const [isSubmitting, setIsSubmitting] = useState(false);

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

  // const getAllowedActions = (visitor_give_access: number): string[] => {
  //   switch (visitor_give_access) {
  //     case 0:
  //       return ['Grant'];
  //     case 1:
  //       return ['Revoke', 'Block'];
  //     case 2:
  //       return ['Grant'];
  //     case 3:
  //       return [];
  //     default:
  //       return [];
  //   }
  // };
  // const selectedAccessStatus = useMemo(() => {
  //   if (selectedAccessIds.length === 0) return null;

  //   // ambil access pertama yang dipilih
  //   const selectedAccess = accessData.find((a) => selectedAccessIds.includes(a.access_control_id));

  //   return selectedAccess?.visitor_give_access ?? null;
  // }, [selectedAccessIds, accessData]);

  // const allowedActions =
  //   selectedAccessStatus !== null ? getAllowedActions(selectedAccessStatus) : [];
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
    <>
      <PageContainer title="Dashboard">
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid size={{ xs: 12, lg: 9 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 3 }}>
            <Box display="flex" flexDirection="column" width="100%" gap={2} height="100%">
              <Button
                onClick={handleOpenScanQR}
                sx={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 1,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'scale(1.02)',
                  },

                  // ✅ Responsive height
                  height: {
                    xs: 180, // tinggi di layar kecil
                    sm: 220, // tablet
                    md: 240, // desktop kecil
                    lg: '100%', // di desktop besar mengikuti tinggi parent
                  },
                }}
              >
                <Typography fontWeight={600} color="#000" variant="h6" mb={1} textAlign="center">
                  Tap to Scan
                </Typography>

                <Box
                  sx={{
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    backgroundColor: '#fff',
                    padding: 1,
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <QRCode size={50} color="#000" value="example" />
                </Box>
              </Button>
            </Box>
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
                          height: 250,
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
                          height: 250,
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
                  {/* Contoh konten lain */}
                  {/* <Box
                    sx={{
                      flexGrow: 1, // ambil sisa tinggi yang ada
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%', // penting agar anaknya bisa ikut penuh
                      overflow: 'hidden', // opsional, untuk mencegah scroll ganda
                    }}
                  > */}
                  <DynamicTable
                    isHaveHeaderTitle={true}
                    titleHeader="Data Arrival"
                    data={[]}
                    isHaveChecked={true}
                    isHaveAction={false}
                    isHaveArrival={true}
                    // isHaveAction={false}
                  />
                  {/* </Box> */}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* Scan QR */}
        <Dialog fullWidth maxWidth="sm" open={openDialogIndex === 1} onClose={handleCloseScanQR}>
          <DialogTitle display="flex">
            Scan QR Visitor
            <IconButton
              aria-label="close"
              sx={{ position: 'absolute', right: 8, top: 8 }}
              onClick={handleCloseScanQR}
            >
              <CloseIcon />
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
                          setIsSubmitting(true); // 🔥 mulai loading
                          await handleSubmitQRCode(qrValue); // panggil function kamu
                        } finally {
                          setIsSubmitting(false); // 🔥 matikan loading
                        }
                      }}
                      disabled={!qrValue || isSubmitting} // 🔒 disable kalau kosong atau sedang loading
                      startIcon={
                        isSubmitting ? <CircularProgress size={18} color="inherit" /> : null
                      }
                    >
                      {isSubmitting ? 'Submit...' : 'Submit'}
                    </Button>
                  </Box>
                </Box>
                {/* <QRCode
                  value={'6524505619'}
                  size={150}
                  style={{ margin: '0 auto', marginTop: 20 }}
                /> */}
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
                    // onScan={(result: any) => {
                    //   if (!result) return;

                    //   // 🔒 cegah callback berulang-ulang
                    //   if (hasDecoded) return;

                    //   // 🔍 debug ke console biar tahu struktur object-nya
                    //   console.log('📸 QR scan raw result:', result);

                    //   setHasDecoded(true);

                    //   // 🧩 ambil nilai QR dari berbagai kemungkinan format
                    //   let value = '';
                    //   if (typeof result === 'string') {
                    //     value = result;
                    //   } else if (Array.isArray(result)) {
                    //     value = result[0]?.rawValue || '';
                    //   } else if (typeof result === 'object') {
                    //     value = result.rawValue || JSON.stringify(result);
                    //   }

                    //   console.log('✅ Extracted QR value:', value);
                    //   setQrValue(value);
                    //   setOpenDetailQRCode(true); // buka dialog detail
                    //   setOpenDialogIndex(null); // reset index jika perlu

                    //   // 🚀 AUTO SUBMIT langsung setelah QR berhasil dibaca
                    //   // setTimeout(() => {
                    //   //   console.log('🚀 Auto submit triggered with value:', value);
                    //   //   setOpenDetailQRCode(true); // buka dialog detail
                    //   //   setOpenDialogIndex(null); // reset index jika perlu
                    //   // }); // kasih delay kecil biar smooth transisi
                    // }}
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
                    {/* Kotak scan di tengah (lubang) */}
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
                      {/* 4 corner, ditempel di dalam kotak agar selalu pas */}
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
                        torchOn ? (
                          <FlashOnIcon fontSize="small" />
                        ) : (
                          <FlashOffIcon fontSize="small" />
                        )
                      }
                    >
                      Torch
                    </Button>
                  </Box>
                </Box>

                {/* Preview hasil + aksi */}
                {/* <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    Hasil: {qrValue || '-'}
                  </Typography>
                </Box> */}

                {/* <Box mt={2} display="flex" gap={1} justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setHasDecoded(false);
                      setQrValue('');
                      setScannerKey((prev) => prev + 1); // 🔥 paksa Scanner re-init
                    }}
                  >
                    Reset
                  </Button>
                  <Box>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setOpenDetailQRCode(true);
                        setOpenDialogIndex(null);
                      }}
                      disabled={!qrValue}
                      type="submit"
                    >
                      Submit
                    </Button>
                  </Box>
                </Box> */}
              </>
            )}
          </DialogContent>
        </Dialog>
        {/* Detail QR Code */}
        <Dialog
          open={openDetailQRCode}
          onClose={() => setOpenDetailQRCode(false)}
          fullWidth
          maxWidth="xl"
          disableEnforceFocus // 🧩 ini kuncinya
          disableAutoFocus // opsional tapi aman
          PaperProps={{
            sx: {
              height: '90vh', // atur tinggi (contoh: 80% tinggi layar)
              maxHeight: '90vh', // batasi maksimal tinggi
            },
          }}
        >
          <DialogTitle>Invitation QR Code</DialogTitle>
          <IconButton
            onClick={() => setOpenDetailQRCode(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <IconX />
          </IconButton>
          <DialogContent dividers>
            <Grid container spacing={2} alignItems={'stretch'} height={'100%'}>
              <Grid size={{ xs: 12, xl: 7 }}>
                <Box>
                  {/* Foto Visitor */}
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mb={2}
                    justifyContent="center"
                    sx={{ position: 'relative' }}
                  >
                    <Box
                      display={'flex'}
                      flexDirection={'column'}
                      justifyContent={'center'}
                      alignItems={'center'}
                    >
                      <Avatar
                        src={
                          invitationCode[0]?.selfie_image
                            ? `${BASE_URL}/cdn${invitationCode[0].selfie_image}`
                            : ''
                        }
                        alt="visitor"
                        sx={{ width: 100, height: 100 }}
                      />
                      <Typography variant="h5" mt={2}>
                        {invitationCode[0]?.visitor?.name || '-'}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      sx={{ position: 'absolute', top: 0, right: 0 }}
                      onClick={() => setOpenRelated(true)}
                    >
                      Related
                    </Button>
                  </Box>

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
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <IconCards />
                            <Box>
                              <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Card</CustomFormLabel>

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
                                <Typography>{invitationCode[0]?.visitor_status || '-'}</Typography>{' '}
                                Visitor Status
                              </CustomFormLabel>
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
                              <Typography>
                                {formatDateTime(invitationCode[0]?.visitor_period_start)}
                              </Typography>
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
                                {formatDateTime(invitationCode[0]?.visitor_period_end)}
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
                </Box>
              </Grid>

              <Grid
                display={{ xs: 'none', md: 'flex' }}
                justifyContent="center"
                alignItems="stretch"
                sx={{ px: 1 }}
              >
                <Divider orientation="vertical" flexItem />
              </Grid>
              <Grid
                size={{ xs: 12, xl: 4.7 }}
                display="flex"
                justifyContent="center"
                // alignItems="center"
                sx={{ textAlign: 'center' }}
              >
                <Box sx={{ width: '100%' }}>
                  <DynamicTable
                    data={accessData}
                    isHaveHeaderTitle={true}
                    titleHeader="Access"
                    isNoActionTableHead={true}
                    isHavePagination={false}
                    overflowX="auto"
                    isHaveApproval={false}
                    isHaveAction={true}
                    isHaveAccess={true}
                    isHaveChecked={true}
                    onAccessAction={handleAccessAction}
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center' }}>
            {(() => {
              const status = visitorStatus ?? invitationCode[0]?.visitor_status;
              // const status = invitationCode[0]?.visitor_status;

              // Status belum check-in / belum block
              if (!['Checkin', 'Checkout', 'Block', 'Unblock'].includes(status)) {
                return (
                  <>
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

              // Sudah check-in
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
                    sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
                    onClick={() => confirmCheckIn('Unblock')}
                    startIcon={<IconBan />}
                  >
                    Unblock
                  </Button>
                );
              }

              if (status === 'Unblock') {
                return (
                  <>
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

              return null;
            })()}
          </DialogActions>
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
            <CloseIcon />
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
                  Cards chosen: {selectedCards.length} / {cardLimit || relatedVisitors.length}
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

        {/* Related Visitor */}
        <Dialog
          open={openRelated}
          onClose={handleCloseRelated}
          fullWidth
          maxWidth="xl"
          TransitionComponent={Fade}
          transitionDuration={150}
        >
          <DialogTitle>Related Visitor</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseRelated}
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
            <Grid container spacing={2} alignItems={'stretch'}>
              {/* Kiri: daftar avatar visitor */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    overflowX: 'auto',
                    p: 1,
                    maxWidth: '100%',
                    '&::-webkit-scrollbar': {
                      height: 6,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderRadius: 3,
                    },
                  }}
                >
                  {relatedVisitors.length === 0 ? (
                    <Typography color="text.secondary">No related visitors found</Typography>
                  ) : (
                    relatedVisitors.map((v, index) => {
                      const isDisabled = disabledIndexes.includes(index);
                      const isSelected = selected.includes(index);

                      return (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.4 : 1,
                            textAlign: 'center',
                            borderRadius: '50%',
                            transition: 'all 0.2s ease',
                            flex: '0 0 auto',
                            '&:hover': { transform: isDisabled ? 'none' : 'scale(1.05)' },
                          }}
                          onClick={() => {
                            if (isDisabled) return;
                            setSelected((prev) =>
                              prev.includes(index)
                                ? prev.filter((i) => i !== index)
                                : [...prev, index],
                            );
                          }}
                        >
                          <Avatar
                            src={`${BASE_URL}/cdn${v.selfie_image}`}
                            alt={v.name}
                            sx={{ width: 60, height: 60 }}
                          />
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            sx={{
                              position: 'absolute',
                              top: -6,
                              right: -6,
                              bgcolor: 'white',
                              borderRadius: '50%',
                              p: 0.2,
                              '& .MuiSvgIcon-root': { fontSize: 16 },
                            }}
                          />
                          <Typography mt={1} fontSize={12} noWrap width={60}>
                            {v.name}
                          </Typography>
                        </Box>
                      );
                    })
                  )}
                </Box>

                {/* Tombol select/unselect */}
                <Box display="flex" justifyContent="flex-start" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      setSelected(
                        relatedVisitors
                          .map((_, i) => i)
                          .filter((i) => !disabledIndexes.includes(i)),
                      )
                    }
                    disabled={relatedVisitors.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => setSelected([])}
                    disabled={selected.length === 0}
                  >
                    Unselect All
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleChooseMultipleCard}>
                    Choose Card
                  </Button>
                </Box>

                <Divider sx={{ mt: 2, mb: 2 }} />

                {/* Tabel visitor terpilih */}
                <DynamicTable
                  data={selectedVisitorData}
                  isHaveChecked={true}
                  isHavePagination={false}
                  isHaveHeaderTitle={true}
                  titleHeader="Selected Visitor"
                />

                {/* Dropdown Action + Apply */}
                <Box display="flex" alignItems="center" gap={2} mt={2}>
                  <CustomSelect
                    sx={{ width: '30%' }}
                    value={selectedAction}
                    onChange={(e: any) => {
                      const action = e.target.value;
                      setSelectedAction(action);

                      // Kalau belum pilih, reset semua
                      if (!action) {
                        setDisabledIndexes([]);
                        setSelected([]);
                        return;
                      }

                      const newDisabledIndexes = relatedVisitors
                        .map((v, i) => {
                          const status = (v.visitor_status || '').trim();

                          if (status === 'Block' && action !== 'Unblock') {
                            return i;
                          }

                          switch (action) {
                            case 'Checkin':
                              // ❌ Tidak bisa Checkin jika status sudah Checkin atau Checkout
                              return status === 'Checkin' || status === 'Checkout' ? i : null;

                            case 'Checkout':
                              // ❌ Tidak bisa Checkout jika status bukan Checkin
                              // (berarti juga tidak bisa kalau sudah Checkout)
                              return status !== 'Checkin' ? i : null;

                            case 'Block':
                              // ❌ Tidak bisa Block kalau sudah Block
                              return status === 'Block' ? i : null;

                            case 'Unblock':
                              // ❌ Tidak bisa Unblock kalau bukan Block
                              return status !== 'Block' ? i : null;

                            default:
                              return null;
                          }
                        })
                        .filter((x) => x !== null);

                      // console.log('🎯 Action:', action);
                      // console.log('🚫 Disabled indexes:', newDisabledIndexes);

                      // Update state
                      setDisabledIndexes(newDisabledIndexes);

                      // Pastikan selected tidak mengandung index yang baru di-disable
                      setSelected((prev) => prev.filter((i) => !newDisabledIndexes.includes(i)));
                    }}
                    displayEmpty
                  >
                    <MenuItem value="">Select Action</MenuItem>
                    <MenuItem value="Checkin">Check In</MenuItem>
                    <MenuItem value="Checkout">Check Out</MenuItem>
                    <MenuItem value="Block">Block</MenuItem>
                    <MenuItem value="Unblock">Unblock</MenuItem>
                  </CustomSelect>

                  <Button
                    sx={{ width: '20%' }}
                    variant="contained"
                    color="primary"
                    disabled={
                      !selectedAction ||
                      relatedVisitors.length === 0 ||
                      disabledIndexes.length === relatedVisitors.length ||
                      selected.length === 0
                    }
                    onClick={() => confirmMultipleAction(selectedAction as any)}
                  >
                    Apply
                  </Button>
                </Box>
              </Grid>

              {/* Kanan: daftar Access */}
              <Grid
                display={{ xs: 'none', md: 'flex' }}
                justifyContent="center"
                alignItems="stretch"
                sx={{ px: 1 }}
              >
                <Divider orientation="vertical" flexItem />
              </Grid>
              <Grid
                size={{ xs: 12, md: 4.5 }}
                display="flex"
                justifyContent="space-between"
                flexDirection={'column'}
                sx={{ textAlign: 'center' }}
              >
                <Box sx={{ width: '100%' }}>
                  <DynamicTable
                    data={accessData}
                    isHaveHeaderTitle={true}
                    titleHeader="Access"
                    isHavePagination={false}
                    isHaveChecked={true}
                    overflowX="auto"
                    isNoActionTableHead={true}
                    isHaveApproval={false}
                    isHaveAction={false}
                    isHaveAccess={true}
                    onAccessAction={handleAccessAction}
                    onCheckedChange={(checkedRows) => {
                      const ids = checkedRows.map((r) => r.access_control_id);
                      setSelectedAccessIds(ids);
                    }}
                  />
                </Box>

                <Box display="flex" alignItems={'center'} gap={1} mt={2}>
                  <CustomSelect
                    sx={{ width: '30%', p: 0 }}
                    value={selectedActionAccess}
                    onChange={(e: any) => setSelectedActionAccess(e.target.value)}
                    displayEmpty
                    disabled={!selectedAccessIds.length}
                  >
                    <MenuItem value="">Select Action</MenuItem>
                    <MenuItem value="Grant" disabled={!allowedActions.includes('Grant')}>
                      Grant
                    </MenuItem>
                    <MenuItem value="Revoke" disabled={!allowedActions.includes('Revoke')}>
                      Revoke
                    </MenuItem>
                    <MenuItem value="Block" disabled={!allowedActions.includes('Block')}>
                      Block
                    </MenuItem>
                  </CustomSelect>

                  <Button
                    sx={{ width: '20%' }}
                    variant="contained"
                    color="primary"
                    disabled={!selectedActionAccess}
                    onClick={confirmMultipleAccessAction}
                  >
                    Apply
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
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
              color: 'primary'
            }}
            open={loadingAccess}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </Portal>
      </PageContainer>
    </>
  );
};

export default DashboardOperator;
