import {
  Button,
  Grid2 as Grid,
  Typography,
  CircularProgress,
  FormControlLabel,
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
  Divider,
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
  Parking,
  Tracking,
  UpdateSiteRequestSchema,
} from 'src/customs/api/models/Admin/Sites';
import { IconInfoCircle, IconTrash } from '@tabler/icons-react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import {
  createSite,
  uploadImageSite,
  getAllSite,
  createSiteDocument,
  updateSite,
  getAllSiteDocument,
  getAllAccessControl,
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
  getSitesAccessById,
  deleteSiteDocument,
  getSiteDocumentBySiteId,
  deleteSiteTracking,
  deleteSiteParking,
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
import imageCompression from 'browser-image-compression';
import { useSiteMutation } from 'src/hooks/Sites/useSiteMutation';
import { useDocuments } from 'src/hooks/Documents/useDocument';
import { useAccessControl } from 'src/hooks/AccessControl/useAccessControl';
import { useSiteParking } from 'src/hooks/Sites/useSiteParking';
import { useSiteTracking } from 'src/hooks/Sites/useSiteTracking';
import { useSiteAccess } from 'src/hooks/Sites/useSiteAccess';
import { useSitesParking } from 'src/hooks/Sites/useSitesParking';
import { useSitesTracking } from 'src/hooks/Sites/useSitesTracking';
import { useSiteDocuments } from 'src/hooks/Sites/useSiteDocuments';

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
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
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
  setIsDirty,
}: FormSiteProps) => {
  const { token } = useSession();
  const location = useLocation();
  const segments = location.pathname.split('/');
  const parentRouteId = segments[segments.length - 1] || null;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // const [loading, setLoading] = useState(false);

  const [siteTypes] = useState<{ label: string; value: number }[]>([
    { label: 'Site', value: 0 },
    { label: 'Building', value: 1 },
    { label: 'Floor', value: 2 },
    { label: 'Room', value: 3 },
  ]);

  const timezoneOptions = [
    { value: 'Asia/Jakarta', label: '(UTC+07:00) WIB (Waktu Indonesia Barat)' },
    { value: 'Asia/Makassar', label: '(UTC+08:00) WITA (Waktu Indonesia Tengah)' },
    { value: 'Asia/Jayapura', label: '(UTC+09:00) WIT (Waktu Indonesia Timur)' },
  ];
  // const [documentlist, setDocumentList] = useState<DocumentItem[]>([]);
  const [filteredSiteDocumentList, setFilteredSiteDocumentList] = useState<any[]>([]);
  // const [siteParking, setSiteParking] = useState<Parking[]>([]);
  // const [siteTracking, setSiteTracking] = useState<Tracking[]>([]);
  const [newDocument, setNewDocument] = useState<SiteDocumentItem>({
    id: '',
    site_id: '',
    site_name: '',
    documents: {} as DocumentItem,
    retentionTime: 0,
  });
  const [deletedSiteDocuments, setDeletedSiteDocuments] = useState<any[]>([]);
  // const [accessControl, setAccessControl] = useState<AccessControlItem[]>([]);
  const [approvalData, setApprovalData] = useState<{ label: string; value: number }[]>([]);
  const [siteImageFile, setSiteImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localForm, setLocalForm] = useState(formData);
  const lastSentRef = useRef<string>('');
  const [newSiteDocuments, setNewSiteDocuments] = useState<any[]>([]);
  const [retentionInput, setRetentionInput] = useState('0');
  const typeLabel = siteTypes.find((i) => i.value === Number(localForm.type))?.label ?? '';
  const [initialTracking, setInitialTracking] = useState([]);
  const [initialParking, setInitialParking] = useState([]);

  useEffect(() => {
    setRetentionInput(newDocument.retentionTime.toString());
  }, [newDocument.retentionTime]);

  // useEffect(() => {
  //   if (!editingId || !token) return;

  //   (async () => {
  //     try {
  //       const results = await Promise.allSettled([
  //         getSitesAccessById(token, editingId),
  //         getAllAccessControl(token),
  //         getSiteParking(token),
  //         getSiteTracking(token),
  //         getSitesParking(token),
  //         getSitesTracking(token),
  //         getAllDocument(token),
  //         getSiteDocumentBySiteId(token, editingId),
  //       ]);

  //       const [
  //         siteRes,
  //         accessControlRes,
  //         parkingMasterRes,
  //         trackingMasterRes,
  //         parkingRelationRes,
  //         trackingRelationRes,
  //         documentRes,
  //         siteDocumentRes,
  //       ] = results;

  //       const site = siteRes.status === 'fulfilled' ? siteRes.value.collection : {};
  //       // console.log('site', site);
  //       const accessControlList =
  //         accessControlRes.status === 'fulfilled' ? (accessControlRes.value.collection ?? []) : [];

  //       setAccessControl(accessControlList);

  //       if (documentRes.status === 'fulfilled') {
  //         setDocumentList(documentRes.value.collection ?? []);
  //       }

  //       const parkingMaster =
  //         parkingMasterRes.status === 'fulfilled' ? (parkingMasterRes.value.collection ?? []) : [];

  //       const trackingMaster =
  //         trackingMasterRes.status === 'fulfilled'
  //           ? (trackingMasterRes.value.collection ?? [])
  //           : [];

  //       // RELATION
  //       const parkingRelation =
  //         parkingRelationRes.status === 'fulfilled'
  //           ? (parkingRelationRes.value.collection ?? [])
  //           : [];

  //       const trackingRelation =
  //         trackingRelationRes.status === 'fulfilled'
  //           ? (trackingRelationRes.value.collection ?? [])
  //           : [];

  //       const siteDocumentRelations =
  //         siteDocumentRes.status === 'fulfilled' ? (siteDocumentRes.value.collection ?? []) : [];

  //       setSiteParking(parkingMaster);
  //       setSiteTracking(trackingMaster);

  //       const normalizedId = editingId.toLowerCase();

  //       const filteredParking = parkingRelation.filter(
  //         (p: any) => String(p.site_id).toLowerCase() === normalizedId,
  //       );

  //       const filteredTracking = trackingRelation.filter(
  //         (t: any) => String(t.site_id).toLowerCase() === normalizedId,
  //       );

  //       const mappedParking = filteredParking.map((p: any, idx: number) => {
  //         const master = parkingMaster.find(
  //           (x: any) => String(x.id).toLowerCase() === String(p.prk_area_parking_id).toLowerCase(),
  //         );

  //         return {
  //           id: p.id,
  //           sort: idx,
  //           site_id: p.site_id,
  //           prk_area_parking_id: p.prk_area_parking_id,
  //           name: master?.name ?? '',
  //           early_access: p.early_access ?? false,
  //         };
  //       });

  //       const mappedAccess = Array.isArray(site)
  //         ? site.map((a: any, idx: number) => {
  //             const master = accessControlList.find(
  //               (x: any) =>
  //                 String(x.id).toLowerCase() === String(a.access_control_id).toLowerCase(),
  //             );

  //             return {
  //               id: a.id,
  //               sort: idx,
  //               access_control_id: a.access_control_id,
  //               name: master?.name ?? a.name ?? '',
  //               early_access: a.early_access ?? false,
  //             };
  //           })
  //         : site?.access_control_id
  //           ? [
  //               {
  //                 id: site.id,
  //                 sort: site.sort ?? 0,
  //                 access_control_id: site.access_control_id,
  //                 name: site.name ?? '',
  //                 early_access: site.early_access ?? false,
  //               },
  //             ]
  //           : [];

  //       const mappedTracking = filteredTracking.map((t: any, idx: number) => {
  //         const master = trackingMaster.find(
  //           (x: any) =>
  //             String(x.id).toLowerCase() === String(t.trk_ble_card_access_id).toLowerCase(),
  //         );

  //         return {
  //           id: t.id,
  //           sort: idx,
  //           site_id: t.site_id,
  //           trk_ble_card_access_id: t.trk_ble_card_access_id,
  //           name: master?.masked_area_name ?? master?.name ?? '',
  //           early_access: t.early_access ?? false,
  //         };
  //       });

  //       setInitialTracking(mappedTracking);
  //       setInitialParking(mappedParking);

  //       setFilteredSiteDocumentList(siteDocumentRelations);

  //       setLocalForm((prev) => ({
  //         ...prev,
  //         ...site,
  //         type: site?.type !== undefined ? Number(site.type) : prev.type,
  //         access: mappedAccess,
  //         parking: mappedParking,
  //         tracking: mappedTracking,
  //       }));
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   })();
  // }, [editingId, token]);

  const { data: documents } = useDocuments();
  // const { data: siteById } = useSiteById(editingId);
  const { data: accessControl } = useAccessControl();
  const { data: siteParking } = useSiteParking();
  const { data: siteTracking } = useSiteTracking();
  const { data: siteAccess } = useSiteAccess(editingId);
  const { data: parkingRelations } = useSitesParking();
  const { data: trackingRelations } = useSitesTracking();
  const { data: siteDocuments } = useSiteDocuments(editingId);

  useEffect(() => {
    if (!editingId) return;
    // if (
    //   !siteAccess ||
    //   !accessControl ||
    //   !siteParking ||
    //   !siteTracking ||
    //   !parkingRelations ||
    //   !trackingRelations ||
    //   !documents ||
    //   !siteDocuments
    // ) {
    //   return;
    // }

    const site = siteAccess?.collection;
    const accessControlList = accessControl?.collection ?? [];
    const parkingMaster = siteParking?.collection ?? [];
    const trackingMaster = siteTracking?.collection ?? [];
    const parkingRelation = parkingRelations?.collection ?? [];
    const trackingRelation = trackingRelations?.collection ?? [];
    const siteDocumentRelations = siteDocuments?.collection ?? [];

    const normalizedId = editingId.toLowerCase();

    const filteredParking = parkingRelation.filter(
      (p: any) => p.site_id.toLowerCase() === normalizedId,
    );

    const filteredTracking = trackingRelation.filter(
      (t: any) => t.site_id.toLowerCase() === normalizedId,
    );

    const mappedParking = filteredParking.map((p: any, idx: number) => {
      const master = parkingMaster.find(
        (x: any) => x.id.toLowerCase() === p.prk_area_parking_id.toLowerCase(),
      );

      return {
        id: p.id,
        sort: idx,
        site_id: p.site_id,
        prk_area_parking_id: p.prk_area_parking_id,
        name: master?.name ?? '',
        early_access: p.early_access ?? false,
      };
    });

    const mappedTracking = filteredTracking.map((t: any, idx: number) => {
      const master = trackingMaster.find(
        (x: any) => x.id.toLowerCase() === t.trk_ble_card_access_id.toLowerCase(),
      );

      return {
        id: t.id,
        sort: idx,
        site_id: t.site_id,
        trk_ble_card_access_id: t.trk_ble_card_access_id,
        name: master?.masked_area_name ?? master?.name ?? '',
        early_access: t.early_access ?? false,
      };
    });

    const mappedAccess = Array.isArray(site)
      ? site.map((a: any, idx: number) => {
          const master = accessControlList.find(
            (x: any) => x.id.toLowerCase() === a.access_control_id.toLowerCase(),
          );

          return {
            id: a.id,
            sort: idx,
            access_control_id: a.access_control_id,
            name: master?.name ?? '',
            early_access: a.early_access ?? false,
          };
        })
      : [];

    setInitialTracking(mappedTracking);
    setInitialParking(mappedParking);

    setFilteredSiteDocumentList(siteDocumentRelations);

    setLocalForm((prev) => ({
      ...prev,
      ...site,
      // type: Number(site.type),
      // type: site?.type !== undefined ? Number(site.type) : prev.type,
      access: mappedAccess,
      parking: mappedParking,
      tracking: mappedTracking,
    }));
  }, [
    editingId,
    siteAccess,
    accessControl,
    siteParking,
    siteTracking,
    parkingRelations,
    trackingRelations,
    siteDocuments,
  ]);

  const handleChange = (e: any) => {
    const { id, name, value, type } = e.target;

    setIsDirty(true);

    setLocalForm((prev) => ({
      ...prev,
      [name || id]: type === 'number' ? (value === '' ? null : Number(value)) : value,
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

  const validateRequiredFields = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Name wajib
    if (!localForm.name?.trim()) {
      newErrors.name = 'Location Name is required.';
    }

    // Timezone wajib
    if (!localForm.timezone?.trim()) {
      newErrors.timezone = 'Timezone is required.';
    }

    // Site Host wajib
    // if (!localForm.host) {
    //   newErrors.host = 'Site Host is required.';
    // }

    // Can Visit wajib aktif
    // if (!localForm.can_visited) {
    //   newErrors.can_visited = 'Can Visit must be enabled.';
    // }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showSwal('error', 'Please complete all required fields.');
      return false;
    }

    setErrors({});
    return true;
  };
  const toUTCTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toISOString().slice(11, 16);
  };

  const { create, update, isPending } = useSiteMutation();

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setErrors({});

    if (!validateRequiredFields()) {
      return;
    }

    try {
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
        const updateDataRaw = UpdateSiteRequestSchema.parse(localForm);

        const updateData = {
          ...updateDataRaw,
          open_time: localForm.open_time ? toUTCTime(localForm.open_time) : null,
          close_time: localForm.close_time ? toUTCTime(localForm.close_time) : null,
        };

        console.log(updateData);

        Object.keys(updateData).forEach((key) => {
          const val = (updateData as any)[key];
          if (val === '' || val === null || val === undefined) delete (updateData as any)[key];
        });

        // const res = await updateSite(editingId, updateData, token);
        const res = await update.mutateAsync({
          id: editingId,
          token,
          data: updateData,
        });
        const deletedTracking = initialTracking.filter(
          (old) => !(localForm.tracking ?? []).some((cur: any) => cur.id === old.id),
        );

        const deletedParking = initialParking.filter(
          (old) => !(localForm.parking ?? []).some((cur: any) => cur.id === old.id),
        );
        await Promise.all(deletedTracking.map((item) => deleteSiteTracking(item.id, token)));
        await Promise.all(deletedParking.map((item) => deleteSiteParking(item.id, token)));

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

        handleFileUpload(editingId);

        if (!localForm.need_document) {
          try {
            const { collection = [] } = await getSiteDocumentBySiteId(token, editingId);

            await Promise.all(collection.map((doc: any) => deleteSiteDocument(doc.id, token)));
          } catch (err: any) {
            const status = err?.response?.status;

            // Kalau memang tidak ada document, lanjut saja
            if (status !== 404) {
              throw err;
            }
          }
        } else {
          // Hapus document yang memang dihapus user
          await Promise.all(
            deletedSiteDocuments.map((doc: any) => deleteSiteDocument(doc.id, token)),
          );

          // Tambah document baru
          await Promise.all(
            newSiteDocuments.map((doc) =>
              createSiteDocument(
                {
                  site_id: editingId,
                  document_id: doc.document_id,
                  retention_time: doc.retention_time,
                },
                token,
              ),
            ),
          );
        }

        showSwal('success', 'Site successfully updated!');
        setDeletedSiteDocuments([]);
        setNewSiteDocuments([]);
      } else {
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
          type: localForm.type ?? 0,
          open_time: localForm.open_time ? toUTCTime(localForm.open_time) : null,
          close_time: localForm.close_time ? toUTCTime(localForm.close_time) : null,
        };
        // console.log('finalFormData', JSON.stringify(finalFormData, null, 2));
        const createData = CreateSiteRequestSchema.parse(finalFormData);
        // const res = await createSite(createData, token);
        const res = await create.mutateAsync({
          token,
          data: createData,
        });
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
      showSwal('error', err.message || 'Failed to create site');
    }
  };

  const compressImage = async (file: File | Blob) => {
    const compressedFile = await imageCompression(file as File, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });

    return compressedFile;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;
    const compressedFile = await compressImage(selectedFile);
    if (compressedFile.size > 1024 * 1024) {
      showSwal('error', 'Image must be under 1 MB');
      return;
    }

    setSiteImageFile(compressedFile);

    setPreviewUrl(URL.createObjectURL(compressedFile));
  };

  const handleClear = () => {
    setSiteImageFile(null);
    setPreviewUrl(null);
  };

  const handleFileUpload = async (siteId: string) => {
    if (!token || !siteImageFile) return;
    try {
      await uploadImageSite(siteId, siteImageFile, token);
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
      return;
    }
    for (const doc of newSiteDocuments) {
      const docWithSiteId: CreateSiteDocumentRequest = {
        ...doc,
        site_id: newSite.id,
      };

      console.log('docWithSiteId', docWithSiteId);

      try {
        await createSiteDocument(docWithSiteId, token);
      } catch (error) {
        console.error('Error creating site document:', error);
      }
    }
  };

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
          id: '',
          sort: localForm.parking?.length ?? 0,
          site_id: '',
          name: '',
          prk_area_parking_id: '',
          early_access: false,
        };
        break;

      case 'tracking':
        newItem = {
          id: '',
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

              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="name" sx={{ mt: 0.5 }} required>
                    Location Name
                  </CustomFormLabel>
                  <CustomTextField
                    id="name"
                    value={localForm.name}
                    onChange={handleChange}
                    error={Boolean(errors.name)}
                    helperText={errors.name || ''}
                    fullWidth
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CustomFormLabel htmlFor="type" sx={{ mt: 0.5 }}>
                        Type
                      </CustomFormLabel>
                      <Tooltip title="Type Info" arrow>
                        <IconButton size="small">
                          <IconInfoCircle size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
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
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CustomFormLabel sx={{ mt: 0 }} required>
                      Site Host
                    </CustomFormLabel>

                    <Tooltip title="Select the host responsible for this site" arrow>
                      <IconButton size="small">
                        <IconInfoCircle size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Autocomplete
                    id="employee"
                    options={employee ?? []}
                    getOptionLabel={(option: any) => option.name || ''}
                    value={
                      employee.find(
                        (emp: any) => emp.id?.toLowerCase() === localForm.host?.toLowerCase(),
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setLocalForm((prev: any) => ({
                        ...prev,
                        host: newValue ? newValue.id : null,
                      }));
                    }}
                    renderInput={(params) => (
                      <CustomTextField
                        {...params}
                        fullWidth
                        disabled={isBatchEdit}
                        error={Boolean(errors.host)}
                        helperText={errors.host || ''}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CustomFormLabel sx={{ mt: 0 }}>Code</CustomFormLabel>

                    <Tooltip title="Enter a unique site code" arrow>
                      <IconButton size="small">
                        <IconInfoCircle size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <CustomTextField
                    id="code"
                    value={localForm.code}
                    onChange={handleChange}
                    error={Boolean(errors.code)}
                    helperText={errors.code || ''}
                    fullWidth
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CustomFormLabel sx={{ mt: 0 }}>Max Capacity</CustomFormLabel>

                    <Tooltip title="Maximum number of people allowed in this site" arrow>
                      <IconButton size="small">
                        <IconInfoCircle size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <CustomTextField
                    id="max_capacity"
                    type="number"
                    value={localForm.max_capacity}
                    onChange={handleChange}
                    error={Boolean(errors.max_capacity)}
                    helperText={errors.max_capacity || ''}
                    fullWidth
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CustomFormLabel sx={{ mt: 0 }}>Address</CustomFormLabel>

                    <Tooltip title="Enter the full address of the site" arrow>
                      <IconButton size="small">
                        <IconInfoCircle size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <CustomTextField
                    id="address"
                    value={localForm.address}
                    onChange={handleChange}
                    error={Boolean(errors.address)}
                    helperText={errors.address || ''}
                    fullWidth
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CustomFormLabel htmlFor="open_time" sx={{ mt: 0 }}>
                      Open Time
                    </CustomFormLabel>

                    <Tooltip title="Set the site opening time" arrow>
                      <IconButton size="small">
                        <IconInfoCircle size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <CustomTextField
                    id="open_time"
                    type="time"
                    value={localForm.open_time}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    // inputProps={{ step: 1 }}
                    disabled={isBatchEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CustomFormLabel htmlFor="close_time" sx={{ mt: 0 }}>
                      Close Time
                    </CustomFormLabel>

                    <Tooltip title="Set the site closing time" arrow>
                      <IconButton size="small">
                        <IconInfoCircle size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <CustomTextField
                    id="close_time"
                    type="time"
                    value={localForm.close_time}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    // inputProps={{ step: 1 }}
                    disabled={isBatchEdit}
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
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 12, sm: 12 }}>
                  {' '}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ marginX: 0 }}
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
                    value={localForm.timezone ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLocalForm((prev) => ({ ...prev, timezone: e.target.value }))
                    }
                    error={Boolean(errors.timezone)}
                    fullWidth
                    sx={{ mb: 1 }}
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
                  {errors.timezone && (
                    <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                      {errors.timezone}
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ marginX: 1 }}
                  >
                    <CustomFormLabel htmlFor="signout_time" sx={{ mt: 0 }}>
                      Check-out Time
                    </CustomFormLabel>
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
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <CustomFormLabel htmlFor="latitude" sx={{ mt: 0 }}>
                    Latitude
                  </CustomFormLabel>
                  <CustomTextField
                    id="latitude"
                    type="number"
                    value={localForm.latitude}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    disabled={isBatchEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <CustomFormLabel htmlFor="longitude" sx={{ mt: 0 }}>
                    Longtitude
                  </CustomFormLabel>
                  <CustomTextField
                    id="longitude"
                    type="number"
                    value={localForm.longitude}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    disabled={isBatchEdit}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Right-most settings switches */}
          <Grid size={{ xs: 12, md: 3.5 }} display={'flex'}>
            <Paper sx={{ p: 3, pb: 0, height: '100%', width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Settings
              </Typography>
              <Grid container spacing={1.5} sx={{ pt: 1 }}>
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
                          <CustomFormLabel sx={{ mt: 0, mb: 0, fontWeight: '500' }}>
                            Can Visit
                          </CustomFormLabel>
                          <Tooltip
                            title="Visitors can visit the site."
                            sx={{
                              ml: { xs: 0, lg: 3.5 },
                            }}
                            arrow
                          >
                            <IconButton size="small" sx={{ marginLeft: 2 }}>
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                      sx={{ marginRight: 0 }}
                    />
                    {/* {errors.can_visited && (
                      <Typography variant="caption" color="error" sx={{ ml: 2, display: 'block' }}>
                        {errors.can_visited}
                      </Typography>
                    )} */}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localForm.need_invitation || false}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, need_invitation: checked }));
                            // if (isBatchEdit) {
                            //   setEnabledFields((prev) => ({ ...prev, need_invitation: true }));
                            // }
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
                          checked={localForm.can_swap}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, can_swap: checked }));
                            // if (isBatchEdit) {
                            //   setEnabledFields((prev) => ({ ...prev, can_swap: true }));
                            // }
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
                          checked={localForm.is_drop_point || false}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, is_drop_point: checked }));
                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({ ...prev, is_drop_point: true }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Drop Point
                          <Tooltip title="Location for drop-off or collection." arrow>
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
                {/* <Grid size={{ xs: 12, xl: 6 }}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          // checked={localForm.is_assembly_point}
                          onChange={(_, checked) => {
                            setLocalForm((prev) => ({ ...prev, is_assembly_point: checked }));
                            if (isBatchEdit) {
                              setEnabledFields((prev) => ({ ...prev, is_assembly_point: true }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Assembly Point
                          <Tooltip title="Designated meeting or gathering point." arrow>
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                </Grid> */}
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
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CustomFormLabel
                        htmlFor="approval_workflow_id"
                        required={localForm.need_approval}
                        sx={{ mt: 0.5 }}
                      >
                        Type Approval
                      </CustomFormLabel>

                      <Tooltip title="Select the approval workflow type" arrow>
                        <IconButton size="small">
                          <IconInfoCircle size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <CustomSelect
                      id="approval_workflow_id"
                      name="approval_workflow_id"
                      value={localForm.approval_workflow_id ?? ''}
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
                      <MenuItem value="">Select Type Approval</MenuItem>
                      {approvalData.map((item) => (
                        <MenuItem key={item.value} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </CustomSelect>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 12 }}>
                  <Divider sx={{ my: 0.1 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <CustomFormLabel sx={{ mt: 0 }}>Contact Name</CustomFormLabel>
                  <CustomTextField
                    id="contact_name"
                    value={localForm.contact_name}
                    onChange={handleChange}
                    error={Boolean(errors.contact_name)}
                    helperText={errors.contact_name || ''}
                    fullWidth
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel sx={{ mt: 0 }}>Contact Email</CustomFormLabel>
                  <CustomTextField
                    id="contact_email"
                    value={localForm.contact_email}
                    onChange={handleChange}
                    error={Boolean(errors.contact_email)}
                    helperText={errors.contact_email || ''}
                    fullWidth
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel sx={{ mt: 0 }}>Contact Phone</CustomFormLabel>
                  <CustomTextField
                    id="contact_phone"
                    value={localForm.contact_phone}
                    onChange={handleChange}
                    error={Boolean(errors.contact_phone)}
                    helperText={errors.contact_phone || ''}
                    fullWidth
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
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
                                const documentId = doc.documents?.id ?? doc.documentId;

                                // Cari nama dokumen dari master document
                                const docInfo = documents?.find((d) => d.id === documentId);

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
                                          const doc = filteredSiteDocumentList[idx];

                                          if (doc.id) {
                                            // Document lama (sudah ada di database)
                                            setDeletedSiteDocuments((prev) => [...prev, doc]);
                                          } else {
                                            // Document baru (belum pernah disimpan)
                                            const documentId = doc.documents?.id ?? doc.documentId;

                                            setNewSiteDocuments((prev) =>
                                              prev.filter((d) => d.document_id !== documentId),
                                            );
                                          }

                                          // Hilangkan dari tampilan
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
                        value={newDocument.documents?.id?.toString() || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const selectedId = e.target.value;

                          const selectedDoc = documents?.find(
                            (doc) => doc.id.toString() === selectedId.toString(),
                          );

                          if (selectedDoc) {
                            setNewDocument((prev) => ({
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
                        {documents?.map((doc) => (
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

                            setNewDocument((prev) => ({
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
                          const selectedDoc = newDocument.documents;

                          if (!selectedDoc || !selectedDoc.id || !selectedDoc.name) {
                            alert('Dokumen belum dipilih!');
                            return;
                          }

                          const isDuplicate = filteredSiteDocumentList.some(
                            (doc) => (doc.documents?.id ?? doc.documentId) === selectedDoc.id,
                          );

                          if (isDuplicate) {
                            alert(`Dokumen "${selectedDoc.name}" sudah ditambahkan.`);
                            return;
                          }

                          setNewSiteDocuments((prev) => [
                            ...prev,
                            {
                              document_id: selectedDoc.id,
                              site_id: '',
                              retention_time: newDocument.retentionTime,
                            },
                          ]);

                          setFilteredSiteDocumentList((prev) => [
                            ...prev,
                            {
                              ...newDocument,
                              isNew: true,
                            },
                          ]);

                          setNewDocument({
                            id: '',
                            site_id: '',
                            site_name: '',
                            documents: {} as DocumentItem,
                            retentionTime: 0,
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
                    Supports: JPG, JPEG, PNG, Up to <span style={{ fontWeight: '700' }}>1 Mb</span>
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
                <Box sx={{ mt: 4, margin: '0', marginTop: '16px' }}>
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
            disabled={isPending}
            size="medium"
          >
            Submit
          </Button>
        </Box>
      </form>

      <Backdrop
        open={isPending}
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
