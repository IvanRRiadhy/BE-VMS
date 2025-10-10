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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconDownload, IconMail, IconTrash, IconX } from '@tabler/icons-react';
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
import { format } from 'date-fns';
// import CameraUpload from 'src/customs/components/camera/CameraUpload';
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers';
import { FormVisitor } from 'src/customs/api/models/Visitor';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import MuiButton from 'src/views/forms/form-elements/MuiButton';
import Webcam from 'react-webcam';
import { updateExtend } from 'src/customs/api/admin';

const Invitation = () => {
  const { token } = useSession();
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tableData, setTableData] = useState<[]>([]);
  const [openExtendVisit, setOpenExtendVisit] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [invitatioOpenDetail, setInvitatioOpenDetail] = useState(false);
  // const [invitationData, setInvitationData] = useState<any[]>([]);
  const [invitationData, setInvitationData] = useState<any>(null);
  // daftar opsi durasi dalam menit
  const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180];
  const [dataVisitor, setDataVisitor] = useState<any[]>([]);
  // const [steps, setSteps] = useState<string[]>([]);

  const cards = [
    {
      title: 'Total Invitation',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      icon: IconMail,
      color: 'none',
    },
  ];

  const [agenda, setAgenda] = useState('');

  const tableDataInvitation = [
    {
      id: 1,
      name: 'Kunjungan',
      phone: '081234567890',
      registered_site: 'Gedung A',
      // is_used : true,
      // status: true,
      day: 'Mon, 14 Jul 2025 09:00 AM',
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

  const agendaOptions = [
    'Meeting Tim A',
    'Presentasi Proyek',
    'Training Karyawan',
    'Rapat Bulanan',
  ];

  const [detailVisitorInvitation, setDetailVisitorInvitation] = useState([]);

  // useEffect(() => {
  //   if (!invitationData?.collection) return;
  //   const qPages = invitationData.collection.question_page || [];
  //   setSteps(qPages.map((q: any) => q.name));
  //   setDataVisitor([
  //     {
  //       question_page: qPages, // simpan langsung struktur form
  //     },
  //   ]);
  //   setActiveStep(0);
  // }, [invitationData]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // hitung tanggal
        const start_date = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
        const end_date = dayjs().add(0, 'day').format('YYYY-MM-DD'); // +1 hari agar tanggal akhir ikut

        // if (isDataReady) {
        const res = await getInvitation(token as string, start_date, end_date);
        setTableData(res?.collection ?? []);

        // }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [token, refreshTrigger]);

  const [invitationDetail, setInvitationDetail] = useState<any>([]);
  const [invitationDetailVisitor, setInvitationDetailVisitor] = useState<[]>([]);
  const [openInvitationDialog, setOpenInvitationDialog] = useState(false);

  const handleView = async (id: string) => {
    if (!id || !token) return;

    setOpenInvitationDialog(true);
    setInvitationDetail([]); // reset detail
    setDetailVisitorInvitation([]); // reset related visitor

    try {
      // 1️⃣ Ambil detail utama
      const res = await getInvitationById(id, token);
      setInvitationDetail(res?.collection ?? {});

      // 2️⃣ Ambil related visitor (opsional)
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

  const handleSelectInvitation = async (_: any, value: any) => {
    if (!value) return;

    const selected = invitationDetail.find((item: any) => item.agenda === value); // sesuaikan dengan field sebenarnya
    if (!selected) return;

    try {
      const detail = await getDetailInvitationForm(token as string, selected.id);
      setInvitationData(detail);
    } catch (error) {
      console.error('Error fetching invitation detail:', error);
    }
  };

  const [activeStep, setActiveStep] = useState(0); // 🧭 Stepper navigation handlers

  const handleNext = () => {
    const current = groupedSections[activeStep];
    if (!current) return;
    const valid = validateStep(current);
    if (!valid) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // 🧾 Simulasi validasi sederhana per step
  const validateStep = (section: any) => {
    if (!section) return true;

    // contoh: pastikan semua mandatory field diisi
    for (const s of section.sections || []) {
      for (const f of s.form || []) {
        if (f.mandatory && !f.answer_text && !f.answer_file) {
          alert(`Field "${f.long_display_text}" masih kosong.`);
          return false;
        }
      }
    }
    return true;
  };

  // 🚀 Handle submit akhir
  // const handleSubmit = async () => {
  //   if (!invitationData) return;

  //   // build payload
  //   const payload = {
  //     visitor_type:
  //       invitationData.collection.visitor_type || invitationData.collection.visitor_type_data?.id,
  //     type_registered: 1,
  //     is_group: true,
  //     group_name: invitationData.collection.group_name || 'Group Visitor',
  //     tz: invitationData.collection.tz || 'Asia/Jakarta',
  //     registered_site: invitationData.collection.site_place_data?.id || '',
  //     data_visitor: dataVisitor,
  //   };

  //   console.log('✅ Final Submit Payload:', payload);

  //   // TODO: panggil API create invitation di sini
  //   // await createInvitation(token, payload)

  //   alert('Invitation submitted successfully!');
  //   handleReset();
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

    // Kelompokkan menjadi 2: visitor_info_group dan purpose_visit
    const visitorGroup = qPages.filter((q: any) => !['purpose_visit'].includes(getSectionType(q)));
    const purposeVisit = qPages.find((q: any) => getSectionType(q) === 'purpose_visit');

    const result: { label: string; type: string; sections: any[] }[] = [];

    if (visitorGroup.length > 0)
      result.push({
        label: 'Visitor Information Group',
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

  // 🧭 Stepper handlers
  // const handleNext = () => {
  //   const current = groupedSections[activeStep];
  //   if (!current) return;
  //   const valid = validateStep(current);
  //   if (!valid) return;
  //   setActiveStep((prev) => prev + 1);
  // };
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

  const THEME = useTheme();
  const isMobile = useMediaQuery(THEME.breakpoints.down('sm'));
  const [uploadNames, setUploadNames] = React.useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({}); //
  const [uploadMethods, setUploadMethods] = useState<Record<string, 'file' | 'camera'>>({});
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
    // reset input agar bisa pilih file yg sama lagi
    e.target.value = '';
  };

  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [removing, setRemoving] = React.useState<Record<string, boolean>>({});

  const handleRemoveFileForField = async (
    currentUrl: string,
    setAnswerFile: (url: string) => void,
    inputId: string, // <- pakai key yg sama dengan id input
  ) => {
    try {
      setRemoving((s) => ({ ...s, [inputId]: true }));
      if (currentUrl) {
        await axiosInstance2.delete(`/cdn${currentUrl}`);
        console.log('✅ Berhasil hapus file CDN:', currentUrl);
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

  const debounce = (fn: Function, delay = 300) => {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  const renderFieldInput = (
    field: FormVisitor,
    index: number,
    onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void,
    onDelete?: (index: number) => void,
    opts?: { showLabel?: boolean; uniqueKey?: string },
  ) => {
    const showLabel = opts?.showLabel ?? true;

    const renderInput = () => {
      // const [uploadMethod, setUploadMethod] = React.useState('file'); // default file upload
      const key = opts?.uniqueKey ?? String(index);
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
                (inputValues[index] || '').length < 3
                  ? 'Ketik minimal 3 karakter untuk mencari'
                  : 'Not found'
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

            // ✅ Kalau tetap kosong, isi default standar
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
                {/* <MenuItem value="" hidden>
                  <em>Select Vehicle Type</em>
                </MenuItem> */}

                {options.map((opt) => (
                  <MenuItem key={opt.id} value={opt.name}>
                    {opt.name}
                  </MenuItem>
                ))}
              </TextField>
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
                    const utc = newValue.utc().format(); // hasil: 2025-08-05T10:00:00Z
                    onChange(index, 'answer_datetime', utc);
                  }
                }}
                format="ddd, DD - MMM - YYYY, HH:mm"
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
          // File upload (PDF / NDA)
          // const inputId = `pdf-${opts?.uniqueKey ?? index}`;
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
                    {uploadNames[key] ??
                      fileUrl.split('/').pop()?.split('?')[0] ?? // ambil nama file dari URL
                      'Uploaded File'}
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
              flexDirection={{ xs: 'column', sm: 'column', md: 'row' }} // ⬅️ stack on mobile
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              gap={1.5}
              width="100%" // ⬅️ let it adapt instead of fixed width
              sx={{ maxWidth: 400 }}
            >
              <TextField
                select
                size="small"
                value={uploadMethods[key] || 'file'}
                onChange={(e) => handleUploadMethodChange(key, e.target.value)}
                fullWidth
                sx={{
                  width: { xs: '100%', md: '200px' }, // full on mobile
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
                          (field as any).answer_file.split('/').pop()?.split('?')[0] ?? // ambil nama file dari URL
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

  const [activeGroupIdx, setActiveGroupIdx] = useState(0);

  const handleSubmit = async () => {
    if (!invitationData?.collection) return;

    const source = invitationData.collection;

    const payload = {
      visitor_type: source.visitor_type ?? source.visitor_type_data?.id ?? '',
      type_registered: 1,
      is_group: source.is_group ?? true,
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
            // ✅ perbaikan format DateTime untuk .NET
            answer_datetime: f.answer_datetime ?? null,
            answer_file: f.answer_file ?? null,
          })),
        })),
      })),
    };

    console.log('🚀 Payload ready:', JSON.stringify(payload, null, 2));

    try {
      const id = source.id;
      console.log('id', id);
      const res = await createVisitorInvitation(token as string, id, payload);
      console.log('✅ Success:', JSON.stringify(res, null, 2));
    } catch (err) {
      console.error('❌ Failed:', err);
    }
  };

  // const handleAddDetails = () => {
  //   if (!invitationData?.collection?.question_page) return;

  //   setDataVisitor((prev) => {
  //     // Deep clone dari master question_page (bukan prev[0])
  //     const clone = JSON.parse(JSON.stringify(invitationData.collection.question_page));

  //     // Kosongkan semua jawaban
  //     clone.forEach((page: any) => {
  //       (page.form ?? []).forEach((f: any) => {
  //         f.answer_text = '';
  //         f.answer_datetime = '';
  //         f.answer_file = '';
  //       });
  //     });

  //     const next = [...prev, { question_page: clone }];
  //     setActiveGroupIdx(next.length - 1);
  //     return next;
  //   });
  // };

  const handleAddDetails = () => {
    if (!invitationData?.collection?.question_page) return;

    setDataVisitor((prev) => {
      // Deep clone dari master question_page
      const clone = JSON.parse(JSON.stringify(invitationData.collection.question_page));

      // Daftar field remarks yang harus tetap diisi (shared)
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

  // const visitorSections = current.sections || [];
  // const allForms = visitorSections.flatMap((section: any) => section.form || []);

  const renderStepContent = (stepIndex: number) => {
    if (!groupedSections.length) return null;
    const current = groupedSections[stepIndex];
    if (!current) return null;

    // ======================================================
    // 🧩 STEP 1: Visitor Information Group (editable)
    // ======================================================
    if (current.type === 'visitor_information_group') {
      const visitorSections = current.sections || [];
      // 🔹 kumpulkan semua form dari semua section
      const allForms = visitorSections.flatMap((section: any) => section.form || []);

      // 🔹 hilangkan duplikat remarks
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
                // 💻 DESKTOP MODE (Table)
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

    // ======================================================
    // 🧩 STEP 2: Purpose Visit (read-only + datetime support)
    // ======================================================
    if (current.type === 'purpose_visit') {
      const section = current.sections[0];

      return (
        <Box>
          {/* <Typography variant="h6" gutterBottom>
          {current.label}
        </Typography>
        <Divider sx={{ mb: 2 }} /> */}

          {section.form.map((f: any, fIdx: number) => {
            let displayValue = '-';

            if (f.remarks === 'host') {
              // tampilkan nama host, bukan ID
              displayValue = invitationData?.collection?.host_data?.name ?? f.answer_text ?? '-';
            } else if (f.remarks === 'site_place') {
              // tampilkan nama site, bukan ID
              displayValue =
                invitationData?.collection?.site_place_data?.name ?? f.answer_text ?? '-';
            } else if (f.answer_text) {
              displayValue = f.answer_text;
            } else if (f.answer_datetime) {
              // 🕒 format datetime ke bentuk “Thu, 09 Oct 2025 | 14:00”
              const dt = dayjs(f.answer_datetime);
              displayValue = dt.isValid()
                ? dt.format('ddd, DD MMM YYYY | HH:mm')
                : f.answer_datetime;
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

  const isLastStep = activeStep === steps.length - 1;

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true);
    // setErrors({});
    try {
      if (!token) return;
      if (selectedMinutes) {
        const result = await updateExtend(token, {
          id: invitationDetail?.id,
          period: selectedMinutes,
          apply_to_all: false,
        });
        console.log('extend: ', result);
      }
    } catch {
      console.error('Failed to extend visit.');
    }
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
              {/* {isDataReady ? ( */}
              <DynamicTable
                overflowX={'auto'}
                data={tableData}
                isHavePagination={true}
                selectedRows={selectedRows}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
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
              {/* // ) : (
              //   <Card sx={{ width: '100%' }}>
              //     <Skeleton />
              //     <Skeleton animation="wave" />
              //     <Skeleton animation={false} />
              //   </Card>
              // )} */}
            </Grid>
          </Grid>
        </Box>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Invitation</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
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
          <DialogContent>
            <form action="">
              <Stack spacing={2} marginTop={1}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <CustomFormLabel htmlFor="agenda" sx={{ mt: 0 }}>
                      Select Agenda
                    </CustomFormLabel>
                    <Autocomplete
                      options={invitationDetailVisitor.map((item: any) => item.agenda)}
                      onChange={handleSelectInvitation}
                      renderInput={(params) => (
                        <CustomTextField
                          {...params}
                          label=""
                          placeholder="Choose or input invitation"
                          fullWidth
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Stack>
              <Button
                // type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                fullWidth
                onClick={() => setInvitatioOpenDetail(true)}
              >
                <Typography>Next</Typography>
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={invitatioOpenDetail}
          onClose={() => setInvitatioOpenDetail(false)}
          fullWidth
          maxWidth="xl"
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
                      <StepLabel onClick={() => setActiveStep(idx)}>{s.label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <>
                  <Box mt={4}>{renderStepContent(activeStep)}</Box>
                  <Box display="flex" flexDirection="row" mt={4}>
                    <Button disabled={activeStep === 0} onClick={handleBack}>
                      Back
                    </Button>
                    <Box flex="1 1 auto" />
                    {activeStep !== steps.length - 1 ? (
                      <Button onClick={handleNext} variant="contained">
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

        {/* Dialog Detail */}
        <Dialog
          open={openInvitationDialog}
          onClose={() => setOpenInvitationDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Detail Invitation</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => setOpenInvitationDialog(false)}
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
          <DialogContent>
            <form action="">
              <Stack spacing={2} marginTop={1}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="agenda" sx={{ mt: 0 }}>
                      Visit Start
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.visitor_period_start
                        ? format(
                            new Date(invitationDetail.visitor_period_start),
                            'dd MMM yyyy, HH:mm',
                          )
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="agenda" sx={{ mt: 0 }}>
                      Visit End
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.visitor_period_end
                        ? format(
                            new Date(invitationDetail.visitor_period_end),
                            'dd MMM yyyy, HH:mm',
                          )
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                      Registered Site
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.site_place_name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                      Group Code
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.group_code}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                      Vehicle Plate
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.vehicle_plate_number || '-'}{' '}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                      PIC Host
                    </CustomFormLabel>
                    <Typography sx={{ mt: 0 }} variant="body1">
                      {invitationDetail?.host_name}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <CustomFormLabel htmlFor="agenda" sx={{ mt: 0, mb: 2 }}>
                      Another Visitor
                    </CustomFormLabel>
                    <Box
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      overflow="auto" // ⬅️ bikin bisa di-scroll
                      sx={{ gap: 0.5, pb: 1 }} // spasi antar item & padding bawah agar tidak terpotong
                    >
                      {detailVisitorInvitation?.length > 0 ? (
                        detailVisitorInvitation.map((visitor: any, index: number) => (
                          <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            flexDirection="column"
                            sx={{ minWidth: 70 }} // pastikan tiap item punya lebar minimum
                          >
                            <Avatar
                              sx={{ width: 45, height: 45, mb: 0.5 }}
                              alt={visitor.name}
                              src={visitor.visitor_face || '/static/images/avatar/1.jpg'}
                            />
                            <Typography
                              variant="subtitle2"
                              sx={{ textAlign: 'center', width: '100%' }}
                            >
                              {visitor.visitor?.name || '-'}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1.5, ml: 0.2 }}
                        >
                          -
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="h6" sx={{ mt: 0 }} fontWeight={600}>
                        Access Pass
                      </Typography>
                      <IconButton
                        color="primary"
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        }}
                      >
                        <Download />
                      </IconButton>
                    </Box>

                    <Box p={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography sx={{ mt: 1 }} variant="subtitle1" fontWeight={500}>
                            Invitation Code
                          </Typography>
                          <Typography sx={{ mt: 0 }} variant="body1" fontWeight={400}>
                            {invitationDetail?.invitation_code}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ mt: 1 }} variant="subtitle1" fontWeight={500}>
                            Card
                          </Typography>
                          <Typography sx={{ mt: 0 }} variant="body1" fontWeight={400}>
                            {invitationDetail?.visitor_card || '-'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" justifyContent="center" mt={3}>
                        <Paper
                          elevation={4}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
                          }}
                        >
                          {invitationDetail?.visitor_number ? (
                            <>
                              <QRCode
                                value={invitationDetail.visitor_number}
                                size={180}
                                style={{
                                  height: 'auto',
                                  width: '180px',
                                  borderRadius: 8,
                                }}
                              />
                              {/* <Typography
                                sx={{
                                  mt: 1.5,
                                  fontWeight: 600,
                                  fontSize: '0.9rem',
                                  color: 'text.primary',
                                }}
                                textAlign="center"
                              >
                                {invitationDetail.visitor_number}
                              </Typography> */}
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              QR code tidak tersedia
                            </Typography>
                          )}
                        </Paper>
                      </Box>

                      <Box display="flex" gap={3} mb={2} mt={2} justifyContent={'center'}>
                        <Typography color="error" textAlign={'center'}>
                          {' '}
                          Tracked
                        </Typography>
                        <Typography color="error" textAlign={'center'}>
                          Low Battery
                        </Typography>
                      </Box>

                      <Typography variant="body2" mb={1} mt={1} textAlign={'center'}>
                        Show this whilte visiting
                      </Typography>
                      <Typography sx={{ mt: 1 }} variant="h6" fontWeight={500} textAlign={'center'}>
                        {invitationDetail?.visitor_code}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
              <Button
                onClick={() => setOpenExtendVisit(true)}
                variant="contained"
                sx={{ mt: 3 }}
                fullWidth
              >
                <Typography>Extend</Typography>
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={openExtendVisit}
          onClose={() => setOpenExtendVisit(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Extend Visit</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => setOpenExtendVisit(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
          <DialogContent dividers>
            <form onSubmit={handleExtend}>
              <Box display="flex" flexWrap="wrap" gap={1.5} justifyContent="center" sx={{ mb: 2 }}>
                {durationOptions.map((minutes) => (
                  <Chip
                    key={minutes}
                    label={`${minutes} min`}
                    clickable
                    color={selectedMinutes === minutes ? 'primary' : 'default'}
                    onClick={() => setSelectedMinutes(minutes)}
                    sx={{
                      fontWeight: selectedMinutes === minutes ? 600 : 400,
                      px: 1.5,
                    }}
                  />
                ))}
              </Box>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="body2" color="text.secondary">
                    Apply to another visitor
                  </Typography>
                }
              />
              <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
                Extend Visit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </>
  );
};

export default Invitation;

const CameraUpload: React.FC<{
  value?: string;
  onChange: (url: string) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(value || null);
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState(false);
  const webcamRef = React.useRef<Webcam>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const clearLocal = () => {
    setScreenshot(null);
    setPreviewUrl(null);
    onChange('');
  };

  const uploadFileToCDN = async (file: File | Blob): Promise<string | null> => {
    const formData = new FormData();
    const filename = file instanceof File && file.name ? file.name : 'selfie.png';
    formData.append('file_name', filename);
    formData.append('file', file, filename);
    formData.append('path', 'visitor');
    try {
      const { data } = await axiosInstance2.post('/cdn/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl = data?.collection?.file_url;
      console.log('CDN Response File URL:', fileUrl);
      return fileUrl ? (fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl) : null;
    } catch (e) {
      console.error('Upload failed:', e);
      return null;
    }
  };

  const handleCapture = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    const blob = await fetch(imageSrc).then((r) => r.blob());
    const cdnUrl = await uploadFileToCDN(blob);
    if (!cdnUrl) return;
    setScreenshot(imageSrc);
    setPreviewUrl(imageSrc);
    onChange(cdnUrl);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const cdnUrl = await uploadFileToCDN(file);

    if (!cdnUrl) return;
    setPreviewUrl(URL.createObjectURL(file));
    onChange(cdnUrl);
  };

  // ⛔ Hapus file di CDN: DELETE ke URL file (http://host/pathcdn/visitor/xxx.png)
  const handleRemove = async () => {
    if (!value) {
      // cuma bersihkan local state kalau belum ada URL CDN
      clearLocal();
      return;
    }
    try {
      setRemoving(true);
      // await axios.delete(value); // <--- sesuai API kamu
      await axiosInstance2.delete(`/cdn${value}`);
      console.log('✅ Berhasil hapus file CDN:', value);
      clearLocal();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Button size="small" onClick={() => setOpen(true)} startIcon={<PhotoCameraIcon />}>
          Camera
        </Button>
        {previewUrl && ( // <-- tombol Remove hanya muncul jika ada foto
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={handleRemove}
            startIcon={<IconTrash />}
            disabled={removing}
          >
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        )}
        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFile} />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 3 }}>
          <Box>
            <Typography variant="h6" mb={2}>
              Take Photo From Camera
            </Typography>
            {/* close button */}
            <IconButton
              onClick={() => setOpen(false)}
              size="small"
              sx={{ position: 'absolute', top: 10, right: 10 }}
            >
              <IconX />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'environment' }}
                style={{ width: '100%', borderRadius: 8, border: '2px solid #ccc' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {screenshot ? (
                <img
                  src={screenshot}
                  alt="Captured"
                  style={{ width: '100%', borderRadius: 8, border: '2px solid #ccc' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: '2px dashed #ccc',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 240,
                  }}
                >
                  <Typography color="text.secondary">No Photos Have Been Taken Yet</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box textAlign="right">
            <Button color="warning" sx={{ mr: 1 }} onClick={clearLocal}>
              Clear
            </Button>
            <Button variant="contained" onClick={handleCapture}>
              Take Photo
            </Button>
            <Button sx={{ ml: 1 }} onClick={() => setOpen(false)}>
              Submit
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};
