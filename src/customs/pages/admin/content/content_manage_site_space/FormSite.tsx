import {
  Button,
  Grid2 as Grid,
  Alert,
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
  TableContainer,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Box } from '@mui/system';
import React, { useEffect, useState, useRef } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateSiteRequest,
  CreateSiteRequestSchema,
  generateKeyCode,
  Item,
  SiteType,
  TypeApproval,
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
} from 'src/customs/api/admin';
import {
  CreateSiteDocumentRequest,
  CreateSiteDocumentRequestSchema,
  Item as SiteDocumentItem,
} from 'src/customs/api/models/SiteDocument';
import { Item as DocumentItem } from 'src/customs/api/models/Document';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

interface FormSiteProps {
  formData: Item;
  setFormData: React.Dispatch<React.SetStateAction<Item>>;
  editingId?: string;
  onSuccess?: () => void;
}

const FormSite = ({ formData, setFormData, editingId, onSuccess }: FormSiteProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    console.log('Submitting form with data:', formData);
    e.preventDefault();
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
      const data: CreateSiteRequest = CreateSiteRequestSchema.parse(formData);
      console.log('Setting Data: ', data);
      if (editingId && editingId !== '') {
        await updateSite(editingId, data, token);

        console.log('Editing ID:', editingId);
      } else {
        await createSite(data, token);
      }

      await createSiteDocumentsForNewSite();
      handleFileUpload();
      localStorage.removeItem('unsavedSiteForm');
      setAlertType('success');
      setAlertMessage('Site successfully created!');
      setTimeout(() => {
        onSuccess?.();
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
      setLoading(false);
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

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid>
          {/* Location Details */}
          <Grid size={{ xs: 12, md: 5 }}>
            {/* <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Site Access
              </Typography>
              <Button onClick={handleKeyClick}>
                <Typography variant="h6">Key</Typography>
              </Button>
            </Paper> */}
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
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={6}>
                  <CustomFormLabel htmlFor="type" required>
                    Type
                  </CustomFormLabel>
                  <CustomSelect
                    id="type"
                    select
                    value={formData.type}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev) => ({ ...prev, type: Number(e.target.value) }))
                    }
                    fullWidth
                    sx={{ mb: 2 }}
                    required
                    // SelectProps={{ native: true }}
                  >
                    <MenuItem value="" disabled>
                      Select Type
                    </MenuItem>
                    {Object.entries(SiteType)
                      .filter(([key, value]) => !isNaN(Number(value)))
                      .map(([key, value]) => (
                        <MenuItem key={value} value={value}>
                          {formatEnumLabel(key)}
                        </MenuItem>
                      ))}
                  </CustomSelect>
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
                </Grid>
                {/* <Grid size={{ xs: 6 }}>
                  <CustomFormLabel htmlFor="city">City</CustomFormLabel>
                  <CustomTextField
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Grid> */}
                {/* <Grid size={{ xs: 6 }}>
                  <CustomFormLabel htmlFor="province">State</CustomFormLabel>
                  <CustomTextField
                    id="province"
                    value={formData.province}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Grid> */}
                {/* <Grid size={{ xs: 6 }}>
                  <CustomFormLabel htmlFor="zipCode">Zip Code</CustomFormLabel>
                  <CustomTextField
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 3 }}
                  />
                </Grid> */}
              </Grid>
            </Paper>
          </Grid>
          {/* Language and Timezone */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 5, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Language and Timezone
              </Typography>
              <CustomFormLabel htmlFor="timezone" required>
                Timezone
              </CustomFormLabel>
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
              <CustomFormLabel htmlFor="signout_time">Check-out Time</CustomFormLabel>
              <CustomTextField
                id="signout_time"
                type="time"
                value={formData.signout_time}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                inputProps={{ step: 1 }}
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
                      onChange={(_, checked) =>
                        setFormData((prev) => ({ ...prev, can_visited: checked }))
                      }
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
                      onChange={(_, checked) =>
                        setFormData((prev) => ({ ...prev, need_approval: checked }))
                      }
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
                      onChange={(_, checked) =>
                        setFormData((prev) => ({ ...prev, can_signout: checked }))
                      }
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
                      onChange={(_, checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          auto_signout: checked,
                          can_signout: checked ? true : prev.can_signout, // force true if checked, leave unchanged if unchecked
                        }))
                      }
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
                      onChange={(_, checked) =>
                        setFormData((prev) => ({ ...prev, can_contactless_login: checked }))
                      }
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
                      onChange={(_, checked) =>
                        setFormData((prev) => ({ ...prev, need_document: checked }))
                      }
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
                    cursor: 'pointer',
                    width: '100%',
                    margin: '0 auto',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    Upload Site Image
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Supports: JPG, JPEG, PNG
                  </Typography>
                  {/* Show file name or short base64 */}
                  {(siteImageFile || formData.image) && (
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
                  )}
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
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
          {/* <Button
            sx={{ mt: 2, width: '25%' }}
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading}
            
            size='large'
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button> */}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button color="primary" variant="contained" type="submit" disabled={loading} size="large">
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </form>

      {/* <Dialog open={keyDialogOpen} onClose={handleKeyDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ borderLeft: '4px solid #673ab7', pl: 1, fontWeight: 600 }}>
          Location Key
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
            Location Key Details
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Location Key
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {formData.code}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            QR Code
          </Typography>
          <QRCodeCanvas value={formData.code} size={128} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleKeyDialogClose}>Cancel</Button>
          <Button onClick={handleRegenerateKey} variant="contained" color="primary">
            Re-Generate Key
          </Button>
        </DialogActions>
      </Dialog> */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </>
  );
};

export default FormSite;
