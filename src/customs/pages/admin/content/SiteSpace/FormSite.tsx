import {
  Button,
  Grid2 as Grid,
  Alert,
  Typography,
  CircularProgress,
  FormControlLabel,
  TextField,
  Switch,
  Paper,
  Button as MuiButton,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Backdrop,
  TableContainer,
  Tooltip,
  IconButton,
  Autocomplete,
} from '@mui/material';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import 'react-image-crop/dist/ReactCrop.css';
import { Box } from '@mui/system';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';

import { v4 as uuidv4 } from 'uuid';
import {
  CreateSiteRequest,
  CreateSiteRequestSchema,
  Item,
  TypeApproval,
  Access,
  Parking,
  Tracking,
  UpdateSiteRequestSchema,
} from 'src/customs/api/models/Admin/Sites';
import { IconTrash } from '@tabler/icons-react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import {
  createSite,
  uploadImageSite,
  getAllSite,
  createSiteDocument,
  updateSite,
  getAllSiteDocument,
  getAllAccessControl,
  getSiteById,
  getSiteParking,
  getSiteTracking,
  createSiteParking,
  createSiteTracking,
  updateSiteTracking,
  updateSiteParking,
  getSitesParking,
  getSitesTracking,
  createSiteTrackingBulk,
  createSiteParkingBulk,
  getAllDocument,
  getAllEmployee,
  getSitesAccessById,
} from 'src/customs/api/admin';
import {
  CreateSiteDocumentRequest,
  Item as SiteDocumentItem,
} from 'src/customs/api/models/Admin/SiteDocument';
import { Item as DocumentItem } from 'src/customs/api/models/Admin/Document';
import { Item as AccessControlItem } from 'src/customs/api/models/Admin/AccessControl';
import { BASE_URL } from 'src/customs/api/interceptor';
import { showSwal } from 'src/customs/components/alerts/alerts';
import RenderDragSite from './components/RenderDragSite';
import { useLocation } from 'react-router';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { getAllApprovalWorkflow } from 'src/customs/api/Admin/ApprovalWorkflow';

type EnabledFields = {
  type: boolean;
  approval_workflow_id: boolean;
  timezone: boolean;
  signout_time: boolean;
  need_approval: boolean;
  can_visited: boolean;
  can_signout: boolean;
  auto_signout: boolean;
  can_contactless_login: boolean;
  need_document: boolean;
  is_registered_point: boolean;
};

interface FormSiteProps {
  formData: Item;
  setFormData: React.Dispatch<React.SetStateAction<Item>>;
  editingId?: string;
  onSuccess?: () => void;
  selectedRows?: Item[];
  isBatchEdit?: boolean;
  enabledFields?: EnabledFields;
  setEnabledFields: React.Dispatch<React.SetStateAction<EnabledFields>>;
  employee?: any;
}

