import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Skeleton,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Autocomplete,
  Divider,
  IconButton,
  Avatar,
  Paper,
  Chip,
  Checkbox,
  FormControlLabel,
  Stepper,
  StepLabel,
  Step,
  StepIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
  TextField,
  MenuItem,
  Portal,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  Radio,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CameraUpload from 'src/customs/components/camera/CameraUpload';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconArrowRight, IconDownload, IconMail, IconTrash, IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';
import FilterMoreContent from './FilterMoreContent';
import dayjs from 'dayjs';
import {
  createVisitorInvitation,
  getDetailInvitationForm,
  getInvitation,
  getInvitationById,
  getInvitationRelatedVisitor,
  getOngoingInvitation,
} from 'src/customs/api/visitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import { Download } from '@mui/icons-material';
import QRCode from 'react-qr-code';
// import CameraUpload from 'src/customs/components/camera/CameraUpload';
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers';
import { FormVisitor } from 'src/customs/api/models/Admin/Visitor';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { updateExtend } from 'src/customs/api/admin';
import moment from 'moment-timezone';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { IconArrowLeft } from '@tabler/icons-react';
import { showSwal } from 'src/customs/components/alerts/alerts';
import InvitationDetailDialog from './components/Dialog/InvitationDetailDialog';
import ExtendVisitDialog from './components/Dialog/ExtendVisitDialog';
import SelectAgendaInvitationDialog from './components/Dialog/SelectAgendaInvitationDialog';

