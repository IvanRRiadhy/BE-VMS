import { useEffect, useState, useRef, useMemo, act } from 'react';
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
} from 'src/customs/api/models/Admin/Integration';
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
  getCardAccessTracking,
  getCardAccessTrackingById,
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
  updateCardAccessTracking,
  updateCardTracking,
  updateDepartmentTracking,
  updateDistrictTracking,
  updateFloorPlanMaskedArea,
  updateOrganizationTracking,
} from 'src/customs/api/admin';
import CloseIcon from '@mui/icons-material/Close';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { floor, rest } from 'lodash';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { count } from 'console';

const BioPeopleTracking = ({ id }: { id: string }) => {
  const { token } = useSession();

  const handleTrackingBleSyncIntegration = async () => {
    if (!id || !token) {
      setSyncMsg({ open: true, text: 'Session habis / ID tidak valid.', severity: 'error' });
      return;
    }

    try {
      setSyncing(true);

      await new Promise((resolve) => setTimeout(resolve, 300));

      const res = await syncTrackingBleIntegration(id as string, token as string);

      if (res.status !== 'success') {
        setSyncing(false);

        if (res.status_code === 404 && /not connected/i.test(res.msg || '')) {
          setSyncMsg({
            open: true,
            text: 'Tidak terhubung ke server. Coba lagi nanti.',
            severity: 'error',
          });
        } else {
          setSyncMsg({
            open: true,
            text: res.msg || 'Sinkronisasi gagal.',
            severity: 'error',
          });
        }
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await loadTotals();
      await fetchListByType(selectedType);

      setSyncing(false);

      showSwal('success', res.msg || 'Sinkronisasi berhasil.');
    } catch (e: any) {
      console.error('Sync error:', e);
      setSyncing(false);
      showSwal('error', e?.msg || e?.message || 'Sinkronisasi gagal. Coba lagi nanti.');
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
    card_access: 0,
    cctv: 0,
    alarm: 0,
    alarm_warning: 0,
    access_control: 0,
    brand: 0,
    access_cctv: 0,
    ble_reader: 0,
    tracking_transaction: 0,
    alarm_record: 0,
  });

  const cards = useMemo(
    () => [
      {
        title: 'Card Access',
        subTitle: String(totals.card_access),
        subTitleSetting: 0,
        icon: IconRectangle,
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
  // const [floorPlanMaskedArea setFloorPlanForm] = useState<any>(null);
  const [floorPlanMaskedArea, setFloorPlanMaskedArea] = useState<any>(null);
  const [cardAccessForm, setCardAccessForm] = useState<any>(null);

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
    // | 'Organization'
    // | 'District'
    // | 'Department'
    // | 'Member'
    // | 'Card'
    // | 'Visitor'
    // | 'Visitor Blacklist'
    // | 'Trx Visitor'
    // | 'Access CCTV'
    // | 'Floor Plan'
    // | 'Floor Plan Masked Area'
    | 'Card Access'
    // | 'Brand'
    // | 'Access Control'
    // | 'Floor'
    // | 'Building'
    // | 'Ble Reader'
    // | 'Alarm Record'
    // | 'Alarm Warning'
    // | 'Tracking Transaction'
    | null
  >(null);
  const [selectedType, setSelectedType] = useState('card_access');
  const [editingRow, setEditingRow] = useState<Item | null>(null);
  const headerMap: Record<string, string> = {
    // floor_plan_masked_area: 'Floor Plan Masked Area',
    card_access: 'Card Access',
  };

  const TYPE_MAP: Record<
    string,
    // 'Floor Plan Masked Area'
    //  |
    'Card Access'
  > = {
    // floor_plan_masked_area: 'Floor Plan Masked Area',
    card_access: 'Card Access',
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

    const settled = await Promise.allSettled([getCardAccessTracking(id as string, token)]);

    const countOf = (i: number) =>
      settled[i].status === 'fulfilled'
        ? getCount((settled[i] as PromiseFulfilledResult<any>).value)
        : 0;

    setTotals({
      card_access: countOf(0),
    });
  };

  useEffect(() => {
    loadTotals();
  }, [id, token]);

  const fetchListByType = async (type: string) => {
    if (!token || !id) return;
    setLoading(true);
    try {
      if (type === 'card_access') {
        const res = await getCardAccessTracking(id as string, token);
        const resAllSite = await getAllSite(token);
        const rows = res.collection.map((item: any) => ({
          id: item.id,
          trx_card_access_id: item.trk_card_access_id,
          name: item.name,
          access_scope: item.accessScope,
          remarks: item.remarks,
          // integration_id: item.integration_id,
          site:
            resAllSite.collection.find(
              (site: any) => String(site.id).toUpperCase() === String(item.site_id).toUpperCase(),
            )?.name ?? item.site_id,
          active: item.active ? 'Active' : 'Inactive',
        }));
        setListData(rows ?? []);
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
    setEditingRow(null);
    setDetailData(null);
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
      if (selectedType === 'floor_plan_masked_area') {
        const res = await getFloorPlanMaskedAreaById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'card_access') {
        const res = await getCardAccessTrackingById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else {
        setDetailData(row);
      }
    } catch (e) {
      console.error('Fetch detail error:', e);
      setDetailData(row);
    }
  };

  useEffect(() => {
    if (!editingRow) return;

    let type: typeof editDialogType = null;
    if (selectedType === 'card_access') type = 'Card Access';

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
  };

  useEffect(() => {
    // Tutup dialog → kosongkan form
    if (!editDialogType) {
      setCardAccessForm(null);
      return;
    }

    if (!detailData) return;

    if (editDialogType === 'Card Access') {
      setCardAccessForm({
        id: detailData.id ?? '',
        name: detailData.name ?? '',
        accessScope: detailData.accessScope ?? '',
        remarks: detailData.remarks ?? '',
        integration_id: detailData.integration_id ?? '',
        site_id: (detailData.site_id ?? '').toUpperCase() ?? '',
        active: detailData.active ?? '',
      });
    } else {
      setCardAccessForm(null);
    }
  }, [editDialogType, detailData]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadOptions = async () => {
      try {
        if (editDialogType === 'Card Access') {
          // Dialog lain (atau ditutup)
          const res = await getAllSite(token);
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id).toUpperCase(),
              label: o.name ?? '',
            })) || [];

          setOrgOptions(items);
        } else {
          setOrgOptions([]);
        }
      } catch (e) {
        console.error('Load options error:', e);
        // if (editDialogType === 'Organization') {
        //   setOrgOptions([]);
        // } else {
        //   setOrgOptions([]);
        // }
        setOrgOptions([]);
      }
    };

    loadOptions();

    return () => {};
  }, [editDialogType, token]);

  const omitEmpty = <T extends Record<string, any>>(obj: T) =>
    Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined),
    );

  const handleSaveFloorPlanMaskedArea = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      if (!isBatchEdit) {
        const areaId = String(floorPlanMaskedArea?.id ?? detailData?.id ?? '');

        if (!areaId) {
          setSyncMsg({
            open: true,
            text: 'ID Floor Plan Masked Area tidak ditemukan.',
            severity: 'error',
          });
          return;
        }

        const payload = omitEmpty({
          site_id: floorPlanMaskedArea.site_id || undefined,
          active: floorPlanMaskedArea.active,
        });

        await updateFloorPlanMaskedArea(areaId, payload, token);

        setListData((prev) => {
          const updated = prev.map((item) =>
            String(item.trk_floorplan_masked_area_id) === areaId ? { ...item, ...payload } : item,
          );
          return [...updated]; // 🔥 PAKSA reference baru
        });

        await new Promise((res) => setTimeout(res, 300));

        handleCloseDialog();
        await fetchListByType(selectedType);
        await new Promise((res) => setTimeout(res, 300));

        showSwal('success', 'Floor Plan Masked Area updated successfully');

        return;
      }
    } catch (err: any) {
      setSyncMsg({
        open: true,
        text: err?.response?.data?.msg || 'Failed to update Floor Plan Masked Area',
        severity: 'error',
      });
    } finally {
      setTimeout(() => setSaving(false), 400);
    }
  };

  const handleSaveCardAccess = async () => {
    if (!token || !id) return;

    try {
      setSaving(true);

      if (!isBatchEdit) {
        const areaId = String(cardAccessForm?.id ?? detailData?.id ?? '');

        if (!areaId) {
          setSyncMsg({
            open: true,
            text: 'ID Floor Plan Masked Area tidak ditemukan.',
            severity: 'error',
          });
          return;
        }

        const payload = omitEmpty({
          site_id: cardAccessForm.site_id || undefined,
          active: cardAccessForm.active,
        });

        await updateCardAccessTracking(areaId, payload, token);

        setListData((prev) => {
          const updated = prev.map((item) =>
            String(item.id) === areaId ? { ...item, ...payload } : item,
          );
          return [...updated];
        });

        await new Promise((res) => setTimeout(res, 300));

        handleCloseDialog();
        await fetchListByType(selectedType);
        await new Promise((res) => setTimeout(res, 300));

        showSwal('success', 'Card Access updated successfully');

        return;
      }
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to update Card Access');
    } finally {
      setTimeout(() => setSaving(false), 400);
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
                  loading={loading}
                  isHavePagination
                  rowsPerPageOptions={[5, 10, 25, 50, 100, 250, 500]}
                  overflowX={'auto'}
                  data={listData}
                  selectedRows={selectedRows}
                  isHaveChecked={true}
                  isHaveAction={false}
                  isSelectedType={selectedType !== 'badge_status'}
                  isHaveActionOnlyEdit={true}
                  isHaveSearch={false}
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
                  defaultSelectedHeaderItem="card_access"
                  onHeaderItemClick={(item) => {
                    setSelectedType(item.name);
                  }}
                  onCheckedChange={(selected) => {
                    setSelectedRows(selected);
                  }}
                  onEdit={handleEditRow}
                  onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      {/* Card Access */}
      <Dialog
        open={editDialogType === 'Card Access'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Card Access
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
          {!cardAccessForm ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="site_id" sx={{ mt: 0 }}>
                    Site
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
                    orgOptions.find((o) => o.id === String(cardAccessForm.site_id ?? '')) || null
                  }
                  onChange={(_, newVal) =>
                    setCardAccessForm((p: any) => ({
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
                <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>
                <Switch
                  checked={Boolean(cardAccessForm?.active)}
                  onChange={(e) =>
                    setCardAccessForm((prev: any) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  color="primary"
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={cardAccessForm.name ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Access Scope</CustomFormLabel>
                <CustomTextField value={cardAccessForm.accessScope ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Remarks</CustomFormLabel>
                <CustomTextField value={cardAccessForm.remarks ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Integration ID</CustomFormLabel>
                <CustomTextField value={cardAccessForm.integration_id ?? ''} fullWidth disabled />
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!cardAccessForm || saving}
            onClick={handleSaveCardAccess}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Floor Plan Masked Area */}
      {/* <Dialog
        open={editDialogType === 'Floor Plan Masked Area'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Floor Plan Masked Area
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
          {!floorPlanMaskedArea ? (
            <Box sx={{ py: 2 }}>Loading…</Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="site_id" sx={{ mt: 0 }}>
                    Site
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
                    orgOptions.find((o) => o.id === String(floorPlanMaskedArea.site_id ?? '')) ||
                    null
                  }
                  onChange={(_, newVal) =>
                    setFloorPlanMaskedArea((p: any) => ({
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
                <CustomFormLabel sx={{ mt: 0 }}>Active</CustomFormLabel>
                <Switch
                  checked={Boolean(floorPlanMaskedArea?.active)}
                  onChange={(e) =>
                    setFloorPlanMaskedArea((prev: any) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  color="primary"
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                <CustomTextField value={floorPlanMaskedArea.name ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Floor ID</CustomFormLabel>
                <CustomTextField value={floorPlanMaskedArea.floor_id ?? ''} fullWidth disabled />
              </Box>

              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Floor Plan ID</CustomFormLabel>
                <CustomTextField
                  value={floorPlanMaskedArea.floorplan_id ?? ''}
                  fullWidth
                  disabled
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Trx Floorplan Masked Area ID</CustomFormLabel>
                <CustomTextField
                  value={floorPlanMaskedArea.trk_floorplan_masked_area_id ?? ''}
                  fullWidth
                  disabled
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Area Shape</CustomFormLabel>
                <CustomTextField value={floorPlanMaskedArea.area_shape ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Color Area</CustomFormLabel>
                <CustomTextField value={floorPlanMaskedArea.color_area ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Restricted Status</CustomFormLabel>
                <CustomTextField
                  value={floorPlanMaskedArea.restricted_status ?? ''}
                  fullWidth
                  disabled
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Integration ID</CustomFormLabel>
                <CustomTextField
                  value={floorPlanMaskedArea.integration_id ?? ''}
                  fullWidth
                  disabled
                />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Created At</CustomFormLabel>
                <CustomTextField value={floorPlanMaskedArea.created_at ?? ''} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Updated At</CustomFormLabel>
                <CustomTextField value={floorPlanMaskedArea.updated_at ?? ''} fullWidth disabled />
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!floorPlanMaskedArea || saving}
            onClick={handleSaveFloorPlanMaskedArea}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* Brand */}
      {/* <Dialog open={editDialogType === 'Brand'} fullWidth maxWidth="md" onClose={handleCloseDialog}>
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
      </Dialog> */}
      {/* Building */}
      {/* <Dialog
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
      </Dialog> */}

      {/* CCTV */}
      {/* <Dialog
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
      </Dialog> */}

      {/* Access Control */}
      {/* <Dialog
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
      </Dialog> */}

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
            zIndex: (t) => 99999999,
          }}
        >
          <CircularProgress />
        </Backdrop>
      </Portal>
    </>
  );
};

export default BioPeopleTracking;
