import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  Box,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  DialogActions,
  Switch,
  FormControlLabel,
  Portal,
  Button,
  Grid2 as Grid,
  TextField,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Autocomplete,
  Skeleton,
  MenuItem,
  Menu,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PageContainer from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import TopCard from 'src/customs/components/cards/TopCard';
import {
  IconAccessible,
  IconBrandMedium,
  IconBuilding,
  IconBuildingSkyscraper,
  IconCar,
  IconCards,
  IconDeviceCctv,
  IconDeviceIpad,
  IconForbid,
  IconMapPins,
  IconMapSearch,
  IconRectangle,
  IconRefresh,
  IconStairsUp,
  IconUserOff,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import {
  Item,
  UpdateDepartmentTrackingRequest,
  UpdateOrganizationTrackingRequest,
} from 'src/customs/api/models/Admin/Integration';
import { getAllVisitorType } from 'src/customs/api/admin';
import {
  getAreaParking,
  getAreaParkingById,
  getBlockParking,
  getBlockParkingById,
  getSlotParking,
  getSlotParkingById,
  getVehicleParking,
  getVehicleParkingById,
  getVisitorTypeParking,
  getVisitorTypeParkingById,
  syncParkingIntegration,
  updateAreaParking,
  updateBlockParking,
  updateSlotParking,
  updateVehicleParking,
  updateVisitorTypeParking,
} from 'src/customs/api/types/ParkingIntegration';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import {
  UpdateVehicleParkingRequest,
  UpdateVisitorTypeParkingRequest,
} from 'src/customs/api/models/Integration/Parking';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

const BioPeopleParking = ({ id }: { id: string }) => {
  const { token } = useSession();

  const handleParkingSyncIntegration = async () => {
    if (!id || !token) {
      setSyncMsg({ open: true, text: 'Session habis / ID tidak valid.', severity: 'error' });
      return;
    }

    try {
      setSyncing(true);
      const res = await syncParkingIntegration(id as string, token as string);
      setSyncing(false); // tutup spinner SEGERA

      if (res.status !== 'success') {
        setSyncMsg({
          open: true,
          text: res.msg || 'Sinkronisasi gagal.',
          severity: 'error',
        });

        if (res.status_code === 404 && /not connected/i.test(res.msg || '')) {
          // kasus khusus kalau mau di-handle
          setSyncMsg({
            open: true,
            text: 'Tidak terhubung ke server. Coba lagi nanti.',
            severity: 'error',
          });
        }

        return; // jangan lanjut refresh list
      }

      setSyncMsg({
        open: true,
        text: res.msg || 'Sinkronisasi berhasil.',
        severity: 'success',
      });

      // refresh data tanpa await
      loadTotals();
      fetchListByType(selectedType);
    } catch (e: any) {
      console.error('Sync error:', e);
      setSyncing(false);
      setSyncMsg({
        open: true,
        text: e?.message || 'Sinkronisasi gagal. Coba lagi nanti.',
        severity: 'error',
      });
    }
  };

  const [totals, setTotals] = useState<{ [key: string]: number }>({
    visitor_type: 0,
    area: 0,
    slot: 0,
    vehicle: 0,
    block: 0,
  });

  const cards = useMemo(
    () => [
      {
        title: 'Visitor Type',
        subTitle: String(totals.visitor_type) || '0',
        subTitleSetting: 0,
        icon: IconUsersGroup,
        color: 'none',
      },
      {
        title: 'Block',
        subTitle: String(totals.block),
        subTitleSetting: 0,
        icon: IconForbid,
        color: 'none',
      },
      {
        title: 'Area',
        subTitle: String(totals.area),
        subTitleSetting: 0,
        icon: IconMapPins,
        color: 'none',
      },
      {
        title: 'Slot',
        subTitle: String(totals.slot),
        subTitleSetting: 0,
        icon: IconUsers,
        color: 'none',
      },
      {
        title: 'Vehicle',
        subTitle: String(totals.vehicle),
        subTitleSetting: 0,
        icon: IconCar,
        color: 'none',
      },
      {
        title: 'Sync Data',
        subTitle: '',
        subTitleSetting: 10,
        icon: IconRefresh,
        color: 'none',
        onIconClick: handleParkingSyncIntegration,
      },
    ],
    [totals],
  );

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [orgOptions, setOrgOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [organizationForm, setOrganizationForm] = useState<any>(null);
  const [districtForm, setDistrictForm] = useState<any>(null);
  const [departmentForm, setDepartmentForm] = useState<any>(null);
  const [memberForm, setMemberForm] = useState<any>(null);
  const [cardForm, setCardForm] = useState<any>(null);

  const [syncMsg, setSyncMsg] = useState<{
    open: boolean;
    text: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    text: '',
    severity: 'success',
  });

  const [editDialogType, setEditDialogType] = useState<
    'Visitor Type' | 'Block' | 'Area' | 'Slot' | 'Vehicle' | null
  >(null);
  const [selectedType, setSelectedType] = useState('visitor_type');
  const [editingRow, setEditingRow] = useState<Item | null>(null);
  const headerMap: Record<string, string> = {
    visitor_type: 'Visitor Type',
    block: 'Block',
    area: 'Area',
    slot: 'Slot',
    vehicle: 'Vehicle',
  };

  const TYPE_MAP: Record<string, 'Visitor Type' | 'Block' | 'Area' | 'Slot' | 'Vehicle'> = {
    visitor_type: 'Visitor Type',
    block: 'Block',
    area: 'Area',
    slot: 'Slot',
    vehicle: 'Vehicle',
  };

  const getCount = (res: any) => {
    if (!res) return 0;
    // variasi umum
    if (typeof res?.RecordsTotal === 'number') return res.RecordsTotal;
    if (Array.isArray(res?.collection)) return res.collection.length;

    // beberapa API taruh di data/collection
    if (typeof res?.data?.RecordsTotal === 'number') return res.data.RecordsTotal;
    if (Array.isArray(res?.data?.collection)) return res.data.collection.length;

    // fallback: kalau ada field 'total' atau 'count'
    if (typeof res?.total === 'number') return res.total;
    if (typeof res?.count === 'number') return res.count;

    return 0;
  };

  const loadTotals = async () => {
    if (!token || !id) return;

    const settled = await Promise.allSettled([
      getVisitorTypeParking(id as string, token), // 0
      getAreaParking(id as string, token), // 1
      getBlockParking(id as string, token), // 2
      getSlotParking(id as string, token), // 3
      getVehicleParking(id as string, token), // 4
    ]);

    const countOf = (i: number) =>
      settled[i].status === 'fulfilled'
        ? getCount((settled[i] as PromiseFulfilledResult<any>).value)
        : 0;

    setTotals({
      visitor_type: countOf(0),
      area: countOf(1),
      block: countOf(2),
      slot: countOf(3),
      vehicle: countOf(4),
    });
  };

  useEffect(() => {
    loadTotals();
  }, [id, token]);

  const fetchListByType = async (type: string) => {
    if (!token || !id) return;
    setLoading(true);
    try {
      if (type === 'visitor_type') {
        const res = await getVisitorTypeParking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'area') {
        const res = await getAreaParking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'block') {
        const res = await getBlockParking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'slot') {
        const res = await getSlotParking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'vehicle') {
        const res = await getVehicleParking(id as string, token);
        setListData(res.collection ?? []);
      } else {
        setListData([]);
      }
    } catch (e) {
      console.error('Fetch list error:', e);
      setListData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListByType(selectedType);
    setIsDataReady(true);
  }, [selectedType, token, id]);

  useEffect(() => {
    if (!editingRow) return;
    setEditDialogType(TYPE_MAP[selectedType] ?? null);
  }, [selectedType, editingRow]);

  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const handleEditBatch = () => {
    if (!selectedRows.length) {
      setSyncMsg({ open: true, text: 'Pilih minimal satu baris.', severity: 'error' });
      return;
    }
    setIsBatchEdit(true);
    setEditingRow(null); // jangan pakai detail satu item
    setDetailData(null); // kosongkan detail agar effect tidak overwrite form
  };

  const [enabled, setEnabled] = useState({
    visitor_type_id: true,
    vehicle_type: true,
    active: true,
  });

  const handleEditRow = async (row: any) => {
    if (!token || !id) return;

    setIsBatchEdit(false);
    setEnabled({
      visitor_type_id: true,
      vehicle_type: true,
      active: true,
    });

    setEditingRow(row);
    setEditDialogType(TYPE_MAP[selectedType] ?? null);
    try {
      if (selectedType === 'visitor_type') {
        const res = await getVisitorTypeParkingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'slot') {
        const res = await getSlotParkingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'area') {
        const res = await getAreaParkingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'vehicle') {
        // belum ada API by id → pakai row dulu
        const res = await getVehicleParkingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'block') {
        const res = await getBlockParkingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else {
        setDetailData(row);
      }
    } catch (e) {
      console.error('Fetch detail error:', e);
      setDetailData(row);
    }
  };

  const [openFormType, setOpenFormType] = useState<'Organization' | null>(null);

  useEffect(() => {
    if (!editingRow) return; // jangan set kalau belum pilih row untuk edit

    let type: typeof editDialogType = null;
    if (selectedType === 'visitor_type') type = 'Visitor Type';
    else if (selectedType === 'block') type = 'Block';
    else if (selectedType === 'area') type = 'Area';
    else if (selectedType === 'slot') type = 'Slot';
    else if (selectedType === 'vehicle') type = 'Vehicle';

    setEditDialogType(type);
  }, [selectedType, editingRow]);

  const handleCloseDialog = () => {
    setIsBatchEdit(false);
    setEnabled({
      visitor_type_id: true,
      vehicle_type: true,
      active: true,
    });
    setEditDialogType(null);
    setEditingRow(null);
    // setOpenFormType(null);
  };

  useEffect(() => {
    // Tutup dialog → kosongkan form
    if (!editDialogType) {
      setOrganizationForm(null);
      setDepartmentForm(null);
      setDistrictForm(null);
      setMemberForm(null);
      setCardForm(null);
      return;
    }

    //   // Tunggu data detail
    if (!detailData) return;

    // Hanya handle form Organization di sini
    if (editDialogType == 'Visitor Type') {
      setOrganizationForm({
        visitor_type_id: detailData.visitor_type_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        active: detailData.active ?? false,
        integration_id: detailData.integration_id ?? '',
        name: detailData.name ?? '',
        group_type: detailData.group_type ?? '',
        uid: detailData.uid ?? '',
        id: detailData.id ?? '',
      });
    } else if (editDialogType === 'Slot') {
      setDepartmentForm({
        integration_id: detailData.integration_id ?? '',
        number: detailData.number ?? '',
        active: detailData.active ?? false,
        host_id: detailData.host_id ?? '',
        name: detailData.name ?? '',
        host: detailData.host ?? '',
        uid: detailData.uid ?? '',
        id: detailData.id ?? '',
      });
    } else if (editDialogType === 'Area') {
      setDistrictForm({
        uid: detailData.uid ?? '',
        type: detailData.type ?? '',
        code: detailData.code ?? '',
        name: detailData.name ?? '',
        location: detailData.location ?? '',
        need_block: detailData.need_block ?? false,
        need_barier: detailData.need_barier ?? false,
        active: detailData.active ?? false,
        integration_id: detailData.integration_id ?? '',
        id: detailData.id ?? '',
      });
    } else if (editDialogType === 'Vehicle') {
      setCardForm({
        uid: detailData.uid ?? '',
        name: detailData.name ?? '',
        type: detailData.type ?? '',
        vehicle_type: detailData.vehicle_type ?? '',
        slug: detailData.slug ?? '',
        integration_id: detailData.integration_id ?? '',
        active: detailData.active ?? false,
        id: detailData.id ?? '',
      });
    } else if (editDialogType === 'Block') {
      setMemberForm({
        uid: detailData.uid ?? '',
        name: detailData.name ?? '',
        block_code: detailData.block_code ?? '',
        serial: detailData.serial ?? '',
        integration_id: detailData.integration_id ?? '',
        area_id: detailData.area_id ?? '',
        active: detailData.active ?? false,
        id: detailData.id ?? '',
      });
    } else {
      setOrganizationForm(null);
      setDepartmentForm(null);
      setDistrictForm(null);
      setCardForm(null);
      setMemberForm(null);
    }
  }, [editDialogType, detailData]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadOptions = async () => {
      try {
        if (editDialogType === 'Visitor Type') {
          // Load organizations
          const res = await getAllVisitorType(token);
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id),
              label: o.name ?? '',
            })) || [];

          setOrgOptions(items);
          // reset yang lain agar nggak nyangkut
        } else {
          // Dialog lain (atau ditutup)
          setOrgOptions([]);
        }
      } catch (e) {
        console.error('Load options error:', e);
        if (editDialogType === 'Visitor Type') {
          setOrgOptions([]);
        } else {
          setOrgOptions([]);
        }
      }
    };

    loadOptions();

    return () => {};
  }, [editDialogType, token]);

  const omitEmpty = <T extends Record<string, any>>(obj: T) =>
    Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined),
    );

  // Visitor Type
  const handleSaveVisitorType = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const visitorTypeId = String(organizationForm?.id ?? detailData?.id ?? '');
        if (!visitorTypeId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // Kirim dua field (trim) — kosong tidak ikut dikirim agar tidak mengosongkan server
        const payload = omitEmpty({
          visitor_type_id: organizationForm?.visitor_type_id
            ? organizationForm?.visitor_type_id
            : undefined,
          active: organizationForm?.active,
        });

        await updateVisitorTypeParking(visitorTypeId, payload, token as string);

        setListData((prev) =>
          prev.map((it) => (String(it.id) === visitorTypeId ? { ...it, ...payload } : it)),
        );

        setSyncMsg({ open: true, text: 'Visitor type updated successfullys', severity: 'success' });
        return;
      }

      // === BATCH EDIT ===
      const payload: UpdateVisitorTypeParkingRequest = omitEmpty({
        visitor_type_id: organizationForm?.visitor_type_id
          ? String(organizationForm?.visitor_type_id).trim()
          : undefined,
      });

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateVisitorTypeParking(it, payload, token as string))); //

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      setSyncMsg({ open: true, text: 'Visitor type updated successfully', severity: 'success' });
    } catch (err: any) {
      setSyncMsg({
        open: true,
        text: err?.response?.data?.msg || 'Failed to update visitor type',
        severity: 'error',
      });
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  const handleSaveVehicle = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const vehicleId = String(cardForm?.id ?? detailData?.id ?? '');
        if (!vehicleId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // kirim field apa adanya, jangan di-omit
        const payload = {
          vehicle_type: cardForm?.vehicle_type || '',
          active: cardForm?.active ?? false,
        };

        console.log('Payload:', payload);

        await updateVehicleParking(vehicleId, payload, token as string);

        // update list
        setListData((prev) =>
          prev.map((it) => (String(it.id) === vehicleId ? { ...it, ...payload } : it)),
        );

        // update form agar sinkron
        setCardForm((prev: any) => ({
          ...prev,
          ...payload,
        }));

        setSyncMsg({ open: true, text: 'Vehicle updated successfully', severity: 'success' });
        return;
      }

      // === BATCH EDIT ===
      const payload: any = {};
      if (enabled.vehicle_type) payload.vehicle_type = cardForm?.vehicle_type || '';
      if (enabled.active) payload.active = cardForm?.active ?? false;

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateVehicleParking(it, payload, token as string)));

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      setSyncMsg({ open: true, text: 'Vehicle updated successfully', severity: 'success' });
    } catch (err: any) {
      setSyncMsg({
        open: true,
        text: err?.response?.data?.msg || 'Failed to update vehicle',
        severity: 'error',
      });
    } finally {
      setTimeout(() => setSaving(false), 600);
    }
  };

  // Block
  const handleSaveBlock = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const blockId = String(memberForm?.id ?? detailData?.id ?? '');
        if (!blockId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // kirim boolean apa adanya, jangan di-omit
        const payload = { active: memberForm?.active };

        await updateBlockParking(blockId, payload, token as string);

        // update list
        setListData((prev) =>
          prev.map((it) => (String(it.id) === blockId ? { ...it, ...payload } : it)),
        );

        // update form biar switch sinkron
        setMemberForm((prev: any) => ({
          ...prev,
          ...payload,
        }));

        setSyncMsg({
          open: true,
          text: 'Block updated successfully',
          severity: 'success',
        });
        return;
      }

      // === BATCH EDIT ===
      const payload: any = {};
      if (enabled.active) {
        payload.active = memberForm?.active;
      }

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateBlockParking(it, payload, token as string)));

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      setSyncMsg({ open: true, text: 'Block updated successfully', severity: 'success' });
    } catch (err: any) {
      setSyncMsg({
        open: true,
        text: err?.response?.data?.msg || 'Failed to update block',
        severity: 'error',
      });
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  // Area
  const handleSaveArea = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const areaId = String(districtForm?.id ?? detailData?.id ?? '');
        if (!areaId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // kirim apa adanya, termasuk false
        const payload = { active: districtForm?.active };

        await updateAreaParking(areaId, payload, token as string);

        // update list
        setListData((prev) =>
          prev.map((it) => (String(it.id) === areaId ? { ...it, ...payload } : it)),
        );

        // update form agar switch sinkron
        setDistrictForm((prev: any) => ({
          ...prev,
          ...payload,
        }));

        setSyncMsg({
          open: true,
          text: 'Area updated successfully',
          severity: 'success',
        });
        return;
      }

      // === BATCH EDIT ===
      const payload = omitEmpty({
        ...(enabled.active && { active: districtForm?.active }),
      });

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateAreaParking(it, payload, token as string))); //

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      setSyncMsg({ open: true, text: 'Area updated successfully', severity: 'success' });
    } catch (err: any) {
      setSyncMsg({
        open: true,
        text: err?.response?.data?.msg || 'Failed to update area',
        severity: 'error',
      });
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  // Slot
  const handleSaveSlot = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const slotId = departmentForm?.id ?? detailData?.id ?? '';
        if (!slotId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // kirim apa adanya, termasuk false
        const payload = { active: departmentForm?.active };

        await updateSlotParking(slotId, payload, token as string);

        // update list
        setListData((prev) =>
          prev.map((it) => (String(it.id) === slotId ? { ...it, ...payload } : it)),
        );

        // update form agar switch ikut berubah
        setDepartmentForm((prev: any) => ({
          ...prev,
          ...payload,
        }));

        setSyncMsg({ open: true, text: 'Slot updated successfully', severity: 'success' });
        return;
      }

      // === BATCH EDIT ===
      const payload = omitEmpty({
        ...(enabled.active && { active: departmentForm?.active }),
      });

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateSlotParking(it, payload, token as string))); //

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      setSyncMsg({ open: true, text: 'Slot updated successfully', severity: 'success' });
    } catch (err: any) {
      setSyncMsg({
        open: true,
        text: err?.response?.data?.msg || 'Failed to update slot',
        severity: 'error',
      });
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  return (
    <>
      <PageContainer
        title="Bio People Parking Integration"
        description="Manage BioPeople Parking Integration"
      >
        <Box>
          <Grid container spacing={3} flexWrap={'wrap'}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 2 }} />
            </Grid>

            <Grid container mt={1} size={{ xs: 12, lg: 12 }}>
              <Grid size={{ xs: 12, lg: 12 }}>
                <DynamicTable
                  isHavePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  overflowX={'auto'}
                  data={listData}
                  selectedRows={selectedRows}
                  isHaveChecked={true}
                  isHaveAction={false}
                  isSelectedType={selectedType !== 'badge_status'}
                  isHaveActionOnlyEdit={true}
                  isHaveSearch={true}
                  isHaveFilter={false}
                  isHaveExportPdf={false}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={false}
                  isHaveAddData={false}
                  isHaveBooleanSwitch={false}
                  onBatchEdit={handleEditBatch}
                  isHaveHeader={true}
                  headerContent={{
                    items: Object.keys(headerMap).map((key) => ({
                      name: key,
                      label: headerMap[key],
                    })),
                  }}
                  defaultSelectedHeaderItem="visitor_type"
                  onHeaderItemClick={(item) => {
                    setSelectedType(item.name);
                  }}
                  onCheckedChange={(selected) => {
                    setSelectedRows(selected);
                  }}
                  onEdit={handleEditRow}
                  onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                  // onFilterByColumn={(column) => {
                  //   setSortColumn(column.column);
                  // }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      {/* VIsitor Type */}
      <Dialog
        open={editDialogType === 'Visitor Type'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Visitor Type
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{ color: (t) => t.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {!organizationForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="visitor_type_id" sx={{ mt: 0 }}>
                    Visitor Type
                  </CustomFormLabel>

                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.visitor_type_id}
                          onChange={(e) =>
                            setEnabled((p) => ({ ...p, visitor_type_id: e.target.checked }))
                          }
                        />
                      }
                      label=""
                    />
                  )}
                </Box>

                <Autocomplete
                  fullWidth
                  autoHighlight
                  disablePortal
                  options={orgOptions}
                  value={
                    orgOptions.find(
                      (o) => o.id === String(organizationForm?.visitor_type_id ?? ''),
                    ) || null
                  }
                  onChange={(_, newVal) =>
                    setOrganizationForm((p: any) => ({
                      ...p,
                      visitor_type_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.visitor_type_id || saving : saving}
                    />
                  )}
                  disabled={isBatchEdit ? !enabled.visitor_type_id || saving : saving}
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>
                <Switch
                  checked={Boolean(organizationForm?.active)}
                  onChange={(e) =>
                    setOrganizationForm((prev: any) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  color="primary"
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={organizationForm?.name ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Group Type</CustomFormLabel>
                <CustomTextField value={organizationForm?.group_type ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Integration Id</CustomFormLabel>
                <CustomTextField
                  value={organizationForm?.integration_id ?? ''}
                  fullWidth
                  disabled
                />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Uid</CustomFormLabel>
                <CustomTextField value={organizationForm?.uid ?? ''} fullWidth disabled />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!organizationForm || saving}
            onClick={handleSaveVisitorType}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block */}
      <Dialog open={editDialogType === 'Block'} fullWidth maxWidth="md" onClose={handleCloseDialog}>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Block
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{ color: (t) => t.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {!memberForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={memberForm?.name ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Block Code</CustomFormLabel>
                <CustomTextField value={memberForm?.block_code ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Serial</CustomFormLabel>
                <CustomTextField value={memberForm?.serial ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Area Id</CustomFormLabel>
                <CustomTextField value={memberForm?.area_id ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Integration Id</CustomFormLabel>
                <CustomTextField value={memberForm?.integration_id ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>
                <Switch
                  checked={Boolean(memberForm?.active)}
                  onChange={(e) =>
                    setMemberForm((prev: any) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  color="primary"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!memberForm || saving}
            onClick={handleSaveBlock}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Area */}
      <Dialog open={editDialogType === 'Area'} fullWidth maxWidth="md" onClose={handleCloseDialog}>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Area
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{ color: (t) => t.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {!districtForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Uid</CustomFormLabel>
                <CustomTextField value={districtForm?.uid ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={districtForm?.name ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Code</CustomFormLabel>
                <CustomTextField value={districtForm?.code ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Type</CustomFormLabel>
                <CustomTextField value={districtForm?.type ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Location</CustomFormLabel>
                <CustomTextField value={districtForm?.location ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Integration Id</CustomFormLabel>
                <CustomTextField value={districtForm?.integration_id ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Need Barier</CustomFormLabel>
                <Switch
                  checked={Boolean(districtForm?.need_barier)}
                  onChange={(e) =>
                    setDistrictForm((prev: any) => ({
                      ...prev,
                      need_barier: e.target.checked,
                    }))
                  }
                  color="primary"
                  disabled
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Need Block</CustomFormLabel>
                <Switch
                  checked={Boolean(districtForm?.need_block)}
                  onChange={(e) =>
                    setDistrictForm((prev: any) => ({
                      ...prev,
                      need_block: e.target.checked,
                    }))
                  }
                  color="primary"
                  disabled
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>
                <Switch
                  checked={Boolean(districtForm?.active)}
                  onChange={(e) =>
                    setDistrictForm((prev: any) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  color="primary"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!districtForm || saving}
            onClick={handleSaveArea}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Slot */}
      <Dialog open={editDialogType === 'Slot'} fullWidth maxWidth="md" onClose={handleCloseDialog}>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Slot
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{ color: (t) => t.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {!departmentForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Uid</CustomFormLabel>
                <CustomTextField value={departmentForm?.uid ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={departmentForm?.name ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Number</CustomFormLabel>
                <CustomTextField value={departmentForm?.number ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Host Id</CustomFormLabel>
                <CustomTextField value={departmentForm?.host_id ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Integration Id</CustomFormLabel>
                <CustomTextField value={departmentForm?.integration_id ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>
                <Switch
                  checked={Boolean(departmentForm?.active)}
                  onChange={(e) =>
                    setDepartmentForm((prev: any) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  color="primary"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!departmentForm || saving}
            onClick={handleSaveSlot}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle */}
      <Dialog
        open={editDialogType === 'Vehicle'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Vehicle
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{ color: (t) => t.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {!cardForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Vehicle Type */}
              <Box>
                <CustomFormLabel htmlFor="vehicle_type" sx={{ mt: 0 }}>
                  Vehicle Type
                </CustomFormLabel>
                <CustomSelect
                  size="small"
                  fullWidth
                  value={cardForm?.vehicle_type ?? ''}
                  onChange={(e: any) =>
                    setCardForm((prev: any) => ({
                      ...prev,
                      vehicle_type: Number(e.target.value), // ⬅️ pastikan jadi number
                    }))
                  }
                  disabled={isBatchEdit ? !enabled.vehicle_type || saving : saving}
                >
                  <MenuItem value={1}>Car</MenuItem>
                  <MenuItem value={2}>Motorcycle</MenuItem>
                  <MenuItem value={3}>Bus</MenuItem>
                  <MenuItem value={4}>Truck</MenuItem>
                  <MenuItem value={5}>Van</MenuItem>
                  <MenuItem value={99}>Other</MenuItem>
                </CustomSelect>
              </Box>

              {/* Other info (disabled) */}
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={cardForm?.name ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Type</CustomFormLabel>
                <CustomTextField value={cardForm?.type ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Slug</CustomFormLabel>
                <CustomTextField value={cardForm?.slug ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Integration Id</CustomFormLabel>
                <CustomTextField value={cardForm?.integration_id ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Uid</CustomFormLabel>
                <CustomTextField value={cardForm?.uid ?? ''} fullWidth disabled />
              </Box>

              {/* Active */}
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>
                <Switch
                  checked={Boolean(cardForm?.active)}
                  onChange={(e) =>
                    setCardForm((prev: any) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  color="primary"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!cardForm || saving}
            onClick={handleSaveVehicle}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Portal>
        <Snackbar
          open={syncMsg.open}
          autoHideDuration={3000}
          onClose={() => setSyncMsg((p) => ({ ...p, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: 99999 }} // ⬅️ di atas modal & backdrop apa pun
        >
          <Alert
            onClose={() => setSyncMsg((p) => ({ ...p, open: false }))}
            severity={syncMsg.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {syncMsg.text}
          </Alert>
        </Snackbar>
      </Portal>

      {/* OVERLAY SAVING: di atas modal, tapi DI BAWAH snackbar */}
      <Portal>
        <Backdrop
          open={saving}
          sx={{
            color: '#fff',
            zIndex: (t) => Math.min(99998, (t.zIndex.snackbar ?? 1400) - 1), // ⬅️ tepat di bawah snackbar
          }}
        >
          <CircularProgress />
        </Backdrop>
      </Portal>

      {/* OVERLAY SYNCING: sama aturan dengan saving */}
      <Portal>
        <Backdrop
          open={syncing}
          sx={{
            color: '#fff',
            zIndex: (t) => Math.min(99998, (t.zIndex.snackbar ?? 1400) - 1),
          }}
        >
          <CircularProgress />
        </Backdrop>
      </Portal>
    </>
  );
};

export default BioPeopleParking;