const FormSite = ({
  formData,
  setFormData,
  editingId,
  onSuccess,
  isBatchEdit,
  selectedRows = [],
  enabledFields,
  setEnabledFields,
  employee,
}: FormSiteProps) => {
  const { token } = useSession();
  const location = useLocation();
  const segments = location.pathname.split('/');
  const parentRouteId = segments[segments.length - 1] || null;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');

  const [siteTypes, setSiteTypes] = useState<{ label: string; value: number }[]>([
    { label: 'Site', value: 0 },
    { label: 'Building', value: 1 },
    { label: 'Floor', value: 2 },
    { label: 'Room', value: 3 },
  ]);

  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );

  const timezoneOptions = [
    { value: 'Asia/Jakarta', label: '(UTC+07:00) WIB (Waktu Indonesia Barat)' },
    { value: 'Asia/Makassar', label: '(UTC+08:00) WITA (Waktu Indonesia Tengah)' },
    { value: 'Asia/Jayapura', label: '(UTC+09:00) WIT (Waktu Indonesia Timur)' },
  ];
  const [documentlist, setDocumentList] = useState<DocumentItem[]>([]);
  const [filteredSiteDocumentList, setFilteredSiteDocumentList] = useState<SiteDocumentItem[]>([]);
  const [siteDocuments, setSiteDocuments] = useState<CreateSiteDocumentRequest[]>([]);
  const [siteParking, setSiteParking] = useState<Parking[]>([]);
  const [siteTracking, setSiteTracking] = useState<Tracking[]>([]);
  const [newDocumentA, setNewDocumentA] = useState<SiteDocumentItem>({
    id: '',
    site_id: '',
    site_name: '',
    documents: {} as DocumentItem,
    retentionTime: 0,
  });
  const [accessControl, setAccessControl] = useState<AccessControlItem[]>([]);

  const [siteImageFile, setSiteImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [retentionInput, setRetentionInput] = useState('0');
  useEffect(() => {
    setRetentionInput(newDocumentA.retentionTime.toString());
  }, [newDocumentA.retentionTime]);

  const [newDocument, setNewDocument] = useState<CreateSiteDocumentRequest>({
    document_id: '',
    site_id: '',
    retention_time: 0,
  });

  useEffect(() => {
    if (!editingId || !token) return;

    (async () => {
      try {
        const results = await Promise.allSettled([
          // getSiteById(editingId, token),
          getSitesAccessById(token, editingId),
          getSitesParking(token),
          getSitesTracking(token),
        ]);

        const [siteRes, parkingRes, trackingRes] = results;

        // const site = siteRes.status === 'fulfilled' ? siteRes.value.collection?.access : [];
        const site = siteRes.status === 'fulfilled' ? siteRes.value.collection : [];

        const parkingList =
          parkingRes.status === 'fulfilled' ? (parkingRes.value.collection ?? []) : [];

        const trackingList =
          trackingRes.status === 'fulfilled' ? (trackingRes.value.collection ?? []) : [];
        setSiteParking(parkingList);
        setSiteTracking(trackingList);

        const normalizedId = editingId.toLowerCase();

        const filteredParking = parkingList.filter(
          (p: any) => (p.site_id || p.siteId)?.toLowerCase() === normalizedId,
        );

        const filteredTracking = trackingList.filter(
          (t: any) => (t.site_id || t.siteId)?.toLowerCase() === normalizedId,
        );

        const mappedParking = filteredParking.map((p: any, idx: any) => ({
          id: p.id,
          sort: idx,
          site_id: p.site_id,
          prk_area_parking_id: p.prk_area_parking_id ?? p.id,
          name: p.name ?? p.area_name ?? '',
          early_access: p.early_access ?? false,
        }));

        const mappedTracking = filteredTracking.map((t: any, idx: any) => ({
          id: t.id,
          sort: idx,
          site_id: t.site_id,
          trk_ble_card_access_id: t.trk_ble_card_access_id ?? t.id,
          name: t.name ?? t.name ?? '',
          early_access: t.early_access ?? false,
        }));

        setLocalForm((prev) => ({
          ...prev,
          ...site,
          // type: Number(site.type),
          type: site?.type !== undefined ? Number(site.type) : prev.type,
          access: site ?? [],
          parking: mappedParking,
          tracking: mappedTracking,
        }));
      } catch (err) {
        console.error('❌ Unexpected error:', err);
      }
    })();
  }, [editingId, token]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [docRes, accessControlRes, siteParkingRes, siteTrackingRes, siteDocRes] =
          await Promise.allSettled([
            getAllDocument(token),
            getAllAccessControl(token),
            getSiteParking(token),
            getSiteTracking(token),
            getAllSiteDocument(token),
          ]);

        if (docRes.status === 'fulfilled') setDocumentList(docRes.value.collection ?? []);
        if (accessControlRes.status === 'fulfilled')
          setAccessControl(accessControlRes.value.collection);
        if (siteParkingRes.status === 'fulfilled') setSiteParking(siteParkingRes.value.collection);
        if (siteTrackingRes.status === 'fulfilled')
          setSiteTracking(siteTrackingRes.value.collection);

        if (siteDocRes.status === 'fulfilled' && editingId) {
          const filtered = siteDocRes.value.collection.filter(
            (doc: SiteDocumentItem) => doc.site_id === editingId,
          );
          setFilteredSiteDocumentList(filtered);
          setSiteDocuments(
            filtered.map((item) => ({
              site_id: item.site_id,
              document_id: item.id,
              retention_time: item.retentionTime,
            })),
          );
        }
      } catch (error) {
        console.error('Unexpected error during data fetching:', error);
      }
    };

    fetchData();
  }, [token, editingId]);

  const [localForm, setLocalForm] = useState(formData);

  useEffect(() => {
    setLocalForm(formData);
  }, [formData]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const { id, name, value } = e.target as any;
    setLocalForm((prev) => ({
      ...prev,
      [name || id]: value,
    }));
  };

  const normalizeTrackingPayloads = (items: any[], siteId: string) => {
    return {
      data: items.map((t, idx) => ({
        site_id: siteId,
        sort: idx + 1,
        // access_control_id: t.access_control_id,
        trk_ble_card_access_id: t.trk_ble_card_access_id,
        early_access: t.early_access ?? false,
      })),
    };
  };

  const normalizeParkingPayloads = (items: any[], siteId: string) => {
    return {
      data: items.map((p, idx) => ({
        site_id: siteId,
        sort: idx + 1,
        // access_control_id: p.access_control_id,
        prk_area_parking_id: p.prk_area_parking_id,
        early_access: p.early_access ?? false,
      })),
    };
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setLoading(true);
      if (!token) {
        showSwal('error', 'Session expired!');
        return;
      }
      if (isBatchEdit && selectedRows.length > 0) {
        const updatedFields: Partial<CreateSiteRequest> = {};

        Object.entries(enabledFields || {}).forEach(([key, isEnabled]) => {
          if (isEnabled) (updatedFields as any)[key] = (localForm as any)[key];
        });

        if (Object.keys(updatedFields).length === 0) {
          showSwal('error', 'Please enable at least one field to update.');
          setLoading(false);
          return;
        }

        for (const row of selectedRows) {
          await updateSite(row.id, { ...row, ...updatedFields }, token);
        }

        showSwal('success', 'Batch update successful!');
        resetEnabledFields();
        onSuccess?.();
        return;
      }

      if (editingId) {
        const updateData = UpdateSiteRequestSchema.parse(localForm);
        console.log('updateData main', updateData);
        // const updateDataTracking = UpdateSiteTrackingSchema.parse(localForm.tracking || []);
        // console.log('updateData tracking', updateDataTracking);
        // const updateDataParking = UpdateSiteParkingSchema.parse(localForm.parking || []);
        // console.log('updateData parking', updateDataParking);

        // Bersihkan field kosong
        Object.keys(updateData).forEach((key) => {
          const val = (updateData as any)[key];
          if (val === '' || val === null || val === undefined) delete (updateData as any)[key];
        });

        const res = await updateSite(editingId, updateData, token);
        console.log('res', JSON.stringify(res, null, 2));

        // const trackingPayload = normalizeTrackingPayload(localForm.tracking ?? [], editingId);
        // console.log('trackingPayload', trackingPayload);

        // await updateSiteTracking(editingId, trackingPayload, token);
        // const parkingPayload = normalizeTrackingPayload(localForm.parking ?? [], editingId);
        // console.log('parkingPayload', parkingPayload);

        // await updateSiteParking(editingId, parkingPayload, token);

        // for (const t of localForm.tracking ?? []) {
        //   const payload = {
        //     site_id: editingId,
        //     sort: t.sort,
        //     trk_ble_card_access_id: t.trk_ble_card_access_id ?? t.id,
        //     early_access: t.early_access ?? false,
        //   };

        //   if (t.id) {
        //     await updateSiteTracking(t.id, payload, token);
        //   } else {
        //     await createSiteTracking(payload, token);
        //   }
        // }

        await Promise.all(
          (localForm.tracking ?? []).map((t) => {
            const payload = {
              site_id: editingId,
              sort: t.sort,
              trk_ble_card_access_id: t.trk_ble_card_access_id ?? t.id,
              early_access: t.early_access ?? false,
            };

            return t.id
              ? updateSiteTracking(t.id, payload, token)
              : createSiteTracking(payload, token);
          }),
        );

        await Promise.all(
          (localForm.parking ?? []).map((p) => {
            const payload = {
              site_id: editingId,
              sort: p.sort,
              prk_area_parking_id: p.prk_area_parking_id ?? p.id,
              early_access: p.early_access ?? false,
            };

            return p.id
              ? updateSiteParking(p.id, payload, token)
              : createSiteParking(payload, token);
          }),
        );

        // 🔹 Update Parking per item
        // for (const p of localForm.parking ?? []) {
        //   const payload = {
        //     site_id: editingId,
        //     sort: p.sort,
        //     prk_area_parking_id: p.prk_area_parking_id ?? p.id,
        //     early_access: p.early_access ?? false,
        //   };

        //   if (p.id) {
        //     await updateSiteParking(p.id, payload, token);
        //   } else {
        //     await createSiteParking(payload, token);
        //   }
        // }

        handleFileUpload(editingId);

        showSwal('success', 'Site successfully updated!');
      } else {
        const rawId = parentRouteId;

        const isValidParent =
          typeof parentRouteId === 'string' &&
          parentRouteId.trim() !== '' &&
          parentRouteId !== 'site-space' &&
          parentRouteId !== 'create';

        const parentId = isValidParent ? parentRouteId : null;
        let finalFormData = {
          ...localForm,
          parent: parentId ?? null,
          is_child: Boolean(parentId),
          // is_child: !!parentId,
          type: localForm.type ?? 0,
        };
        console.log('finalFormData', finalFormData);
        const createData = CreateSiteRequestSchema.parse(finalFormData);
        console.log('createData', createData);
        const res = await createSite(createData, token);
        const newSiteId = res.collection?.id as string;

        const trackingPayload = normalizeTrackingPayloads(localForm.tracking ?? [], newSiteId);

        if (trackingPayload.data.length > 0) {
          await createSiteTrackingBulk(trackingPayload, token);
        }

        const parkingPayload = normalizeParkingPayloads(localForm.parking ?? [], newSiteId);

        if (parkingPayload.data.length > 0) {
          await createSiteParkingBulk(parkingPayload, token);
        }

        await createSiteDocumentsForNewSite();
        handleFileUpload(newSiteId);

        showSwal('success', 'Site successfully created!');
      }

      onSuccess?.();
    } catch (err: any) {
      if (err?.errors) setErrors(err.errors);
      showSwal('error', err?.message || 'Failed to submit form.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setSiteImageFile(selectedFile);
      console.log('Slected file:', selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleClear = () => {
    setSiteImageFile(null);
    setPreviewUrl(null);
  };

  const handleFileUpload = async (siteId: string) => {
    if (!token || !siteImageFile) return;

    console.log('Uploading image for site:', siteId);

    try {
      await uploadImageSite(siteId, siteImageFile, token);
      console.log('Image upload success');
    } catch (err) {
      console.error('Image upload failed', err);
    }
  };

  const createSiteDocumentsForNewSite = async () => {
    if (!token) return;

    const allSitesRes = await getAllSite(token);
    const newSite = allSitesRes.collection.find(
      (site: any) => site.name === localForm.name && site.description === localForm.description,
    );

    if (!newSite) {
      console.error('New site not found after creation');
      return;
    }
    for (const doc of siteDocuments) {
      const docWithSiteId: CreateSiteDocumentRequest = {
        ...doc,
        site_id: newSite.id,
      };

      try {
        await createSiteDocument(docWithSiteId, token);
      } catch (error) {
        console.error('Error creating site document:', error);
      }
    }
  };

  function formatEnumLabel(label: string) {
    return label.replace(/([A-Z])/g, ' $1').trim();
  }

  const selectedEmployee = employee.find((emp: any) => emp.id === localForm.host) || null;

  const resetEnabledFields = () => {
    setLocalForm((prev) => ({
      ...prev,
      type: 0,
      approval_workflow_id: null,
      timezone: null,
      signout_time: null,
      need_approval: false,
      can_visited: false,
      can_signout: false,
      auto_signout: false,
      can_contactless_login: false,
      need_document: false,
      is_registered_point: false,
    }));
    setEnabledFields({
      type: false,
      approval_workflow_id: false,
      timezone: false,
      signout_time: false,
      need_approval: false,
      can_visited: false,
      can_signout: false,
      auto_signout: false,
      can_contactless_login: false,
      need_document: false,
      is_registered_point: false,
    });
  };

  useEffect(() => {
    if (!siteImageFile && localForm.image) {
      if (
        localForm.image.startsWith('data:image') ||
        localForm.image.startsWith('http') ||
        localForm.image.startsWith('https')
      ) {
        setPreviewUrl(localForm.image);
      } else {
        setPreviewUrl(`${BASE_URL}/cdn${localForm.image}`);
      }
    }
  }, [localForm.image, siteImageFile]);

  const handleDetailChange = (section: string, index: number, field: string, value: any) => {
    setLocalForm((prev) => {
      const arr = Array.isArray(prev[section as keyof typeof localForm])
        ? [...(prev[section as keyof typeof localForm] as any[])]
        : [];
      if (index < 0 || index >= arr.length) return prev;
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: arr };
    });
  };

  const handleDetailDelete = (section: string, index: number) => {
    setLocalForm((prev) => {
      const arr = Array.isArray(prev[section as keyof typeof localForm])
        ? [...(prev[section as keyof typeof localForm] as any[])]
        : [];
      if (index < 0 || index >= arr.length) return prev;
      arr.splice(index, 1);
      return { ...prev, [section]: arr };
    });
  };

  const handleDragEnd = (section: 'access' | 'parking' | 'tracking') => (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = localForm[section] || [];

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items as any, oldIndex, newIndex);

    const updated = reordered.map((item, idx) => ({
      ...(item as any),
      sort: idx + 1,
    }));

    setLocalForm((prev) => ({
      ...prev,
      [section]: updated,
    }));
  };

  const handleAddDetail = (section: 'parking' | 'tracking' | 'access') => {
    let newItem: any = {};

    switch (section) {
      case 'parking':
        newItem = {
          id: uuidv4(),
          sort: localForm.parking?.length ?? 0,
          site_id: '',
          name: '',
          prk_area_parking_id: '',
          early_access: false,
        };
        break;

      case 'tracking':
        newItem = {
          id: uuidv4(),
          sort: localForm.tracking?.length ?? 0,
          trk_ble_card_access_id: '',
          site_id: '',
          name: '',
          early_access: false,
        };
        break;

      case 'access':
      default:
        newItem = {
          id: uuidv4(),
          sort: localForm.access?.length ?? 0,
          access_control_id: '',
          name: '',
          early_access: false,
        };
        break;
    }

    setLocalForm((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), newItem],
    }));
  };

  const typeLabel = siteTypes.find((i) => i.value === Number(localForm.type))?.label ?? '';

  const [approvalData, setApprovalData] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllApprovalWorkflow(token!);
        const data = res.collection.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        setApprovalData(data);
      } catch (error) {
        console.error('Error fetching access control data:', error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
          <Grid size={{ xs: 12, md: 5 }} display={'flex'}>
            <Paper sx={{ p: 3, height: '100%', width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Location Details
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="name" sx={{ mt: 0.5 }}>
                    Location Name
                  </CustomFormLabel>
                  <CustomTextField
                    id="name"
                    value={localForm.name}
                    onChange={handleChange}
                    error={Boolean(errors.name)}
                    helperText={errors.name || ''}
                    fullWidth
                    required
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
                  <CustomFormLabel htmlFor="description" sx={{ mt: 0.5 }}>
                    Description
                  </CustomFormLabel>
                  <CustomTextField
                    id="description"
                    value={localForm.description}
                    onChange={handleChange}
                    error={Boolean(errors.description)}
                    helperText={errors.description || ''}
                    fullWidth
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <CustomFormLabel htmlFor="type" sx={{ mt: 0.5 }}>
                      Type
                    </CustomFormLabel>
                  </Box>
                  <CustomTextField
                    id="type"
                    name="type"
                    // select
                    value={typeLabel}
                    fullWidth
                    sx={{ mb: 2 }}
                    // required
                    disabled
                  />
                  <Box>
                    <CustomFormLabel
                      htmlFor="approval_workflow_id"
                      required={localForm.need_approval}
                      sx={{ mt: 0.5 }}
                    >
                      Type Approval
                    </CustomFormLabel>
                    <CustomSelect
                      id="approval_workflow_id"
                      name="approval_workflow_id"
                      value={localForm.approval_workflow_id}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // const value = Number(e.target.value);
                        setLocalForm((prev) => ({
                          ...prev,
                          approval_workflow_id: e.target.value,
                          need_approval: e.target.value !== '0' ? true : false,
                        }));
                      }}
                      fullWidth
                      required={localForm.need_approval}
                      sx={{ mb: 2 }}
                      disabled={!localForm.need_approval || isBatchEdit}
                    >
                      <MenuItem value="" disabled>
                        Select Type Approval
                      </MenuItem>
                      {/* {Object.entries(TypeApproval)
                        .filter(([key, value]) => !isNaN(Number(value)))
                        .map(([key, value]) => (
                          <MenuItem key={value} value={value}>
                            {formatEnumLabel(key)}
                          </MenuItem>
                        ))} */}
                      {approvalData.map((item) => (
                        <MenuItem key={item.value} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </CustomSelect>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel sx={{ mt: 0.5 }} required>
                    Employee
                  </CustomFormLabel>
                  <Autocomplete
                    id="employee"
                    options={employee ?? []}
                    getOptionLabel={(option: any) => option.name || ''}
                    // value={selectedEmployee}
                    value={
                      employee.find(
                        (emp: any) => emp.id?.toLowerCase() === localForm.host?.toLowerCase(),
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setLocalForm((prev: any) => ({
                        ...prev,
                        host: newValue ? newValue.id : '',
                      }));
                    }}
                    renderInput={(params) => (
                      <CustomTextField {...params} fullWidth disabled={isBatchEdit} />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          {/* Language and Timezone */}
          <Grid size={{ xs: 12, md: 3.5 }} display={'flex'}>
            <Paper sx={{ p: 3, height: '100%', width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Language and Timezone
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginX: 1 }}
              >
                <CustomFormLabel htmlFor="timezone" required sx={{ mt: 0.5 }}>
                  Timezone
                </CustomFormLabel>
                {isBatchEdit && (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={enabledFields?.timezone || false}
                        onChange={(e) =>
                          setEnabledFields((prev) => ({
                            ...prev,
                            timezone: e.target.checked,
                          }))
                        }
                      />
                    }
                    label=""
                    labelPlacement="start"
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>
              <CustomSelect
                id="timezone"
                name="timezone"
                value={localForm.timezone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocalForm((prev) => ({ ...prev, timezone: e.target.value }))
                }
                fullWidth
                sx={{ mb: 2 }}
                selectprops={{ native: true }}
                disabled={isBatchEdit && !enabledFields?.timezone}
              >
                <MenuItem value="" disabled>
                  Select Timezone
                </MenuItem>
                {timezoneOptions.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </CustomSelect>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginX: 1 }}
              >
                <CustomFormLabel htmlFor="signout_time">Check-out Time</CustomFormLabel>
                {isBatchEdit && (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={enabledFields?.signout_time || false}
                        onChange={(e) =>
                          setEnabledFields((prev) => ({
                            ...prev,
                            signout_time: e.target.checked,
                          }))
                        }
                      />
                    }
                    label=""
                    labelPlacement="start"
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>

              <CustomTextField
                id="signout_time"
                type="time"
                value={localForm.signout_time}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                inputProps={{ step: 1 }}
                disabled={isBatchEdit && !enabledFields?.signout_time}
              />
            </Paper>
          </Grid>

          {/* Right-most settings switches */}
          <Grid size={{ xs: 12, md: 3.5 }} display={'flex'}>
            <Paper sx={{ p: 3, pb: 0, height: '100%', width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Settings
              </Typography>
              <Grid container spacing={2} sx={{ pt: 1 }}>
                <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localForm.can_visited}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, can_visited: checked }));

                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({ ...prev, can_visited: true }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Can Visit
                          <Tooltip
                            title="Visitors can visit the site."
                            sx={{
                              ml: { xs: 0, lg: 3.5 },
                            }}
                            arrow
                          >
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                      sx={{ marginRight: 0 }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localForm.need_approval}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, need_approval: checked }));
                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({ ...prev, need_approval: true }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Need Approval
                          <Tooltip
                            title="Visitors must be approved before visiting the site."
                            arrow
                          >
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          // checked={localForm.need_invitation}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, need_invitation: checked }));
                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({ ...prev, need_invitation: true }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Need Invitation
                          <Tooltip title="Visitors must be invited before visiting the site." arrow>
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          // checked={localForm.need_invitation}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, need_invitation: checked }));
                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({ ...prev, need_invitation: true }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Need Swap Card
                          <Tooltip
                            title="
                            Visitors must swap card.
                          "
                            arrow
                          >
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localForm.can_signout}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, can_signout: checked }));
                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({ ...prev, can_signout: true }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Can Check-out
                          <Tooltip title="Visitors must check out before leaving the site." arrow>
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localForm.auto_signout}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({
                              ...prev,
                              auto_signout: checked,
                              can_signout: checked ? true : prev.can_signout,
                            }));
                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({ ...prev, auto_signout: true }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Auto Check-out
                          <Tooltip
                            title="Automatically checks out visitors at a specified time."
                            arrow
                          >
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localForm.can_contactless_login}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, can_contactless_login: checked }));
                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({
                                ...prev,
                                can_contactless_login: true,
                              }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Contactless Login
                          <Tooltip title="Visitors can do contactless login." arrow>
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localForm.need_document}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, need_document: checked }));
                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({ ...prev, need_document: true }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Need Document
                          <Tooltip
                            title="Visitors must upload a document before visiting the site."
                            arrow
                          >
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localForm.is_registered_point}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, is_registered_point: checked }));
                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({ ...prev, is_registered_point: true }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Registered Site
                          <Tooltip
                            title="Visitors must register a point before visiting the site."
                            arrow
                          >
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Site Access */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ borderLeft: '4px solid #673ab7', pl: 1 }}>
                    Access
                  </Typography>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd('access')}
                  >
                    <TableContainer component={Paper} sx={{ mb: 1 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>*</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Early Access</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <RenderDragSite
                          sectionKey="access"
                          items={localForm.access}
                          onChange={handleDetailChange}
                          onDelete={handleDetailDelete}
                          accessControlList={accessControl}
                          onReorder={(newItems) =>
                            setLocalForm((prev) => ({
                              ...prev,
                              access: newItems,
                            }))
                          }
                        />
                      </Table>
                    </TableContainer>
                  </DndContext>
                  {localForm.can_visited && (
                    <MuiButton
                      size="small"
                      onClick={() => handleAddDetail('access')}
                      variant="contained"
                      color="primary"
                    >
                      Add New
                    </MuiButton>
                  )}
                </Box>
              </Paper>
            </Grid>
            {/* Site Parking */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ borderLeft: '4px solid #673ab7', pl: 1 }}>
                    Site Parking
                  </Typography>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd('parking')}
                  >
                    <TableContainer component={Paper} sx={{ mb: 1 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>*</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Early Access</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <RenderDragSite
                          sectionKey="parking"
                          items={localForm.parking}
                          onChange={handleDetailChange}
                          onDelete={handleDetailDelete}
                          parkingList={siteParking}
                          onReorder={(newItems) =>
                            setLocalForm((prev) => ({
                              ...prev,
                              parking: newItems,
                            }))
                          }
                        />
                      </Table>
                    </TableContainer>
                  </DndContext>
                  {(!localForm.parking ||
                    (localForm.parking.length === 0 && localForm.can_visited)) && (
                    <MuiButton
                      size="small"
                      onClick={() => handleAddDetail('parking')}
                      variant="contained"
                      color="primary"
                    >
                      Add New
                    </MuiButton>
                  )}
                </Box>
              </Paper>
            </Grid>
            {/* Site Tracking */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ borderLeft: '4px solid #673ab7', pl: 1 }}>
                    Site Tracking
                  </Typography>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd('tracking')}
                  >
                    <TableContainer component={Paper} sx={{ mb: 1 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>*</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Early Access</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <RenderDragSite
                          sectionKey="tracking"
                          items={localForm.tracking}
                          onChange={handleDetailChange}
                          onDelete={handleDetailDelete}
                          trackingList={siteTracking}
                          onReorder={(newItems) =>
                            setLocalForm((prev) => ({
                              ...prev,
                              tracking: newItems,
                            }))
                          }
                        />
                      </Table>
                    </TableContainer>
                  </DndContext>
                  {(!localForm.tracking ||
                    (localForm.tracking.length === 0 && localForm.can_visited)) && (
                    <MuiButton
                      size="small"
                      onClick={() => handleAddDetail('tracking')}
                      variant="contained"
                      color="primary"
                    >
                      Add New
                    </MuiButton>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {localForm.need_document && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ borderLeft: '4px solid #673ab7', pl: 1 }}>
                    Site Document
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={8}>
                      <TableContainer
                        component={Box}
                        sx={{ maxHeight: 290, overflowY: 'auto', mt: 1 }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Retention Time (days)</TableCell>
                              <TableCell align="right"></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredSiteDocumentList.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ color: '#888' }}>
                                  No documents added
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredSiteDocumentList.map((doc, idx) => {
                                const docInfo = documentlist.find((d) => d.id === doc.documents.id);

                                return (
                                  <TableRow key={doc.id + idx}>
                                    <TableCell>{docInfo ? docInfo.name : doc.id}</TableCell>
                                    {doc.retentionTime === 0 ? (
                                      <TableCell sx={{ color: '#888' }}>Forever</TableCell>
                                    ) : (
                                      <TableCell sx={{ color: '#888' }}>
                                        {doc.retentionTime} days
                                      </TableCell>
                                    )}
                                    <TableCell align="right">
                                      <Button
                                        color="error"
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          minWidth: 28,
                                          width: 28,
                                          height: 28,
                                          p: 0,
                                          fontSize: '1rem',
                                          lineHeight: 1,
                                          bgcolor: '#fff5f5',
                                          borderColor: '#ffcdd2',
                                          '&:hover': { bgcolor: '#ffcdd2' },
                                        }}
                                        onClick={() => {
                                          setSiteDocuments((prev) =>
                                            prev.filter((_, i) => i !== idx),
                                          );
                                          setFilteredSiteDocumentList((prev) =>
                                            prev.filter((_, i) => i !== idx),
                                          );
                                        }}
                                      >
                                        ×
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid size={4} sx={{ mt: -3 }}>
                      <CustomFormLabel htmlFor="map_link">Document</CustomFormLabel>
                      <CustomSelect
                        id="document_id"
                        name="document_id"
                        value={newDocumentA.documents?.id?.toString() || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const selectedId = e.target.value;

                          const selectedDoc = documentlist.find(
                            (doc) => doc.id.toString() === selectedId.toString(),
                          );

                          if (selectedDoc) {
                            setNewDocumentA((prev) => ({
                              ...prev,
                              documents: selectedDoc,
                            }));
                          }
                        }}
                        fullWidth
                        sx={{ mb: 2 }}
                        selectprops={{ native: true }}
                      >
                        <MenuItem value="" disabled>
                          Select Document
                        </MenuItem>
                        {documentlist.map((doc) => (
                          <MenuItem key={doc.id} value={doc.id}>
                            {doc.name}
                          </MenuItem>
                        ))}
                      </CustomSelect>
                      <CustomFormLabel htmlFor="retention_time">
                        Retention Time (days)
                        <Tooltip title="If the value is 0, the document data will be stored permanently.">
                          <IconButton size="small">
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </CustomFormLabel>
                      <CustomTextField
                        id="retention_time"
                        name="retention_time"
                        value={retentionInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) {
                            setRetentionInput(value);

                            setNewDocumentA((prev) => ({
                              ...prev,
                              retentionTime: value === '' ? 0 : Number(value),
                            }));
                          }
                        }}
                        type="text"
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                        }}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ my: 3 }}
                        onClick={() => {
                          const selectedDoc = newDocumentA.documents;

                          if (!selectedDoc || !selectedDoc.id || !selectedDoc.name) {
                            alert('Dokumen belum dipilih!');
                            return;
                          }

                          const isDuplicate = filteredSiteDocumentList.some(
                            (doc) => doc.documents?.name === selectedDoc.name,
                          );

                          if (isDuplicate) {
                            alert(`Dokumen "${selectedDoc.name}" sudah ditambahkan.`);
                            return;
                          }

                          setSiteDocuments((prev) => [
                            ...prev,
                            {
                              document_id: selectedDoc.id,
                              site_id: '',
                              retention_time: newDocumentA.retentionTime,
                            },
                          ]);

                          setFilteredSiteDocumentList((prev) => [...prev, newDocumentA]);

                          setNewDocumentA({
                            id: '',
                            site_id: '',
                            site_name: '',
                            documents: {} as DocumentItem,
                            retentionTime: 0,
                          });

                          setNewDocument({
                            document_id: '',
                            site_id: '',
                            retention_time: 0,
                          });
                        }}
                      >
                        Add Document
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                  Site Image
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed #90caf9',
                    borderRadius: 2,
                    padding: 4,
                    textAlign: 'center',
                    backgroundColor: '#f5faff',
                    cursor: isBatchEdit ? 'not-allowed' : 'pointer',
                    width: '100%',
                    margin: '0 auto',
                    pointerEvents: isBatchEdit ? 'none' : 'auto',
                    opacity: isBatchEdit ? 0.5 : 1,
                  }}
                  onClick={() => !isBatchEdit && fileInputRef.current?.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    Upload Site Image
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Supports: JPG, JPEG, PNG, Up to 100KB
                  </Typography>
                  {previewUrl && (
                    <Box
                      mt={2}
                      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <img
                        src={previewUrl}
                        alt="preview"
                        style={{
                          width: 200,
                          height: 200,
                          borderRadius: 12,
                          objectFit: 'cover',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                        }}
                      />
                      <Button
                        color="error"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 2, minWidth: 120 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear();
                        }}
                        startIcon={<IconTrash />}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                  {/* hidden file input */}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    disabled={isBatchEdit}
                  />
                </Box>
                {/* Map Link Field */}
                <Box sx={{ mt: 4, maxWidth: 600, margin: '0', marginTop: '16px' }}>
                  <CustomFormLabel htmlFor="map_link">Map Link (Google Maps)</CustomFormLabel>
                  <CustomTextField
                    id="map_link"
                    value={localForm.map_link}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/..."
                    disabled={isBatchEdit}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading}
            size="medium"
          >
            Submit
          </Button>
        </Box>
      </form>

      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: 999999,
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </>
  );
};

export default FormSite;
