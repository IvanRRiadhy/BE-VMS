import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  DialogActions,
  Portal,
  Button,
  Grid2 as Grid,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Autocomplete,
  Switch,
  FormControlLabel,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import TopCard from 'src/customs/components/cards/TopCard';
import {
  getCompanies,
  getCompaniesById,
  getBadgeType,
  getBadgeTypeById,
  getClearcodes,
  getClearcodesById,
  getBadgeStatus,
  getBadgeStatusById,
  getAllOrganizations,
  getAllVisitorType,
  getAllAccessControl,
  updateCompany,
  updateBadgeType,
  updateClearcodes,
  syncHoneywellIntegration,
  syncHoneywellBadge,
  addBadgeEmployee,
} from 'src/customs/api/admin';
import {
  Item,
  UpdateBadgeTypeRequest,
  UpdateClearcodesRequest,
} from 'src/customs/api/models/Admin/Integration';
import {
  IconAccessPoint,
  IconBuilding,
  IconCode,
  IconRefresh,
  IconUsersGroup,
} from '@tabler/icons-react';
import { showSwal } from 'src/customs/components/alerts/alerts';
import AddBadgeDialog from './components/AddBadgeDialog';
import { checkConnection } from 'src/customs/api/Admin/Integration';
import SyncBadgeDialog from './components/SyncBadgeDialog';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import EditCompanyDialog from './components/Honeywell/EditCompaniesDialog';
import EditBadgeTypeDialog from './components/Honeywell/EditBadgeTypeDialog';
import EditClearCodeDialog from './components/Honeywell/EditClearCodeDialog';

