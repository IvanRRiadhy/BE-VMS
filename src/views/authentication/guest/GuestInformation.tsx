import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Card,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Dialog,
  Alert,
  Divider,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/customs/components/logo/Logo';
import { IconError404, IconMan, IconTrash, IconWoman } from '@tabler/icons-react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { AuthVisitor, SubmitPraForm } from 'src/customs/api/users';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import MuiButton from 'src/views/forms/form-elements/MuiButton';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Webcam from 'react-webcam';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
dayjs.extend(utc);
dayjs.extend(timezone);

const GuestInformationStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [invitationData, setInvitationData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCamera, setOpenCamera] = React.useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadNames, setUploadNames] = React.useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [removing, setRemoving] = React.useState<Record<string, boolean>>({});
  const webcamRef = useRef<Webcam>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const formatDateTime = (value: string | null) => {
    if (!value) return '-';
    return dayjs(value).tz('Asia/Jakarta').format('DD MMMM YYYY HH:mm');
  };

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || ''; // ambil dari URL

  const validateStep = (section: any) => {
    const newErrors: Record<string, string> = {};

    section.form?.forEach((f: any) => {
      if (
        (f.remarks === 'vehicle_type' || f.remarks === 'vehicle_plate') &&
        !formValues[f.remarks]
      ) {
        newErrors[f.remarks] = `${f.long_display_text} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true kalau valid
  };

  const handlePDFUploadFor =
    (remarks: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const path = await uploadFileToCDN(file);
      if (path) {
        setFormValues((prev) => ({ ...prev, [remarks]: path }));
        setPreviews((prev) => ({ ...prev, [remarks]: URL.createObjectURL(file) }));
        setUploadNames((prev) => ({ ...prev, [remarks]: file.name }));
      }

      e.target.value = ''; // reset
    };

  useEffect(() => {
    const fetchData = async () => {
      if (!code) return;

      try {
        setLoading(true);
        // panggil API visitor
        const res = await AuthVisitor({ code });
        setInvitationData(res.collection);

        // inisialisasi nilai form dari payload
        const initial: Record<string, any> = {};
        res.collection.question_page.forEach((section: any) => {
          section.form.forEach((f: any) => {
            if (f.field_type === 9) {
              initial[f.remarks] = f.answer_datetime;
            } else if (f.field_type === 10 || f.field_type === 11 || f.field_type === 12) {
              initial[f.remarks] = f.answer_file;
            } else {
              initial[f.remarks] = f.answer_text || '';
            }
          });
        });
        setFormValues(initial);
      } catch (err) {
        console.error('Gagal load invitation', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  const handleChange = (remarks: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [remarks]: value }));
  };

  const handleNext = () => {
    const currentSection = formSections[activeStep];
    if (!validateStep(currentSection)) return; // stop kalau ada error
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => setActiveStep(0);

  const CustomStepIcon = (props: any) => {
    const { icon, active } = props;
    return (
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: active ? 'primary.main' : 'grey.400',
          color: active ? 'white' : 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
        }}
      >
        {icon}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        component="div"
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
        }}
      >
        <CircularProgress />
        {/* <Typography mt={1}>Loading...</Typography> */}
      </Box>
    );
  }

  if (!invitationData) {
    return (
      <Box
        sx={{
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <IconError404 color="error" style={{ fontSize: '5rem' }} />
        <Typography variant="h5" color="error">
          Data tidak ditemukan
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kode yang kamu masukkan mungkin salah atau tidak ada.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Pastikan kode benar atau hubungi admin jika masalah berlanjut.
        </Alert>
      </Box>
    );
  }

  // const formSections = invitationData.question_page.filter((q: any) => !q.is_document);
  const formSections = invitationData.question_page;

  // const formSections = invitationData.question_page;
  const steps = formSections.map((q: any) => q.name);

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

  const uploadFileToCDN = async (file: File | Blob): Promise<string | null> => {
    const formData = new FormData();

    const filename = file instanceof File && file.name ? file.name : 'selfie.png';
    formData.append('file_name', filename);
    formData.append('file', file, filename);
    formData.append('path', 'visitor');

    try {
      const response = await axiosInstance2.post('/cdn/upload', formData, {
        // const response = await axios.post('http://localhost:8000/cdn/upload', formData, {
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

  const handleCaptureForField = async (setAnswerFile: (url: string) => void, trackKey?: string) => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const blob = await fetch(imageSrc).then((res) => res.blob());
    const path = await uploadFileToCDN(blob);
    if (!path) return;

    if (trackKey) {
      setPreviews((prev) => ({ ...prev, [trackKey]: imageSrc }));
      setUploadNames((prev) => ({ ...prev, [trackKey]: 'camera.jpg' }));
    }
    setAnswerFile(path);
  };

  // const StepContent = (section: any) => (

  //   <Box mt={3}>
  //     <Grid container spacing={2}>
  //       {section.form?.map((f: any, idx: number) => {
  //         // mapping value
  //         let displayValue = formValues[f.remarks] ?? '';
  //         if (f.remarks === 'host') {
  //           displayValue = invitationData.host_data?.name || displayValue;
  //         } else if (f.remarks === 'site_place') {
  //           displayValue = invitationData.site_place_data?.name || displayValue;
  //         }

  //         // 👇 kalau Purpose Visit pakai xs=12
  //         const gridSize =
  //           section.name === 'Purpose Visit' ||
  //           f.remarks === 'vehicle_type' ||
  //           f.remarks === 'vehicle_plate' ||
  //           f.remarks === 'selfie_image' ||
  //           f.remarks === 'nda' ||
  //           f.remarks === 'identity_image'
  //             ? { xs: 12 }
  //             : { xs: 12, md: 6 };

  //         return (
  //           <Grid key={idx} size={gridSize}>
  //             <CustomFormLabel sx={{ mt: 0 }}>{f.long_display_text || f.remarks}</CustomFormLabel>

  //             {f.remarks === 'visitor_period_start' || f.remarks === 'visitor_period_end' ? (
  //               <CustomTextField
  //                 fullWidth
  //                 value={formatDateTime(formValues[f.remarks])}
  //                 InputProps={{ readOnly: true }}
  //                 disabled
  //               />
  //             ) : section.name === 'Purpose Visit' ? (
  //               <CustomTextField
  //                 fullWidth
  //                 value={displayValue}
  //                 InputProps={{ readOnly: true }}
  //                 disabled
  //               />
  //             ) : f.remarks === 'vehicle_plate' ? (
  //               <CustomTextField
  //                 fullWidth
  //                 value={displayValue}
  //                 onChange={(e) => handleChange(f.remarks, e.target.value)}
  //                 placeholder={f.long_display_text || f.remarks}
  //                 error={!!errors[f.remarks]}
  //                 helperText={errors[f.remarks]}
  //               />
  //             ) : f.remarks === 'gender' ? (
  //               <ToggleButtonGroup
  //                 id="gender"
  //                 exclusive
  //                 value={formValues[f.remarks] || ''}
  //                 onChange={(_, val) => {
  //                   if (val !== null) handleChange(f.remarks, val);
  //                 }}
  //                 sx={{
  //                   '& .MuiToggleButton-root': {
  //                     textTransform: 'none',
  //                     px: 2,
  //                     py: 1,
  //                     bgcolor: 'transparent',
  //                     color: 'text.primary',
  //                     '&:hover': { bgcolor: 'action.hover' },
  //                   },
  //                   '& .MuiToggleButton-root.Mui-selected': {
  //                     bgcolor: 'primary.main',
  //                     color: 'white',
  //                     '&:hover': { bgcolor: 'primary.dark' },
  //                   },
  //                 }}
  //               >
  //                 <ToggleButton value="1">
  //                   <IconMan size={16} style={{ marginRight: 6 }} /> Laki-Laki
  //                 </ToggleButton>
  //                 <ToggleButton value="2">
  //                   <IconWoman size={16} style={{ marginRight: 6 }} /> Perempuan
  //                 </ToggleButton>
  //               </ToggleButtonGroup>
  //             ) : f.remarks === 'vehicle_type' ? (
  //               <FormControl component="fieldset">
  //                 <RadioGroup
  //                   value={formValues[f.remarks] || ''}
  //                   onChange={(e) => handleChange(f.remarks, e.target.value)}
  //                   sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
  //                 >
  //                   {[
  //                     { value: 'car', label: 'Car' },
  //                     { value: 'bus', label: 'Bus' },
  //                     { value: 'motor', label: 'Motor' },
  //                     { value: 'bicycle', label: 'Bicycle' },
  //                     { value: 'truck', label: 'Truck' },
  //                     { value: 'private_car', label: 'Private Car' },
  //                     { value: 'other', label: 'Other' },
  //                   ].map((opt) => (
  //                     <FormControlLabel
  //                       key={opt.value}
  //                       value={opt.value}
  //                       control={<Radio />}
  //                       label={opt.label}
  //                     />
  //                   ))}
  //                 </RadioGroup>
  //                 {errors[f.remarks] && (
  //                   <Typography variant="caption" color="error">
  //                     {errors[f.remarks]}
  //                   </Typography>
  //                 )}
  //               </FormControl>
  //             ) : f.remarks === 'selfie_image' ? (
  //               <Box>
  //                 <Box
  //                   sx={{
  //                     border: '2px dashed #90caf9',
  //                     borderRadius: 2,
  //                     padding: 4,
  //                     textAlign: 'center',
  //                     backgroundColor: '#f5faff',
  //                     cursor: 'pointer',
  //                     width: '100%',
  //                   }}
  //                   onClick={() => setOpenCamera(true)}
  //                 >
  //                   <PhotoCameraIcon sx={{ fontSize: 48, color: '#42a5f5', mr: 0.5 }} />
  //                   <Typography variant="subtitle1" color="primary" fontWeight={600}>
  //                     Use Camera
  //                   </Typography>
  //                 </Box>

  //                 {/* PREVIEW */}
  //                 {previews[f.remarks] && (
  //                   <Box mt={2} display="flex" flexDirection="column" alignItems="center">
  //                     <img
  //                       src={previews[f.remarks] as string}
  //                       alt="preview"
  //                       style={{
  //                         width: 200,
  //                         height: 200,
  //                         objectFit: 'cover',
  //                         borderRadius: 8,
  //                       }}
  //                     />
  //                     <Button
  //                       color="error"
  //                       size="small"
  //                       variant="outlined"
  //                       sx={{ mt: 2, minWidth: 120 }}
  //                       onClick={() =>
  //                         handleRemoveFileForField(
  //                           formValues[f.remarks],
  //                           (url) => handleChange(f.remarks, url),
  //                           f.remarks,
  //                         )
  //                       }
  //                       startIcon={<IconTrash />}
  //                     >
  //                       Remove
  //                     </Button>
  //                   </Box>
  //                 )}

  //                 <Dialog
  //                   open={openCamera}
  //                   onClose={() => setOpenCamera(false)}
  //                   maxWidth="md"
  //                   fullWidth
  //                 >
  //                   <Box sx={{ p: 3 }}>
  //                     <Typography variant="h6" mb={2}>
  //                       Take Photo From Camera
  //                     </Typography>

  //                     <Grid container spacing={2}>
  //                       <Grid size={{ xs: 12, sm: 6 }}>
  //                         <Webcam
  //                           audio={false}
  //                           ref={webcamRef}
  //                           screenshotFormat="image/jpeg"
  //                           videoConstraints={{ facingMode: 'environment' }}
  //                           style={{
  //                             width: '100%',
  //                             borderRadius: 8,
  //                             border: '2px solid #ccc',
  //                           }}
  //                         />
  //                       </Grid>

  //                       <Grid size={{ xs: 12, sm: 6 }}>
  //                         {previews[f.remarks] ? (
  //                           <img
  //                             src={previews[f.remarks] as string}
  //                             alt="Captured"
  //                             style={{
  //                               width: '100%',
  //                               borderRadius: 8,
  //                               border: '2px solid #ccc',
  //                             }}
  //                           />
  //                         ) : (
  //                           <Box
  //                             sx={{
  //                               width: '100%',
  //                               height: '100%',
  //                               border: '2px dashed #ccc',
  //                               borderRadius: 8,
  //                               display: 'flex',
  //                               alignItems: 'center',
  //                               justifyContent: 'center',
  //                               minHeight: 240,
  //                             }}
  //                           >
  //                             <Typography color="text.secondary">No Photos Yet</Typography>
  //                           </Box>
  //                         )}
  //                       </Grid>
  //                     </Grid>

  //                     <Divider sx={{ my: 2 }} />

  //                     <Box sx={{ textAlign: 'right' }}>
  //                       <Button
  //                         color="warning"
  //                         sx={{ mr: 2 }}
  //                         onClick={() =>
  //                           handleRemoveFileForField(
  //                             formValues[f.remarks],
  //                             (url) => handleChange(f.remarks, url),
  //                             f.remarks,
  //                           )
  //                         }
  //                       >
  //                         Clear Foto
  //                       </Button>
  //                       <Button
  //                         variant="contained"
  //                         onClick={() =>
  //                           handleCaptureForField((url) => handleChange(f.remarks, url), f.remarks)
  //                         }
  //                       >
  //                         Take Foto
  //                       </Button>
  //                       <Button onClick={() => setOpenCamera(false)} sx={{ ml: 2 }}>
  //                         Submit
  //                       </Button>
  //                     </Box>
  //                   </Box>
  //                 </Dialog>
  //               </Box>
  //             ) : f.remarks === 'nda' ? (
  //               <Box>
  //                 <Box
  //                   sx={{
  //                     border: '2px dashed #90caf9',
  //                     borderRadius: 2,
  //                     padding: 4,
  //                     textAlign: 'center',
  //                     backgroundColor: '#f5faff',
  //                     cursor: 'pointer',
  //                     width: '100%',
  //                     pointerEvents: 'auto',
  //                     opacity: 1,
  //                   }}
  //                   onClick={() => fileInputRefs.current[f.remarks]?.click()}
  //                 >
  //                   <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
  //                   <Typography variant="subtitle1" sx={{ mt: 1 }}>
  //                     Upload File
  //                   </Typography>

  //                   <Typography variant="body2" color="textSecondary" mt={1}>
  //                     Supports: PDF, DOCX, JPG, PNG, up to
  //                     <span style={{ fontWeight: 'semibold' }}> 5 MB</span>
  //                   </Typography>

  //                   {(previews[f.remarks] || uploadNames[f.remarks]) && (
  //                     <Box
  //                       mt={2}
  //                       sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
  //                     >
  //                       {previews[f.remarks] ? (
  //                         <>
  //                           <img
  //                             src={previews[f.remarks] as string}
  //                             alt="preview"
  //                             style={{
  //                               width: 200,
  //                               height: 200,
  //                               borderRadius: 12,
  //                               objectFit: 'cover',
  //                               cursor: 'pointer',
  //                               boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  //                             }}
  //                           />
  //                           <Button
  //                             color="error"
  //                             size="small"
  //                             variant="outlined"
  //                             sx={{ mt: 2, minWidth: 120 }}
  //                             onClick={() =>
  //                               handleRemoveFileForField(
  //                                 formValues[f.remarks],
  //                                 (url) => handleChange(f.remarks, url),
  //                                 f.remarks,
  //                               )
  //                             }
  //                             startIcon={<IconTrash />}
  //                           >
  //                             Remove
  //                           </Button>
  //                         </>
  //                       ) : (
  //                         <Typography variant="caption" noWrap>
  //                           {uploadNames[f.remarks]}
  //                         </Typography>
  //                       )}
  //                     </Box>
  //                   )}

  //                   <input
  //                     id={`file-${f.remarks}`}
  //                     type="file"
  //                     accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
  //                     hidden
  //                     ref={(el: HTMLInputElement | null) => {
  //                       if (el !== null) {
  //                         fileInputRefs.current[f.remarks] = el;
  //                       }
  //                     }}
  //                     onChange={handlePDFUploadFor(f.remarks)}
  //                   />
  //                 </Box>
  //               </Box>
  //             ) : f.remarks === 'identity_image' ? (
  //               <Box>
  //                 <Box
  //                   sx={{
  //                     border: '2px dashed #90caf9',
  //                     borderRadius: 2,
  //                     padding: 4,
  //                     textAlign: 'center',
  //                     backgroundColor: '#f5faff',
  //                     cursor: 'pointer',
  //                     width: '100%',
  //                     pointerEvents: 'auto',
  //                     opacity: 1,
  //                   }}
  //                   onClick={() => fileInputRefs.current[f.remarks]?.click()}
  //                 >
  //                   <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
  //                   <Typography variant="subtitle1" sx={{ mt: 1 }}>
  //                     Upload File
  //                   </Typography>

  //                   <Typography variant="caption" color="textSecondary">
  //                     Supports: JPG, PNG
  //                   </Typography>

  //                   <Typography
  //                     variant="subtitle1"
  //                     component="span"
  //                     color="primary"
  //                     sx={{ fontWeight: 600, ml: 1, cursor: 'pointer' }}
  //                     onClick={(e) => {
  //                       e.stopPropagation();
  //                       setOpenCamera(true);
  //                     }}
  //                   >
  //                     Use Camera
  //                   </Typography>

  //                   <input
  //                     id={`file-${f.remarks}`}
  //                     type="file"
  //                     accept=".jpg,.jpeg,.png"
  //                     hidden
  //                     ref={(el: HTMLInputElement | null) => {
  //                       if (el !== null) {
  //                         fileInputRefs.current[f.remarks] = el;
  //                       }
  //                     }}
  //                     onChange={(e) =>
  //                       handleFileChangeForField(
  //                         e as React.ChangeEvent<HTMLInputElement>,
  //                         (url) => handleChange(f.remarks, url),
  //                         f.remarks,
  //                       )
  //                     }
  //                   />

  //                   {/* PREVIEW */}
  //                   {(previews[f.remarks] || uploadNames[f.remarks]) && (
  //                     <Box mt={2} display="flex" flexDirection="column" alignItems="center">
  //                       {previews[f.remarks] ? (
  //                         <>
  //                           <img
  //                             src={previews[f.remarks] as string}
  //                             alt="preview"
  //                             style={{
  //                               width: 200,
  //                               height: 200,
  //                               borderRadius: 12,
  //                               objectFit: 'cover',
  //                               cursor: 'pointer',
  //                               boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  //                             }}
  //                           />
  //                           <Button
  //                             color="error"
  //                             size="small"
  //                             variant="outlined"
  //                             sx={{ mt: 2, minWidth: 120 }}
  //                             onClick={() =>
  //                               handleRemoveFileForField(
  //                                 formValues[f.remarks],
  //                                 (url) => handleChange(f.remarks, url),
  //                                 f.remarks,
  //                               )
  //                             }
  //                             startIcon={<IconTrash />}
  //                           >
  //                             Remove
  //                           </Button>
  //                         </>
  //                       ) : (
  //                         <Typography variant="caption" noWrap>
  //                           {uploadNames[f.remarks]}
  //                         </Typography>
  //                       )}
  //                     </Box>
  //                   )}
  //                 </Box>

  //                 {/* DIALOG CAMERA */}
  //                 <Dialog
  //                   open={openCamera}
  //                   onClose={() => setOpenCamera(false)}
  //                   maxWidth="md"
  //                   fullWidth
  //                 >
  //                   <Box sx={{ p: 3 }}>
  //                     <Typography variant="h6" mb={2}>
  //                       Take Photo From Camera
  //                     </Typography>

  //                     <Grid container spacing={2}>
  //                       <Grid size={{ xs: 12, sm: 6 }}>
  //                         <Webcam
  //                           audio={false}
  //                           ref={webcamRef}
  //                           screenshotFormat="image/jpeg"
  //                           videoConstraints={{ facingMode: 'environment' }}
  //                           style={{
  //                             width: '100%',
  //                             borderRadius: 8,
  //                             border: '2px solid #ccc',
  //                           }}
  //                         />
  //                       </Grid>

  //                       <Grid size={{ xs: 12, sm: 6 }}>
  //                         {previews[f.remarks] ? (
  //                           <img
  //                             src={previews[f.remarks] as string}
  //                             alt="Captured"
  //                             style={{
  //                               width: '100%',
  //                               borderRadius: 8,
  //                               border: '2px solid #ccc',
  //                             }}
  //                           />
  //                         ) : (
  //                           <Box
  //                             sx={{
  //                               width: '100%',
  //                               height: '100%',
  //                               border: '2px dashed #ccc',
  //                               borderRadius: 8,
  //                               display: 'flex',
  //                               alignItems: 'center',
  //                               justifyContent: 'center',
  //                               minHeight: 240,
  //                             }}
  //                           >
  //                             <Typography color="text.secondary">No Photos Yet</Typography>
  //                           </Box>
  //                         )}
  //                       </Grid>
  //                     </Grid>

  //                     <Divider sx={{ my: 2 }} />

  //                     <Box sx={{ textAlign: 'right' }}>
  //                       <Button
  //                         onClick={() =>
  //                           handleRemoveFileForField(
  //                             formValues[f.remarks],
  //                             (url) => handleChange(f.remarks, url),
  //                             f.remarks,
  //                           )
  //                         }
  //                         color="warning"
  //                         sx={{ mr: 2 }}
  //                       >
  //                         Clear Foto
  //                       </Button>
  //                       <Button
  //                         variant="contained"
  //                         onClick={(e) => {
  //                           e.stopPropagation();
  //                           handleCaptureForField((url) => handleChange(f.remarks, url), f.remarks);
  //                         }}
  //                       >
  //                         Take Foto
  //                       </Button>
  //                       <Button onClick={() => setOpenCamera(false)} sx={{ ml: 2 }}>
  //                         Close
  //                       </Button>
  //                     </Box>
  //                   </Box>
  //                 </Dialog>
  //               </Box>
  //             ) : (
  //               <CustomTextField
  //                 fullWidth
  //                 value={displayValue}
  //                 onChange={(e) => handleChange(f.remarks, e.target.value)}
  //                 placeholder={f.long_display_text || f.remarks}
  //               />
  //             )}
  //           </Grid>
  //         );
  //       })}
  //     </Grid>
  //   </Box>
  // );

  const StepContent = (section: any) => (
    <Box mt={3}>
      <Grid container spacing={2}>
        {section.form?.map((f: any, idx: number) => {
          let displayValue = formValues[f.remarks] ?? '';
          if (f.remarks === 'host') {
            displayValue = invitationData.host_data?.name || displayValue;
          } else if (f.remarks === 'site_place') {
            displayValue = invitationData.site_place_data?.name || displayValue;
          }

          const gridSize =
            section.name === 'Purpose Visit' ||
            ['vehicle_type', 'vehicle_plate', 'selfie_image', 'nda', 'identity_image'].includes(
              f.remarks,
            )
              ? { xs: 12 }
              : { xs: 12, md: 6 };

          return (
            <Grid key={idx} size={gridSize}>
              <CustomFormLabel sx={{ mt: 0 }}>{f.long_display_text || f.remarks}</CustomFormLabel>

              {/* === Case 1: field date === */}
              {['visitor_period_start', 'visitor_period_end'].includes(f.remarks) ? (
                <CustomTextField
                  fullWidth
                  value={formatDateTime(formValues[f.remarks])}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              ) : /* === Case 2: Purpose Visit → readonly === */
              section.name === 'Purpose Visit' ? (
                <CustomTextField
                  fullWidth
                  value={displayValue}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              ) : /* === Case 3: Vehicle plate === */
              f.remarks === 'vehicle_plate' ? (
                <CustomTextField
                  fullWidth
                  value={displayValue}
                  onChange={(e) => handleChange(f.remarks, e.target.value)}
                  placeholder={f.long_display_text || f.remarks}
                  error={!!errors[f.remarks]}
                  helperText={errors[f.remarks]}
                />
              ) : /* === Case 4: Gender === */
              f.remarks === 'gender' ? (
                <ToggleButtonGroup
                  id="gender"
                  exclusive
                  value={formValues[f.remarks] || ''}
                  onChange={(_, val) => {
                    if (val !== null) handleChange(f.remarks, val);
                  }}
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      px: 2,
                      py: 1,
                      bgcolor: 'transparent',
                      color: 'text.primary',
                      '&:hover': { bgcolor: 'action.hover' },
                    },
                    '& .MuiToggleButton-root.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ToggleButton value="1">
                    <IconMan size={16} style={{ marginRight: 6 }} /> Laki-Laki
                  </ToggleButton>
                  <ToggleButton value="2">
                    <IconWoman size={16} style={{ marginRight: 6 }} /> Perempuan
                  </ToggleButton>
                </ToggleButtonGroup>
              ) : /* === Case 5: Vehicle type === */
              f.remarks === 'vehicle_type' ? (
                <FormControl component="fieldset">
                  <RadioGroup
                    value={formValues[f.remarks] || ''}
                    onChange={(e) => handleChange(f.remarks, e.target.value)}
                    sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                  >
                    {[
                      { value: 'car', label: 'Car' },
                      { value: 'bus', label: 'Bus' },
                      { value: 'motor', label: 'Motor' },
                      { value: 'bicycle', label: 'Bicycle' },
                      { value: 'truck', label: 'Truck' },
                      { value: 'private_car', label: 'Private Car' },
                      { value: 'other', label: 'Other' },
                    ].map((opt) => (
                      <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={<Radio />}
                        label={opt.label}
                      />
                    ))}
                  </RadioGroup>
                  {errors[f.remarks] && (
                    <Typography variant="caption" color="error">
                      {errors[f.remarks]}
                    </Typography>
                  )}
                </FormControl>
              ) : /* === Case 6: File-based fields (selfie, identity, nda) === */
              ['selfie_image', 'identity_image', 'nda'].includes(f.remarks) ? (
                f.answer_file ? (
                  <Box mt={2} display="flex" flexDirection="column" alignItems="center">
                    {/* <Typography variant="subtitle2" gutterBottom>
                      {f.long_display_text}
                    </Typography> */}
                    <img
                      src={'http://192.168.1.116:8000/cdn' + f.answer_file}
                      alt={f.remarks}
                      style={{ width: 200, borderRadius: 8, objectFit: 'cover' }}
                    />
                    <Button
                      color="error"
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1 }}
                      onClick={() =>
                        handleRemoveFileForField(
                          f.answer_file,
                          (url) => handleChange(f.remarks, url),
                          f.remarks,
                        )
                      }
                      startIcon={<IconTrash />}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  /* fallback → upload/camera UI yang sudah ada */
                  <Box>{/* panggil UI upload/camera sesuai case kamu */}</Box>
                )
              ) : (
                /* === Default: TextField === */
                <CustomTextField
                  fullWidth
                  value={displayValue}
                  onChange={(e) => handleChange(f.remarks, e.target.value)}
                  placeholder={f.long_display_text || f.remarks}
                />
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  function transformToSubmitPayload(invitationData: any) {
    const { question_page = [], site_place_data, visitor_type, visitor_type_data } = invitationData;

    return {
      visitor_type: visitor_type, // ← bisa pakai langsung dari API kalau mau
      type_registered: 1,
      is_group: false,
      tz: site_place_data?.timezone ?? 'Asia/Jakarta',
      registered_site: site_place_data?.id,
      data_visitor: [
        {
          question_page: question_page.map((section: any) => {
            // cari definisi section
            const sectionDef = visitor_type_data?.section_page_visitor_types?.find(
              (s: any) => s.Id.toLowerCase() === section.id.toLowerCase(),
            );

            return {
              id: section.id,
              sort: section.sort,
              name: section.name,
              status: 0,
              is_document: section.is_document,
              can_multiple_used: section.can_multiple_used,
              self_only: section.self_only ?? false,
              foreign_id: section.foreign_id ?? '',
              form: (section.form ?? []).map((f: any) => {
                const fieldDef =
                  sectionDef?.visit_form?.find((vf: any) => vf.remarks === f.remarks) || {};

                const value = formValues[f.remarks];

                const base = {
                  sort: f.sort,
                  short_name: f.short_name,
                  long_display_text: f.long_display_text,
                  field_type: f.field_type,
                  is_primary: true,
                  is_enable: true,
                  mandatory: true,
                  remarks: f.remarks,
                  custom_field_id:
                    fieldDef.custom_field_id ?? f.custom_field_id ?? crypto.randomUUID(),
                  multiple_option_fields: fieldDef.multiple_option_fields ?? [],
                  visitor_form_type: 1,
                };

                if (!value) return base;

                // per-tipe mapping
                if (f.field_type === 9) {
                  return { ...base, answer_datetime: value, answer_text: value }; // boleh double kalau backend butuh
                }
                if (f.field_type === 10 || f.field_type === 11 || f.field_type === 12) {
                  return { ...base, answer_file: value };
                }
                return { ...base, answer_text: value };
              }),
            };
          }),
        },
      ],
    };
  }
  const handleSubmit = async () => {
    const currentSection = formSections[activeStep];
    if (!validateStep(currentSection)) return;

    try {
      const payload = transformToSubmitPayload(invitationData);
      console.log('Payload siap dikirim:', JSON.stringify(payload, null, 2));

      const visitorId = invitationData?.id; // ambil id visitor dari data
      console.log('Visitor ID:', visitorId);
      if (!visitorId) {
        console.error('❌ Visitor ID tidak ditemukan di invitationData');
        return;
      }

      // const res = await AuthVisitor({ code, ...payload });
      const res = await SubmitPraForm(payload, visitorId);
      console.log('Response submit:', JSON.stringify(res || {}, null, 2));

      if (res?.collection?.id) {
        console.log('Visitor Invitation ID:', res.collection.id);
      }

      // redirect ke halaman selanjutnya
      navigate('/guest/dashboard');
    } catch (error) {
      console.error('Error submit:', error);
    }
  };

  return (
    <PageContainer title="Information" description="Guest Info Stepper">
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: '100vh', backgroundColor: '#f4f6f8' }}
      >
        <Grid size={{ xs: 11, sm: 8, lg: 10 }}>
          <Card elevation={10} sx={{ p: 3, borderRadius: 3, bgcolor: 'white', boxShadow: 3 }}>
            <Box
              textAlign="center"
              mb={3}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Logo />
              {code && (
                <Typography variant="subtitle1" fontWeight={600} mt={0}>
                  Kode Undangan: {code}
                </Typography>
              )}
            </Box>

            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label: any, idx: number) => (
                <Step key={idx}>
                  <StepLabel
                    StepIconComponent={CustomStepIcon}
                    onClick={() => setActiveStep(idx)}
                    sx={{
                      cursor: 'pointer',
                      '& .MuiStepLabel-label': {
                        typography: 'body1',
                        fontWeight: activeStep === idx ? 600 : 400,
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === steps.length ? (
              <Box mt={3} textAlign="center">
                <Typography variant="h6" color="success.main">
                  Semua langkah selesai 🎉
                </Typography>
                <Button onClick={handleReset} sx={{ mt: 2 }} variant="contained" color="error">
                  Reset
                </Button>
              </Box>
            ) : (
              <>
                <Box mt={4}>{StepContent(formSections[activeStep])}</Box>

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
            )}
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default GuestInformationStepper;
