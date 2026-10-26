import { useEffect, useState, useRef, useMemo } from 'react';
import {
  Box,
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
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Autocomplete,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PageContainer from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import TopCard from 'src/customs/components/cards/TopCard';
import {
  IconCar,
  IconForbid,
  IconMapPins,
  IconRefresh,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Item } from 'src/customs/api/models/Admin/Integration';
import {
  getAllVisitorType,
  updateBadgeStatus,
  updateBadgeType,
  updateClearcodes,
} from 'src/customs/api/admin';
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
import { showSwal } from 'src/customs/components/alerts/alerts';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { useNavigate } from 'react-router';
import { useVehicle } from 'src/hooks/Setting/useVehicle';
import AreaDialog from './components/Parking/AreaDialog';
import SlotDialog from './components/Parking/SlotDialog';
import VehicleDialog from './components/Parking/VehicleDialog';
import VisitorTypeDialog from './components/Parking/VisitorTypeDialog';
import BlockDialog from './components/Parking/BlockDialog';
import { useTranslation } from 'react-i18next';

const BioPeopleParking = ({ id, integrationName }: { id: string; integrationName?: string }) => {
  const [totals, setTotals] = useState<{ [key: string]: number }>({
    visitor_type: 0,
    area: 0,
    slot: 0,
    vehicle: 0,
    block: 0,
  });

  const { t } = useTranslation();

  const handleParkingSyncIntegration = async () => {
    if (!id) {
      setSyncMsg({ open: true, text: 'Session habis / ID tidak valid.', severity: 'error' });
      return;
    }

    try {
      setSyncing(true);
      const res = await syncParkingIntegration(id as string);
      setSyncing(false);

      if (res.status !== 'success') {
        showSwal('error', res.msg || 'Sinkronisasi gagal.');

        if (res.status_code === 404 && /not connected/i.test(res.msg || '')) {
          showSwal('error', 'Unable to connect to the device. Please try again later.');
        }

        return;
      }
      showSwal('success', res.msg || 'Successfully synchronized.');
      loadTotals();
      fetchListByType(selectedType);
    } catch (e: any) {
      setSyncing(false);
      showSwal('error', e?.message || 'Failed to synchronize. Please try again later.');
    }
  };

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
        title: 'Blocks',
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
        icon: IconRefresh,
        onIconClick: handleParkingSyncIntegration,
        type: 'action',
      },
    ],
    [totals],
  );

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
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
    vehicle: 'Vehicle',
    area: 'Area',
    block: 'Block',
    slot: 'Slot',
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
    if (typeof res?.RecordsTotal === 'number') return res.RecordsTotal;
    if (Array.isArray(res?.collection)) return res.collection.length;

    if (typeof res?.data?.RecordsTotal === 'number') return res.data.RecordsTotal;
    if (Array.isArray(res?.data?.collection)) return res.data.collection.length;

    if (typeof res?.total === 'number') return res.total;
    if (typeof res?.count === 'number') return res.count;

    return 0;
  };

  const loadTotals = async () => {
    if (!id) return;

    const settled = await Promise.allSettled([
      getVisitorTypeParking(id as string), // 0
      getAreaParking(id as string), // 1
      getBlockParking(id as string), // 2
      getSlotParking(id as string), // 3
      getVehicleParking(id as string), // 4
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
  }, [id]);

  const fetchListByType = async (type: string) => {
    if (!id) return;
    setLoading(true);
    try {
      if (type === 'visitor_type') {
        const res = await getVisitorTypeParking(id as string);

        setListData(
          (res.collection ?? []).map(({ integration_id, ...item }: any) => ({
            ...item,
            visitor_types: item.visitor_types?.length
              ? item.visitor_types.map((v: any) => v.visitor_type_name).join(', ')
              : '-',
            active: item.active ?? false,
          })),
        );
      } else if (type === 'area') {
        const res = await getAreaParking(id as string);

        const data = (res.collection ?? []).map(({ integration_id, ...item }) => item);

        setListData(data);
      } else if (type === 'block') {
        const res = await getBlockParking(id as string);
        setListData(
          (res.collection ?? []).map(({ integration_id, area_id, ...item }: any) => item),
        );
      } else if (type === 'slot') {
        const res = await getSlotParking(id as string);

        const data = (res.collection ?? []).map(({ integration_id, host_id, ...item }) => item);

        setListData(data);
      } else if (type === 'vehicle') {
        const res = await getVehicleParking(id as string);

        setListData(
          (res.collection ?? []).map(({ integration_id, ...item }: any) => ({
            ...item,
            vehicle_type: item.vehicle_type ?? '-',
          })),
        );
      } else {
        setListData([]);
      }
    } catch (e) {
      // setListData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListByType(selectedType);
  }, [selectedType, id]);

  useEffect(() => {
    if (!editingRow) return;
    setEditDialogType(TYPE_MAP[selectedType] ?? null);
  }, [selectedType, editingRow]);

  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const handleEditBatch = () => {
    if (!selectedRows.length) {
      showSwal('error', 'Please select at least one row.');
      return;
    }
    setIsBatchEdit(true);
    setEditingRow(null);
    setDetailData(null);
  };

  const [enabled, setEnabled] = useState({
    visitor_type_id: true,
    vehicle_type: true,
    active: true,
  });

  const handleEditRow = async (row: any) => {
    if (!id) return;

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
        const res = await getVisitorTypeParkingById(id as string, String(row.id));

        const data = res.collection ?? row;

        setDetailData({
          ...data,
          visitor_type_id: data.visitor_types?.map((v: any) => v.visitor_type_id) ?? [],
        });
      } else if (selectedType === 'slot') {
        const res = await getSlotParkingById(id as string, String(row.id));
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'area') {
        const res = await getAreaParkingById(id as string, String(row.id));
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'vehicle') {
        const res = await getVehicleParkingById(id as string, String(row.id));
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'block') {
        const res = await getBlockParkingById(id as string, String(row.id));
        setDetailData(res.collection ?? row);
      } else {
        setDetailData(row);
      }
    } catch (e) {
      setDetailData(row);
    }
  };

  useEffect(() => {
    if (!editingRow) return;

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
    if (!editDialogType) {
      setOrganizationForm(null);
      setDepartmentForm(null);
      setDistrictForm(null);
      setMemberForm(null);
      setCardForm(null);
      return;
    }

    if (!detailData) return;

    if (editDialogType == 'Visitor Type') {
      setOrganizationForm({
        visitor_type_id: detailData.visitor_type_id ?? '',
        visitor_type_name: detailData.visitor_type_name ?? '',
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
        vehicle_id: detailData.vehicle_id ?? '',
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
    let cancelled = false;

    const loadOptions = async () => {
      try {
        if (editDialogType === 'Visitor Type') {
          const res = await getAllVisitorType();
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id),
              label: o.name ?? '',
            })) || [];

          setOrgOptions(items);
        } else {
          // setOrgOptions([]);
        }
      } catch (e) {
        if (editDialogType === 'Visitor Type') {
          setOrgOptions([]);
        } else {
          setOrgOptions([]);
        }
      }
    };

    loadOptions();

    return () => {};
  }, [editDialogType]);

  const omitEmpty = <T extends Record<string, any>>(obj: T) =>
    Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined),
    );

  const handleSaveVisitorType = async () => {
    if (!id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const visitorTypeId = String(organizationForm?.id ?? detailData?.id ?? '');
        if (!visitorTypeId) {
          showSwal('error', 'ID Not Found.');
          return;
        }

        const payload = omitEmpty({
          visitor_type_id: organizationForm?.visitor_type_id
            ? organizationForm?.visitor_type_id
            : undefined,
          active: organizationForm?.active,
        });

        await updateVisitorTypeParking(visitorTypeId, payload);
        await fetchListByType(selectedType);
        loadTotals();

        handleCloseDialog();

        // setListData((prev) =>
        //   prev.map((it) => (String(it.id) === visitorTypeId ? { ...it, ...payload } : it)),
        // );
        showSwal('success', t('updatedSuccess', { name: 'Visitor Type' }));
        return;
      }

      // === BATCH EDIT ===
      const payload: UpdateVisitorTypeParkingRequest = omitEmpty({
        visitor_type_id: organizationForm?.visitor_type_id
          ? String(organizationForm?.visitor_type_id).trim()
          : undefined,
      });

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateVisitorTypeParking(it, payload)));

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      // setSyncMsg({ open: true, text: 'Visitor type updated successfully', severity: 'success' });
      showSwal('success', t('updatedSuccess', { name: 'Visitor Type' }));
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to update visitor type');
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  const handleSaveVehicle = async () => {
    if (!id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const vehicleId = String(cardForm?.id ?? detailData?.id ?? '');
        if (!vehicleId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        const selectedVehicle = vehicleOptions.find(
          (vehicle: any) => vehicle.value === cardForm?.vehicle_type,
        );

        const payload = {
          vehicle_type: cardForm?.vehicle_type || '',
          vehicle_id: cardForm?.vehicle_id || '',
          active: cardForm?.active ?? false,
        };

        await updateVehicleParking(vehicleId, payload);
        await fetchListByType(selectedType);

        loadTotals();

        handleCloseDialog();
        showSwal('success', t('updatedSuccess', { name: 'Vehicle' }));
        return;
      }

      // === BATCH EDIT ===
      const payload: any = {};
      if (enabled.vehicle_type) payload.vehicle_type = cardForm?.vehicle_type || '';
      if (enabled.active) payload.active = cardForm?.active ?? false;

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateVehicleParking(it, payload)));

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      setSyncMsg({
        open: true,
        text: t('updatedSuccess', { name: 'Vehicle' }),
        severity: 'success',
      });
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to update vehicle');
    } finally {
      setTimeout(() => setSaving(false), 600);
    }
  };

  // Block
  const handleSaveBlock = async () => {
    if (!id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const blockId = String(memberForm?.id ?? detailData?.id ?? '');
        if (!blockId) {
          showSwal('error', 'ID Not Found.');
          return;
        }

        const payload = { active: memberForm?.active };
        await updateBlockParking(blockId, payload);

        await fetchListByType(selectedType);
        loadTotals();

        handleCloseDialog();
        showSwal('success', t('updatedSuccess', { name: 'Block' }));
        return;
      }

      // === BATCH EDIT ===
      const payload: any = {};
      if (enabled.active) {
        payload.active = memberForm?.active;
      }

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateBlockParking(it, payload)));

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      // setSyncMsg({ open: true, text: t('updatedSuccess', { name: 'Block' }), severity: 'success' });
      showSwal('success', t('updatedSuccess', { name: 'Block' }));
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to update block');
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  // Area
  const handleSaveArea = async () => {
    if (!id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const areaId = String(districtForm?.id ?? detailData?.id ?? '');
        if (!areaId) {
          // setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          showSwal('error', 'ID Not Found.');
          return;
        }

        const payload = { active: districtForm?.active };

        await updateAreaParking(areaId, payload);

        await fetchListByType(selectedType);

        loadTotals();

        handleCloseDialog();

        // setSyncMsg({
        //   open: true,
        //   text: 'Area updated successfully',
        //   severity: 'success',
        // });
        showSwal('success', t('updatedSuccess', { name: 'Area' }));
        return;
      }

      // === BATCH EDIT ===
      const payload = omitEmpty({
        ...(enabled.active && { active: districtForm?.active }),
      });

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateAreaParking(it, payload))); //

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      // setSyncMsg({ open: true, text: t('updatedSuccess', { name: 'Area' }), severity: 'success' });
      showSwal('success', t('updatedSuccess', { name: 'Area' }));
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to update area');
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  // Slot
  const handleSaveSlot = async () => {
    if (!id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const slotId = departmentForm?.id ?? detailData?.id ?? '';
        if (!slotId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        const payload = { active: departmentForm?.active };

        await updateSlotParking(slotId, payload);

        setListData((prev) =>
          prev.map((it) => (String(it.id) === slotId ? { ...it, ...payload } : it)),
        );

        setDepartmentForm((prev: any) => ({
          ...prev,
          ...payload,
        }));

        // setSyncMsg({ open: true, text: 'Slot updated successfully', severity: 'success' });
        showSwal('success', t('updatedSuccess', { name: 'Slot' }));
        return;
      }

      // === BATCH EDIT ===
      const payload = omitEmpty({
        ...(enabled.active && { active: departmentForm?.active }),
      });

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateSlotParking(it, payload)));

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      // setSyncMsg({ open: true, text: t('updatedSuccess', { name: 'Slot' }), severity: 'success' });
      showSwal('success', t('updatedSuccess', { name: 'Slot' }));
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to update slot');
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  const navigate = useNavigate();

  const idFieldMap: Record<string, string> = {
    visitor_type: 'uid',
    block: 'uid',
    area: 'uid',
    slot: 'uid',
    vehicle: 'uid',
  };

  const handleBack = () => {
    navigate('/admin/manage/integration');
  };

  const handleCopy = async (row: any) => {
    try {
      const field = idFieldMap[selectedType];
      const value = row[field];

      if (!value) {
        showSwal('error', 'ID not found');
        return;
      }

      await navigator.clipboard.writeText(String(value));

      showSwal('success', 'Successfully copied ID');
    } catch (error) {
      showSwal('error', 'Failed to copy ID');
    }
  };

  const { data: vehicleOptions = [], isLoading: vehicleLoading } = useVehicle();

  const handleBooleanSwitchChange = async (rowId: string, field: string, value: boolean) => {
    const prev = listData;

    setListData((p) =>
      p.map((it) => (String(it.id) === String(rowId) ? { ...it, [field]: value } : it)),
    );

    try {
      const payload: any = { [field]: value };
      if (selectedType == 'visitor_type') await updateVisitorTypeParking(String(rowId), payload);
      else if (selectedType == 'block' || selectedType === 'block')
        await updateBlockParking(String(rowId), payload as any);
      else if (selectedType == 'area') await updateAreaParking(String(rowId), payload as any);
      else if (selectedType == 'slot') {
        await updateSlotParking(String(rowId), payload as any);
      } else if (selectedType == 'vehicle')
        await updateVehicleParking(String(rowId), payload as any);

      showSwal('success', `Successfully updated ${headerMap[selectedType] ?? 'Data'}.`);
    } catch (e: any) {
      setListData(prev);
      showSwal('error', e?.response?.data?.msg || 'Failed to update status.');
    }
  };

  const isEditable = ['visitor_type', 'vehicle'].includes(selectedType);

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
                  loading={loading}
                  isHavePagination
                  rowsPerPageOptions={[10, 50]}
                  overflowX={'auto'}
                  data={listData}
                  selectedRows={selectedRows}
                  isHaveChecked={true}
                  isHaveAction={false}
                  isSelectedType={selectedType !== 'badge_status'}
                  isDataVerified={false}
                  // isHaveActionOnlyEdit={true}
                  isHaveActive={false}
                  isHaveBack={true}
                  onBack={handleBack}
                  isNoActionTableHead
                  isHaveActionOnlyEdit={isEditable}
                  isTitleIntegration={`${integrationName || 'Bio People Parking'}`}
                  isHaveBooleanSwitch={true}
                  onBooleanSwitchChange={handleBooleanSwitchChange}
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
                  // isCopy={true}
                  // onCopy={(row) => {
                  //   handleCopy(row);
                  // }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>

      <VisitorTypeDialog
        open={editDialogType === 'Visitor Type'}
        saving={saving}
        isBatchEdit={isBatchEdit}
        enabled={{
          visitor_type_id: enabled.visitor_type_id,
        }}
        organizationForm={organizationForm}
        orgOptions={orgOptions}
        onClose={handleCloseDialog}
        onSubmit={handleSaveVisitorType}
        setOrganizationForm={setOrganizationForm}
        setEnabled={setEnabled}
      />

      <BlockDialog
        open={editDialogType === 'Block'}
        saving={saving}
        memberForm={memberForm}
        onClose={handleCloseDialog}
        onSubmit={handleSaveBlock}
        setMemberForm={setMemberForm}
      />

      <AreaDialog
        open={editDialogType === 'Area'}
        districtForm={districtForm}
        setDistrictForm={setDistrictForm}
        handleCloseDialog={handleCloseDialog}
        handleSaveArea={handleSaveArea}
        saving={saving}
      />

      <SlotDialog
        open={editDialogType === 'Slot'}
        departmentForm={departmentForm}
        setDepartmentForm={setDepartmentForm}
        handleCloseDialog={handleCloseDialog}
        handleSaveSlot={handleSaveSlot}
        saving={saving}
      />

      <VehicleDialog
        open={editDialogType === 'Vehicle'}
        cardForm={cardForm}
        setCardForm={setCardForm}
        enabled={enabled}
        vehicleOptions={vehicleOptions}
        vehicleLoading={vehicleLoading}
        isBatchEdit={isBatchEdit}
        saving={saving}
        handleCloseDialog={handleCloseDialog}
        handleSaveVehicle={handleSaveVehicle}
      />

      <Portal>
        <Snackbar
          open={syncMsg.open}
          autoHideDuration={3000}
          onClose={() => setSyncMsg((p) => ({ ...p, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: 99999 }}
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

      <GlobalBackdropLoading open={syncing || saving} />
    </>
  );
};

export default BioPeopleParking;
