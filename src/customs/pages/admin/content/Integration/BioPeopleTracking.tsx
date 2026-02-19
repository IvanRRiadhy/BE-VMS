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
  MenuItem,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import TopCard from 'src/customs/components/cards/TopCard';
import { IconRectangle, IconRefresh } from '@tabler/icons-react';
import { Item } from 'src/customs/api/models/Admin/Integration';
import {
  getAllSite,
  getAllVisitorType,
  getCardAccessTracking,
  getCardAccessTrackingById,
  getFloorPlanMaskedAreaById,
  syncTrackingBleIntegration,
  updateCardAccessTracking,
} from 'src/customs/api/admin';
import CloseIcon from '@mui/icons-material/Close';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { showSwal } from 'src/customs/components/alerts/alerts';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

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
  const [visitoTypeOptions, setVisitorTypeOptions] = useState<Array<{ id: string; label: string }>>(
    [],
  );
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
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
    card_access: 'Card Access',
  };

  const TYPE_MAP: Record<string, 'Card Access'> = {
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
    site_id: true,
    visitor_type_id: true,
  });

  const handleEditRow = async (row: any) => {
    if (!token || !id) return;

    setIsBatchEdit(false);
    setEnabled({
      site_id: true,
      visitor_type_id: true,
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
    setEditDialogType(null);
    setEditingRow(null);
    setDetailData(null);

    setIsBatchEdit(false);
    setEnabled({
      site_id: true,
      visitor_type_id: true,
    });
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
        visitor_type_id: (detailData.visitor_type_id ?? '').toUpperCase() ?? '',
        access_tracking_type: detailData.access_tracking_type ?? '',
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
          const resVisitorType = await getAllVisitorType(token);
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id).toUpperCase(),
              label: o.name ?? '',
            })) || [];

          const itemsVisitorType = (resVisitorType.collection ?? []).map((o: any) => ({
            id: String(o.id).toUpperCase(),
            label: o.name ?? '',
          }));

          setOrgOptions(items);
          setVisitorTypeOptions(itemsVisitorType);
        } else {
          setOrgOptions([]);
        }
      } catch (e) {
        console.error('Load options error:', e);
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

  const accessType = cardAccessForm?.access_tracking_type;

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
          access_tracking_type: accessType || undefined,

          site_id: accessType === 'Site' ? cardAccessForm.site_id || null : null,

          visitor_type_id:
            accessType === 'VisitorType' ? cardAccessForm.visitor_type_id || null : null,

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

  const isSiteAccess = cardAccessForm?.access_tracking_type === 'Site';
  const isVisitorTypeAccess = cardAccessForm?.access_tracking_type === 'VisitorType';

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
                <CustomFormLabel htmlFor="access_tracking_type" sx={{ mt: 0 }}>
                  Access Type
                </CustomFormLabel>
                <CustomSelect
                  id="access_tracking_type"
                  fullWidth
                  value={cardAccessForm?.access_tracking_type ?? ''}
                  onChange={(e: any) =>
                    setCardAccessForm((p: any) => ({
                      ...p,
                      access_tracking_type: e.target.value,
                      site_id: e.target.value === 'Site' ? p.site_id : '',
                      visitor_type_id: e.target.value === 'VisitorType' ? p.visitor_type_id : '',
                    }))
                  }
                  disabled={isBatchEdit}
                >
                  <MenuItem value="Site">Site</MenuItem>
                  <MenuItem value="VisitorType">Visitor Type</MenuItem>
                </CustomSelect>
              </Box>
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
                  // disablePortal={true}
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
                  renderInput={(params) => <CustomTextField {...params} size="small" />}
                  disabled={saving || !isSiteAccess || (isBatchEdit && !enabled.site_id)}
                />
              </Box>
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
                  options={visitoTypeOptions}
                  value={
                    visitoTypeOptions.find(
                      (o) => o.id === String(cardAccessForm.visitor_type_id ?? ''),
                    ) || null
                  }
                  onChange={(_, newVal) =>
                    setCardAccessForm((p: any) => ({
                      ...p,
                      visitor_type_id: newVal ? newVal.id : '',
                    }))
                  }
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                  disabled={
                    saving || !isVisitorTypeAccess || (isBatchEdit && !enabled.visitor_type_id)
                  }
                  renderInput={(params) => <CustomTextField {...params} size="small" />}
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
            zIndex: (t) => Math.min(99998, (t.zIndex.snackbar ?? 1400) - 1),
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
