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
  Divider,
  Autocomplete,
  TextField,
  IconButton,
  Backdrop,
  Icon,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import Logo from 'src/customs/components/logo/Logo';
import { IconGenderTransgender, IconMan, IconTrash, IconWoman, IconX } from '@tabler/icons-react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { SubmitPraForm } from 'src/customs/api/users';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Webcam from 'react-webcam';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  createVisitorInvitation,
  getDetailInvitationForm,
  submitPraFormEmployee,
} from 'src/customs/api/visitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getVisitorEmployee } from 'src/customs/api/admin';
import { showErrorAlert, showSuccessAlert } from 'src/customs/components/alerts/alerts';
import { createSubmitCompletePra } from 'src/customs/api/operator';
dayjs.extend(utc);
dayjs.extend(timezone);

interface FormDialogPraregistProps {
  id: string;
  onClose?: () => void;
  onSubmitted?: (id?: string) => void;
  onSubmitting?: (loading: boolean) => void;
}

const FormDialogPraregist: React.FC<FormDialogPraregistProps> = ({
  id,
  onClose,
  onSubmitted,
  onSubmitting,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const { token } = useSession();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [invitationData, setInvitationData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCamera, setOpenCamera] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const webcamRef = useRef<Webcam>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';

  const formatDateTime = (value: string | null) =>
    !value ? '-' : dayjs(value).tz('Asia/Jakarta').format('DD MMMM YYYY HH:mm');

  // ✅ Ambil detail invitation
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !token) return;
      setLoading(true);
      try {
        const res = await getDetailInvitationForm(token, id);
        const data = res.collection;
        setInvitationData(data);

        // siapkan nilai awal form
        const initial: Record<string, any> = {};
        data?.question_page?.forEach((section: any) => {
          section.form?.forEach((f: any) => {
            if (f.field_type === 9) initial[f.remarks] = f.answer_datetime;
            else if ([10, 11, 12].includes(f.field_type)) initial[f.remarks] = f.answer_file;
            else initial[f.remarks] = f.answer_text || '';
          });
        });
        setFormValues(initial);
      } catch (err) {
        console.error('❌ Gagal load invitation detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  // ✅ Validasi field di step aktif
  // const validateStep = (section: any) => {
  //   const newErrors: Record<string, string> = {};
  //   section?.form?.forEach((f: any) => {
  //     if (f.mandatory && !formValues[f.remarks]) {
  //       newErrors[f.remarks] = `${f.long_display_text} is required`;
  //     }
  //   });
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const handleChange = (remarks: string, value: any) =>
    setFormValues((prev) => ({ ...prev, [remarks]: value }));

  const formSections = invitationData?.question_page ?? [];
  const steps = formSections.map((q: any) => q.name ?? 'Untitled');

  const handleNext = () => {
    const currentSection = formSections[activeStep];
    // if (!validateStep(currentSection)) return;
    setActiveStep((s) => s + 1);
  };
  const handleBack = () => setActiveStep((s) => s - 1);

  // ✅ render field kamera/upload
  //   const renderCameraField = (f: any, idx: number) => (
  //     <Box>
  //       <Box
  //         sx={{
  //           border: '2px dashed #90caf9',
  //           borderRadius: 2,
  //           padding: 4,
  //           textAlign: 'center',
  //           backgroundColor: '#f5faff',
  //           cursor: 'pointer',
  //         }}
  //         onClick={() => setOpenCamera(true)}
  //       >
  //         <PhotoCameraIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
  //         <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>
  //           Use Camera
  //         </Typography>
  //       </Box>

  //       <Dialog open={openCamera} onClose={() => setOpenCamera(false)} maxWidth="md" fullWidth>
  //         <Box sx={{ p: 3 }}>
  //           <Typography variant="h6" mb={2}>
  //             Take Selfie Photo
  //           </Typography>
  //           <Webcam
  //             audio={false}
  //             ref={webcamRef}
  //             screenshotFormat="image/jpeg"
  //             videoConstraints={{ facingMode: 'user' }}
  //             style={{ width: '100%', borderRadius: 8, border: '2px solid #ccc' }}
  //           />
  //           <Divider sx={{ my: 2 }} />
  //           <Box sx={{ textAlign: 'right' }}>
  //             <Button
  //               variant="contained"
  //               onClick={() =>
  //                 handleCaptureForField((url) => handleChange(f.remarks, url), f.remarks)
  //               }
  //             >
  //               Capture
  //             </Button>
  //           </Box>
  //         </Box>
  //       </Dialog>
  //     </Box>
  //   );

  const renderCameraField = (f: any, idx: number) => {
    const key = f.remarks;
    const previewSrc = previews[key];
    const shownName = uploadNames[key];

    return (
      <Box>
        {/* MAIN UPLOAD BOX */}
        <Box
          sx={{
            border: '2px dashed #90caf9',
            borderRadius: 2,
            padding: 4,
            textAlign: 'center',
            backgroundColor: '#f5faff',
            cursor: 'pointer',
            width: '100%',
            pointerEvents: 'auto',
            opacity: 1,
          }}
          onClick={() => setOpenCamera(true)}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              p: 2,
            }}
          >
            <PhotoCameraIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
            <Typography
              variant="subtitle1"
              component="span"
              color="primary"
              sx={{ fontWeight: 600 }}
            >
              Use Camera
            </Typography>
            {(previewSrc || shownName) && (
              <Box
                mt={2}
                display="flex"
                alignItems="center"
                gap={1}
                justifyContent={'center'}
                flexDirection="column"
              >
                {previewSrc && (
                  <>
                    <img
                      src={previewSrc}
                      alt="preview"
                      style={{
                        width: 350,
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 8,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Button
                      color="error"
                      size="small"
                      variant="outlined"
                      sx={{ mt: 2, minWidth: 120 }}
                      startIcon={<IconTrash />}
                      onClick={() =>
                        handleRemoveFileForField(
                          f.answer_file,
                          (url) => handleChange(f.remarks, url),
                          key,
                        )
                      }
                    >
                      Remove
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* PREVIEW FOTO */}

        {/* DIALOG KAMERA */}
        <Dialog open={openCamera} onClose={() => setOpenCamera(false)} maxWidth="md" fullWidth>
          <Box sx={{ p: 3, position: 'relative' }}>
            <Box>
              <Typography variant="h6" mb={2}>
                Take Photo From Camera
              </Typography>
              <IconButton
                onClick={() => setOpenCamera(false)}
                sx={{ position: 'absolute', top: 10, right: 10 }}
              >
                <IconX size={22} />
              </IconButton>
            </Box>

            <Grid container spacing={2}>
              {/* CAMERA LIVE VIEW */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user' }}
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: '2px solid #ccc',
                  }}
                />
              </Grid>

              {/* PREVIEW FOTO */}
              <Grid size={{ xs: 12, sm: 6 }}>
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Captured"
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      border: '2px solid #ccc',
                    }}
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

            {/* ACTION BUTTONS */}
            <Box sx={{ textAlign: 'right' }}>
              <Button
                color="warning"
                sx={{ mr: 2 }}
                onClick={() =>
                  handleRemoveFileForField(
                    f.answer_file,
                    (url) => handleChange(f.remarks, url),
                    key,
                  )
                }
              >
                Clear Foto
              </Button>
              <Button
                variant="contained"
                onClick={() => handleCaptureForField((url) => handleChange(f.remarks, url), key)}
              >
                Take Foto
              </Button>
              <Button onClick={() => setOpenCamera(false)} sx={{ ml: 2 }}>
                Submit
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    );
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

  //   const getFieldTypeByRemarks = (remarks: string): number | null => {
  //     switch (remarks) {
  //       case 'selfie_image':
  //         return 10; // Kamera
  //       case 'nda':
  //         return 11; // File upload dokumen
  //       case 'identity_image':
  //         return 12; // Upload file + opsi kamera
  //       default:
  //         return null;
  //     }
  //   };

  // const renderFileUploadField = (f: any, idx: number) => (
  //   <Box
  //     sx={{
  //       border: '2px dashed #90caf9',
  //       borderRadius: 2,
  //       padding: 4,
  //       textAlign: 'center',
  //       backgroundColor: '#f5faff',
  //       cursor: 'pointer',
  //     }}
  //     onClick={() => fileInputRefs.current[f.remarks]?.click()}
  //   >
  //     <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
  //     <Typography variant="subtitle1">Upload NDA File</Typography>
  //     <input
  //       type="file"
  //       hidden
  //       accept="application/pdf,image/*"
  //       ref={(el: any) => (fileInputRefs.current[f.remarks] = el)}
  //       onChange={(e) =>
  //         handleFileChangeForField(e, (url) => handleChange(f.remarks, url), f.remarks)
  //       }
  //     />
  //   </Box>
  // );
  const renderFileUploadField = (f: any, idx: number) => {
    const key = f.remarks;
    const previewSrc = previews[key];
    const shownName = uploadNames[key];

    return (
      <Box>
        {/* Upload Box */}
        <Box
          sx={{
            border: '2px dashed #90caf9',
            borderRadius: 2,
            padding: 4,
            textAlign: 'center',
            backgroundColor: '#f5faff',
            cursor: 'pointer',
            width: '100%',
          }}
          onClick={() => fileInputRefs.current[key]?.click()}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Upload NDA File
          </Typography>

          <Typography variant="caption" color="textSecondary">
            Supports: PDF, DOCX, JPG, PNG
          </Typography>

          {/* Hidden input */}
          <input
            id={`file-${key}`}
            type="file"
            accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hidden
            ref={(el: any) => (fileInputRefs.current[key] = el)}
            onChange={(e) =>
              handleFileChangeForField(
                e as React.ChangeEvent<HTMLInputElement>,
                (url) => handleChange(f.remarks, url),
                key,
              )
            }
          />

          {/* Preview Section */}
          {(previewSrc || shownName) && (
            <Box
              mt={2}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {previewSrc ? (
                // 📄 PDF / DOC Preview
                previewSrc.endsWith('.pdf') || previewSrc.endsWith('.docx') ? (
                  <Box
                    sx={{
                      width: 100,
                      height: 120,
                      border: '1px solid #ddd',
                      borderRadius: 2,
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h6">📄</Typography>
                    <Typography variant="caption" textAlign="center">
                      {shownName || 'Document'}
                    </Typography>
                  </Box>
                ) : (
                  // 🖼️ Image Preview
                  <img
                    src={previewSrc}
                    alt="preview"
                    style={{
                      width: 350,
                      height: 200,
                      borderRadius: 12,
                      objectFit: 'cover',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    }}
                  />
                )
              ) : (
                // No previewSrc, show filename only
                <Typography variant="caption" noWrap>
                  {shownName}
                </Typography>
              )}

              {/* Remove button */}
              <Button
                color="error"
                size="small"
                variant="outlined"
                sx={{ mt: 2, minWidth: 120 }}
                onClick={() =>
                  handleRemoveFileForField(
                    f.answer_file,
                    (url) => handleChange(f.remarks, url),
                    key,
                  )
                }
                startIcon={<IconTrash />}
              >
                Remove
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    );
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

  const getFieldTypeByRemarks = (remarks: string): number | null => {
    switch (remarks) {
      case 'selfie_image':
        return 10; // Kamera
      case 'nda':
        return 11; // File upload dokumen
      case 'identity_image':
        return 12; // Upload file + opsi kamera
      default:
        return null;
    }
  };

  const renderUploadWithCamera = (f: any, idx: number) => {
    const key = f.remarks;
    const previewSrc = previews[key];
    const shownName = uploadNames[key];

    return (
      <Box>
        <Box
          sx={{
            border: '2px dashed #90caf9',
            borderRadius: 2,
            padding: 4,
            textAlign: 'center',
            backgroundColor: '#f5faff',
            cursor: 'pointer',
            width: '100%',
            pointerEvents: 'auto',
            opacity: 1,
          }}
          onClick={() => fileInputRefs.current[key]?.click()}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Upload File
          </Typography>

          <Typography variant="caption" color="textSecondary">
            Supports: PDF, DOCX, JPG, PNG
          </Typography>

          {/* 🔹 Tombol kamera tambahan */}
          <Typography
            variant="subtitle1"
            component="span"
            color="primary"
            sx={{ fontWeight: 600, ml: 1, cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              setOpenCamera(true);
            }}
          >
            Use Camera
          </Typography>

          {/* 🔹 Hidden input file */}
          <input
            id={`file-${key}`}
            type="file"
            accept="image/*,application/pdf"
            hidden
            ref={(el: any) => (fileInputRefs.current[key] = el)}
            onChange={(e) =>
              handleFileChangeForField(
                e as React.ChangeEvent<HTMLInputElement>,
                (url) => handleChange(f.remarks, url),
                key,
              )
            }
          />

          {/* 🔹 Preview upload / foto */}
          {(previewSrc || shownName) && (
            <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {previewSrc ? (
                <>
                  <img
                    src={previewSrc}
                    alt="preview"
                    style={{
                      width: 350,
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
                    onClick={() =>
                      handleRemoveFileForField(
                        f.answer_file,
                        (url) => handleChange(f.remarks, url),
                        key,
                      )
                    }
                    startIcon={<IconTrash />}
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <Typography variant="caption" noWrap>
                  {shownName}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* 🔹 Dialog kamera */}
        <Dialog open={openCamera} onClose={() => setOpenCamera(false)} maxWidth="md" fullWidth>
          <Box sx={{ p: 3, position: 'relative' }}>
            <Typography variant="h6" mb={2}>
              Take Photo From Camera
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'environment' }}
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: '2px solid #ccc',
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Captured"
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      border: '2px solid #ccc',
                    }}
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

            <Box sx={{ textAlign: 'right' }}>
              <Button
                onClick={() =>
                  handleRemoveFileForField(
                    f.answer_file,
                    (url) => handleChange(f.remarks, url),
                    key,
                  )
                }
                color="warning"
                sx={{ mr: 2 }}
              >
                Clear Foto
              </Button>
              <Button
                variant="contained"
                onClick={(e) => {
                  // e.stopPropagation();
                  handleCaptureForField((url) => handleChange(f.remarks, url), key);
                }}
              >
                Take Foto
              </Button>
              <Button onClick={() => setOpenCamera(false)} sx={{ ml: 2 }}>
                Close
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    );
  };

  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});

  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getVisitorEmployee(token as string);
      setAllVisitorEmployee(res?.collection ?? []);
    };
    fetchData();
  }, [token]);

  // ✅ render field per section
  const StepContent = (section: any) => (
    <Box mt={3}>
      <Grid container spacing={2}>
        {section.form?.map((f: any, idx: number) => {
          let displayValue = formValues[f.remarks] ?? '';

          // Mapping field type berdasarkan remarks
          const type = getFieldTypeByRemarks(f.remarks) ?? f.field_type;

          // Override host dan site_place
          if (f.remarks === 'host') {
            displayValue = invitationData.host_data?.name || displayValue;
          } else if (f.remarks === 'site_place') {
            displayValue = invitationData.site_place_data?.name || displayValue;
          }

          const gridSize = { xs: 12 };

          return (
            <Grid key={idx} size={gridSize}>
              <CustomFormLabel sx={{ mt: 0 }}>{f.long_display_text || f.remarks}</CustomFormLabel>

              {/* 🔹 CASE A: file-based (selfie/nda/identity) */}
              {(() => {
                switch (type) {
                  case 10:
                    return renderCameraField(f, idx); // selfie_image
                  case 11:
                    return renderFileUploadField(f, idx); // nda
                  case 12:
                    return renderUploadWithCamera(f, idx); // identity_image
                  default:
                    return null;
                }
              })()}

              {/* 🔹 CASE B: tanggal readonly */}
              {['visitor_period_start', 'visitor_period_end'].includes(f.remarks) && (
                <CustomTextField
                  fullWidth
                  value={formatDateTime(formValues[f.remarks])}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              )}

              {/* 🔹 CASE C: readonly section Purpose Visit */}
              {section.name === 'Purpose Visit' &&
                !['visitor_period_start', 'visitor_period_end'].includes(f.remarks) && (
                  <CustomTextField
                    fullWidth
                    value={displayValue}
                    InputProps={{ readOnly: true }}
                    disabled
                  />
                )}

              {/* 🔹 CASE D: vehicle_plate */}
              {f.remarks === 'vehicle_plate' && (
                <CustomTextField
                  fullWidth
                  value={displayValue}
                  onChange={(e) => handleChange(f.remarks, e.target.value)}
                  placeholder={f.long_display_text || f.remarks}
                  error={!!errors[f.remarks]}
                  helperText={errors[f.remarks]}
                />
              )}

              {/* 🔹 CASE E: gender */}
              {f.remarks === 'gender' && (
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
                    <IconMan size={16} style={{ marginRight: 6 }} /> Male
                  </ToggleButton>
                  <ToggleButton value="0">
                    <IconWoman size={16} style={{ marginRight: 6 }} /> Female
                  </ToggleButton>
                  <ToggleButton value="2">
                    <IconGenderTransgender size={16} style={{ marginRight: 6 }} /> Prefer not to say
                  </ToggleButton>
                </ToggleButtonGroup>
              )}

              {/* 🔹 CASE F: is_driving */}
              {f.remarks === 'is_driving' && (
                <>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={formValues[f.remarks] || ''}
                      onChange={(e) => handleChange(f.remarks, e.target.value)}
                      sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                    >
                      <FormControlLabel value="true" control={<Radio />} label="Yes" />
                      <FormControlLabel value="false" control={<Radio />} label="No" />
                    </RadioGroup>
                  </FormControl>
                  {errors[f.remarks] && (
                    <Typography variant="caption" color="error">
                      {errors[f.remarks]}
                    </Typography>
                  )}
                </>
              )}

              {f.remarks === 'employee' && (
                <>
                  <Autocomplete
                    size="small"
                    options={allVisitorEmployee.map((emp: any) => ({
                      value: emp.id,
                      name: emp.name,
                    }))}
                    getOptionLabel={(option) => option.name}
                    inputValue={inputValues[f.remarks] || ''}
                    onInputChange={(_, newInputValue) =>
                      setInputValues((prev) => ({ ...prev, [f.remarks]: newInputValue }))
                    }
                    filterOptions={(opts, state) => {
                      if (state.inputValue.length < 3) return [];
                      return opts.filter((opt) =>
                        opt.name.toLowerCase().includes(state.inputValue.toLowerCase()),
                      );
                    }}
                    noOptionsText={
                      (inputValues[f.remarks] || '').length < 3
                        ? 'Ketik minimal 3 karakter untuk mencari'
                        : 'Tidak ditemukan'
                    }
                    value={
                      allVisitorEmployee
                        .map((emp: any) => ({ value: emp.id, name: emp.name }))
                        .find((opt) => opt.value === formValues[f.remarks]) || null
                    }
                    onChange={(_, newValue) =>
                      handleChange(f.remarks, newValue ? newValue.value : '')
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label=""
                        placeholder="Ketik minimal 3 karakter"
                        fullWidth
                      />
                    )}
                  />

                  {/* {errors[f.remarks] && (
                    <Typography variant="caption" color="error">
                      {errors[f.remarks]}
                    </Typography>
                  )} */}
                </>
              )}

              {f.remarks === 'is_employee' && (
                <>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={formValues[f.remarks] || ''}
                      onChange={(e) => handleChange(f.remarks, e.target.value)}
                      sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                    >
                      <FormControlLabel value="true" control={<Radio />} label="Yes" />
                      <FormControlLabel value="false" control={<Radio />} label="No" />
                    </RadioGroup>
                  </FormControl>
                  {errors[f.remarks] && (
                    <Typography variant="caption" color="error">
                      {errors[f.remarks]}
                    </Typography>
                  )}
                </>
              )}

              {/* 🔹 CASE G: vehicle_type */}
              {f.remarks === 'vehicle_type' && (
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
              )}

              {/* 🔹 CASE H: Default input */}
              {![
                'visitor_period_start',
                'visitor_period_end',
                'vehicle_plate',
                'gender',
                'is_driving',
                'is_employee',
                'employee',
                'vehicle_type',
              ].includes(f.remarks) &&
                !['selfie_image', 'nda', 'identity_image'].includes(f.remarks) &&
                section.name !== 'Purpose Visit' && (
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

  const transformToSubmitPayload = (data: any) => ({
    visitor_type: data.visitor_type,
    type_registered: 0,
    trx_visitor_id: id,
    is_group: true, // tergantung kebutuhan
    group_name: data.group_name ?? '',
    tz: data.site_place_data?.timezone ?? 'Asia/Jakarta',
    registered_site: data.site_place_data?.id ?? '',
    data_visitor: [
      {
        question_page: data.question_page?.map((section: any) => ({
          id: section.id,
          sort: section.sort,
          name: section.name,
          status: section.status ?? 0,
          is_document: section.is_document ?? false,
          can_multiple_used: section.can_multiple_used ?? false,
          self_only: section.self_only ?? false,
          foreign_id: section.foreign_id ?? '',
          form: section.form?.map((f: any) => {
            const value = formValues[f.remarks] ?? '';
            const base = {
              sort: f.sort,
              short_name: f.short_name,
              long_display_text: f.long_display_text,
              field_type: f.field_type,
              is_primary: f.is_primary,
              is_enable: f.is_enable,
              mandatory: f.mandatory,
              remarks: f.remarks,
              multiple_option_fields: f.multiple_option_fields ?? [],
              visitor_form_type: f.visitor_form_type ?? 1,
              answer_text: null,
              answer_datetime: null,
              answer_file: null,
            };

            // mapping per tipe
            if ([10, 11, 12].includes(f.field_type)) {
              // file (selfie_image, nda, identity)
              base.answer_file = value;
            } else if (f.field_type === 9) {
              // datetime
              base.answer_datetime = value;
            } else {
              // text
              base.answer_text = value;
            }

            return base;
          }),
        })),
      },
    ],
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!invitationData) return;

    try {
      setSubmitting(true); // 🔹 tampilkan backdrop internal

      const payload = transformToSubmitPayload(invitationData);
      console.log('Payload response:', JSON.stringify(payload, null, 2));
      const res = await createSubmitCompletePra(token as string, payload);

      const ok =
        res &&
        (res.status === 'success' || res.status_code === 200 || res.title === 'success' || res.msg);

      if (ok) {
        // ✅ beri jeda dulu agar spinner terlihat, baru tampilkan snackbar
        await new Promise((r) => setTimeout(r, 600));

        showSuccessAlert('Successfully Pra Register!', res.msg ?? 'Success');

        await new Promise((r) => setTimeout(r, 1000));

        // onSubmitted?.();
        onSubmitted?.(invitationData.id);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        showErrorAlert('Error!', res.msg ?? 'Something went wrong');
      }
    } catch (err) {
      console.error('❌ Submit error:', err);
      const errMsg = (err as any)?.response?.data?.msg ?? (err as any)?.message ?? 'Unknown error';

      await new Promise((r) => setTimeout(r, 600));
      showErrorAlert('Error!', errMsg);
    } finally {
      // 🔹 beri sedikit jeda agar snackbar sempat muncul dulu sebelum backdrop hilang
      setTimeout(() => {
        setSubmitting(false);
      }, 600);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Grid
        container
        justifyContent="center"
        alignItems="stretch"
        sx={{
          width: '100%',
          // minHeight: '100vh',
          // backgroundColor: '#f4f6f8',
        }}
      >
        <Grid size={{ xs: 12 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label: string, i: number) => (
              <Step key={i}>
                <StepLabel
                  StepIconComponent={CustomStepIcon}
                  onClick={() => setActiveStep(i)}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.9rem', // 👉 ubah ukuran font
                      fontWeight: 500, // opsional: tebalin dikit
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box mt={4}>
            {formSections.length > 0 ? (
              StepContent(formSections[activeStep])
            ) : (
              <Typography textAlign="center" color="text.secondary">
                Form sections not found.
              </Typography>
            )}
          </Box>

          <Box display="flex" flexDirection="row" mt={4}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box flex="1 1 auto" />
            {activeStep !== steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 9999,
          position: 'fixed',
        }}
        open={submitting}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" />
        </Box>
      </Backdrop>
    </>
  );
};

const CustomStepIcon = (props: any) => {
  const { active, completed, className } = props;

  return (
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: '2px solid',
        borderColor: active ? 'primary.main' : '#ccc',
        backgroundColor: active ? 'primary.main' : '#ccc',
        color: active ? 'white' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
      }}
      className={className}
    >
      {props.icon} {/* tetap tampilkan nomor step */}
    </Box>
  );
};

export default FormDialogPraregist;
