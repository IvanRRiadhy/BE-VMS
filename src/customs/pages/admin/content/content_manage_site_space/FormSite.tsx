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
} from '@mui/material';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import 'react-image-crop/dist/ReactCrop.css';
import { Box } from '@mui/system';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
import Swal from 'sweetalert2';
import {
  CreateSiteRequest,
  CreateSiteRequestSchema,
  generateKeyCode,
  Item,
  TypeApproval,
  UpdateSiteRequest,
  Access,
} from 'src/customs/api/models/Sites';
import { IconTrash } from '@tabler/icons-react';
import { QRCodeCanvas } from 'qrcode.react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import {
  createSite,
  uploadImageSite,
  getAllSitePagination,
  getAllSite,
  getAllDocumentPagination,
  createSiteDocument,
  updateSite,
  getAllSiteDocument,
  getAllAccessControl,
} from 'src/customs/api/admin';
import {
  CreateSiteDocumentRequest,
  CreateSiteDocumentRequestSchema,
  Item as SiteDocumentItem,
} from 'src/customs/api/models/SiteDocument';
// import { axiosInstance2 } from 'src/customs/api/interceptor';
import { Item as DocumentItem } from 'src/customs/api/models/Document';
import { Item as AccessControlItem } from 'src/customs/api/models/AccessControl';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// const BASE_URL = 'http://' + import.meta.env.VITE_API_HOST;
const BASE_URL = 'http://192.168.1.116:8000';
// const BASE_URL = 'http://localhost:8000';

type EnabledFields = {
  type: boolean;
  type_approval: boolean;
  timezone: boolean;
  signout_time: boolean;
  need_approval: boolean;
  can_visited: boolean;
  can_signout: boolean;
  auto_signout: boolean;
  can_contactless_login: boolean;
  need_document: boolean;
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
}
const ITEM_TYPE = 'ACCESS_ROW';

