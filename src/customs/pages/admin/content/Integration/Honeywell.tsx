import { useEffect, useState, useRef } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { showSwal } from 'src/customs/components/alerts/alerts';

const Honeywell = ({ id }: { id: string }) => {
  // const { id } = useParams();
  const { token } = useSession();
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedType, setSelectedType] = useState('companies');
  const [openFormType, setOpenFormType] = useState<
    'Companies' | 'Badge Type' | 'Clearcodes' | 'Badge Status' | null
  >(null);

  const [editingRow, setEditingRow] = useState<Item | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Data for type
  const [listData, setListData] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [orgOptions, setOrgOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [companyForm, setCompanyForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [badgeTypeForm, setBadgeTypeForm] = useState<any>(null);
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
    if (!id || !token) {
      setSyncMsg({ open: true, text: 'Session habis / ID tidak valid.', severity: 'error' });
      return;
    }

    try {
      setSyncing(true);
      const res = await syncHoneywellIntegration(id as string, token as string);
      setSyncing(false); // tutup spinner SEGERA

      if (res.status !== 'success') {
        setSyncMsg({
          open: true,
          text: res.msg || 'Sinkronisasi gagal.',
          severity: 'error',
        });

        if (res.status_code === 404 && /not connected/i.test(res.msg || '')) {
          // kasus khusus kalau mau di-handle
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

  const cards = [
    {
      title: 'Companies',
      subTitle: totals.companies.toString(),
      subTitleSetting: totals.companies,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Badge Type',
      subTitle: totals.badge_type.toString(),
      subTitleSetting: totals.badge_type,
      icon: IconUsersGroup,
      color: 'none',
    },
    {
      title: 'Clearcodes',
      subTitle: totals.clear_codes.toString(),
      subTitleSetting: totals.clear_codes,
      icon: IconCode,
      color: 'none',
    },
    {
      title: 'Badge Status',
      subTitle: totals.badge_status.toString(),
      subTitleSetting: totals.badge_status,
      icon: IconAccessPoint,
      color: 'none',
    },
    {
      title: 'Sync Data',
      subTitle: '',
      subTitleSetting: 10,
      icon: IconRefresh,
      color: 'none',
      onIconClick: handleSyncIntegration,
    },
  ];

  // helper: aman ambil total dari response
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

  // muat total untuk semua kategori
  const loadTotals = async () => {
    if (!token || !id) return;

    const [cRes, btRes, ccRes, bsRes] = await Promise.allSettled([
      getCompanies(id as string, token),
      getBadgeType(id as string, token),
      getClearcodes(id as string, token),
      getBadgeStatus(id as string, token),
    ]);

    setTotals({
      companies: cRes.status === 'fulfilled' ? getCount(cRes.value) : 0,
      badge_type: btRes.status === 'fulfilled' ? getCount(btRes.value) : 0,
      clear_codes: ccRes.status === 'fulfilled' ? getCount(ccRes.value) : 0,
      badge_status: bsRes.status === 'fulfilled' ? getCount(bsRes.value) : 0,
    });

    // // (opsional) logging biar tau mana yang error
    // if (cRes.status === 'rejected') console.warn('getCompanies failed:', cRes.reason);
    // if (btRes.status === 'rejected') console.warn('getBadgeType failed:', btRes.reason);
    // if (ccRes.status === 'rejected') console.warn('getClearcodes failed:', ccRes.reason);
    // if (bsRes.status === 'rejected') console.warn('getBadgeStatus failed:', bsRes.reason);
  };

  // panggil sekali saat token/id siap
  useEffect(() => {
    loadTotals();
  }, [id, token]);

  const fetchListByType = async (type: string) => {
    if (!token || !id) return;
    setLoading(true);
    try {
      if (type === 'companies') {
        const res = await getCompanies(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'badge_type' || type === 'badge_types') {
        const res = await getBadgeType(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'clear_codes') {
        const res = await getClearcodes(id as string, token);
        setListData(res.collection ?? []);
      } else if (type === 'badge_status') {
        const res = await getBadgeStatus(id as string, token);
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

  const [editDialogType, setEditDialogType] = useState<
    'Companies' | 'Badge Type' | 'Clearcodes' | 'Badge Status' | null
  >(null);

  useEffect(() => {
    if (!editingRow) return; // jangan set kalau belum pilih row untuk edit

    let type: typeof editDialogType = null;
    if (selectedType === 'companies') type = 'Companies';
    else if (selectedType === 'badge_types') type = 'Badge Type';
    else if (selectedType === 'clear_codes') type = 'Clearcodes';
    else if (selectedType === 'badge_status') type = 'Badge Status';
    setEditDialogType(type);
  }, [selectedType, editingRow]);

  const handleCloseDialog = () => {
    setIsBatchEdit(false);
    setEnabled({
      name: true,
      organization_id: true,
      visitor_type_id: true,
      access_control_id: true,
    });
    setEditDialogType(null);
    setEditingRow(null);
    setOpenFormType(null);
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
    if (!token || !id) return;

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
        const res = await getCompaniesById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'badge_type') {
        const res = await getBadgeTypeById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'clear_codes') {
        const res = await getClearcodesById(id as string, String(row.id), token);
        setDetailData(res.collection ?? row);
      } else if (selectedType === 'badge_status') {
        // belum ada API by id → pakai row dulu
        const res = await getBadgeStatusById(id as string, String(row.id), token);
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
        visitor_type_id: detailData.visitor_type_id ?? '',
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
        access_control_id: detailData.access_control_id ?? '',

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
    if (!token) return;

    let cancelled = false;

    const loadOptions = async () => {
      try {
        if (editDialogType === 'Companies') {
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
          setVisitorTypeOptions([]);
        } else if (editDialogType === 'Badge Type') {
          // Load visitor types
          const res = await getAllVisitorType(token);
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
          const res = await getAllAccessControl(token);
          if (cancelled) return;

          const items =
            (res.collection ?? []).map((v: any) => ({
              id: String(v.id),
              label: v.name ?? v.description ?? String(v.id),
            })) || [];

          setAccessControlOptions(items);
          setOrgOptions([]);
        } else {
          // Dialog lain (atau ditutup)
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
    return () => {};
  }, [editDialogType, token]);

  const omitEmpty = <T extends Record<string, any>>(obj: T) =>
    Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined),
    );

  const handleSaveCompany = async () => {
    if (!companyForm) return;

    try {
      setSaving(true);

      // === SINGLE EDIT ===
      if (!isBatchEdit) {
        const companyId = String(companyForm.id ?? detailData?.id ?? '');
        if (!companyId) {
          setSyncMsg({ open: true, text: 'ID tidak ditemukan.', severity: 'error' });
          return;
        }

        // Kirim dua field (trim) — kosong tidak ikut dikirim agar tidak mengosongkan server
        const payload = omitEmpty({
          name: companyForm.name?.trim(),
          organization_id: companyForm.organization_id
            ? String(companyForm.organization_id).trim()
            : undefined,
        });

        await updateCompany(companyId, payload, token as string);

        setListData((prev) =>
          prev.map((it) => (String(it.id) === companyId ? { ...it, ...payload } : it)),
        );

        // setSyncMsg({ open: true, text: 'Company updated successfully', severity: 'success' });
        showSwal('success', 'Company updated successfully');
        setTimeout(() => {
          handleCloseDialog();
        }, 600);
        return;
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
        // setSyncMsg({
        //   open: true,
        //   text: 'Nyalakan minimal satu toggle (Name/Organization) untuk disimpan.',
        //   severity: 'error',
        // });
        showSwal('error', 'Turn on at least one toggle (Name/Organization) to save.');
        return;
      }

      const ids = selectedRows.map((r) => String(r.id));
      await Promise.all(ids.map((id) => updateCompany(id, payload, token as string)));

      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      // setSyncMsg({
      //   open: true,
      //   text: `Updated ${ids.length} companies.`,
      //   severity: 'success',
      // });
      showSwal('success', `Updated ${ids.length} companies.`);
      setTimeout(() => {
        handleCloseDialog();
      }, 600);
      return;
    } catch (err: any) {
      // setSyncMsg({
      //   open: true,
      //   text: err?.response?.data?.msg || 'Failed to update company',
      //   severity: 'error',
      // });
      showSwal('error', err?.response?.data?.msg || 'Failed to update company');
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 800);
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

        await updateBadgeType(btId, payload, token as string);
        setListData((prev) =>
          prev.map((it) => (String(it.id) === btId ? { ...it, ...payload } : it)),
        );
        // setSyncMsg({ open: true, text: 'Badge type updated successfully', severity: 'success' });
        showSwal('success', 'Badge type updated successfully');

        setTimeout(() => {
          handleCloseDialog();
        }, 600);
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
        setSyncMsg({
          open: true,
          text: 'Nyalakan minimal satu toggle (Name/Visitor Type) untuk disimpan.',
          severity: 'error',
        });
        return;
      }

      const ids = selectedRows.map((r) => String(r.id));
      await Promise.all(ids.map((id) => updateBadgeType(id, payload, token as string)));
      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );

      showSwal('success', `Updated ${ids.length} badge types.`);
      // setSyncMsg({ open: true, text: `Updated ${ids.length} badge types.`, severity: 'success' });
      setTimeout(() => {
        handleCloseDialog();
      }, 600);
    } catch (err) {
      // console.error('Save badge type error:', err);
      // setSyncMsg({ open: true, text: 'Failed to update badge type', severity: 'error' });
      showSwal('error', 'Failed to update badge type');
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 800);
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

        await updateClearcodes(ccId, payload, token as string);
        setListData((prev) =>
          prev.map((it) => (String(it.id) === ccId ? { ...it, ...payload } : it)),
        );
        // setSyncMsg({ open: true, text: 'Clear code updated successfully', severity: 'success' });
        showSwal('success', 'Clear code updated successfully');
        setTimeout(() => {
          handleCloseDialog();
        }, 600);
        return;
        return;
      }

      // === BATCH EDIT ===
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
        // setSyncMsg({
        //   open: true,
        //   text: 'Nyalakan minimal satu toggle (Name/Access Control) untuk disimpan.',
        //   severity: 'error',
        // });
        showSwal('error', 'Turn on at least one toggle (Name/Access Control) to save.');
        return;
      }

      const ids = selectedRows.map((r) => String(r.id));
      await Promise.all(ids.map((id) => updateClearcodes(id, payload, token as string)));
      setListData((prev) =>
        prev.map((it) => (ids.includes(String(it.id)) ? { ...it, ...payload } : it)),
      );
      // setSyncMsg({ open: true, text: `Updated ${ids.length} clear codes.`, severity: 'success' });
      showSwal('success', `Updated ${ids.length} clear codes.`);
      setTimeout(() => {
        handleCloseDialog();
      }, 600);
      return;
    } catch (err) {
      console.error('Save clear code error:', err);
      // setSyncMsg({ open: true, text: 'Failed to update clear code', severity: 'error' });
      showSwal('error', 'Failed to update clear code');
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  };

  const handleBooleanSwitchChange = async (rowId: string, field: string, value: boolean) => {
    if (!token) {
      setSyncMsg({ open: true, text: 'Session habis.', severity: 'error' });
      return;
    }
    const prev = listData;

    setListData((p) =>
      p.map((it) => (String(it.id) === String(rowId) ? { ...it, [field]: value } : it)),
    );

    try {
      const payload: any = { [field]: value };
      if (selectedType === 'companies')
        await updateCompany(String(rowId), payload, token as string);
      else if (selectedType === 'badge_type' || selectedType === 'badge_types')
        await updateBadgeType(String(rowId), payload as any, token as string);
      else if (selectedType === 'clear_codes')
        await updateClearcodes(String(rowId), payload as any, token as string);
      else if (selectedType === 'badge_status') {
        // setSyncMsg({ open: true, text: 'Update Badge Status belum didukung.', severity: 'error' });
        showSwal('error', 'Failed to update badge status');
        setListData(prev);
        return;
      }

      setSyncMsg({ open: true, text: 'Status diperbarui.', severity: 'success' });
    } catch (e: any) {
      console.error(e);
      setListData(prev);
      // setSyncMsg({
      //   open: true,
      //   text: e?.response?.data?.msg || 'Gagal mengubah status.',
      //   severity: 'error',
      // });
      showSwal('error', e?.response?.data?.msg || 'Failed to update status.');
    }
  };

  const [edittingId, setEdittingId] = useState('');
  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const handleEditBatch = () => {
    if (!selectedRows.length) {
      // setSyncMsg({ open: true, text: 'Pilih minimal satu baris.', severity: 'error' });
      showSwal('error', 'Select at least one row.');
      return;
    }

    setIsBatchEdit(true);
    setEditingRow(null); // jangan pakai detail satu item
    setDetailData(null); // kosongkan detail agar effect tidak overwrite form
    setEditDialogType(TYPE_MAP[selectedType] ?? null);

    // Inisialisasi form kosong → hanya field yang diisi user yang akan dikirim
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

  return (
    <>
      <PageContainer title="Integration Detail" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3} flexWrap={'wrap'}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 2.4 }} />
            </Grid>
            <Grid container mt={1} size={{ xs: 12, lg: 12 }}>
              <Grid size={{ xs: 12, lg: 12 }}>
                {isDataReady ? (
                  <DynamicTable
                    isHavePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    overflowX={'auto'}
                    data={listData}
                    selectedRows={selectedRows}
                    isHaveChecked={true}
                    isHaveAction={false}
                    isHaveActionOnlyEdit={true}
                    isSelectedType={selectedType !== 'badge_status'}
                    isHaveSearch={true}
                    isHaveFilter={false}
                    isHaveExportPdf={false}
                    isHaveExportXlf={false}
                    isHaveFilterDuration={false}
                    isHaveAddData={false}
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
                    onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                    onFilterByColumn={(column) => {
                      setSortColumn(column.column);
                    }}
                  />
                ) : (
                  <Card sx={{ width: '100%' }}>
                    <Skeleton />
                    <Skeleton animation="wave" />
                    <Skeleton animation={false} />
                  </Card>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>

      {/* Edit Companies */}
      <Dialog
        open={editDialogType === 'Companies'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Company
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
          {!companyForm ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                py: 4,
              }}
            >
              <CircularProgress size={36} thickness={4} />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                    Name
                  </CustomFormLabel>

                  {/* Toggle hanya muncul saat batch */}
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.name}
                          onChange={(e) => setEnabled((p) => ({ ...p, name: e.target.checked }))}
                        />
                      }
                      label=""
                    />
                  )}
                </Box>

                <CustomTextField
                  id="name"
                  value={companyForm?.name ?? ''}
                  onChange={(e: any) =>
                    setCompanyForm((p: any) => ({ ...p, name: e.target.value }))
                  }
                  fullWidth
                  // single: aktif, batch: tergantung toggle
                  disabled={isBatchEdit ? !enabled.name || saving : saving}
                />
              </Box>

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
                    orgOptions.find((o) => o.id === String(companyForm?.organization_id ?? '')) ||
                    null
                  }
                  onChange={(_, newVal) =>
                    setCompanyForm((p: any) => ({ ...p, organization_id: newVal ? newVal.id : '' }))
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

              {/* === Readonly info (opsional) === */}
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Address</CustomFormLabel>
                <CustomTextField value={companyForm.address} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>City</CustomFormLabel>
                <CustomTextField value={companyForm.city} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>State</CustomFormLabel>
                <CustomTextField value={companyForm.state} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>ZIP</CustomFormLabel>
                <CustomTextField value={companyForm.zip} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Description</CustomFormLabel>
                <CustomTextField value={companyForm.description} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Company ID</CustomFormLabel>
                <CustomTextField value={companyForm.company_id} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Honeywell ID</CustomFormLabel>
                <CustomTextField value={companyForm.honeywell_id} fullWidth disabled />
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
            disabled={!companyForm || saving}
            onClick={handleSaveCompany}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Badge Type */}
      <Dialog
        open={editDialogType === 'Badge Type'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Badge Type
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
          {!badgeTypeForm ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                py: 4,
              }}
            >
              <CircularProgress size={36} thickness={4} />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* === Editable === */}
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="bt_name" sx={{ mt: 0 }}>
                    Name
                  </CustomFormLabel>
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.name}
                          onChange={(e) => setEnabled((p) => ({ ...p, name: e.target.checked }))}
                        />
                      }
                      label=""
                    />
                  )}
                </Box>

                <CustomTextField
                  id="bt_name"
                  value={badgeTypeForm.name}
                  onChange={(e: any) =>
                    setBadgeTypeForm((p: any) => ({ ...p, name: e.target.value }))
                  }
                  fullWidth
                  disabled={isBatchEdit ? !enabled.name || saving : saving}
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
                  options={visitorTypeOptions}
                  value={
                    visitorTypeOptions.find(
                      (o) => o.id === String(badgeTypeForm.visitor_type_id ?? ''),
                    ) || null
                  }
                  onChange={(_, newVal) =>
                    setBadgeTypeForm((p: any) => ({
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
                />
              </Box>

              {/* === Readonly (opsional ditampilkan) === */}
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Description</CustomFormLabel>
                <CustomTextField value={badgeTypeForm.description} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Badge Type ID</CustomFormLabel>
                <CustomTextField value={badgeTypeForm.badge_type_id} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Honeywell ID</CustomFormLabel>
                <CustomTextField value={badgeTypeForm.honeywell_id} fullWidth disabled />
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
            disabled={!badgeTypeForm || saving}
            onClick={handleSaveBadgeType}
          >
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Clear Codes */}
      <Dialog
        open={editDialogType === 'Clearcodes'}
        fullWidth
        maxWidth="md"
        onClose={handleCloseDialog}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Edit Clear Codes
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
          {!clearCodeForm ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                py: 4,
              }}
            >
              <CircularProgress size={36} thickness={4} />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* === Editable === */}
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CustomFormLabel htmlFor="cc_name" sx={{ mt: 0 }}>
                    Name
                  </CustomFormLabel>
                  {isBatchEdit && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={enabled.name}
                          onChange={(e) => setEnabled((p) => ({ ...p, name: e.target.checked }))}
                        />
                      }
                      label=""
                    />
                  )}
                </Box>

                <CustomTextField
                  id="cc_name"
                  value={clearCodeForm.name}
                  onChange={(e: any) =>
                    setClearCodeForm((p: any) => ({ ...p, name: e.target.value }))
                  }
                  fullWidth
                  disabled={isBatchEdit ? !enabled.name || saving : saving}
                />
              </Box>

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
                  options={accessControlOptions}
                  value={
                    accessControlOptions.find(
                      (o) => o.id === String(clearCodeForm.access_control_id ?? ''),
                    ) || null
                  }
                  onChange={(_, newVal) =>
                    setClearCodeForm((p: any) => ({
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
                />
              </Box>

              {/* === Readonly (opsional) === */}
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Description</CustomFormLabel>
                <CustomTextField value={clearCodeForm.description} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Clearcode ID</CustomFormLabel>
                <CustomTextField value={clearCodeForm.clearcode_id} fullWidth disabled />
              </Box>
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Honeywell ID</CustomFormLabel>
                <CustomTextField value={clearCodeForm.honeywell_id} fullWidth disabled />
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
            disabled={!clearCodeForm || saving}
            onClick={handleSaveClearCode}
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

export default Honeywell;