const Honeywell = ({ id }: { id: string }) => {
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [selectedType, setSelectedType] = useState('companies');
  const [openFormType, setOpenFormType] = useState<
    'Companies' | 'Badge Type' | 'Clearcodes' | 'Badge Status' | null
  >(null);
  const [editingRow, setEditingRow] = useState<Item | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [listData, setListData] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [orgOptions, setOrgOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [companyForm, setCompanyForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [badgeTypeForm, setBadgeTypeForm] = useState<any>(null);
  const [dataSyncBadge, setDataSyncBadge] = useState<any[]>([]);
  const [openSyncDialog, setOpenSyncDialog] = useState(false);
  const [visitorTypeOptions, setVisitorTypeOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [clearCodeForm, setClearCodeForm] = useState<any>(null);
  const [accessControlOptions, setAccessControlOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [badgeStatusForm, setBadgeStatusForm] = useState<any>(null);
  const [enabled, setEnabled] = useState({
    name: true,
    organization_id: true,
    visitor_type_id: true,
    access_control_id: true,
  });
  const [totals, setTotals] = useState({
    companies: 0,
    badge_type: 0,
    clear_codes: 0,
    badge_status: 0,
  });

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{
    open: boolean;
    text: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    text: '',
    severity: 'success',
  });

  const handleSyncIntegration = async () => {
    if (!id) {
      showSwal('error', 'Session expired / Invalid ID.');
      return;
    }

    try {
      setSyncing(true);
      const res = await syncHoneywellIntegration(id as string);
      setSyncing(false);

      if (res.status !== 'success') {
        showSwal('error', res.msg || 'Synchronization failed.');

        if (res.status_code === 404 && /not connected/i.test(res.msg || '')) {
          showSwal('error', 'Unable to connect to the device. Please try again later.');
        }

        return;
      }

      showSwal('success', res.msg || 'Synchronization successful.');
      loadTotals().catch((e) => console.error('loadTotals error:', e));
      fetchListByType(selectedType).catch((e) => console.error('fetchListByType error:', e));
    } catch (e: any) {
      setSyncing(false);
      showSwal('error', e?.message || 'Synchronization failed. Please try again later.');
    }
  };

  const handleSyncBadge = async () => {
    if (!id) {
      showSwal('error', 'Session expired / Invalid ID.');
      return;
    }

    try {
      setSyncing(true);

      const res = await syncHoneywellBadge(id as string);

      setSyncing(false);

      if (res.status !== 'success') {
        showSwal('error', res.msg || 'Synchronization failed.');
        return;
      }

      const notExisted = res.collection?.data_notexisted || [];

      if (notExisted.length === 0) {
        showSwal('info', 'No new badge data to import.');
        return;
      }

      setDataSyncBadge(notExisted);
      setOpenSyncDialog(true);
      showSwal('success', res.msg || 'Synchronization successful.', 1000);
    } catch (e: any) {
      setSyncing(false);
      showSwal('error', e?.message || 'Synchronization failed.');
    }
  };

  const cards = useMemo(
    () => [
      {
        title: "Companies",
        subTitle: totals.companies.toString(),
        subTitleSetting: totals.companies,
        icon: IconBuilding,
        color: "none",
        type: "info",
      },
      {
        title: "Badge Type",
        subTitle: totals.badge_type.toString(),
        subTitleSetting: totals.badge_type,
        icon: IconUsersGroup,
        color: "none",
        type: "info",
      },
      {
        title: "Clearcodes",
        subTitle: totals.clear_codes.toString(),
        subTitleSetting: totals.clear_codes,
        icon: IconCode,
        color: "none",
        type: "info",
      },
      {
        title: "Badge Status",
        subTitle: totals.badge_status.toString(),
        subTitleSetting: totals.badge_status,
        icon: IconAccessPoint,
        color: "none",
        type: "info",
      },
      {
        title: "Sync Data",
        icon: IconRefresh,
        onIconClick: handleSyncIntegration,
        type: "action",
      },
      {
        title: "Import Badge",
        icon: IconRefresh,
        onIconClick: handleSyncBadge,
        type: "action",
      },
    ],
    [totals, handleSyncIntegration, handleSyncBadge]
  );

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

    const [cRes, btRes, ccRes, bsRes] = await Promise.allSettled([
      getCompanies(id as string),
      getBadgeType(id as string),
      getClearcodes(id as string),
      getBadgeStatus(id as string),
    ]);

    setTotals({
      companies: cRes.status === 'fulfilled' ? getCount(cRes.value) : 0,
      badge_type: btRes.status === 'fulfilled' ? getCount(btRes.value) : 0,
      clear_codes: ccRes.status === 'fulfilled' ? getCount(ccRes.value) : 0,
      badge_status: bsRes.status === 'fulfilled' ? getCount(bsRes.value) : 0,
    });
  };

  useEffect(() => {
    loadTotals();
  }, [id]);

  const fetchListByType = async (type: string) => {
    if (!id) return;
    setLoading(true);
    try {
      if (type === 'companies') {
        const res = await getCompanies(id as string);
        const rows = res?.collection?.map((item: any) => ({
          id: String(item.id),
          name: item.name ?? '',
          description: item.description ?? '',
          address: item.address ?? '',
          city: item.city ?? '',
          state: item.state ?? '',
          zip: item.zip ?? '',
          company_id: item.company_id ?? '',
          organization: item.organization?.name ?? '',
          active: item.active ?? false,
        }))
        setListData(rows ?? []);
      } else if (type === 'badge_type' || type === 'badge_types') {
        const res = await getBadgeType(id as string);
        const rows = res?.collection?.map((item: any) => ({
          id: String(item.id),
          name: item.name ?? '',
          description: item.description ?? '',
          badge_type_id: item.badge_type_id ?? '',
          visitor_type_id: item.visitor_type_id ?? '',
          visitor_type: item.visitor_type?.name ?? '',
          honeywell_id: item.honeywell_id ?? '',
          // visitor_type: item.visitor_type.name,
          active: item.active ?? false,
        }));
        setListData(rows ?? []);
      } else if (type === 'clear_codes') {
        const res = await getClearcodes(id as string);
        const rows = res?.collection?.map((item: any) => ({
          id: String(item.id),
          clearcode_id: item.clearcode_id ?? '',
          description: item.description ?? '',
          honeywell_id: item.honeywell_id ?? '',
          access_control: item.access_control?.name ?? '',
          active: item.active ?? false,
        }))
        setListData(rows ?? []);
      } else if (type === 'badge_status') {
        const res = await getBadgeStatus(id as string);
        setListData(res.collection ?? []);
      } else {
        setListData([]);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListByType(selectedType);
  }, [selectedType, id]);

  const [editDialogType, setEditDialogType] = useState<
    'Companies' | 'Badge Type' | 'Clearcodes' | 'Badge Status' | null
  >(null);

  useEffect(() => {
    if (!editingRow) return;

    let type: typeof editDialogType = null;
    if (selectedType === 'companies') type = 'Companies';
    else if (selectedType === 'badge_types') type = 'Badge Type';
    else if (selectedType === 'clear_codes') type = 'Clearcodes';
    else if (selectedType === 'badge_status') type = 'Badge Status';
    setEditDialogType(type);
  }, [selectedType, editingRow]);

  const handleCloseDialog = () => {
    console.log("close");
    setEditDialogType(null);

    setIsBatchEdit(false);
    setEnabled({
      name: true,
      organization_id: true,
      visitor_type_id: true,
      access_control_id: true,
    });
  };

  const headerMap: Record<string, string> = {
    companies: 'Companies',
    badge_type: 'Badge Type',
    clear_codes: 'Clearcodes',
    badge_status: 'Badge Status',
  };

  const TYPE_MAP: Record<string, 'Companies' | 'Badge Type' | 'Clearcodes' | 'Badge Status'> = {
    companies: 'Companies',
    badge_type: 'Badge Type',
    clear_codes: 'Clearcodes',
    badge_status: 'Badge Status',
  };

  useEffect(() => {
    if (!editingRow) return;
    setEditDialogType(TYPE_MAP[selectedType] ?? null);
  }, [selectedType, editingRow]);

  const handleEditRow = async (row: any) => {
    if (!id) return;

    setIsBatchEdit(false);
    setEnabled({
      name: true,
      organization_id: true,
      visitor_type_id: true,
      access_control_id: true,
    });

    setEditingRow(row);
    setEditDialogType(TYPE_MAP[selectedType] ?? null);
    try {
      if (selectedType === 'companies') {
        const res = await getCompaniesById(id as string, String(row.id));
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'badge_type') {
        const res = await getBadgeTypeById(id as string, String(row.id));
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'clear_codes') {
        const res = await getClearcodesById(id as string, String(row.id));

        setDetailData(res.collection ?? row);
      } else if (selectedType === 'badge_status') {
        const res = await getBadgeStatusById(id as string, String(row.id));
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
    if (!editDialogType) {
      setCompanyForm(null);
      setBadgeTypeForm(null);
      setClearCodeForm(null);
      setBadgeStatusForm(null);
      return;
    }

    if (!detailData) return;

    if (editDialogType === 'Companies') {
      setCompanyForm({
        // editable
        name: detailData.name ?? '',
        organization_id: detailData.organization_id ?? '',
        // readonly (opsional)
        address: detailData.address ?? '',
        city: detailData.city ?? '',
        state: detailData.state ?? '',
        zip: detailData.zip ?? '',
        description: detailData.description ?? '',
        company_id: detailData.company_id ?? '',
        honeywell_id: detailData.honeywell_id ?? '',
        id: detailData.id ?? '',
      });
      // pastikan form lain di-reset
      setBadgeTypeForm(null);
    } else if (editDialogType === 'Badge Type') {
      setBadgeTypeForm({
        // editable
        name: detailData.name ?? '',
        visitor_type_id: detailData.visitor_type?.id ?? detailData.visitor_type_id ?? '',
        // readonly (opsional)
        description: detailData.description ?? '',
        badge_type_id: detailData.badge_type_id ?? '',
        honeywell_id: detailData.honeywell_id ?? '',
        id: detailData.id ?? '',
      });
      setCompanyForm(null);
    } else if (editDialogType === 'Clearcodes') {
      setClearCodeForm({
        // editable
        name: detailData.name ?? '',
        // access_control_id: detailData.access_control_id ?? '',
        access_control_id:
          detailData.access_control?.id ??
          detailData.access_control_id ??
          '',

        description: detailData.description ?? '',
        clearcode_id: detailData.clearcode_id ?? '',
        honeywell_id: detailData.honeywell_id ?? '',
        id: detailData.id ?? '',
      });
    } else if (editDialogType === 'Badge Status') {
      setBadgeStatusForm({
        // editable
        name: detailData.name ?? '',
        description: detailData.description ?? '',
        badge_status_id: detailData.badge_status_id ?? '',
        honeywell_id: detailData.honeywell_id ?? '',
        id: detailData.id ?? '',
      });
    } else {
      setCompanyForm(null);
      setBadgeTypeForm(null);
      setClearCodeForm(null);
    }
  }, [editDialogType, detailData]);

  useEffect(() => {


    let cancelled = false;

    const loadOptions = async () => {
      try {
        if (editDialogType === 'Companies') {
          // Load organizations
          const res = await getAllOrganizations();
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((o: any) => ({
              id: String(o.id),
              label: o.name ?? '',
            })) || [];

          setOrgOptions(items);
          // reset yang lain agar nggak nyangkut
          setVisitorTypeOptions([]);
        } else if (editDialogType === 'Badge Type') {
          // Load visitor types
          const res = await getAllVisitorType();
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((v: any) => ({
              id: String(v.id),
              label: v.name ?? v.description ?? String(v.id),
            })) || [];

          setVisitorTypeOptions(items);
          setOrgOptions([]);
        } else if (editDialogType === 'Clearcodes') {
          // Load visitor types
          const res = await getAllAccessControl();
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((v: any) => ({
              id: String(v.id),
              label: v.name ?? v.description ?? String(v.id),
            })) || [];


          setAccessControlOptions(items ?? []);

          setOrgOptions([]);
        } else {
          setOrgOptions([]);
          setVisitorTypeOptions([]);
        }
      } catch (e) {
        console.error('Load options error:', e);
        if (editDialogType === 'Companies') {
          setOrgOptions([]);
        } else if (editDialogType === 'Badge Type') {
          setVisitorTypeOptions([]);
        } else if (editDialogType === 'Clearcodes') {
          setAccessControlOptions([]);
        } else {
          setOrgOptions([]);
          setVisitorTypeOptions([]);
          setAccessControlOptions([]);
        }
      }
    };

    loadOptions();
    return () => { };
  }, [editDialogType]);

  const omitEmpty = <T extends Record<string, any>>(obj: T) =>
    Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined),
    );

  const handleSaveCompany = async () => {
    if (!companyForm) return;

    try {
      setSaving(true);

      if (!isBatchEdit) {
        const companyId = String(companyForm.id ?? detailData?.id ?? '');
        if (!companyId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // const payload = omitEmpty({
        //   name: companyForm.name?.trim(),
        //   organization_id: companyForm.organization_id
        //     ? String(companyForm.organization_id).trim()
        //     : undefined,
        // });
        const payload: any = {
          name: companyForm.name?.trim() || null,
          organization_id: companyForm.organization_id
            ? String(companyForm.organization_id).trim()
            : null,
        };
        await updateCompany(companyId, payload);
        await fetchListByType(selectedType);
        setListData((prev) =>
          prev.map((it) => (String(it.id) === companyId ? { ...it, ...payload } : it)),
        );

        showSwal('success', 'Company updated successfully');
        setTimeout(() => {
          handleCloseDialog();
        }, 600);
        return;
      }

      // === BATCH EDIT ===
      const payload = omitEmpty({
        ...(enabled.name ? { name: companyForm.name?.trim() } : {}),
        ...(enabled.organization_id
          ? {
            organization_id: companyForm.organization_id
              ? String(companyForm.organization_id).trim()
              : undefined,
          }
          : {}),
      });

      if (!Object.keys(payload).length) {
        showSwal('error', 'Turn on at least one toggle (Name/Organization) to save.');
        return;
      }

      const ids = selectedRows.map((r) => String(r.id));
      await Promise.all(ids.map((id) => updateCompany(id, payload)));
      await fetchListByType(selectedType);

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      showSwal('success', `Updated ${ids.length} companies.`);
      setTimeout(() => {
        handleCloseDialog();
      }, 600);
      return;
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBadgeType = async () => {
    if (!badgeTypeForm) return;
    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const btId = String(badgeTypeForm.id ?? '');
        if (!btId) {
          // console.error('❌ badgeTypeForm.id is missing');
          return;
        }

        const payload: UpdateBadgeTypeRequest = omitEmpty({
          name: badgeTypeForm.name?.trim(),
          visitor_type_id: badgeTypeForm.visitor_type_id
            ? String(badgeTypeForm.visitor_type_id).trim()
            : undefined,
        });

        await updateBadgeType(btId, payload);
        setListData((prev) =>
          prev.map((it) => (String(it.id) === btId ? { ...it, ...payload } : it)),
        );
        await fetchListByType(selectedType);
        showSwal('success', 'Badge type updated successfully');

        handleCloseDialog();
        return;
      }

      // === BATCH EDIT ===
      const payload: UpdateBadgeTypeRequest = omitEmpty({
        ...(enabled.name ? { name: badgeTypeForm.name?.trim() } : {}),
        ...(enabled.visitor_type_id
          ? {
            visitor_type_id: badgeTypeForm.visitor_type_id
              ? String(badgeTypeForm.visitor_type_id).trim()
              : undefined,
          }
          : {}),
      });

      if (!Object.keys(payload).length) {
        return;
      }

      const ids = selectedRows.map((r) => String(r.id));
      await Promise.all(ids.map((id) => updateBadgeType(id, payload)));
      await fetchListByType(selectedType);
      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      showSwal('success', `Updated ${ids.length} badge types.`);
      handleCloseDialog();
    } catch (err: any) {
      showSwal('error', err?.response?.data?.msg || 'Failed to update badge type');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClearCode = async () => {
    if (!clearCodeForm) return;
    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const ccId = String(clearCodeForm.id ?? '');
        if (!ccId) {
          console.error('❌ clearCodeForm.id is missing');
          return;
        }

        const payload: UpdateClearcodesRequest = omitEmpty({
          name: clearCodeForm.name?.trim(),
          access_control_id: clearCodeForm.access_control_id
            ? String(clearCodeForm.access_control_id).trim()
            : undefined,
        });

        await updateClearcodes(ccId, payload);
        setListData((prev) =>
          prev.map((it) => (String(it.id) === ccId ? { ...it, ...payload } : it)),
        );
        await fetchListByType(selectedType);
        // setSyncMsg({ open: true, text: 'Clear code updated successfully', severity: 'success' });
        showSwal('success', 'Clear code updated successfully');
        setTimeout(() => {
          handleCloseDialog();
        }, 600);
        return;
      }

      const payload: UpdateClearcodesRequest = omitEmpty({
        ...(enabled.name ? { name: clearCodeForm.name?.trim() } : {}),
        ...(enabled.access_control_id
          ? {
            access_control_id: clearCodeForm.access_control_id
              ? String(clearCodeForm.access_control_id).trim()
              : undefined,
          }
          : {}),
      });

      if (!Object.keys(payload).length) {
        showSwal('error', 'Turn on at least one toggle (Name/Access Control) to save.');
        return;
      }

      const ids = selectedRows.map((r) => String(r.id));
      await Promise.all(ids.map((id) => updateClearcodes(id, payload)));
      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );
      await fetchListByType(selectedType);
      // setSyncMsg({ open: true, text: `Updated ${ids.length} clear codes.`, severity: 'success' });
      showSwal('success', `Updated ${ids.length} clear codes.`);
      handleCloseDialog();
      return;
    } catch (err) {
      console.error('Save clear code error:', err);
      // setSyncMsg({ open: true, text: 'Failed to update clear code', severity: 'error' });
      showSwal('error', 'Failed to update clear code');
    } finally {
      setSaving(false);
    }
  };

  const handleBooleanSwitchChange = async (rowId: string, field: string, value: boolean) => {

    const prev = listData;

    setListData((p) =>
      p.map((it) => (String(it.id) === String(rowId) ? { ...it, [field]: value } : it)),
    );

    try {
      const payload: any = { [field]: value };
      if (selectedType === 'companies')
        await updateCompany(String(rowId), payload);
      else if (selectedType === 'badge_type' || selectedType === 'badge_types')
        await updateBadgeType(String(rowId), payload as any);
      else if (selectedType === 'clear_codes')
        await updateClearcodes(String(rowId), payload as any);
      else if (selectedType === 'badge_status') {
        showSwal('error', 'Failed to update badge status');
        setListData(prev);
        return;
      }

      // setSyncMsg({ open: true, text: 'Status diperbarui.', severity: 'success' });
      showSwal('success', 'Status diperbarui.');
    } catch (e: any) {
      setListData(prev);
      showSwal('error', e?.response?.data?.msg || 'Failed to update status.');
    }
  };

  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const handleEditBatch = () => {
    if (!selectedRows.length) {
      showSwal('error', 'Select at least one row.');
      return;
    }

    setIsBatchEdit(true);
    setEditingRow(null);
    setDetailData(null);
    setEditDialogType(TYPE_MAP[selectedType] ?? null);

    if (selectedType === 'companies') {
      setCompanyForm({
        name: '',
        organization_id: '',
      });
      setBadgeTypeForm(null);
      setClearCodeForm(null);
    } else if (selectedType === 'badge_type' || selectedType === 'badge_types') {
      setBadgeTypeForm({
        name: '',
        visitor_type_id: '',
      });
      setCompanyForm(null);
      setClearCodeForm(null);
    } else if (selectedType === 'clear_codes') {
      setClearCodeForm({
        name: '',
        access_control_id: '',
      });
      setCompanyForm(null);
      setBadgeTypeForm(null);
    } else {
      setIsBatchEdit(false);
      setEditDialogType(null);
    }
  };

  useEffect(() => {
    setEnabled({
      name: isBatchEdit ? false : true,
      organization_id: isBatchEdit ? false : true,
      visitor_type_id: isBatchEdit ? false : true,
      access_control_id: isBatchEdit ? false : true,
    });
  }, [isBatchEdit, editDialogType]);

  const [openAddBadge, setOpenAddBadge] = useState(false);

  const handleConfirmImportBadge = async () => {
    try {
      const selectedData = dataSyncBadge.filter((badge) => selectedBadges.includes(badge.BadgeID));

      if (selectedData.length === 0) {
        showSwal('error', 'Please select at least one badge.');
        return;
      }

      const payload = {
        data: selectedData.map((badge) => ({
          BadgeID: badge.BadgeID,
          LastName: badge.LastName,
          FirstName: badge.FirstName,
          MiddleName: badge.MiddleName,
          IssueDate: badge.IssueDate,
          ExpireDate: badge.ExpireDate,
          RowVersion: badge.RowVersion,
          Email: badge.Email,
          CellPhone: badge.CellPhone,
          BadgeType: {
            badgeTypeID: badge.BadgeType?.badgeTypeID,
            description: badge.BadgeType?.description || '',
          },
        })),
      };

      await addBadgeEmployee(id as string, payload);

      showSwal('success', 'Selected badges imported successfully');

      setOpenSyncDialog(false);
      setDataSyncBadge([]);
      setSelectedBadges([]);

      loadTotals();
      fetchListByType(selectedType);
    } catch (error) {
      showSwal('error', 'Failed importing badges');
    }
  };

  const handleCheckConnection = async () => {
    setCheckingConnection(true);

    try {
      const res = await checkConnection(id);

      if (res.status === 'success') {
        showSwal('success', res.msg || 'Connected');
      } else {
        showSwal('error', res.msg || 'Not connected');
      }
    } catch (e: any) {
      showSwal('error', e?.response?.data?.msg || 'Failed to check connection');
    } finally {
      setCheckingConnection(false);
    }
  };
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBadges(dataSyncBadge.map((b) => b.BadgeID));
    } else {
      setSelectedBadges([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedBadges((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const [searchInput, setSearchInput] = useState('');

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback((keyword: string) => {
    // setPage(0);
    setSearchInput(keyword);
    setSearchKeyword(keyword);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchKeyword) return listData;

    const keyword = searchKeyword.toLowerCase();

    return listData.filter((item) => {
      return Object.values(item).some((val) => String(val).toLowerCase().includes(keyword));
    });
  }, [listData, searchKeyword]);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/manage/integration');
  };

  return (
    <>
      <PageContainer title="Integration Detail" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3} flexWrap={'wrap'}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 2 }} />
            </Grid>
            <Grid container mt={1} size={{ xs: 12, lg: 12 }}>
              <Grid size={{ xs: 12, lg: 12 }}>
                <DynamicTable
                  loading={loading}
                  isHavePagination={false}
                  rowsPerPageOptions={[10, 50, 100]}
                  overflowX={'auto'}
                  data={filteredData}
                  selectedRows={selectedRows}
                  isHaveBack={true}
                  onBack={handleBack}
                  isHaveChecked={true}
                  isHaveAction={false}
                  isHaveActionOnlyEdit={true}
                  isSelectedType={selectedType !== 'badge_status'}
                  isHaveSearch={true}
                  isHaveFilter={false}
                  isHaveExportPdf={false}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={false}
                  // isHaveAddData={selectedType === 'badge_type' || selectedType === 'badge_types'}
                  onAddData={() => setOpenAddBadge(true)}
                  isHaveConnection={true}
                  onCheckConnection={handleCheckConnection}
                  isHaveBooleanSwitch={true}
                  onBatchEdit={handleEditBatch}
                  onBooleanSwitchChange={handleBooleanSwitchChange}
                  isHaveHeader={true}
                  headerContent={{
                    items: Object.keys(headerMap).map((key) => ({
                      name: key,
                      label: headerMap[key],
                    })),
                  }}
                  defaultSelectedHeaderItem="companies"
                  onHeaderItemClick={(item) => {
                    setSelectedType(item.name);
                  }}
                  onCheckedChange={(selected) => {
                    setSelectedRows(selected);
                  }}
                  onEdit={handleEditRow}
                  // onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                  onSearchKeywordChange={handleSearchKeywordChange}
                  searchKeyword={searchInput}
                  onSearch={handleSearch}
                  onFilterByColumn={(column) => {
                    setSortColumn(column.column);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>

      <AddBadgeDialog
        open={openAddBadge}
        onClose={() => setOpenAddBadge(false)}
        onSubmit={handleConfirmImportBadge}
      />
      {/* Edit Companies */}
      <EditCompanyDialog
        open={editDialogType === "Companies"}
        saving={saving}
        isBatchEdit={isBatchEdit}
        companyForm={companyForm}
        setCompanyForm={setCompanyForm}
        enabled={enabled}
        setEnabled={setEnabled}
        orgOptions={orgOptions}
        onClose={handleCloseDialog}
        onSubmit={handleSaveCompany}
        onExited={() => {
          setCompanyForm(null);
          setBadgeTypeForm(null);
          setClearCodeForm(null);
          setBadgeStatusForm(null);
          setDetailData(null);
          setEditingRow(null);
        }}
      />

      {/* Edit Badge Type */}
      <EditBadgeTypeDialog
        open={editDialogType === "Badge Type"}
        saving={saving}
        isBatchEdit={isBatchEdit}
        badgeTypeForm={badgeTypeForm}
        setBadgeTypeForm={setBadgeTypeForm}
        enabled={enabled}
        setEnabled={setEnabled}
        visitorTypeOptions={visitorTypeOptions}
        onClose={handleCloseDialog}
        onSubmit={handleSaveBadgeType}
        onExited={() => {
          setCompanyForm(null);
          setBadgeTypeForm(null);
          setClearCodeForm(null);
          setBadgeStatusForm(null);
          setDetailData(null);
          setEditingRow(null);
        }}
      />

      {/* Edit Clear Codes */}
      <EditClearCodeDialog
        open={editDialogType === "Clearcodes"}
        saving={saving}
        isBatchEdit={isBatchEdit}
        clearCodeForm={clearCodeForm}
        setClearCodeForm={setClearCodeForm}
        enabled={enabled}
        setEnabled={setEnabled}
        accessControlOptions={accessControlOptions}
        onClose={handleCloseDialog}
        onSubmit={handleSaveClearCode}
        onExited={() => {
          setCompanyForm(null);
          setBadgeTypeForm(null);
          setClearCodeForm(null);
          setBadgeStatusForm(null);
          setDetailData(null);
          setEditingRow(null);
        }}
      />

      <SyncBadgeDialog
        open={openSyncDialog}
        onClose={() => setOpenSyncDialog(false)}
        data={dataSyncBadge}
        selected={selectedBadges}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onConfirm={handleConfirmImportBadge}
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

      <GlobalBackdropLoading open={syncing || saving || checkingConnection} />
    </>
  );
};

export default Honeywell;