const Invitation = () => {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [openExtendVisit, setOpenExtendVisit] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [invitatioOpenDetail, setInvitatioOpenDetail] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180];
  const [extendedEndTime, setExtendedEndTime] = useState<any | null>(null);
  const [dataVisitor, setDataVisitor] = useState<any[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [permissionAccess, setPermissionAccess] = useState<any[]>([]);
  const THEME = useTheme();
  const isMobile = useMediaQuery(THEME.breakpoints.down('sm'));
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({}); //
  const [uploadMethods, setUploadMethods] = useState<Record<string, 'file' | 'camera'>>({});

  const [invitationDetail, setInvitationDetail] = useState<any>([]);
  const [invitationDetailVisitor, setInvitationDetailVisitor] = useState<[]>([]);
  const [openInvitationDialog, setOpenInvitationDialog] = useState(false);
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});

  const cards = [
    {
      title: 'Total Invitation',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      icon: IconMail,
      color: 'none',
    },
  ];

  const handleAdd = () => {
    setOpenDialog(true);
  };

  const [filters, setFilters] = useState<any>({
    site_id: '',
  });

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  const [applyToAll, setApplyToAll] = useState(false);

  const handleApplyToAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setApplyToAll(checked);
  };

  const [detailVisitorInvitation, setDetailVisitorInvitation] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // hitung tanggal
        const start_date = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
        const end_date = dayjs().add(0, 'day').format('YYYY-MM-DD');

        // if (isDataReady) {
        const res = await getInvitation(token as string, start_date, end_date);
        const rows = res.collection.map((item: any) => {
          return {
            id: item.id,
            name: item.visitor.name,
            email: item.visitor.email,
            // organization: item.visitor.organization,
            invitation_code: item.invitation_code,
            // gender: item.visitor.gender,
            phone: item.visitor.phone,
            visitor_period_start: item.visitor_period_start,
            visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
            host: item.host_name ?? item.host ?? '-',
            agenda: item.agenda,
            site: item.site_place_name,
          };
        });

        setTableData(rows ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, refreshTrigger]);

  const handleView = async (id: string) => {
    if (!id || !token) return;

    setOpenInvitationDialog(true);
    setInvitationDetail([]);
    setDetailVisitorInvitation([]);

    try {
      const res = await getInvitationById(id, token);
      console.log('res', res);
      setInvitationDetail(res?.collection ?? {});

      try {
        const resAnotherVisitor = await getInvitationRelatedVisitor(id, token);
        setDetailVisitorInvitation(resAnotherVisitor?.collection ?? []);
      } catch (relatedErr) {
        console.warn('No related visitor data found or request failed.');
        setDetailVisitorInvitation([]);
      }

      console.log('Invitation Detail:', res?.collection);
    } catch (err: any) {
      console.error(err?.message || 'Failed to fetch invitation detail.');
    }
  };

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const res = await getOngoingInvitation(token as string);
        setInvitationDetailVisitor(res?.collection ?? []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [token]);

  const handleSelectInvitation = async (_: any, selected: any) => {
    if (!selected || !selected.id) return;

    console.log('Selected invitation:', selected);

    try {
      const detail = await getDetailInvitationForm(token as string, selected.id);
      setInvitationData(detail);
    } catch (error) {
      console.error('Error fetching invitation detail:', error);
    }
  };

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    const current = groupedSections[activeStep];
    if (!current) return;
    // const valid = validateStep(current);
    // if (!valid) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // 🧾 Simulasi validasi sederhana per step
  // const validateStep = (section: any) => {
  //   if (!section) return true;

  //   // contoh: pastikan semua mandatory field diisi
  //   for (const s of section.sections || []) {
  //     for (const f of s.form || []) {
  //       if (f.mandatory && !f.answer_text && !f.answer_file) {
  //         alert(`Field "${f.long_display_text}" masih kosong.`);
  //         return false;
  //       }
  //     }
  //   }
  //   return true;
  // };

  const getSectionType = (section: any) => {
    const f = section.form || [];

    if (f.some((x: any) => x.remarks === 'vehicle_plate') && !section.is_document) return 'parking';
    if (f.some((x: any) => x.remarks === 'host')) return 'purpose_visit';
    if (f.some((x: any) => x.remarks === 'nda')) return 'nda';
    if (f.some((x: any) => x.remarks === 'identity_image')) return 'identity_image';
    if (f.some((x: any) => x.remarks === 'selfie_image')) return 'selfie_image';
    if (!section.is_document) return 'visitor_information';
    return 'unknown';
  };

  const groupedSections = React.useMemo(() => {
    if (!invitationData?.collection?.question_page) return [];

    const qPages = invitationData.collection.question_page;
    const visitorGroup = qPages.filter((q: any) => !['purpose_visit'].includes(getSectionType(q)));
    const purposeVisit = qPages.find((q: any) => getSectionType(q) === 'purpose_visit');

    const result: { label: string; type: string; sections: any[] }[] = [];

    if (visitorGroup.length > 0)
      result.push({
        label: 'Visitor Information (Group)',
        type: 'visitor_information_group',
        sections: visitorGroup,
      });

    if (purposeVisit)
      result.push({
        label: 'Purpose Visit',
        type: 'purpose_visit',
        sections: [purposeVisit],
      });

    return result;
  }, [invitationData]);

  const steps = groupedSections.map((s) => s.label);

  useEffect(() => {
    if (!invitationData?.collection) return;
    const qPages = invitationData.collection.question_page || [];
    setDataVisitor([{ question_page: qPages }]);
    setActiveStep(0);
  }, [invitationData]);

  const uploadFileToCDN = async (file: File | Blob): Promise<string | null> => {
    const formData = new FormData();

    const filename = file instanceof File && file.name ? file.name : 'selfie.png';
    formData.append('file_name', filename);
    formData.append('file', file, filename);
    formData.append('path', 'visitor');

    try {
      const response = await axiosInstance2.post('/cdn/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = response.data?.collection?.file_url;
      console.log('CDN Response File URL:', fileUrl);

      if (!fileUrl) return null;

      // Tambahkan protokol jika belum ada
      return fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const handleUploadMethodChange = (ukey: string, v: string) => {
    setUploadMethods((prev) => ({ ...prev, [ukey]: v as 'file' | 'camera' }));
  };
  const handleFileChangeForField = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setAnswerFile: (url: string) => void,
    trackKey?: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // tampilkan preview lokal dulu (supaya user melihat langsung)
    if (trackKey) {
      setUploadNames((prev) => ({ ...prev, [trackKey]: file.name }));
      setPreviews((prev) => ({ ...prev, [trackKey]: URL.createObjectURL(file) }));
    }

    const path = await uploadFileToCDN(file);
    if (path) setAnswerFile(path);

    e.target.value = '';
  };

  const handleRemoveFileForField = async (
    currentUrl: string,
    setAnswerFile: (url: string) => void,
    inputId: string,
  ) => {
    try {
      setRemoving((s) => ({ ...s, [inputId]: true }));
      if (currentUrl) {
        await axiosInstance2.delete(`/cdn${currentUrl}`);
      }

      setAnswerFile('');
      setPreviews((p) => ({ ...p, [inputId]: null }));
      setUploadNames((n) => {
        const { [inputId]: _, ...rest } = n;
        return rest;
      });
      const el = document.getElementById(inputId) as HTMLInputElement | null;
      if (el) el.value = '';
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setRemoving((s) => ({ ...s, [inputId]: false }));
    }
  };

  useEffect(() => {
    if (!invitationData?.collection?.question_page) return;

    const allForms = invitationData.collection.question_page.flatMap((p: any) => p.form || []);
    const map: Record<string, string> = {};

    allForms.forEach((f: any, i: any) => {
      if (f.answer_file) {
        const name = f.answer_file.split('/').pop()?.split('?')[0] ?? 'Uploaded File';
        map[String(i)] = name;
      }
    });
    setUploadNames(map);
  }, [invitationData]);

  const renderFieldInput = (
    field: FormVisitor,
    index: number,
    onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void,
    onDelete?: (index: number) => void,
    opts?: { showLabel?: boolean; uniqueKey?: string },
  ) => {
    const showLabel = opts?.showLabel ?? true;

    const renderInput = () => {
      switch (field.field_type) {
        case 0: // Text
          return (
            <TextField
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder=""
              fullWidth
              sx={{ minWidth: 160, maxWidth: '100%' }}
            />
          );

        case 1: // Number
          return (
            <TextField
              type="number"
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder="Enter number"
              fullWidth
            />
          );

        case 2: // Email
          return (
            <TextField
              type="email"
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder=""
              fullWidth
              sx={{ minWidth: 160, maxWidth: '100%' }}
            />
          );

        case 3: {
          let options: { value: string; name: string }[] = [];
          return (
            <Autocomplete
              size="small"
              options={options}
              getOptionLabel={(option) => option.name}
              inputValue={inputValues[index] || ''}
              onInputChange={(_, newInputValue) =>
                setInputValues((prev) => ({ ...prev, [index]: newInputValue }))
              }
              filterOptions={(opts, state) => {
                if (state.inputValue.length < 3) return [];
                return opts.filter((opt) =>
                  opt.name.toLowerCase().includes(state.inputValue.toLowerCase()),
                );
              }}
              noOptionsText={
                (inputValues[index] || '').length < 3 ? 'Enter at least 3 characters' : 'Not found'
              }
              value={options.find((opt) => opt.value === field.answer_text) || null}
              onChange={(_, newValue) =>
                onChange(index, 'answer_text', newValue ? newValue.value : '')
              }
              renderInput={(params) => (
                <TextField {...params} label="" placeholder="Ketik minimal 3 karakter" fullWidth />
              )}
            />
          );
        }

        case 4: // Date
          return (
            <TextField
              type="date"
              size="small"
              value={field.answer_datetime}
              onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
              fullWidth
            />
          );

        case 5: // Radio
          if (field.remarks === 'gender') {
            const genderOptions = field.multiple_option_fields?.length
              ? field.multiple_option_fields
              : [
                  { id: '1', value: '0', name: 'Female' },
                  { id: '2', value: '1', name: 'Male' },
                  { id: '3', value: '2', name: 'Prefer not to say' },
                ];

            return (
              <TextField
                select
                size="small"
                value={field.answer_text || ''}
                onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                fullWidth
                sx={{ width: 120 }}
              >
                {genderOptions.map((opt) => (
                  <MenuItem key={opt.id} value={opt.value}>
                    {opt.name}
                  </MenuItem>
                ))}
              </TextField>
            );
          }
          if (field.remarks === 'vehicle_type') {
            let options = field.multiple_option_fields || [];

            // ✅ Kalau options kosong tapi answer_text sudah ada, tambahkan minimal 1 opsi
            if (options.length === 0 && field.answer_text) {
              options = [{ id: 'default', value: field.answer_text, name: field.answer_text }];
            }

    
            if (options.length === 0) {
              options = [
                { id: '1', value: 'truck', name: 'Truck' },
                { id: '2', value: 'other', name: 'Other' },
                { id: '3', value: 'bicycle', name: 'Bicycle' },
                { id: '4', value: 'motor', name: 'Motor' },
                { id: '5', value: 'private_car', name: 'Private Car' },
                { id: '6', value: 'car', name: 'Car' },
                { id: '7', value: 'bus', name: 'Bus' },
              ];
            }

            return (
              <TextField
                select
                size="small"
                fullWidth
                value={field.answer_text || ''}
                onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                sx={{ minWidth: 150 }}
                SelectProps={{ displayEmpty: true }}
              >
                {options.map((opt) => (
                  <MenuItem key={opt.id} value={opt.name}>
                    {opt.name}
                  </MenuItem>
                ))}
              </TextField>
            );
          }

          if (field.remarks === 'is_driving') {
            return (
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={field.answer_text || ''}
                  onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                  sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio size="small" color="primary" />}
                    label="Yes"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio size="small" color="primary" />}
                    label="No"
                  />
                </RadioGroup>
              </FormControl>
            );
          }
          return (
            <TextField
              size="small"
              value={field.answer_text}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              placeholder="Enter text"
              fullWidth
            />
          );

        case 6: // Checkbox
          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.answer_text)}
                  onChange={(e) => onChange(index, 'answer_text', e.target.checked)}
                />
              }
              label=""
            />
          );

        case 8: // Time
          return (
            <TextField
              type="time"
              size="small"
              value={field.answer_datetime}
              onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
              fullWidth
            />
          );

        case 9:
          return (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
              <DateTimePicker
                value={field.answer_datetime ? dayjs(field.answer_datetime) : null}
                ampm={false}
                onChange={(newValue) => {
                  if (newValue) {
                    const utc = newValue.utc().format();
                    onChange(index, 'answer_datetime', utc);
                  }
                }}
                format="dddd, DD MMMM YYYY, HH:mm"
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          );

        case 10: // Camera
          return (
            <CameraUpload
              value={field.answer_file}
              onChange={(url) => onChange(index, 'answer_file', url)}
            />
          );

        case 11: {
          const key = opts?.uniqueKey ?? String(index);
          const fileUrl = (field as any).answer_file as string | undefined;
          return (
            <Box>
              <label htmlFor={key}>
                <Box
                  sx={{
                    border: '2px dashed #90caf9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    borderRadius: 2,
                    p: 0.5,
                    textAlign: 'center',
                    backgroundColor: '#f5faff',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
                  <Typography variant="subtitle1">Upload File</Typography>
                </Box>
              </label>

              <input
                id={key}
                type="file"
                accept="*"
                hidden
                // onChange={handlePDFUploadFor(index, onChange)
                onChange={(e) =>
                  handleFileChangeForField(
                    e as React.ChangeEvent<HTMLInputElement>,
                    (url) => onChange(index, 'answer_file', url),
                    key,
                  )
                }
              />

              {fileUrl && (
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" noWrap>
                    {uploadNames[key] ?? fileUrl.split('/').pop()?.split('?')[0] ?? 'Uploaded File'}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      handleRemoveFileForField(
                        fileUrl,
                        (url) => onChange(index, 'answer_file', url),
                        key,
                      )
                    }
                  >
                    <IconX size={16} />
                  </IconButton>
                </Box>
              )}
            </Box>
          );
        }

        case 12: {
          const key = opts?.uniqueKey ?? String(index);
          return (
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              gap={1.5}
              width="100%"
              sx={{ maxWidth: 400 }}
            >
              <TextField
                select
                size="small"
                value={uploadMethods[key] || 'file'}
                onChange={(e) => handleUploadMethodChange(key, e.target.value)}
                fullWidth
                sx={{
                  width: { xs: '100%', md: '200px' },
                }}
              >
                <MenuItem value="file">Choose File</MenuItem>
                <MenuItem value="camera">Take Photo</MenuItem>
              </TextField>

              {(uploadMethods[key] || 'file') === 'camera' ? (
                <CameraUpload
                  value={field.answer_file}
                  onChange={(url) => onChange(index, 'answer_file', url)}
                />
              ) : (
                <Box sx={{ width: { xs: '100%', md: '200px' } }}>
                  <label htmlFor={key}>
                    <Box
                      sx={{
                        border: '2px dashed #90caf9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        borderRadius: 2,
                        p: 0.5,
                        textAlign: 'center',
                        backgroundColor: '#f5faff',
                        cursor: 'pointer',
                        width: '100%',
                        transition: '0.2s',
                        '&:hover': { backgroundColor: '#e3f2fd' },
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
                      <Typography variant="subtitle1" sx={{ fontSize: { xs: 13, md: 14 } }}>
                        Upload File
                      </Typography>
                    </Box>
                  </label>

                  <input
                    id={key}
                    type="file"
                    accept="*"
                    hidden
                    onChange={(e) =>
                      handleFileChangeForField(
                        e as React.ChangeEvent<HTMLInputElement>,
                        (url) => onChange(index, 'answer_file', url),
                        key,
                      )
                    }
                  />

                  {!!(field as any).answer_file && (
                    <Box
                      mt={0.5}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ overflow: 'hidden' }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        {uploadNames[key] ??
                          (field as any).answer_file.split('/').pop()?.split('?')[0] ??
                          'Uploaded File'}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={!!removing[key]}
                        onClick={() =>
                          handleRemoveFileForField(
                            (field as any).answer_file,
                            (url) => onChange(index, 'answer_file', url),
                            key,
                          )
                        }
                      >
                        <IconX size={16} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          );
        }
        default:
          return (
            <TextField
              size="small"
              value={field.long_display_text}
              onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
              placeholder="Enter value"
              fullWidth
            />
          );
      }
    };

    return (
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        {showLabel && (
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            {field.long_display_text}
          </Typography>
        )}
        {renderInput()}
      </Box>
    );
  };

  const handleSubmit = async () => {
    if (!invitationData?.collection) return;

    const source = invitationData.collection;

    setLoadingAccess(true);
    const payload = {
      visitor_type: source.visitor_type ?? source.visitor_type_data?.id ?? '',
      type_registered: 1,
      // is_group: source.is_group ?? true,
      is_group: true,
      group_name: source.group_name ?? '',
      tz: source.tz ?? 'Asia/Jakarta',
      registered_site: source.site_place_data?.id ?? '',
      data_visitor: dataVisitor.map((visitor: any) => ({
        question_page: (visitor.question_page ?? []).map((page: any) => ({
          id: page.id,
          sort: page.sort ?? 0,
          name: page.name,
          status: 0,
          is_document: page.is_document ?? false,
          can_multiple_used: page.can_multiple_used ?? false,
          self_only: page.self_only ?? false,
          foreign_id: page.foreign_id ?? '',
          form: (page.form ?? []).map((f: any) => ({
            sort: f.sort ?? 0,
            short_name: f.short_name,
            long_display_text: f.long_display_text,
            field_type: f.field_type,
            is_primary: f.is_primary ?? false,
            is_enable: f.is_enable ?? true,
            mandatory: f.mandatory ?? false,
            remarks: f.remarks,
            custom_field_id: f.custom_field_id,
            multiple_option_fields: f.multiple_option_fields ?? [],
            visitor_form_type: 1,
            answer_text: f.answer_text ?? null,
            answer_datetime: f.answer_datetime ?? null,
            answer_file: f.answer_file ?? null,
          })),
        })),
      })),
    };

    console.log('🚀 Payload ready:', JSON.stringify(payload, null, 2));

    try {
      const id = source.id;
      // console.log('id', id);
      const res = await createVisitorInvitation(token as string, id, payload);
      console.log('✅ Success:', JSON.stringify(res, null, 2));
      showSwal('success', 'Visitor has been invited.');
    } catch (err) {
      console.error('❌ Failed:', err);
    } finally {
      setTimeout(() => setLoadingAccess(false), 1000);
    }
  };
  const handleAddDetails = () => {
    if (!invitationData?.collection?.question_page) return;

    setDataVisitor((prev) => {
      const clone = JSON.parse(JSON.stringify(invitationData.collection.question_page));

      const sharedRemarks = [
        'host',
        'agenda',
        'site_place',
        'visitor_period_start',
        'visitor_period_end',
      ];

      // Kosongkan hanya field non-shared
      clone.forEach((page: any) => {
        (page.form ?? []).forEach((f: any) => {
          if (!sharedRemarks.includes(f.remarks)) {
            f.answer_text = null;
            f.answer_datetime = null;
            f.answer_file = null;
          }
        });
      });

      // Tambahkan ke list visitor
      const next = [...prev, { question_page: clone }];
      setActiveGroupIdx(next.length - 1);
      return next;
    });
  };

  const renderStepContent = (stepIndex: number) => {
    if (!groupedSections.length) return null;
    const current = groupedSections[stepIndex];
    if (!current) return null;

    if (current.type === 'visitor_information_group') {
      const visitorSections = current.sections || [];
      // 🔹 kumpulkan semua form dari semua section
      const allForms = visitorSections.flatMap((section: any) => section.form || []);

      const uniqueForms = allForms.filter(
        (f: any, idx: number, arr: any[]) =>
          f.remarks && arr.findIndex((x) => x.remarks === f.remarks) === idx,
      );

      return (
        <Grid>
          <Box>
            <TableContainer component={Paper} sx={{ mb: 1 }}>
              {isMobile ? (
                <>
                  {dataVisitor.length > 0 ? (
                    dataVisitor.map((group, gIdx) => (
                      <Accordion key={gIdx} sx={{ mb: 1 }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                          }}
                        >
                          <Typography fontWeight="bold">Visitor {gIdx + 1}</Typography>

                          {dataVisitor.length > 1 && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDataVisitor((prev) => prev.filter((_, i) => i !== gIdx));
                              }}
                            >
                              <IconTrash />
                            </IconButton>
                          )}
                        </AccordionSummary>

                        <AccordionDetails>
                          {uniqueForms.map((formDef: any, fIdx: number) => {
                            const found = group.question_page
                              .flatMap((s: any) => s.form)
                              .find((f: any) => f.remarks === formDef.remarks);

                            if (!found) return null;
                            return (
                              <Box key={`${gIdx}-${fIdx}`} sx={{ mb: 2 }}>
                                {renderFieldInput(
                                  found,
                                  fIdx,
                                  (i, fieldKey, value) => {
                                    setDataVisitor((prev) => {
                                      const next = [...prev];
                                      const targetPage = next[gIdx].question_page.find((q: any) =>
                                        q.form.some((f: any) => f.remarks === found.remarks),
                                      );
                                      if (!targetPage) return prev;
                                      const formIdx = targetPage.form.findIndex(
                                        (f: any) => f.remarks === found.remarks,
                                      );
                                      if (formIdx !== -1) {
                                        targetPage.form[formIdx] = {
                                          ...targetPage.form[formIdx],
                                          [fieldKey]: value,
                                        };
                                      }
                                      return next;
                                    });
                                  },
                                  undefined,
                                  { uniqueKey: `${gIdx}-${fIdx}` },
                                )}
                              </Box>
                            );
                          })}
                        </AccordionDetails>
                      </Accordion>
                    ))
                  ) : (
                    <Typography align="center" sx={{ py: 2 }}>
                      No visitor data. Click "Add New" to start.
                    </Typography>
                  )}

                  <Button
                    size="small"
                    variant="contained"
                    sx={{ my: 2 }}
                    fullWidth
                    onClick={handleAddDetails}
                  >
                    Add New
                  </Button>
                </>
              ) : (
                <Table
                  size="small"
                  sx={{
                    minWidth: 1000,
                    tableLayout: 'auto',
                    '& th, & td': { whiteSpace: 'nowrap' },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      {uniqueForms.map((f: any, i: any) => (
                        <TableCell key={f.custom_field_id || i}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {f.long_display_text}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Actions
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {dataVisitor.length > 0 ? (
                      dataVisitor.map((group, gIdx) => (
                        <TableRow key={gIdx}>
                          {uniqueForms.map((formDef: any, fIdx: number) => {
                            const found = group.question_page
                              .flatMap((s: any) => s.form)
                              .find((f: any) => f.remarks === formDef.remarks);

                            return (
                              <TableCell key={`${gIdx}-${fIdx}`}>
                                {found
                                  ? renderFieldInput(
                                      found,
                                      fIdx,
                                      (i, fieldKey, value) => {
                                        setDataVisitor((prev) => {
                                          const next = [...prev];
                                          const targetPage = next[gIdx].question_page.find(
                                            (q: any) =>
                                              q.form.some((f: any) => f.remarks === found.remarks),
                                          );
                                          if (!targetPage) return prev;
                                          const formIdx = targetPage.form.findIndex(
                                            (f: any) => f.remarks === found.remarks,
                                          );
                                          if (formIdx !== -1) {
                                            targetPage.form[formIdx] = {
                                              ...targetPage.form[formIdx],
                                              [fieldKey]: value,
                                            };
                                          }
                                          return next;
                                        });
                                      },
                                      undefined,
                                      { uniqueKey: `${gIdx}-${fIdx}`, showLabel: false },
                                    )
                                  : null}
                              </TableCell>
                            );
                          })}
                          <TableCell align="right">
                            {dataVisitor.length > 1 && (
                              <IconButton
                                aria-label="delete-row"
                                onClick={() =>
                                  setDataVisitor((prev) => prev.filter((_, i) => i !== gIdx))
                                }
                                size="small"
                              >
                                <IconTrash />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={uniqueForms.length + 1} align="center">
                          No visitor data. Click "Add New" to start.
                        </TableCell>
                      </TableRow>
                    )}

                    <TableRow>
                      <TableCell colSpan={uniqueForms.length + 1} align="left">
                        <Button
                          size="small"
                          onClick={handleAddDetails}
                          sx={{ mx: 1, my: 1 }}
                          variant="contained"
                        >
                          Add New
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Box>
        </Grid>
      );
    }

    if (current.type === 'purpose_visit') {
      const section = current.sections[0];

      return (
        <Box>
          {section.form.map((f: any, fIdx: number) => {
            let displayValue = '-';

            if (f.remarks === 'host') {
              // tampilkan nama host, bukan ID
              displayValue = invitationData?.collection?.host_data?.name ?? f.answer_text ?? '-';
            } else if (f.remarks === 'site_place') {
              // tampilkan nama site, bukan ID
              displayValue =
                invitationData?.collection?.site_place_data?.name ?? f.answer_text ?? '-';
            } else if (f.remarks === 'visitor_period_start' || f.remarks === 'visitor_period_end') {
              // 🕒 khusus untuk field waktu (convert UTC → local)
              const dt = moment.utc(f.answer_datetime).local();
              const raw = f.answer_datetime;

              displayValue = dt.isValid()
                ? dt.format('ddd, DD MMM YYYY, HH:mm')
                : f.answer_datetime;
            } else if (f.answer_text) {
              displayValue = f.answer_text;
            } else if (f.answer_datetime) {
              try {
                const dt = moment.utc(f.answer_datetime).local();
                console.log('Converted time:', dt.format());

                displayValue = dt.isValid()
                  ? dt.format('ddd, DD MMM YYYY, HH:mm')
                  : f.answer_datetime;
              } catch (err) {
                console.error('Invalid datetime:', f.answer_datetime);
                displayValue = f.answer_datetime;
              }
            } else if (f.answer_file) {
              displayValue = f.answer_file;
            }

            return (
              <Box key={fIdx} sx={{ mb: 2 }}>
                <CustomFormLabel>{f.long_display_text}</CustomFormLabel>
                <CustomTextField fullWidth size="small" value={displayValue} disabled />
              </Box>
            );
          })}
        </Box>
      );
    }

    return null;
  };

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedMinutes) return;

    try {
      setLoadingAccess(true);


      await new Promise((resolve) => setTimeout(resolve, 0));

      await updateExtend(token, {
        id: invitationDetail?.id,
        period: selectedMinutes,
        apply_to_all: applyToAll,
      });

      if (invitationDetail?.visitor_period_end) {
        const baseTime = moment
          .utc(invitationDetail.visitor_period_end)
          .add(invitationDetail.extend_visitor_period || 0, 'minutes');

        const newEnd = baseTime.add(selectedMinutes, 'minutes');

        setExtendedEndTime(newEnd.toISOString());

        setTableData((prev) =>
          prev.map((row) =>
            row.id === invitationDetail.id
              ? { ...row, visitor_period_end: newEnd.format('YYYY-MM-DD HH:mm') }
              : row,
          ),
        );
      }
      setTimeout(() => setLoadingAccess(false), 800);

      // 🟢 BARU MUNCULKAN ALERT
      setTimeout(() => showSwal('success', 'Successfully extended visit.'), 1000);

      setOpenExtendVisit(false);
    } catch (err: any) {
      setLoadingAccess(false);

      const message = err?.response?.data?.msg || err?.message || 'Failed to extend visit.';
      showSwal('error', message);
    }
  };

  const finalEndTime = extendedEndTime
    ? extendedEndTime
    : invitationDetail?.visitor_period_end
    ? moment
        .utc(invitationDetail.visitor_period_end)
        .add(invitationDetail.extend_visitor_period || 0, 'minutes')
        .local()
    : null;

  const handleCloseExtend = () => {
    setApplyToAll(false);
    setSelectedMinutes(null);
    setOpenExtendVisit(false);
  };

  return (
    <>
      <PageContainer title="Invitation" description="Invitation Page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={tableData}
                isHavePagination={true}
                selectedRows={selectedRows}
                defaultRowsPerPage={rowsPerPage}
                isNoActionTableHead={true}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                titleHeader="Invitation"
                isHaveHeaderTitle={true}
                isHaveSearch={false}
                isHavePeriod={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveView={true}
                isHaveFilterMore={false}
                onView={(row: { id: string }) => {
                  handleView(row.id);
                }}
                isHaveHeader={false}
                isHavePdf={true}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                  />
                }
                onAddData={() => {
                  handleAdd();
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <SelectAgendaInvitationDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          invitations={invitationDetailVisitor}
          onSelectInvitation={handleSelectInvitation}
          onNext={() => setInvitatioOpenDetail(true)}
        />

        <Dialog
          open={invitatioOpenDetail}
          onClose={() => setInvitatioOpenDetail(false)}
          fullWidth
          // maxWidth="xl"
          maxWidth={false}
          PaperProps={{
            sx: {
              width: '100vw',
            },
          }}
        >
          <DialogTitle>Detail Invitation</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => setInvitatioOpenDetail(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
          <Divider />
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 12 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {groupedSections.map((s, idx) => (
                    <Step key={idx}>
                      <StepLabel
                        onClick={() => setActiveStep(idx)}
                        sx={{ fontSize: '16px !important' }}
                      >
                        {s.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <>
                  <Box mt={4}>{renderStepContent(activeStep)}</Box>
                  <Box display="flex" flexDirection="row" mt={4}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      startIcon={<IconArrowLeft size={18} />}
                    >
                      Back
                    </Button>
                    <Box flex="1 1 auto" />
                    {activeStep !== steps.length - 1 ? (
                      <Button
                        onClick={handleNext}
                        variant="contained"
                        endIcon={<IconArrowRight size={18} />}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} variant="contained" color="primary">
                        Submit
                      </Button>
                    )}
                  </Box>
                </>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>

        <InvitationDetailDialog
          open={openInvitationDialog}
          onClose={() => setOpenInvitationDialog(false)}
          invitationDetail={invitationDetail}
          detailVisitorInvitation={detailVisitorInvitation}
          finalEndTime={finalEndTime}
          onExtend={() => setOpenExtendVisit(true)}
        />
        <ExtendVisitDialog
          open={openExtendVisit}
          onClose={handleCloseExtend}
          durationOptions={durationOptions}
          selectedMinutes={selectedMinutes}
          onSelectMinutes={setSelectedMinutes}
          applyToAll={applyToAll}
          onToggleApplyToAll={setApplyToAll}
          onSubmit={handleExtend}
        />
        <Portal>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarType}
              sx={{ width: '100%', zIndex: 99999 }}
            >
              {snackbarMsg}
            </Alert>
          </Snackbar>
        </Portal>
        <Portal>
          <Backdrop
            sx={{
              zIndex: 99998,
              position: 'fixed',
              margin: '0 auto',
              color: 'primary',
            }}
            open={loadingAccess}
          >
            <CircularProgress color="primary" />
          </Backdrop>
        </Portal>
      </PageContainer>
    </>
  );
};

export default Invitation;
