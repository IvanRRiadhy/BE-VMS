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
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import TopCard from 'src/customs/components/cards/TopCard';
import {
  IconAccessible,
  IconBrandMedium,
  IconBuilding,
  IconBuildingSkyscraper,
  IconCards,
  IconDeviceCctv,
  IconDeviceIpad,
  IconMapPins,
  IconMapSearch,
  IconRectangle,
  IconRefresh,
  IconStairsUp,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react';
import {
  Item,
  UpdateDepartmentTrackingRequest,
  UpdateOrganizationTrackingRequest,
} from 'src/customs/api/models/Integration';
import {
  getAccessCCTV,
  getAccessCCTVById,
  getAccessControl,
  getAccessControlById,
  getAlarmTracking,
  getAlarmWarningTracking,
  getAllAccessControl,
  getAllBrand,
  getAllDepartments,
  getAllDistricts,
  getAllEmployee,
  getAllOrganizations,
  getAllSite,
  getBleReaderTracking,
  getBleReaderTrackingById,
  getBrandTracking,
  getBrandTrackingById,
  getBuildingTracking,
  getBuildingTrackingById,
  getCardTracking,
  getCardTrackingById,
  getDepartmentTracking,
  getDepartmentTrackingById,
  getDistrictTracking,
  getDistrictTrackingById,
  getFloor,
  getFloorById,
  getFloorPlan,
  getFloorPlanById,
  getFloorPlanMaskedArea,
  getFloorPlanMaskedAreaById,
  getMemberTracking,
  getMemberTrackingById,
  getOrganizationTracking,
  getOrganizationTrackingById,
  getTrackingTransaction,
  getTrackingTransactionById,
  getTRXVisitor,
  getVisitorBlacklist,
  getVisitorTracking,
  syncTrackingBleIntegration,
  updateCardTracking,
  updateDepartmentTracking,
  updateDistrictTracking,
  updateOrganizationTracking,
} from 'src/customs/api/admin';
import CloseIcon from '@mui/icons-material/Close';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

const BioPeopleTracking = ({ id }: { id: string }) => {
  const { token } = useSession();

  const handleTrackingBleSyncIntegration = async () => {
    if (!id || !token) {
      setSyncMsg({ open: true, text: 'Session habis / ID tidak valid.', severity: 'error' });
      return;
    }

    try {
      setSyncing(true);
      const res = await syncTrackingBleIntegration(id as string, token as string);
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
      loadTotals().catch((e) => console.error('loadTotals error:', e));
      fetchListByType(selectedType).catch((e) => console.error('fetchListByType error:', e));
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
    organization: 0,
    district: 0,
    department: 0,
    member: 0,
    card: 0,
    visitor: 0,
    trx_visitor: 0,
    visitor_blacklist: 0,
    building: 0,
    floor: 0,
    floor_plan: 0,
    floor_plan_masked_area: 0,
    cctv: 0,
    alarm: 0,
    alarm_warning: 0,
    brand: 0,
    ble: 0,
  });

  const cards = useMemo(
    () => [
      {
        title: 'Organizations',
        subTitle: String(totals.organizations),
        subTitleSetting: 0,
        icon: IconBuildingSkyscraper,
        color: 'none',
      },
      {
        title: 'Department',
        subTitle: String(totals.departments),
        subTitleSetting: 0,
        icon: IconBuilding,
        color: 'none',
      },
      {
        title: 'District',
        subTitle: String(totals.districts),
        subTitleSetting: 0,
        icon: IconMapPins,
        color: 'none',
      },
      {
        title: 'Member',
        subTitle: String(totals.members),
        subTitleSetting: 0,
        icon: IconUsers,
        color: 'none',
      },
      {
        title: 'Card',
        subTitle: String(totals.card),
        subTitleSetting: 0,
        icon: IconCards,
        color: 'none',
      },
      {
        title: 'Visitor',
        subTitle: String(totals.visitor),
        subTitleSetting: 0,
        icon: IconUsers,
        color: 'none',
      },
      {
        title: 'Trx Visitor',
        subTitle: String(totals.trx_visitor),
        subTitleSetting: 0,
        icon: IconUsers,
        color: 'none',
      },
      {
        title: 'Visitor Blacklist',
        subTitle: String(totals.visitor_blacklist),
        subTitleSetting: 0,
        icon: IconUserOff,
        color: 'none',
      },
      {
        title: 'Building',
        subTitle: String(totals.building),
        subTitleSetting: 0,
        icon: IconBuilding,
        color: 'none',
      },
      {
        title: 'Masked Area',
        subTitle: String(totals.floor_plan_masked_area),
        subTitleSetting: 0,
        icon: IconRectangle,
        color: 'none',
      },
      {
        title: 'Floor Plan',
        subTitle: String(totals.floor_plan),
        subTitleSetting: 0,
        icon: IconMapSearch,
        color: 'none',
      },
      {
        title: 'Floor',
        subTitle: String(totals.floor),
        subTitleSetting: 0,
        icon: IconStairsUp,
        color: 'none',
      },
      {
        title: 'Brand',
        subTitle: String(totals.brand),
        subTitleSetting: 0,
        icon: IconBrandMedium,
        color: 'none',
      },
      {
        title: 'Access Control',
        subTitle: String(totals.access_control),
        subTitleSetting: 0,
        icon: IconAccessible,
        color: 'none',
      },
      {
        title: 'Ble Reader',
        subTitle: String(totals.ble_reader),
        subTitleSetting: 0,
        icon: IconDeviceIpad,
        color: 'none',
      },
      {
        title: 'Access CCTV',
        subTitle: String(totals.access_cctv),
        subTitleSetting: 0,
        icon: IconDeviceCctv,
        color: 'none',
      },
      {
        title: 'Alarm Record',
        subTitle: String(totals.alarm_record),
        subTitleSetting: 0,
        icon: IconDeviceCctv,
        color: 'none',
      },
      {
        title: 'Alarm Warning',
        subTitle: String(totals.alarm_warning),
        subTitleSetting: 0,
        icon: IconDeviceCctv,
        color: 'none',
      },
      {
        title: 'Tracking Transaction',
        subTitle: String(totals.tracking_transaction) || '0',
        subTitleSetting: 0,
        icon: IconDeviceCctv,
        color: 'none',
      },
      {
        title: 'Sync Data',
        subTitle: '',
        subTitleSetting: 10,
        icon: IconRefresh,
        color: 'none',
        onIconClick: handleTrackingBleSyncIntegration,
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
  const [siteForm, setSiteForm] = useState<any>(null);
  const [floorForm, setFloorForm] = useState<any>(null);
  const [floorPlanForm, setFloorPlanForm] = useState<any>(null);
  const [floorPlanMaskedArea, setFloorPlanMaskedArea] = useState<any>(null);
  const [brandForm, setBrandForm] = useState<any>(null);
  const [accessControlForm, setAccessControlForm] = useState<any>(null);
  const [bleReaderForm, setBleReaderForm] = useState<any>(null);
  const [accessCCTVForm, setAccessCCTVForm] = useState<any>(null);
  const [alarmRecordForm, setAlarmRecordForm] = useState<any>(null);
  const [alarmWarningForm, setAlarmWarningForm] = useState<any>(null);
  const [trackingTransactionForm, setTrackingTransactionForm] = useState<any>(null);
  const [buildingForm, setBuildingForm] = useState<any>(null);

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
    | 'Organization'
    | 'District'
    | 'Department'
    | 'Member'
    | 'Card'
    | 'Visitor'
    | 'Visitor Blacklist'
    | 'Trx Visitor'
    | 'Access CCTV'
    | 'Floor Plan'
    | 'Floor Plan Masked Area'
    | 'Brand'
    | 'Access Control'
    | 'Floor'
    | 'Building'
    | 'Ble Reader'
    | 'Alarm Record'
    | 'Alarm Warning'
    | 'Tracking Transaction'
    | null
  >(null);
  const [selectedType, setSelectedType] = useState('organizations');
  const [editingRow, setEditingRow] = useState<Item | null>(null);
  const headerMap: Record<string, string> = {
    organizations: 'Organization',
    districts: 'District',
    departments: 'Department',
    members: 'Member',
    card: 'Card',
    visitor: 'Visitor',
    trx_visitor: 'Trx Visitor',
    visitor_blacklist: 'Visitor Blacklist',
    access_cctv: 'Access CCTV',
    floor: 'Floor',
    floor_plan: 'Floor Plan',
    floor_plan_masked_area: 'Floor Plan Masked Area',
    brand: 'Brand',
    access_control: 'Access Control',
    building: 'Building',
    ble_reader: 'Ble Reader',
    alarm_record: 'Alarm Record',
    alarm_warning: 'Alarm Warning',
    tracking_transaction: 'Tracking Transaction',
  };

  const TYPE_MAP: Record<
    string,
    | 'Organization'
    | 'District'
    | 'Department'
    | 'Member'
    | 'Card'
    | 'Visitor'
    | 'Visitor Blacklist'
    | 'Trx Visitor'
    | 'Access CCTV'
    | 'Floor Plan'
    | 'Floor Plan Masked Area'
    | 'Brand'
    | 'Access Control'
    | 'Floor'
    | 'Building'
    | 'Ble Reader'
    | 'Alarm Record'
    | 'Alarm Warning'
    | 'Tracking Transaction'
  > = {
    organizations: 'Organization',
    districts: 'District',
    departments: 'Department',
    members: 'Member',
    card: 'Card',
    visitor: 'Visitor',
    trx_visitor: 'Trx Visitor',
    visitor_blacklist: 'Visitor Blacklist',
    access_cctv: 'Access CCTV',
    floor_plan: 'Floor Plan',
    floor_plan_masked_area: 'Floor Plan Masked Area',
    // floor_plan_device: 'Floor Plan Device',
    brand: 'Brand',
    access_control: 'Access Control',
    floor: 'Floor',
    building: 'Building',
    ble_reader: 'Ble Reader',
    alarm_record: 'Alarm Record',
    alarm_warning: 'Alarm Warning',
    tracking_transaction: 'Tracking Transaction',
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
      getOrganizationTracking(id as string, token), // 0
      getDistrictTracking(id as string, token), // 1
      getDepartmentTracking(id as string, token), // 2
      getMemberTracking(id as string, token), // 3
      getCardTracking(id as string, token), // 4
      getVisitorTracking(id as string, token), // 5
      getVisitorBlacklist(id as string, token), // 6
      getTRXVisitor(id as string, token), // 7
      getAccessCCTV(id as string, token), // 8
      getFloorPlan(id as string, token), // 9
      getFloorPlanMaskedArea(id as string, token), // 10
      getBrandTracking(id as string, token), // 11
      getAccessControl(id as string, token), // 12
      getFloor(id as string, token), // 13
      getBuildingTracking(id as string, token), // 14
      getBleReaderTracking(id as string, token), // 15
      getAlarmTracking(id as string, token), // 16
      getAlarmWarningTracking(id as string, token), // 17
      getTrackingTransaction(id as string, token), // 18
    ]);

    const countOf = (i: number) =>
      settled[i].status === 'fulfilled'
        ? getCount((settled[i] as PromiseFulfilledResult<any>).value)
        : 0;

    setTotals({
      organizations: countOf(0),
      districts: countOf(1),
      departments: countOf(2),
      members: countOf(3),
      card: countOf(4),
      visitor: countOf(5),
      visitor_blacklist: countOf(6),
      trx_visitor: countOf(7),
      access_cctv: countOf(8),
      floor_plan: countOf(9),
      floor_plan_masked_area: countOf(10),
      brand: countOf(11),
      access_control: countOf(12),
      floor: countOf(13),
      building: countOf(14),
      ble_reader: countOf(15),
      alarm_record: countOf(16),
      alarm_warning: countOf(17),
      tracking_transaction: countOf(18), // kalau belum ada endpoint
    });
  };

  useEffect(() => {
    loadTotals();
  }, [id, token]);

  const fetchListByType = async (type: string) => {
    if (!token || !id) return;
    setLoading(true);
    try {
      if (type === 'organizations') {
        const res = await getOrganizationTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'districts') {
        const res = await getDistrictTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'departments') {
        const res = await getDepartmentTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'members') {
        const res = await getMemberTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'card') {
        const res = await getCardTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'visitors') {
        const res = await getVisitorTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'visitor_blacklist') {
        const res = await getVisitorBlacklist(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'trx_visitor') {
        const res = await getTRXVisitor(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'access_cctv') {
        const res = await getAccessCCTV(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'floor_plan') {
        const res = await getFloorPlan(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'floor_plan_masked_area') {
        const res = await getFloorPlanMaskedArea(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'brand') {
        const res = await getBrandTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'access_control') {
        const res = await getAccessControl(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'floor') {
        const res = await getFloor(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'building') {
        const res = await getBuildingTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'ble_reader') {
        const res = await getBleReaderTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'alarm_record') {
        const res = await getAlarmTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'alarm_warning') {
        const res = await getAlarmWarningTracking(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'tracking_transaction') {
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

  useEffect(() => {
    if (!token) return;
  }, [token, editDialogType]);

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
    organization_id: true,
    department_id: true,
    district_id: true,
    card_id: true,
    site_id: true,
    employee_id: true,
    brand_id: true,
    camera_id: true,
    access_control_id: true,
  });

  const handleEditRow = async (row: any) => {
    if (!token || !id) return;

    setIsBatchEdit(false);
    setEnabled({
      organization_id: true,
      department_id: true,
      district_id: true,
      card_id: true,
      site_id: true,
      employee_id: true,
      brand_id: true,
      camera_id: true,
      access_control_id: true,
    });

    setEditingRow(row);
    setEditDialogType(TYPE_MAP[selectedType] ?? null);
    try {
      if (selectedType === 'organizations') {
        const res = await getOrganizationTrackingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'districts') {
        const res = await getDistrictTrackingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'departments') {
        const res = await getDepartmentTrackingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'members') {
        // belum ada API by id → pakai row dulu
        const res = await getMemberTrackingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'brand') {
        const res = await getBrandTrackingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'access_control') {
        const res = await getAccessControlById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'floor') {
        const res = await getFloorById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'floor_plan_masked_area') {
        const res = await getFloorPlanMaskedAreaById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'floor_plan') {
        const res = await getFloorPlanById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'card') {
        const res = await getCardTrackingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'access_cctv') {
        const res = await getAccessCCTVById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'building') {
        const res = await getBuildingTrackingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'ble_reader') {
        const res = await getBleReaderTrackingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'tracking_transaction') {
        const res = await getTrackingTransactionById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else {
        setDetailData(row);
      }
    } catch (e) {
      console.error('Fetch detail error:', e);
      setDetailData(row);
    }
  };

  // const [openFormType, setOpenFormType] = useState<'Organization' | null>(null);

  useEffect(() => {
    if (!editingRow) return; // jangan set kalau belum pilih row untuk edit

    let type: typeof editDialogType = null;
    if (selectedType === 'organizations') type = 'Organization';
    else if (selectedType === 'districts') type = 'District';
    else if (selectedType === 'departments') type = 'Department';
    else if (selectedType === 'members') type = 'Member';
    else if (selectedType === 'brand') type = 'Brand';
    else if (selectedType === 'access_control') type = 'Access Control';
    else if (selectedType === 'floor') type = 'Floor';
    else if (selectedType === 'floor_plan') type = 'Floor Plan';
    else if (selectedType === 'floor_plan_masked_area') type = 'Floor Plan Masked Area';
    else if (selectedType === 'building') type = 'Building';
    else if (selectedType === 'ble_reader') type = 'Ble Reader';
    else if (selectedType === 'alarm_record') type = 'Alarm Record';
    else if (selectedType === 'alarm_warning') type = 'Alarm Warning';
    else if (selectedType === 'tracking_transaction') type = 'Tracking Transaction';
    else if (selectedType === 'visitor') type = 'Visitor';
    else if (selectedType === 'visitor_blacklist') type = 'Visitor Blacklist';
    else if (selectedType === 'trx_visitor') type = 'Trx Visitor';
    else if (selectedType === 'access_cctv') type = 'Access CCTV';
    else if (selectedType === 'card') type = 'Card';

    setEditDialogType(type);
  }, [selectedType, editingRow]);

  const handleCloseDialog = () => {
    setIsBatchEdit(false);
    setEnabled({
      organization_id: true,
      department_id: true,
      district_id: true,
      employee_id: true,
      card_id: true,
      brand_id: true,
      site_id: true,
      camera_id: true,
      access_control_id: true,
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
      setBrandForm(null);
      setSiteForm(null);
      setAccessControlForm(null);
      setFloorForm(null);
      setFloorPlanForm(null);
      setFloorPlanMaskedArea(null);
      setBuildingForm(null);
      setBleReaderForm(null);
      return;
    }

    // Tunggu data detail
    if (!detailData) return;

    // Hanya handle form Organization di sini
    if (editDialogType == 'Organization') {
      setOrganizationForm({
        organization_id: detailData.organization_id ?? '',
        createdAt: detailData.createdAt ?? '',
        updatedAt: detailData.updatedAt ?? '',
        deletedAt: detailData.deletedAt ?? '',
        code: detailData.code ?? '',
        name: detailData.name ?? '',
        host: detailData.host ?? '',
        id: detailData.id ?? '',
      });
    } else if (editDialogType === 'Department') {
      setDepartmentForm({
        department_id: detailData.department_id ?? '',
        createdAt: detailData.createdAt ?? '',
        updatedAt: detailData.updatedAt ?? '',
        deletedAt: detailData.deletedAt ?? '',
        code: detailData.code ?? '',
        name: detailData.name ?? '',
        host: detailData.host ?? '',
        id: detailData.id ?? '',
      });
    } else if (editDialogType === 'District') {
      setDistrictForm({
        district_id: detailData.district_id ?? '',
        createdAt: detailData.createdAt ?? '',
        updatedAt: detailData.updatedAt ?? '',
        deletedAt: detailData.deletedAt ?? '',
        code: detailData.code ?? '',
        name: detailData.name ?? '',
        host: detailData.host ?? '',
        id: detailData.id ?? '',
      });
    } else if (editDialogType === 'Card') {
      setCardForm({
        card_id: detailData.card_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        name: detailData.name ?? '',
        remarks: detailData.remarks ?? '',
        cardType: detailData.cardType ?? '',
        cardNumber: detailData.cardNumber ?? '',
        dmac: detailData.dmac ?? '',
        isMultiMaskedArea: detailData.isMultiMaskedArea ?? '',
        registeredMaskedAreaId: detailData.registeredMaskedAreaId ?? '',
        isUsed: detailData.isUsed ?? '',
        lastUsed: detailData.lastUsed ?? '',
        visitorId: detailData.visitorId ?? '',
        memberId: detailData.memberId ?? '',
        checkinAt: detailData.checkinAt ?? '',
        checkoutAt: detailData.checkoutAt ?? '',
        statusCard: detailData.statusCard ?? '',
      });
    } else if (editDialogType === 'Floor') {
      setFloorForm({
        floor_id: detailData.floor_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        buildingId: detailData.buildingId ?? '',
        name: detailData.name ?? '',
        floorImage: detailData.floorImage ?? '',
        pixelX: detailData.pixelX ?? '',
        pixelY: detailData.pixelY ?? '',
        floorX: detailData.floorX ?? '',
        floorY: detailData.floorY ?? '',
        meterPerPx: detailData.meterPerPx ?? '',
        engineFloorId: detailData.engineFloorId ?? '',
      });
    } else if (editDialogType === 'Building') {
      setBuildingForm({
        building_id: detailData.building_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        name: detailData.name ?? '',
        image: detailData.image ?? '',
      });
    } else if (editDialogType === 'Floor Plan') {
      setFloorPlanForm({
        floorplan_id: detailData.floorplan_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        name: detailData.name ?? '',
        floorId: detailData.floorId ?? '',
      });
    } else if (editDialogType === 'Floor Plan Masked Area') {
      setFloorPlanMaskedArea({
        floorplan_maskedarea_id: detailData.floorplan_maskedarea_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        name: detailData.name ?? '',
        areaShape: detailData.areaShape ?? '',
        colorArea: detailData.colorArea ?? '',
        restrictedStatus: detailData.restrictedStatus ?? '',
        engineAreaId: detailData.engineAreaId ?? '',
      });
    } else if (editDialogType === 'Access CCTV') {
      setAccessCCTVForm({
        access_cctv_id: detailData.access_cctv_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        name: detailData.name ?? '',
        rtsp: detailData.rtsp ?? '',
      });
    } else if (editDialogType === 'Ble Reader') {
      setBleReaderForm({
        ble_reader_id: detailData.ble_reader_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        name: detailData.name ?? '',
        gmac: detailData.gmac ?? '',
        ip: detailData.ip ?? '',
        engineReaderId: detailData.engineReaderId ?? '',
        brandId: detailData.brandId ?? '',
      });
    } else if (editDialogType === 'Access Control') {
      setAccessControlForm({
        access_control_id: detailData.access_control_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        brandId: detailData.brandId ?? '',
        name: detailData.name ?? '',
        type: detailData.type ?? '',
        description: detailData.description ?? '',
        channel: detailData.channel ?? '',
        doorId: detailData.doorId ?? '',
        raw: detailData.raw ?? '',
        integrationId: detailData.integrationId ?? '',
      });
    } else if (editDialogType === 'Member') {
      setMemberForm({
        member_id: detailData.member_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        name: detailData.name ?? '',
        email: detailData.email ?? '',
        phone: detailData.phone ?? '',
        gender: detailData.gender ?? '',
        address: detailData.address ?? '',
        faceImage: detailData.faceImage ?? '',
        organizationId: detailData.organizationId ?? '',
        integration_id: detailData.integration_id ?? '',
        departmentId: detailData.departmentId ?? '',
        districtId: detailData.districtId ?? '',
        identityId: detailData.identityId ?? '',
        cardNumber: detailData.cardNumber ?? '',
        bleCardNumber: detailData.bleCardNumber ?? '',
        personId: detailData.personId ?? '',
        uploadFr: detailData.uploadFr ?? '',
        uploadFrError: detailData.uploadFrError ?? '',
        birthDate: detailData.birthDate ?? '',
        joinDate: detailData.joinDate ?? '',
        exitDate: detailData.exitDate ?? '',
        headMember1: detailData.headMember1 ?? '',
        headMember2: detailData.headMember2 ?? '',
        statusEmployee: detailData.statusEmployee ?? '',
      });
    } else if (editDialogType === 'Brand') {
      setBrandForm({
        brand_id: detailData.brand_id ?? '',
        // createdAt: detailData.createdAt ?? '',
        // updatedAt: detailData.updatedAt ?? '',
        // deletedAt: detailData.deletedAt ?? '',
        name: detailData.name ?? '',
        tag: detailData.tag ?? '',
      });
    } else {
      setOrganizationForm(null);
      setBuildingForm(null);
      setFloorPlanForm(null);
      setFloorPlanMaskedArea(null);
      setAccessCCTVForm(null);
      setBleReaderForm(null);
      setAccessControlForm(null);
      setMemberForm(null);
      setBrandForm(null);
    }
  }, [editDialogType, detailData]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadOptions = async () => {
      try {
        if (editDialogType === 'Organization') {
          // Load organizations
          const res = await getAllOrganizations(token);
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id),
              label: o.name ?? '',
            })) || [];

          setOrgOptions(items);
          // reset yang lain agar nggak nyangkut
        } else if (editDialogType === 'Department') {
          const res = await getAllDepartments(token);
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id),
              label: o.name ?? '',
            })) || [];

          setOrgOptions(items);
          // reset yang lain agar nggak nyangkut
        } else if (editDialogType === 'District') {
          const res = await getAllDistricts(token);
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id),
              label: o.name ?? '',
            })) || [];

          setOrgOptions(items);
          // reset yang lain agar nggak nyangkut
        } else if (editDialogType === 'Member') {
          const res = await getAllEmployee(token);
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id),
              label: o.name ?? '',
            })) || [];

          setOrgOptions(items);
          // reset yang lain agar nggak nyangkut
        } else if (
          editDialogType === 'Building' ||
          // editDialogType === 'Floor Plan' ||
          editDialogType === 'Floor Plan Masked Area' ||
          editDialogType === 'Floor'
        ) {
          const res = await getAllSite(token);
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id),
              label: o.name ?? '',
            })) || [];

          setOrgOptions(items);
          // reset yang lain agar nggak nyangkut
        } else if (editDialogType === 'Brand') {
          const res = await getAllBrand(token);
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id),
              label: o.name ?? '',
            })) || [];

          setOrgOptions(items);
          // reset yang lain agar nggak nyangkut
        } else if (editDialogType === 'Access Control') {
          const res = await getAllAccessControl(token);

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
        if (editDialogType === 'Organization') {
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

  const handleSaveOrganization = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const organizationId = String(organizationForm?.id ?? detailData?.id ?? '');
        if (!organizationId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // Kirim dua field (trim) — kosong tidak ikut dikirim agar tidak mengosongkan server
        const payload = omitEmpty({
          organization_id: organizationForm?.organization_id
            ? String(organizationForm?.organization_id).trim()
            : undefined,
        });

        await updateOrganizationTracking(organizationId, payload, token as string);

        setListData((prev) =>
          prev.map((it) => (String(it.id) === organizationId ? { ...it, ...payload } : it)),
        );

        setSyncMsg({ open: true, text: 'Organization updated successfullys', severity: 'success' });
        return;
      }

      // === BATCH EDIT ===
      const payload: UpdateOrganizationTrackingRequest = omitEmpty({
        organization_id: organizationForm?.organization_id
          ? String(organizationForm?.organization_id).trim()
          : undefined,
      });

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateOrganizationTracking(it, payload, token as string))); //

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      setSyncMsg({ open: true, text: 'Organizations updated successfully', severity: 'success' });
    } catch (err: any) {
      setSyncMsg({
        open: true,
        text: err?.response?.data?.msg || 'Failed to update organization',
        severity: 'error',
      });
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  const handleSaveDepartment = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const departmentId = String(departmentForm?.id ?? detailData?.id ?? '');
        if (!departmentId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // Kirim dua field (trim) — kosong tidak ikut dikirim agar tidak mengosongkan server
        const payload = omitEmpty({
          department_id: departmentForm?.department_id
            ? String(departmentForm?.department_id).trim()
            : undefined,
        });

        await updateDepartmentTracking(departmentId, payload, token as string);

        setListData((prev) =>
          prev.map((it) => (String(it.id) === departmentId ? { ...it, ...payload } : it)),
        );

        setSyncMsg({
          open: true,
          text: 'Organization updated successfullys',
          severity: 'success',
        });
        return;
      }

      // === BATCH EDIT ===
      const payload = omitEmpty({
        ...(enabled.department_id && { department_id: departmentForm?.department_id }),
      });

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateDepartmentTracking(it, payload, token as string))); //

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      setSyncMsg({ open: true, text: 'Organizations updated successfully', severity: 'success' });
    } catch (err: any) {
      setSyncMsg({
        open: true,
        text: err?.response?.data?.msg || 'Failed to update department',
        severity: 'error',
      });
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  const handleSaveDistrict = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const districtId = String(districtForm?.id ?? detailData?.id ?? '');
        if (!districtId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // Kirim dua field (trim) — kosong tidak ikut dikirim agar tidak mengosongkan server
        const payload = omitEmpty({
          district_id: districtForm?.district_id
            ? String(districtForm?.district_id).trim()
            : undefined,
        });

        await updateDistrictTracking(districtId, payload, token as string);

        setListData((prev) =>
          prev.map((it) => (String(it.id) === districtId ? { ...it, ...payload } : it)),
        );

        setSyncMsg({
          open: true,
          text: 'District updated successfullys',
          severity: 'success',
        });
        return;
      }

      // === BATCH EDIT ===
      const payload = omitEmpty({
        ...(enabled.district_id && { district_id: districtForm?.district_id }),
      });

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateDistrictTracking(it, payload, token as string))); //

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      setSyncMsg({ open: true, text: 'Organizations updated successfully', severity: 'success' });
    } catch (err: any) {
      setSyncMsg({
        open: true,
        text: err?.response?.data?.msg || 'Failed to update district',
        severity: 'error',
      });
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }
  };

  // card
  const handleSaveCard = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const cardId = String(cardForm?.id ?? detailData?.id ?? '');
        if (!cardId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // Kirim dua field (trim) — kosong tidak ikut dikirim agar tidak mengosongkan server
        const payload = omitEmpty({
          card_id: cardForm?.card_id ? String(cardForm?.card_id).trim() : undefined,
        });

        await updateCardTracking(cardId, payload, token as string);

        setListData((prev) =>
          prev.map((it) => (String(it.id) === cardId ? { ...it, ...payload } : it)),
        );

        setSyncMsg({ open: true, text: 'Card updated successfullys', severity: 'success' });
        return;
      }

      // === BATCH EDIT ===
      const payload = omitEmpty({
        ...(enabled.card_id && { card_id: cardForm?.card_id }),
      });

      const ids = selectedRows.map((it) => String(it.id));
      await Promise.all(ids.map((it) => updateCardTracking(it, payload, token as string))); //

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      setSyncMsg({ open: true, text: 'Organizations updated successfully', severity: 'success' });
    } catch (err: any) {
      setSyncMsg({
        open: true,
        text: err?.response?.data?.msg || 'Failed to update card',
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
        title="Bio People Tracking Integration"
        description="Manage BioPeople Tracking Integration"
      >
        <Box>
          <Grid container spacing={3} flexWrap={'wrap'}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 2.4 }} />
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
                  isHaveBooleanSwitch={true}
                  onBatchEdit={handleEditBatch}
                  isHaveHeader={true}
                  headerContent={{
                    items: Object.keys(headerMap).map((key) => ({
                      name: key,
                      label: headerMap[key],
                    })),
                  }}
                  defaultSelectedHeaderItem="organizations"
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
      {/* Organization */}
      <Dialog
        open={editDialogType === 'Organization'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Organization
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
                  <CustomFormLabel htmlFor="organization_id" sx={{ mt: 0 }}>
                    Organization
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.organization_id}
                          onChange={(e) =>
                            setEnabled((p) => ({ ...p, organization_id: e.target.checked }))
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
                      (o) => o.id === String(organizationForm?.organization_id ?? ''),
                    ) || null
                  }
                  onChange={(_, newVal) =>
                    setOrganizationForm((p: any) => ({
                      ...p,
                      organization_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.organization_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.organization_id || saving : saving}
                />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={organizationForm?.name ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Code</CustomFormLabel>
                <CustomTextField value={organizationForm?.code ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Host</CustomFormLabel>
                <CustomTextField value={organizationForm?.host ?? ''} fullWidth disabled />
              </Box>
              {/* CreatedAt */}
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Created At</CustomFormLabel>
                <CustomTextField value={organizationForm?.createdAt ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Updated At</CustomFormLabel>
                <CustomTextField value={organizationForm?.updatedAt ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Deleted At</CustomFormLabel>
                <CustomTextField value={organizationForm?.deletedAt ?? ''} fullWidth disabled />
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
            onClick={handleSaveOrganization}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Department */}
      <Dialog
        open={editDialogType === 'Department'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Department
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
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="department_id" sx={{ mt: 0 }}>
                    Department
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.department_id}
                          onChange={(e) =>
                            setEnabled((p) => ({ ...p, department_id: e.target.checked }))
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
                    orgOptions.find((o) => o.id === String(departmentForm?.department_id ?? '')) ||
                    null
                  }
                  onChange={(_, newVal) =>
                    setDepartmentForm((p: any) => ({
                      ...p,
                      department_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.department_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.department_id || saving : saving}
                />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={departmentForm?.name ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Code</CustomFormLabel>
                <CustomTextField value={departmentForm?.code ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Host</CustomFormLabel>
                <CustomTextField value={departmentForm?.host ?? ''} fullWidth disabled />
              </Box>
              {/* CreatedAt */}
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Created At</CustomFormLabel>
                <CustomTextField value={departmentForm?.createdAt ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Updated At</CustomFormLabel>
                <CustomTextField value={departmentForm?.updatedAt ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Deleted At</CustomFormLabel>
                <CustomTextField value={departmentForm?.deletedAt ?? ''} fullWidth disabled />
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
            onClick={handleSaveDepartment}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* District */}
      <Dialog
        open={editDialogType === 'District'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit District
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
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="district_id" sx={{ mt: 0 }}>
                    District
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.district_id}
                          onChange={(e) =>
                            setEnabled((p) => ({ ...p, district_id: e.target.checked }))
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
                    orgOptions.find((o) => o.id === String(districtForm?.district_id ?? '')) || null
                  }
                  onChange={(_, newVal) =>
                    setDistrictForm((p: any) => ({
                      ...p,
                      district_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.district_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.district_id || saving : saving}
                />
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
                <CustomFormLabel sx={{ mt: 0 }}>Host</CustomFormLabel>
                <CustomTextField value={districtForm?.host ?? ''} fullWidth disabled />
              </Box>
              {/* CreatedAt */}
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Created At</CustomFormLabel>
                <CustomTextField value={districtForm?.createdAt ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Updated At</CustomFormLabel>
                <CustomTextField value={districtForm?.updatedAt ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Deleted At</CustomFormLabel>
                <CustomTextField value={districtForm?.deletedAt ?? ''} fullWidth disabled />
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
            onClick={handleSaveDistrict}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Card */}
      <Dialog open={editDialogType === 'Card'} fullWidth maxWidth="md" onClose={handleCloseDialog}>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Card
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
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="card_id" sx={{ mt: 0 }}>
                    Card
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.card_id}
                          onChange={(e) => setEnabled((p) => ({ ...p, card_id: e.target.checked }))}
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
                  value={orgOptions.find((o) => o.id === String(cardForm?.card_id ?? '')) || null}
                  onChange={(_, newVal) =>
                    setCardForm((p: any) => ({
                      ...p,
                      card_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.card_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.card_id || saving : saving}
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={cardForm?.name ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Remarks</CustomFormLabel>
                <CustomTextField value={cardForm?.remarks ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Card Type</CustomFormLabel>
                <CustomTextField value={cardForm?.cardType ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Card Number</CustomFormLabel>
                <CustomTextField value={cardForm?.cardNumber ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Qr Code</CustomFormLabel>
                <CustomTextField value={cardForm?.qrCode ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Dmac</CustomFormLabel>
                <CustomTextField value={cardForm?.dmac ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Is Multi Masked Area</CustomFormLabel>
                <CustomTextField value={cardForm?.isMultiMaskedArea ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Registered Masked Area</CustomFormLabel>
                <CustomTextField
                  value={cardForm?.registeredMaskedAreaId ?? ''}
                  fullWidth
                  disabled
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Is Used</CustomFormLabel>
                <CustomTextField value={cardForm?.isUsed ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Last Used</CustomFormLabel>
                <CustomTextField value={cardForm?.lastUsed ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Visitor</CustomFormLabel>
                <CustomTextField value={cardForm?.visitorId ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Member</CustomFormLabel>
                <CustomTextField value={cardForm?.memberId ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Checkin At</CustomFormLabel>
                <CustomTextField value={cardForm?.checkinAt ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Checkout At</CustomFormLabel>
                <CustomTextField value={cardForm?.checkoutAt ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Status</CustomFormLabel>
                <CustomTextField value={cardForm?.statusCard ?? ''} fullWidth disabled />
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
            onClick={handleSaveCard}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Member */}
      <Dialog
        open={editDialogType === 'Member'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Member
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
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="employee_id" sx={{ mt: 0 }}>
                    Member
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.employee_id}
                          onChange={(e) =>
                            setEnabled((p) => ({ ...p, employee_id: e.target.checked }))
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
                    orgOptions.find((o) => o.id === String(memberForm?.employee_id ?? '')) || null
                  }
                  onChange={(_, newVal) =>
                    setMemberForm((p: any) => ({
                      ...p,
                      employee_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.employee_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.employee_id || saving : saving}
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={memberForm?.name ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Phone</CustomFormLabel>
                <CustomTextField value={memberForm?.phone ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Email</CustomFormLabel>
                <CustomTextField value={memberForm?.email ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Gender</CustomFormLabel>
                <CustomTextField value={memberForm?.gender ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Address</CustomFormLabel>
                <CustomTextField value={memberForm?.address ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Upload FR</CustomFormLabel>
                <CustomTextField value={memberForm?.uploadFr ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Birth Date</CustomFormLabel>
                <CustomTextField value={memberForm?.birthDate ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Join Date</CustomFormLabel>
                <CustomTextField value={memberForm?.joinDate ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Exit Date</CustomFormLabel>
                <CustomTextField value={memberForm?.exitDate ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Card Number</CustomFormLabel>
                <CustomTextField value={memberForm?.cardNumber ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Ble Card Number</CustomFormLabel>
                <CustomTextField value={memberForm?.bleCardNumber ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Head Member 1</CustomFormLabel>
                <CustomTextField value={memberForm?.headMember1 ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Head Member 2</CustomFormLabel>
                <CustomTextField value={memberForm?.headMember2 ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Status</CustomFormLabel>
                <CustomTextField value={memberForm?.statusEmployee ?? ''} fullWidth disabled />
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
            onClick={handleSaveCard}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floor */}
      <Dialog open={editDialogType === 'Floor'} fullWidth maxWidth="md" onClose={handleCloseDialog}>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Floor
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
          {!floorForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="site_id" sx={{ mt: 0 }}>
                    Floor
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.site_id}
                          onChange={(e) => setEnabled((p) => ({ ...p, site_id: e.target.checked }))}
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
                  value={orgOptions.find((o) => o.id === String(floorForm?.site_id ?? '')) || null}
                  onChange={(_, newVal) =>
                    setFloorForm((p: any) => ({
                      ...p,
                      site_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.site_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.site_id || saving : saving}
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={floorForm?.name ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Floor Image</CustomFormLabel>
                <CustomTextField value={floorForm?.floorImage ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Pixel Y</CustomFormLabel>
                <CustomTextField value={floorForm?.pixelY ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Pixel X</CustomFormLabel>
                <CustomTextField value={floorForm?.pixelX ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Floor X</CustomFormLabel>
                <CustomTextField value={floorForm?.floorX ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Floor Y</CustomFormLabel>
                <CustomTextField value={floorForm?.floorY ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Meter Per Pixel</CustomFormLabel>
                <CustomTextField value={floorForm?.meterPerPx ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Engine Floor</CustomFormLabel>
                <CustomTextField value={floorForm?.engineFloorId ?? ''} fullWidth disabled />
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
            disabled={!floorForm || saving}
            onClick={handleSaveCard}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Floor Plan */}
      {/* <Dialog
        open={editDialogType === 'Floor Plan'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Floor Plan
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
          {!floorPlanForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="site_id" sx={{ mt: 0 }}>
                    Floor
                  </CustomFormLabel>

                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.site_id}
                          onChange={(e) => setEnabled((p) => ({ ...p, site_id: e.target.checked }))}
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
                    orgOptions.find((o) => o.id === String(floorPlanForm?.site_id ?? '')) || null
                  }
                  onChange={(_, newVal) =>
                    setFloorPlanForm((p: any) => ({
                      ...p,
                      site_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.site_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.site_id || saving : saving}
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={floorPlanForm?.name ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Floor</CustomFormLabel>
                <CustomTextField value={floorPlanForm?.floorId ?? ''} fullWidth disabled />
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
            disabled={!floorPlanForm || saving}
            onClick={handleSaveCard}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* Floor Plan Masked Area */}

      {/* Brand */}
      <Dialog open={editDialogType === 'Brand'} fullWidth maxWidth="md" onClose={handleCloseDialog}>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Brand
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
          {!brandForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="site_id" sx={{ mt: 0 }}>
                    Brand
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.brand_id}
                          onChange={(e) =>
                            setEnabled((p) => ({ ...p, brand_id: e.target.checked }))
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
                  value={orgOptions.find((o) => o.id === String(brandForm?.brand_id ?? '')) || null}
                  onChange={(_, newVal) =>
                    setBrandForm((p: any) => ({
                      ...p,
                      brand_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.brand_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.brand_id || saving : saving}
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={brandForm?.name ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Tag</CustomFormLabel>
                <CustomTextField value={brandForm?.tag ?? ''} fullWidth disabled />
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
            disabled={!brandForm || saving}
            onClick={handleSaveCard}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Building */}
      <Dialog
        open={editDialogType === 'Building'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Building
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
          {!buildingForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="site_id" sx={{ mt: 0 }}>
                    Building
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.site_id}
                          onChange={(e) => setEnabled((p) => ({ ...p, site_id: e.target.checked }))}
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
                    orgOptions.find((o) => o.id === String(buildingForm?.site_id ?? '')) || null
                  }
                  onChange={(_, newVal) =>
                    setBuildingForm((p: any) => ({
                      ...p,
                      site_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.site_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.site_id || saving : saving}
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={buildingForm?.name ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Image</CustomFormLabel>
                <CustomTextField value={buildingForm?.image ?? ''} fullWidth disabled />
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
            disabled={!buildingForm || saving}
            onClick={handleSaveCard}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CCTV */}
      <Dialog
        open={editDialogType === 'Access CCTV'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Access CCTV
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
          {!accessCCTVForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="camera_id" sx={{ mt: 0 }}>
                    Access CCTV
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.camera_id}
                          onChange={(e) =>
                            setEnabled((p) => ({ ...p, camera_id: e.target.checked }))
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
                    orgOptions.find((o) => o.id === String(accessCCTVForm?.camera_id ?? '')) || null
                  }
                  onChange={(_, newVal) =>
                    setAccessCCTVForm((p: any) => ({
                      ...p,
                      camera_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.camera_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.camera_id || saving : saving}
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={accessCCTVForm?.name ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>RTSP</CustomFormLabel>
                <CustomTextField value={accessCCTVForm?.rtsp ?? ''} fullWidth disabled />
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
            disabled={!accessCCTVForm || saving}
            onClick={handleSaveCard}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Access Control */}
      <Dialog
        open={editDialogType === 'Access Control'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Access Control
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
          {!accessControlForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="access_control_id" sx={{ mt: 0 }}>
                    Access Control
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.access_control_id}
                          onChange={(e) =>
                            setEnabled((p) => ({ ...p, access_control_id: e.target.checked }))
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
                      (o) => o.id === String(accessControlForm?.access_control_id ?? ''),
                    ) || null
                  }
                  onChange={(_, newVal) =>
                    setAccessControlForm((p: any) => ({
                      ...p,
                      access_control_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label=""
                      size="small"
                      disabled={isBatchEdit ? !enabled.access_control_id || saving : saving}
                    />
                  )}
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.access_control_id || saving : saving}
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={accessControlForm?.name ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Type</CustomFormLabel>
                <CustomTextField value={accessControlForm?.type ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Description</CustomFormLabel>
                <CustomTextField value={accessControlForm?.description ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Channel</CustomFormLabel>
                <CustomTextField value={accessControlForm?.channel ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Door ID</CustomFormLabel>
                <CustomTextField value={accessControlForm?.doorId ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Raw</CustomFormLabel>
                <CustomTextField value={accessControlForm?.raw ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Integration ID</CustomFormLabel>
                <CustomTextField
                  value={accessControlForm?.integrationId ?? ''}
                  fullWidth
                  disabled
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
            disabled={!accessControlForm || saving}
            onClick={handleSaveCard}
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

export default BioPeopleTracking;