interface DragItem {
  index: number;
  type: string;
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
}: FormSiteProps) => {
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
  const { token } = useSession();

  const timezoneOptions = [
    { value: 'Asia/Jakarta', label: '(UTC+07:00) WIB (Waktu Indonesia Barat)' },
    { value: 'Asia/Makassar', label: '(UTC+08:00) WITA (Waktu Indonesia Tengah)' },
    { value: 'Asia/Jayapura', label: '(UTC+09:00) WIT (Waktu Indonesia Timur)' },
    // ...add more as needed
  ];
  const [documentlist, setDocumentList] = useState<DocumentItem[]>([]);
  const [filteredSiteDocumentList, setFilteredSiteDocumentList] = useState<SiteDocumentItem[]>([]);
  const [siteDocuments, setSiteDocuments] = useState<CreateSiteDocumentRequest[]>([]);
  const [newDocumentA, setNewDocumentA] = useState<SiteDocumentItem>({
    id: '',
    site_id: '',
    site_name: '',
    documents: {} as DocumentItem,
    retentionTime: 0,
  });
  const [site, setSite] = useState<Item[]>([]);
  const [accessControl, setAccessControl] = useState<AccessControlItem[]>([]);
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
    if (!token) return;
    const fetchData = async () => {
      const docRes = await getAllDocumentPagination(token, 0, 99, 'id');
      const docs = docRes?.collection ?? [];
      const accessControlRes = await getAllAccessControl(token);
      setAccessControl(accessControlRes.collection);
      setDocumentList(docs);
      const siteDocRes = await getAllSiteDocument(token);
      if (editingId) {
        const filteredSiteDocumentList = siteDocRes.collection.filter(
          (siteDoc: SiteDocumentItem) => siteDoc.site_id === editingId,
        );
        console.log('Filtered site document list:', filteredSiteDocumentList);
        setFilteredSiteDocumentList(filteredSiteDocumentList);
        const parsedSiteDocuments: CreateSiteDocumentRequest[] = filteredSiteDocumentList.map(
          (item) => ({
            site_id: item.site_id,
            document_id: item.id, // extract from nested documents
            retention_time: item.retentionTime, // map to snake_case
          }),
        );
        setSiteDocuments(parsedSiteDocuments);
      }
    };
    fetchData();
  }, [token]);
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { id, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [id]: value }));
  // };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const { id, name, value } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name || id]: value,
    }));
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    // console.log('Submitting form with data:', formData);
    e.preventDefault();
    console.log('Submitting form with data:', formData);
    setLoading(true);
    setErrors({});
    try {
      if (!token) {
        setAlertType('error');
        setAlertMessage('Something went wrong. Please try again later.');

        setTimeout(() => {
          setAlertType('info');
          setAlertMessage('Complete the following data properly and correctly');
        }, 3000);
        return;
      }

      if (isBatchEdit && selectedRows.length > 0) {
        const updatedFields: Partial<CreateSiteRequest> = {};

        // Misal ada field access_area_special dan gender juga
        if (enabledFields?.type) {
          //  setSiteTypes
          updatedFields.type = formData.type;
        }
        if (enabledFields?.can_contactless_login)
          updatedFields.can_contactless_login = formData.can_contactless_login;
        if (enabledFields?.can_visited) {
          updatedFields.can_visited = formData.can_visited;
        }
        if (enabledFields?.can_signout) updatedFields.can_signout = formData.can_signout;
        if (enabledFields?.auto_signout) updatedFields.auto_signout = formData.auto_signout;
        if (enabledFields?.signout_time) updatedFields.signout_time = formData.signout_time;
        if (enabledFields?.timezone) updatedFields.timezone = formData.timezone;
        if (enabledFields?.need_document) updatedFields.need_document = formData.need_document;
        if (enabledFields?.need_approval) updatedFields.need_approval = formData.need_approval;

        // Khusus 'type_approval', cek dulu apakah enabled dan 'need_approval' true
        // if (enabledFields?.type_approval && formData.need_approval === true) {
        //   updatedFields.type_approval = formData.type_approval;
        // }

        if (enabledFields?.type_approval) {
          updatedFields.type_approval = formData.type_approval;
        }

        if (Object.keys(updatedFields).length === 0) {
          setAlertType('error');
          setAlertMessage('Please enable at least one field to update.');
          setTimeout(() => {
            setAlertType('info');
            setAlertMessage('Complete the following data properly and correctly');
          }, 3000);
          setLoading(false);
          return;
        }

        for (const row of selectedRows) {
          const updatedData: UpdateSiteRequest = {
            // hanya kirim field yang perlu
            ...row,
            ...updatedFields,
          };
          await updateSite(row.id, updatedData, token);
          console.log('Updated Data:', updatedData);
        }
        setAlertType('success');
        setAlertMessage('Batch update successfully!');
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Batch update successfully!',
        });

        resetEnabledFields();
        onSuccess?.();
        return;
      }

      const data: CreateSiteRequest = CreateSiteRequestSchema.parse(formData);
      console.log('Setting Data: ', data);
      if (editingId && editingId !== '') {
        await updateSite(editingId, data, token);
        setAlertType('success');
        setAlertMessage('Site successfully updated!');
        console.log('Editing ID:', editingId);
      } else {
        await createSite(data, token);
        setAlertType('success');
        setAlertMessage('Site successfully created!');
      }

      await createSiteDocumentsForNewSite();
      handleFileUpload();
      localStorage.removeItem('unsavedSiteForm');

      setTimeout(() => {
        // onSuccess?.();
      }, 900);
    } catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors);
      }
      setAlertType('error');
      setAlertMessage('Something went wrong. Please try again later.');
      setTimeout(() => {
        setAlertType('info');
        setAlertMessage('Complete the following data properly and correctly');
      }, 3000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  };
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const handleKeyClick = () => {
    setKeyDialogOpen(true);
  };
  const handleKeyDialogClose = () => setKeyDialogOpen(false);
  const handleRegenerateKey = () => {
    setFormData((prev) => ({ ...prev, code: generateKeyCode() }));
  };

  const [siteImageFile, setSiteImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async () => {
    if (fileInputRef.current && token) {
      const allSite = await getAllSitePagination(token, 0, 20, 'id');
      const otherAllSite = await getAllSite(token);
      console.log('All sites (pagination):', allSite);
      console.log('All sites:', allSite);
      const matchedSite = allSite.collection.find(
        (site: any) => site.name === formData.name && site.description === formData.description,
        // add more fields if needed
      );
      const otherMatchedSite = otherAllSite.collection.find(
        (site: any) => site.name === formData.name && site.description === formData.description,
        // add more fields if needed
      );
      if (matchedSite && siteImageFile) {
        console.log('Matched site id:', matchedSite.id);
        await uploadImageSite(matchedSite.id, siteImageFile!, token);
      } else if (otherMatchedSite && siteImageFile) {
        console.log('Matched site id (other):', otherMatchedSite.id);
        await uploadImageSite(otherMatchedSite.id, siteImageFile!, token);
      } else {
        console.log('No matching site found');
      }
    }
  };

  const createSiteDocumentsForNewSite = async () => {
    if (!token) return;

    // Cek duplikat documents.id di dalam siteDocument

    const allSitesRes = await getAllSite(token);
    const newSite = allSitesRes.collection.find(
      (site: any) => site.name === formData.name && site.description === formData.description,
    );

    if (!newSite) {
      console.error('New site not found after creation');
      return;
    }

    // Tambahkan site_id ke tiap dokumen dan kirim
    for (const doc of siteDocuments) {
      const docWithSiteId: CreateSiteDocumentRequest = {
        ...doc,
        site_id: newSite.id,
      };

      console.log('Creating site document with data:', docWithSiteId);

      try {
        await createSiteDocument(docWithSiteId, token);
      } catch (error) {
        console.error('Error creating site document:', error);
      }
    }
  };
  function formatEnumLabel(label: string) {
    // Insert a space before all caps and capitalize the first letter
    return (
      label
        .replace(/([A-Z])/g, ' $1')
        // .replace(/^./, (str) => str.toUpperCase())
        .trim()
    );
  }

  const resetEnabledFields = () => {
    setFormData((prev) => ({
      ...prev,
      type: 0,
      type_approval: 0,
      timezone: '',
      signout_time: '',
      need_approval: false,
      can_visited: false,
      can_signout: false,
      auto_signout: false,
      can_contactless_login: false,
      need_document: false,
    }));
    setEnabledFields({
      type: false,
      type_approval: false,
      timezone: false,
      signout_time: false,
      need_approval: false,
      can_visited: false,
      can_signout: false,
      auto_signout: false,
      can_contactless_login: false,
      need_document: false,
    });
  };

  useEffect(() => {
    if (!siteImageFile && formData.image) {
      // Jika dari backend berupa URL atau base64, set preview
      if (
        formData.image.startsWith('data:image') ||
        formData.image.startsWith('http') ||
        formData.image.startsWith('https')
      ) {
        setPreviewUrl(formData.image);
      } else {
        // Jika bukan URL atau base64 (misal path lokal dari backend), kamu bisa prepend base URL
        setPreviewUrl(`${BASE_URL}/cdn${formData.image}`);
      }
    }
  }, [formData.image, siteImageFile]);

  const handleDetailChange = (
    key: keyof typeof formData,
    index: number,
    field: keyof Access,
    value: any,
  ) => {
    const updated = [...(formData[key] as Access[])];
    (updated[index] as any)[field] = value;
    setFormData({ ...formData, [key]: updated });
  };
  const handleDetailDelete = (fieldKey: 'access', index: number) => {
    setFormData((prev) => {
      const arr = Array.isArray((prev as any)[fieldKey]) ? [...(prev as any)[fieldKey]] : [];
      if (index < 0 || index >= arr.length) return prev;
      arr.splice(index, 1);
      return { ...prev, [fieldKey]: arr } as any;
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const fromIndex = result.source.index;
    const toIndex = result.destination.index;

    if (fromIndex !== toIndex && handleMoveAccess) {
      handleMoveAccess(fromIndex, toIndex);
    }
  };

  const handleMoveAccess = (from: number, to: number) => {
    const updated = [...formData.access];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setFormData((prev) => ({
      ...prev,
      access: updated,
    }));
  };

  const renderDetailRows = (
    access: Access[],
    accessControlList: AccessControlItem[],
    onChange: (index: number, field: keyof Access, value: any) => void,
    onDelete?: (index: number) => void,
  ) => {
    return access.map((item, index) => (
      <Draggable key={`access-${index}`} draggableId={`access-${index}`} index={index}>
        {(provided, snapshot) => (
          <TableRow
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              backgroundColor: snapshot.isDragging ? '#f0f0f0' : undefined,
              cursor: 'move',
            }}
          >
            <TableCell {...provided.dragHandleProps}>⇅</TableCell>
            <TableCell>
              <TextField
                select
                fullWidth
                size="small"
                value={item.access_control_id}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const matched = accessControlList.find((a) => a.id === selectedId);
                  onChange(index, 'access_control_id', selectedId);
                  if (matched) {
                    onChange(index, 'name', matched.name);
                  }
                }}
              >
                <MenuItem value="" disabled>
                  Select Access
                </MenuItem>
                {accessControlList.map((ac) => (
                  <MenuItem key={ac.id} value={ac.id}>
                    {ac.name}
                  </MenuItem>
                ))}
              </TextField>
            </TableCell>
            <TableCell>
              <Switch
                checked={item.early_access}
                onChange={(_, checked) => onChange(index, 'early_access', checked)}
              />
            </TableCell>
            {onDelete && (
              <TableCell>
                <IconButton onClick={() => onDelete(index)} size="small">
                  <IconTrash fontSize="small" />
                </IconButton>
              </TableCell>
            )}
          </TableRow>
        )}
      </Draggable>
    ));
  };

  // const handleMoveAccess = (from: number, to: number) => {
  //   const updated = [...formData.access];
  //   const [movedItem] = updated.splice(from, 1);
  //   updated.splice(to, 0, movedItem);
  //   setFormData((prev) => ({
  //     ...prev,
  //     access: updated,
  //   }));
  // };

  const handleAddDetail = () => {
    // Default access pertama dari accessControl list
    const defaultAccess = accessControl[0];

    if (!defaultAccess) return; // tidak menambahkan jika accessControl kosong

    const newAccess: Access = {
      sort: formData.access.length,
      access_control_id: defaultAccess.id, // Add this line
      name: defaultAccess.name,
      early_access: false,
    };

    setFormData((prev) => ({
      ...prev,
      access: [...(prev.access || []), newAccess],
    }));
  };

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid>
          {/* Location Details */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Location Details
              </Typography>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <CustomFormLabel htmlFor="name" required>
                    Location Name{' '}
                  </CustomFormLabel>
                  <CustomTextField
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={Boolean(errors.name)}
                    helperText={errors.name || ''}
                    fullWidth
                    required
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
                  <CustomFormLabel htmlFor="description" required>
                    Description
                  </CustomFormLabel>
                  <CustomTextField
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={Boolean(errors.description)}
                    helperText={errors.description || ''}
                    fullWidth
                    required
                    disabled={isBatchEdit}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={6}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ marginX: 1 }}
                  >
                    <CustomFormLabel htmlFor="type" required>
                      Type
                    </CustomFormLabel>
                    {isBatchEdit && (
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={enabledFields?.type || false}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                type: parseInt(e.target.value), // parseInt lebih aman untuk kosong
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
                    id="type"
                    name="type"
                    select
                    value={formData.type}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    required
                    disabled={isBatchEdit && !enabledFields?.type}
                  >
                    <MenuItem value="" disabled>
                      Select Type
                    </MenuItem>
                    {/* {Object.entries(SiteType)
                      .filter(([key, value]) => !isNaN(Number(value)))
                      .map(([key, value]) => (
                        <MenuItem key={value} value={value}>
                          {formatEnumLabel(key)}
                        </MenuItem>
                      ))} */}
                    {siteTypes.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>

                  {/* {formData.need_approval && ( */}
                  <Box
                  // display="flex"
                  // alignItems="center"
                  // justifyContent="space-between"
                  // sx={{ marginX: 1 }}
                  >
                    <CustomFormLabel htmlFor="type_approval" required={formData.need_approval}>
                      Type Approval
                    </CustomFormLabel>
                    <CustomSelect
                      id="type_approval"
                      name="type_approval"
                      value={formData.type_approval}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = Number(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          type_approval: value,
                          need_approval: value !== 0 ? true : false, // auto-set if not 0
                        }));
                      }}
                      fullWidth
                      required={formData.need_approval}
                      sx={{ mb: 2 }}
                      // SelectProps={{ native: true }}
                      // disabled={isBatchEdit && !enabledFields?.type_approval} // <- ini penting
                      disabled={!formData.need_approval && isBatchEdit}
                    >
                      <MenuItem value="" disabled>
                        Select Type Approval
                      </MenuItem>
                      {Object.entries(TypeApproval)
                        .filter(([key, value]) => !isNaN(Number(value)))
                        .map(([key, value]) => (
                          <MenuItem key={value} value={value}>
                            {formatEnumLabel(key)}
                          </MenuItem>
                        ))}
                    </CustomSelect>
                  </Box>
                  {/* )} */}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          {/* Language and Timezone */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Language and Timezone
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginX: 1 }}
              >
                <CustomFormLabel htmlFor="timezone" required>
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
                value={formData.timezone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, timezone: e.target.value }))
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
                value={formData.signout_time}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                inputProps={{ step: 1 }}
                disabled={isBatchEdit && !enabledFields?.signout_time}
              />
            </Paper>
          </Grid>

          {/* Right-most settings switches */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Settings
              </Typography>
              {/* Switches */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.can_visited}
                      onChange={(_, checked) => {
                        setFormData((prev) => ({ ...prev, can_visited: checked }));

                        if (isBatchEdit) {
                          setEnabledFields((prev) => ({ ...prev, can_visited: true }));
                        }
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Can Visit
                      <Tooltip title="Visitors can visit the site.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.need_approval}
                      onChange={(_, checked) => {
                        setFormData((prev) => ({ ...prev, need_approval: checked }));
                        if (isBatchEdit) {
                          setEnabledFields((prev) => ({ ...prev, need_approval: true }));
                        }
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Need Approval
                      <Tooltip title="Visitors must be approved before visiting the site.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.can_signout}
                      onChange={(_, checked) => {
                        setFormData((prev) => ({ ...prev, can_signout: checked }));
                        if (isBatchEdit) {
                          setEnabledFields((prev) => ({ ...prev, can_signout: true }));
                        }
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Can Check-out
                      <Tooltip title="Visitors must check out before leaving the site.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.auto_signout}
                      onChange={(_, checked) => {
                        setFormData((prev) => ({
                          ...prev,
                          auto_signout: checked,
                          can_signout: checked ? true : prev.can_signout, // force true if checked, leave unchanged if unchecked
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
                      <Tooltip title="Automatically checks out visitors at a specified time.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.can_contactless_login}
                      onChange={(_, checked) => {
                        setFormData((prev) => ({ ...prev, can_contactless_login: checked }));
                        if (isBatchEdit) {
                          setEnabledFields((prev) => ({ ...prev, can_contactless_login: true }));
                        }
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Contactless Login
                      <Tooltip title="Visitors can do contactless login.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.need_document}
                      onChange={(_, checked) => {
                        setFormData((prev) => ({ ...prev, need_document: checked }));
                        if (isBatchEdit) {
                          setEnabledFields((prev) => ({ ...prev, need_document: true }));
                        }
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Need Document
                      <Tooltip title="Visitors must upload a document before visiting the site.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ borderLeft: '4px solid #673ab7', pl: 1 }}>
                  Access
                </Typography>
                <DragDropContext onDragEnd={handleDragEnd}>
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

                      <Droppable
                        droppableId="access-droppable"
                        isDropDisabled={false}
                        isCombineEnabled={false}
                        ignoreContainerClipping={true}
                      >
                        {(provided) => (
                          <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                            {renderDetailRows(
                              formData.access || [],
                              accessControl,
                              (index, field, value) =>
                                handleDetailChange('access', index, field, value),
                              (index) => handleDetailDelete('access', index),
                            )}
                            {provided.placeholder}
                          </TableBody>
                        )}
                      </Droppable>
                    </Table>
                  </TableContainer>
                </DragDropContext>
                <MuiButton size="small" onClick={() => handleAddDetail()}>
                  Add New
                </MuiButton>
              </Box>
            </Paper>
          </Grid>
          {formData.need_document && (
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
                                    {/* <TableCell>{doc.retentionTime}</TableCell> */}
                                    {/* if 0 rentionTime so give text forever */}
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
                          <IconButton size="small" sx={{ ml: 1 }}>
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

                          // Hanya izinkan angka kosong atau angka murni
                          if (/^\d*$/.test(value)) {
                            setRetentionInput(value);

                            setNewDocumentA((prev) => ({
                              ...prev,
                              retentionTime: value === '' ? 0 : Number(value),
                            }));
                          }
                        }}
                        type="text" // text agar bisa kontrol input
                        inputProps={{
                          inputMode: 'numeric', // buka keyboard angka
                          pattern: '[0-9]*', // cegah input selain angka
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
                    Supports: JPG, JPEG, PNG
                  </Typography>
                  {/* Show file name or short base64 */}
                  {/* {(siteImageFile || formData.image) && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 1, color: '#1976d2', wordBreak: 'break-all' }}
                    >
                      {siteImageFile
                        ? siteImageFile.name
                        : formData.image
                        ? `${formData.image.substring(0, 30)}...${formData.image.substring(
                            formData.image.length - 10,
                          )}`
                        : ''}
                    </Typography>
                  )} */}
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
                <Box sx={{ mt: 4, maxWidth: 600, margin: '0' }}>
                  <CustomFormLabel htmlFor="map_link">Map Link (Google Maps)</CustomFormLabel>
                  <CustomTextField
                    id="map_link"
                    value={formData.map_link}
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
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </form>

      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1, // di atas drawer & dialog
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default FormSite;
