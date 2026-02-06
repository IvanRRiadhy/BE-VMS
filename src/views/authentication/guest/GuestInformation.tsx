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
  IconButton,
  Container,
  Backdrop,
  Tooltip,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import PageContainer from 'src/components/container/PageContainer';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { AuthVisitor, SubmitPraForm } from 'src/customs/api/users';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Webcam from 'react-webcam';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { IconGenderTransgender, IconMan, IconTrash, IconWoman, IconX } from '@tabler/icons-react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { GroupRoleId } from '../../../constant/GroupRoleId';
import Logo from 'src/assets/images/logos/BI_Logo.png';
// import Logo from 'src/assets/images/logos/bio-experience-1x1-logo.png';
import { Snackbar } from '@mui/material';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { IconCamera } from '@tabler/icons-react';

import { useTheme, useMediaQuery, MobileStepper } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Footer from '../components/Footer';
import { KeyboardArrowUp } from '@mui/icons-material';
import { IconDeviceFloppy } from '@tabler/icons-react';
import PreviewDialog from '../components/PreviewDialog';

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(timezone);

dayjs.locale('id');

const GuestInformationStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [invitationData, setInvitationData] = useState<any | null>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [openPreview, setOpenPreview] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const webcamRef = useRef<Webcam>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.snackbar) {
      setSnackbar(location.state.snackbar);

      // bersihin state biar nggak muncul lagi
      window.history.replaceState({}, document.title);
    }
  }, []);

  const formatDateTime = (value: string | null) => {
    if (!value) return '-';

    return dayjs.utc(value).tz(dayjs.tz.guess()).format('dddd, DD MMMM YYYY, HH:mm');
  };

  const { saveToken } = useSession();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';
  const isEmpty = (val: any) => val === undefined || val === null || val === '';

  const validateStep = (section: any) => {
    const newErrors: Record<string, string> = {};
    section?.form?.forEach((f: any) => {
      if (
        f.mandatory &&
        isEmpty(formValues[f.remarks])
        // &&
        // !(
        //   ['vehicle_plate', 'vehicle_type'].includes(f.remarks) &&
        //   formValues['is_driving'] !== 'true'
        // )
      ) {
        newErrors[f.remarks] = `${f.long_display_text} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!code) return;

      const res = await AuthVisitor({ code });
      setInvitationData(res.collection);
      // console.log(res);

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
    };

    fetchData();
  }, [code]);

  const handleChange = (remarks: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [remarks]: value }));
    setErrors((prev) => {
      if (!prev[remarks]) return prev;
      const { [remarks]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleNext = () => {
    const currentSection = formSections[activeStep];
    if (!validateStep(currentSection)) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

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
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const formSections = invitationData.question_page;

  const steps = formSections.map((q: any) => q.name);

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

      if (!fileUrl) return null;

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

    if (trackKey) {
      setUploadNames((prev) => ({ ...prev, [trackKey]: file.name }));
      setPreviews((prev) => ({ ...prev, [trackKey]: URL.createObjectURL(file) }));
    }

    const path = await uploadFileToCDN(file);
    if (path) setAnswerFile(path);

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

  const renderCameraField = (f: any, idx: number) => {
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

        {errors[key] && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {errors[key]}
          </Typography>
        )}

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
                color="error"
                startIcon={<IconTrash />}
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
                startIcon={<IconCamera />}
                onClick={() => handleCaptureForField((url) => handleChange(f.remarks, url), key)}
              >
                Take Foto
              </Button>
              <Button
                onClick={() => setOpenCamera(false)}
                sx={{ ml: 2 }}
                startIcon={<IconDeviceFloppy />}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    );
  };

  const renderFileUploadField = (f: any, idx: number) => {
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
                <Typography variant="caption" noWrap>
                  {shownName}
                </Typography>
              )}

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

  const renderUploadWithCamera = (f: any, idx: number, section: any) => {
    // const key = f.remarks;
    const key = `${section.name}_${f.remarks}`;
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
          <Typography variant="h6" sx={{ mt: 1 }}>
            Upload File
          </Typography>

          <Typography variant="caption" color="textSecondary">
            Supports: JPG, PNG, JPEG, Up to <span style={{ fontWeight: '700' }}> 100KB</span>
          </Typography>

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

        {errors[key] && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {errors[key]}
          </Typography>
        )}

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
                color="error"
                startIcon={<IconTrash />}
                sx={{ mr: 2 }}
              >
                Clear Foto
              </Button>
              <Button
                variant="contained"
                startIcon={<IconCamera />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCaptureForField((url) => handleChange(f.remarks, url), key);
                }}
              >
                Take Foto
              </Button>
              <Button
                onClick={() => setOpenCamera(false)}
                sx={{ ml: 2 }}
                startIcon={<IconDeviceFloppy />}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    );
  };

  const StepContent = (section: any) => {
    const isDriving = formValues['is_driving'] === 'true' || formValues['is_driving'] === true;

    return (
      <Box mt={1}>
        <Grid container spacing={2}>
          {section.form?.map((f: any, idx: number) => {
            if (!isDriving && ['vehicle_type', 'vehicle_plate'].includes(f.remarks)) {
              return null;
            }

            const fieldKey = `${section.name}_${f.remarks}`;
            let displayValue = formValues[f.remarks] ?? '';

            const type = getFieldTypeByRemarks(f.remarks) ?? f.field_type;

            if (f.remarks === 'host') {
              displayValue = invitationData.host_data?.name || displayValue;
            } else if (f.remarks === 'site_place') {
              displayValue = invitationData.site_place_data?.name || displayValue;
            }



            if (!isDriving && ['vehicle_type', 'vehicle_plate'].includes(f.remarks)) {
              return null;
            }

            const gridSize = { xs: 12 };

            return (
              <Grid key={fieldKey} size={gridSize}>
                <CustomFormLabel sx={{ mt: 0 }} required={f.mandatory === true}>
                  {f.long_display_text || f.remarks}
                </CustomFormLabel>
                {(() => {
                  switch (type) {
                    case 10:
                      return renderCameraField(f, idx);
                    case 11:
                      return renderFileUploadField(f, idx);
                    case 12:
                      return renderUploadWithCamera(f, idx, section);
                    default:
                      return null;
                  }
                })()}
                {['visitor_period_start', 'visitor_period_end'].includes(f.remarks) && (
                  <CustomTextField
                    fullWidth
                    value={formatDateTime(formValues[f.remarks])}
                    InputProps={{ readOnly: true }}
                    disabled
                  />
                )}
                {section.name === 'Purpose Visit' &&
                  !['visitor_period_start', 'visitor_period_end'].includes(f.remarks) && (
                    <CustomTextField
                      fullWidth
                      value={displayValue}
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                  )}

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

                {f.remarks === 'gender' && (
                  <>
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
                        <IconGenderTransgender size={16} style={{ marginRight: 6 }} /> Prefer not to
                        say
                      </ToggleButton>
                    </ToggleButtonGroup>
                    {errors[f.remarks] && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                        {errors[f.remarks]}
                      </Typography>
                    )}
                  </>
                )}

                {f.remarks === 'is_driving' && (
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={formValues[f.remarks] || ''}
                      onChange={(e) => handleChange(f.remarks, e.target.value)}
                      sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                    >
                      <FormControlLabel value="true" control={<Radio />} label="Yes" />
                      <FormControlLabel value="false" control={<Radio />} label="No" />
                    </RadioGroup>
                    {errors[f.remarks] && (
                      <Typography variant="caption" color="error">
                        {errors[f.remarks]}
                      </Typography>
                    )}
                  </FormControl>
                )}

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

                {![
                  'visitor_period_start',
                  'visitor_period_end',
                  'vehicle_plate',
                  'gender',
                  'is_driving',
                  'vehicle_type',
                ].includes(f.remarks) &&
                  !['selfie_image', 'nda', 'identity_image'].includes(f.remarks) &&
                  section.name !== 'Purpose Visit' && (
                    <CustomTextField
                      fullWidth
                      value={displayValue}
                      onChange={(e) => handleChange(f.remarks, e.target.value)}
                      placeholder={f.long_display_text || f.remarks}
                      error={!!errors[f.remarks]}
                      helperText={errors[f.remarks]}
                    />
                  )}
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  function transformToSubmitPayload(invitationData: any) {
    const { question_page = [], site_place_data, visitor_type, visitor_type_data } = invitationData;

    return {
      visitor_type: visitor_type,
      type_registered: 0,
      is_group: false,
      tz: site_place_data?.timezone ?? 'Asia/Jakarta',
      registered_site: site_place_data?.id,
      data_visitor: [
        {
          question_page: question_page.map((section: any) => {
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

                if (f.field_type === 9) {
                  return { ...base, answer_datetime: value, answer_text: value };
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const currentSection = formSections[activeStep];
    if (!validateStep(currentSection)) return;

    try {
      setSubmitting(true);

      const payload = transformToSubmitPayload(invitationData);
      console.log('payload', JSON.stringify(payload, null, 2));
      // const visitorId = invitationData?.id;
      // if (!visitorId) {
      //   return;
      // }

      // const res = await SubmitPraForm(payload, visitorId);
      // console.log('✅ SubmitPraForm success:', JSON.stringify(res || {}, null, 2));

      // // await new Promise((r) => setTimeout(r, 500));

      // const authRes = await AuthVisitor({ code });
      // console.log('✅ AuthVisitor success:', JSON.stringify(authRes || {}, null, 2));
      // const token = authRes?.collection?.token;
      // console.log('token', token);

      // const status = authRes.status;

      // if (status === 'process') {
      //   setSubmitting(false);
      //   navigate('/portal/waiting', { replace: true });
      //   return;
      // }

      // if (token) {
      //   await saveToken(token, GroupRoleId.Visitor);
      //   showSwal('success', 'Successfully Pra Register Visitor');

      //   navigate('/guest/dashboard', { replace: true });
      //   localStorage.removeItem('visitor_ref_code');
      //   return;
      // }
    } catch (error) {
      setSubmitting(false);
      showSwal('error', 'Failed to submit guest information form.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="Guest Information" description="Guest Information">
      <Box>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ height: { xs: '100vh', lg: '80vh' }, backgroundColor: '#f4f6f8' }}
        >
          <Grid size={{ xs: 12, sm: 11, xl: 8 }} sx={{ p: { xs: 2 } }}>
            <Card elevation={10} sx={{ p: 3, borderRadius: 3, bgcolor: 'white', boxShadow: 3 }}>
              <Box
                textAlign="center"
                mb={3}
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={Logo} width={100} height={100} alt="Logo" />
                {code && (
                  <Typography variant="h6" fontWeight={600} mt={2}>
                    Invitation Code: {code}
                  </Typography>
                )}
              </Box>

              {!isMobile && (
                <>
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
                </>
              )}

              {isMobile && (
                <Box
                  sx={{
                    mt: 1,
                    mb: 1,
                    px: 2,
                    py: 1,
                    width: 'fit-content',
                    mx: 'auto',
                    // bgcolor: 'primary.main',
                    borderRadius: 2,
                    color: 'primary',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h5" fontWeight={600}>
                    {steps[activeStep]}
                  </Typography>
                </Box>
              )}

              <Box mt={2}>{StepContent(formSections[activeStep])}</Box>

              {isMobile && (
                <Box sx={{ mt: 2 }}>
                  <MobileStepper
                    variant="dots"
                    steps={steps.length}
                    position="static"
                    activeStep={activeStep}
                    nextButton={
                      activeStep === steps.length - 1 ? (
                        <Button
                          size="medium"
                          variant="contained"
                          color="primary"
                          // onClick={handleSubmit}
                          onClick={() => setOpenPreview(true)}
                        >
                          Submit
                        </Button>
                      ) : (
                        <Button
                          size="medium"
                          variant="contained"
                          color="primary"
                          onClick={handleNext}
                        >
                          Next
                          <KeyboardArrowRight />
                        </Button>
                      )
                    }
                    backButton={
                      <Button size="medium" onClick={handleBack} disabled={activeStep === 0}>
                        <KeyboardArrowLeft />
                        Back
                      </Button>
                    }
                  />
                </Box>
              )}

              <>
                {!isMobile && (
                  <Box display="flex" flexDirection="row" mt={4}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      startIcon={<KeyboardArrowLeft />}
                    >
                      Back
                    </Button>
                    <Box flex="1 1 auto" />
                    {activeStep !== steps.length - 1 ? (
                      <Button
                        onClick={handleNext}
                        variant="contained"
                        endIcon={<KeyboardArrowRight />}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        // onClick={handleSubmit}
                        onClick={() => setOpenPreview(true)}
                        variant="contained"
                        color="primary"
                      >
                        Submit
                      </Button>
                    )}
                  </Box>
                )}
              </>
            </Card>
          </Grid>
        </Grid>
        <Footer />
      </Box>

      <PreviewDialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        onConfirm={(e: any) => {
          setOpenPreview(false);
          handleSubmit(e);
        }}
        invitationData={invitationData}
        formValues={formValues}
      />
      <Backdrop
        open={submitting}
        sx={{
          zIndex: 99999,
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <CircularProgress color="primary" />
        </Box>
      </Backdrop>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity as any}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {showBackToTop && (
        <Tooltip title="Back to Top" placement="left" arrow>
          <Box
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              '&:hover': {
                backgroundColor: 'primary.main',
                transform: 'scale(1.05)',
              },
            }}
          >
            <KeyboardArrowUp sx={{ color: '#fff', fontSize: 30 }} />
          </Box>
        </Tooltip>
      )}
    </PageContainer>
  );
};

export default GuestInformationStepper;
