import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
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
  useTheme,
  useMediaQuery,
  MobileStepper,
  Tooltip,
  Paper,
  LinearProgress,
  AlertColor,
  Portal,
  Snackbar,
  Alert,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCamera,
  IconDeviceFloppy,
  IconGenderTransgender,
  IconMan,
  IconRefresh,
  IconTrash,
  IconWoman,
  IconX,
} from '@tabler/icons-react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Webcam from 'react-webcam';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getDetailInvitationForm } from 'src/customs/api/visitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getVisitorEmployee } from 'src/customs/api/admin';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { createSubmitCompletePra } from 'src/customs/api/operator';
import { InfoOutlined, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import GlobalBackdropLoading from '../Components/GlobalBackdrop';
import { useTranslation } from 'react-i18next';
import CameraDialog from '../../admin/content/Visitor/Trx/components/Dialog/CameraDialog';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.locale('id');

interface FormDialogPraregistProps {
  id: string;
  onClose?: () => void;
  onSubmitted?: (id?: string) => void;
  containerRef?: any;
  registeredSite?: string;
}

const FormDialogPraregist: React.FC<FormDialogPraregistProps> = ({
  id,
  onClose,
  onSubmitted,
  containerRef,
  registeredSite,
}) => {
  const [activeStep, setActiveStep] = useState(-1);
  const [isSelfInvitation, setIsSelfInvitation] = useState<boolean | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [invitationData, setInvitationData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCamera, setOpenCamera] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const webcamRef = useRef<Webcam>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const lg = useMediaQuery(theme.breakpoints.up('lg'));
  const [isDragging, setIsDragging] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const { t } = useTranslation();
  const formatDateTime = (value: string | null) =>
    !value ? '-' : dayjs(value).tz(dayjs.tz.guess()).format('dddd, DD MMMM YYYY, HH:mm');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });
  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getDetailInvitationForm(id);
        const data = res.collection;
        setInvitationData(data);

        const initial: Record<string, any> = {};
        data?.question_page?.forEach((section: any) => {
          section.form?.forEach((f: any) => {
            if (f.remarks === 'is_driving') {
              initial[f.remarks] = f.answer_text ?? 'false';
            } else if (f.field_type === 9) {
              initial[f.remarks] = f.answer_datetime;
            } else if ([10, 11, 12].includes(f.field_type)) {
              initial[f.remarks] = f.answer_file;
            } else if (f.remarks === 'visitor_role') {
              const roles = data?.visitor_type_data?.visitor_roles ?? [];

              // const defaultRole = roles.find(
              //   (role: any) => role.active === true && role.is_default === true,
              // );

              initial[f.remarks] = f.answer_text || roles?.role || '';
            } else {
              initial[f.remarks] = f.answer_text ?? null;
            }
          });
        });
        setFormValues(initial);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const validateStep = (section: any) => {
    const newErrors: Record<string, string> = {};
    section?.form?.forEach((f: any) => {
      if (f.mandatory && isEmpty(formValues[f.remarks])) {
        newErrors[f.remarks] = `${f.long_display_text} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (remarks: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [remarks]: value }));
    setErrors((prev) => {
      if (!prev[remarks]) return prev;
      const { [remarks]: _, ...rest } = prev;
      return rest;
    });
  };

  const formSections = invitationData?.question_page ?? [];
  const steps = formSections.map((q: any) => q.name ?? 'Untitled');

  const handleNext = () => {
    const currentSection = formSections[activeStep];
    if (!validateStep(currentSection)) return;
    setActiveStep((s) => s + 1);
  };
  const handleBack = () => setActiveStep((s) => s - 1);

  const isEmpty = (val: any) => val === undefined || val === null || val === '';

  const renderCameraField = (f: any, idx: number) => {
    const key = f.remarks;
    const previewSrc = previews[key];
    const shownName = uploadNames[key];
    const isUploading = !!uploadingFiles[key];

    return (
      <Box>
        <Box
          sx={{
            position: 'relative',
            border: '2px dashed #90caf9',
            borderRadius: 2,
            padding: 4,
            textAlign: 'center',
            backgroundColor: '#f5faff',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            width: '100%',
            pointerEvents: isUploading ? 'none' : 'auto',
            opacity: isUploading ? 0.6 : 1,
            transition: 'opacity 0.2s ease',
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
            {isUploading && (
              <Box
                sx={{
                  width: '100%',
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <LinearProgress
                  sx={{
                    width: '220px',
                    height: 6,
                    borderRadius: 3,
                  }}
                />

                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                  Uploading file...
                </Typography>
              </Box>
            )}
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

        <Dialog
          open={openCamera}
          onClose={() => setOpenCamera(false)}
          maxWidth="md"
          fullWidth
          container={containerRef.current}
          disablePortal
        >
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

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ position: 'relative' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode,
                    }}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      height: '250px',
                      objectFit: 'cover',
                      border: '2px solid #ccc',
                    }}
                  />
                  <IconButton
                    onClick={() =>
                      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                    }
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.7)',
                      },
                    }}
                  >
                    <IconRefresh />
                  </IconButton>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Captured"
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      height: '250px',
                      objectFit: 'cover',
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

            {isUploading && (
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <LinearProgress
                  sx={{
                    width: '220px',
                    height: 6,
                    borderRadius: 3,
                  }}
                />

                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                  Uploading file...
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
              <Button
                disabled={isUploading}
                color="error"
                startIcon={<IconTrash />}
                sx={{ mr: 1 }}
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
                disabled={isUploading}
                startIcon={
                  isUploading ? <CircularProgress size={18} color="inherit" /> : <IconCamera />
                }
                onClick={() => handleCaptureForField((url) => handleChange(f.remarks, url), key)}
              >
                {isUploading ? 'Uploading...' : 'Take Foto'}
              </Button>
              <Button
                disabled={isUploading}
                onClick={() => setOpenCamera(false)}
                sx={{ ml: 1 }}
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
            Supports: JPG, JPEG, PNG, Up to <span style={{ fontWeight: '700' }}>5 MB</span>
          </Typography>
          <input
            id={`file-${key}`}
            type="file"
            accept="image/jpeg,image/png, image/jpg"
            hidden
            ref={(el: any) => (fileInputRefs.current[key] = el)}
            onChange={(e) => {
              handleFileChangeForField(
                e.target.files?.[0],
                (url) => handleChange(f.remarks, url),
                key,
              );

              e.target.value = '';
            }}
          />
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
    const isUploading = !!uploadingFiles[key];

    return (
      <Box>
        <Box
          sx={{
            position: 'relative',
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : '#90caf9',
            borderRadius: 2,
            padding: 4,
            textAlign: 'center',
            backgroundColor: isDragging ? 'action.hover' : '#f5faff',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            width: '100%',
            pointerEvents: isUploading ? 'none' : 'auto',
            opacity: isUploading ? 0.6 : 1,
          }}
          onClick={() => {
            if (!isUploading) {
              fileInputRefs.current[key]?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!isUploading) {
              setIsDragging(true);
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();

            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();

            setIsDragging(false);

            if (isUploading) return;

            handleFileChangeForField(
              e.dataTransfer.files?.[0],
              (url) => {
                handleChange(f.remarks, url);

                if (url) {
                  setErrors((prev) => {
                    const { [f.remarks]: _, ...rest } = prev;
                    return rest;
                  });
                }
              },
              key,
            );
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />

          <Typography variant="h6" sx={{ mt: 1, fontWeight: '600' }}>
            Upload File
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ my: 1 }}>
            {t('dragDropOrTapToSelectFile')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="textSecondary" mt={0}>
              Supports: JPG, JPEG, PNG, Up to <span style={{ fontWeight: '700' }}>5 MB or </span>
            </Typography>

            <Typography
              variant="body1"
              component="span"
              color={isUploading ? 'text.disabled' : 'primary'}
              sx={{
                fontWeight: 600,
                ml: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: isUploading ? 'not-allowed' : 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();

                if (!isUploading) {
                  setOpenCamera(true);
                }
              }}
            >
              <IconCamera size={18} style={{ verticalAlign: 'middle' }} /> Use Camera
            </Typography>
          </Box>

          {isUploading && (
            <Box
              sx={{
                width: '100%',
                mt: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <LinearProgress
                sx={{
                  width: '220px',
                  height: 6,
                  borderRadius: 3,
                }}
              />

              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                Uploading file...
              </Typography>
            </Box>
          )}

          <input
            id={`file-${key}`}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            hidden
            ref={(el: HTMLInputElement | null) => {
              fileInputRefs.current[key] = el;
            }}
            onChange={(e) => {
              handleFileChangeForField(
                e.target.files?.[0],
                (url) => {
                  handleChange(f.remarks, url);
                },
                key,
              );

              e.target.value = '';
            }}
          />

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
                    disabled={isUploading}
                    sx={{ mt: 2, minWidth: 120 }}
                    onClick={(e) => {
                      e.stopPropagation();

                      if (!isUploading) {
                        handleRemoveFileForField(
                          f.answer_file,
                          (url) => handleChange(f.remarks, url),
                          key,
                        );
                      }
                    }}
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

        {/* <Dialog
          open={openCamera}
          onClose={isUploading ? undefined : () => setOpenCamera(false)}
          maxWidth="md"
          fullWidth
          container={containerRef.current}
          disablePortal
        >
          <Box sx={{ p: 3, position: 'relative' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" mb={0}>
                Take Photo From Camera
              </Typography>

              <IconButton disabled={isUploading} onClick={() => setOpenCamera(false)}>
                <IconX />
              </IconButton>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ position: 'relative' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: 'environment',
                    }}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      border: '2px solid #ccc',
                    }}
                  />

                  <IconButton
                    disabled={isUploading}
                    onClick={() =>
                      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                    }
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.7)',
                      },
                    }}
                  >
                    <IconRefresh />
                  </IconButton>
                </Box>
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

            {isUploading && (
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <LinearProgress
                  sx={{
                    width: '220px',
                    height: 6,
                    borderRadius: 3,
                  }}
                />

                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                  Uploading file...
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                textAlign: 'right',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                disabled={isUploading}
                onClick={() =>
                  handleRemoveFileForField(
                    f.answer_file,
                    (url) => handleChange(f.remarks, url),
                    key,
                  )
                }
                startIcon={<IconTrash />}
                variant="contained"
                color="error"
                sx={{ mr: 1 }}
              >
                Clear Foto
              </Button>

              <Button
                variant="contained"
                disabled={isUploading}
                startIcon={
                  isUploading ? <CircularProgress size={18} color="inherit" /> : <IconCamera />
                }
                onClick={(e) => {
                  e.stopPropagation();

                  handleCaptureForField((url) => handleChange(f.remarks, url), key);
                }}
              >
                {isUploading ? 'Uploading...' : 'Take Foto'}
              </Button>

              <Button
                disabled={isUploading}
                onClick={() => setOpenCamera(false)}
                sx={{ ml: 1 }}
                startIcon={<IconDeviceFloppy />}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Dialog> */}
        <CameraDialog
          open={openCamera}
          onClose={() => setOpenCamera(false)}
          webcamRef={webcamRef as any}
          screenshot={screenshot}
          facingMode={facingMode}
          isUploading={isUploading}
          onSwitchCamera={() =>
            setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
          }
          onCapture={() => handleCaptureForField((url) => handleChange(f.remarks, url), key)}
          onClear={() =>
            handleRemoveFileForField(
              // value file yang sedang aktif
              section.form?.find((field: any) => field.remarks === f.remarks)?.answer_file ?? '',
              (url) => handleChange(f.remarks, url),
              key,
            )
          }
          onSubmit={() => {
            setOpenCamera(false);
            setScreenshot(null);
          }}
        />
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
      // console.log('CDN Response File URL:', fileUrl);
      return fileUrl ? (fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl) : null;
    } catch (e) {
      console.error('Upload failed:', e);
      return null;
    }
  };

  const [removing, setRemoving] = useState<Record<string, boolean>>({});

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
      toast(t('deleteSuccess', { name: 'File' }), 'success');
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setRemoving((s) => ({ ...s, [inputId]: false }));
    }
  };
  const handleFileChangeForField = async (
    file: File | undefined,
    setAnswerFile: (url: string) => void,
    trackKey?: string,
  ) => {
    if (!file) return;

    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'];
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (
      !extension ||
      !ALLOWED_EXTENSIONS.includes(extension) ||
      !ALLOWED_MIME_TYPES.includes(file.type)
    ) {
      toast(t('invalidImageFormat'), 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast(t('maxFileSize'), 'info');
      return;
    }

    if (trackKey) {
      setUploadingFiles((prev) => ({
        ...prev,
        [trackKey]: true,
      }));

      setUploadNames((prev) => ({
        ...prev,
        [trackKey]: file.name,
      }));

      setPreviews((prev) => ({
        ...prev,
        [trackKey]: URL.createObjectURL(file),
      }));
    }

    try {
      // Compression sementara disabled
      const path = await uploadFileToCDN(file);

      if (path) {
        setAnswerFile(path);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast('Failed to upload file', 'error');
    } finally {
      if (trackKey) {
        setUploadingFiles((prev) => ({
          ...prev,
          [trackKey]: false,
        }));
      }
    }
  };

  const handleCaptureForField = async (setAnswerFile: (url: string) => void, trackKey?: string) => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    if (trackKey) {
      setUploadingFiles((prev) => ({
        ...prev,
        [trackKey]: true,
      }));
    }

    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());

      const path = await uploadFileToCDN(blob);

      if (!path) return;

      if (trackKey) {
        setPreviews((prev) => ({
          ...prev,
          [trackKey]: imageSrc,
        }));

        setUploadNames((prev) => ({
          ...prev,
          [trackKey]: 'camera.jpg',
        }));
      }

      setAnswerFile(path);
    } catch (error) {
      console.error('Capture/upload failed:', error);
    } finally {
      if (trackKey) {
        setUploadingFiles((prev) => ({
          ...prev,
          [trackKey]: false,
        }));
      }
    }
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

  useEffect(() => {
    const fetchData = async () => {
      const res = await getVisitorEmployee();
      setAllVisitorEmployee(res?.collection ?? []);
    };
    fetchData();
  }, []);

  const handleRadioToggle = (remarks: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [remarks]: prev[remarks] === value ? '' : value,
      ...(remarks === 'vehicle_type' && value === 'bicycle' ? { vehicle_plate: '' } : {}),
    }));
    if (remarks === 'vehicle_type' && value === 'bicycle') {
      setErrors((prev) => {
        const { vehicle_plate, ...rest } = prev;
        return rest;
      });
    }
  };

  const StepContent = (section: any) => (
    <Box mt={3}>
      <Grid container spacing={2}>
        {section.form?.map((f: any, idx: number) => {
          let displayValue = formValues[f.remarks] ?? '';

          const type = getFieldTypeByRemarks(f.remarks) ?? f.field_type;

          if (f.remarks === 'host') {
            displayValue = invitationData.host_name || displayValue;
          } else if (f.remarks === 'site_place') {
            displayValue = invitationData.site_place_name || displayValue;
          } else if (f.remarks === 'visitor_role') {
            displayValue = invitationData?.visitor_type_data.visitor_roles?.role || '';
          }

          const isVisitorPeriod = ['visitor_period_start', 'visitor_period_end'].includes(
            f.remarks,
          );

          const gridSize = isVisitorPeriod ? { xs: 12, md: 6 } : { xs: 12 };
          const hideVehiclePlate =
            f.remarks === 'vehicle_plate' &&
            (formValues['is_driving'] !== 'true' || formValues['vehicle_type'] === 'bicycle');
          if (hideVehiclePlate) {
            return null;
          }
          return (
            <Grid key={idx} size={gridSize}>
              {![
                'vehicle_type',
                'vehicle_plate',
                'visitor_period_start',
                'visitor_period_end',
              ].includes(f.remarks) || formValues['is_driving'] === 'true' ? (
                <CustomFormLabel sx={{ mt: 0 }} required={f.mandatory === true}>
                  {f.long_display_text || f.remarks}
                </CustomFormLabel>
              ) : null}

              {(() => {
                const type = f.field_type;

                switch (true) {
                  case f.remarks === 'selfie_image':
                    return renderUploadWithCamera(f, idx, section);

                  case type === 10:
                    return renderCameraField(f, idx);

                  case type === 11:
                    return renderFileUploadField(f, idx);

                  case type === 12:
                    return renderUploadWithCamera(f, idx, section);

                  default:
                    return null;
                }
              })()}

              {/* {['visitor_period_start', 'visitor_period_end'].includes(f.remarks) && (
                <CustomTextField
                  fullWidth
                  value={formatDateTime(formValues[f.remarks])}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              )} */}

              {f.remarks === 'visitor_period_start' && (
                <>
                  <CustomFormLabel sx={{ mt: 0 }} required={f.mandatory === true}>
                    {f.long_display_text || f.remarks}
                  </CustomFormLabel>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                    <DateTimePicker
                      value={formValues[f.remarks] ? dayjs(formValues[f.remarks]) : null}
                      open={openStartPicker}
                      onOpen={() => setOpenStartPicker(true)}
                      onClose={() => setOpenStartPicker(false)}
                      onChange={(newValue) => {
                        if (newValue) {
                          const utcValue = newValue.utc().format('YYYY-MM-DDTHH:mm:ss[Z]');

                          handleChange(f.remarks, utcValue);

                          if (
                            formValues.visitor_period_end &&
                            dayjs(formValues.visitor_period_end).isBefore(newValue)
                          ) {
                            handleChange('visitor_period_end', '');
                          }
                        } else {
                          handleChange(f.remarks, '');
                        }
                      }}
                      ampm={false}
                      format="dddd, DD MMMM YYYY, HH:mm"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors[f.remarks],
                          helperText: errors[f.remarks],
                          onClick: () => {
                            setOpenStartPicker(true);
                          },
                          FormHelperTextProps: {
                            sx: {
                              ml: 0,
                              mr: 0,
                            },
                          },
                        },
                        actionBar: {
                          actions: ['today', 'clear', 'accept'],
                          sx: {
                            '& .MuiButtonBase-root:nth-of-type(1)': {
                              color: 'secondary !important',
                            },
                            '& .MuiButtonBase-root:nth-of-type(2)': {
                              backgroundColor: '#d32f2f !important',
                              color: 'white',
                              marginLeft: '3px',
                            },
                            '& .MuiButtonBase-root:nth-of-type(3)': {
                              backgroundColor: '#055499 !important',
                              color: 'white',
                              marginLeft: '3px',
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </>
              )}

              {f.remarks === 'visitor_period_end' && (
                <>
                  <CustomFormLabel sx={{ mt: 0 }} required={f.mandatory === true}>
                    {f.long_display_text || f.remarks}
                  </CustomFormLabel>

                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                    <DateTimePicker
                      open={openEndPicker}
                      onOpen={() => setOpenEndPicker(true)}
                      onClose={() => setOpenEndPicker(false)}
                      value={
                        formValues.visitor_period_end ? dayjs(formValues.visitor_period_end) : null
                      }
                      onChange={(newValue) => {
                        const utcValue = newValue
                          ? newValue.utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
                          : '';
                        handleChange('visitor_period_end', utcValue);
                      }}
                      ampm={false}
                      minDateTime={
                        formValues.visitor_period_start
                          ? dayjs(formValues.visitor_period_start)
                          : undefined
                      }
                      format="dddd, DD MMMM YYYY, HH:mm"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.visitor_period_end,
                          helperText: errors.visitor_period_end,
                          onClick: () => {
                            setOpenEndPicker(true);
                          },
                          FormHelperTextProps: {
                            sx: {
                              ml: 0,
                              mr: 0,
                            },
                          },
                        },
                        actionBar: {
                          actions: ['today', 'clear', 'accept'],
                          sx: {
                            '& .MuiButtonBase-root:nth-of-type(1)': {
                              color: 'secondary !important',
                            },
                            '& .MuiButtonBase-root:nth-of-type(2)': {
                              backgroundColor: '#d32f2f !important',
                              color: 'white',
                              marginLeft: '3px',
                            },
                            '& .MuiButtonBase-root:nth-of-type(3)': {
                              backgroundColor: '#055499 !important',
                              color: 'white',
                              marginLeft: '3px',
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </>
              )}

              {f.remarks === 'visitor_period_end' && null}

              {f.remarks === 'email' && (
                <CustomTextField
                  fullWidth
                  value={displayValue}
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

              {f.remarks === 'vehicle_plate' &&
                formValues['is_driving'] === 'true' &&
                formValues['vehicle_type'] !== 'bicycle' && (
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
                <>
                  {' '}
                  <FormControl component="fieldset">
                    {' '}
                    <RadioGroup
                      value={formValues[f.remarks] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleChange(f.remarks, value);
                        if (value === 'false') {
                          handleChange('vehicle_type', null);
                          handleChange('vehicle_plate', null);
                          setErrors((prev) => {
                            const { vehicle_type, vehicle_plate, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                      sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                    >
                      {' '}
                      <FormControlLabel value="true" control={<Radio />} label="Yes" />{' '}
                      <FormControlLabel value="false" control={<Radio />} label="No" />{' '}
                    </RadioGroup>{' '}
                    {errors[f.remarks] && (
                      <Typography variant="caption" color="error">
                        {errors[f.remarks]}{' '}
                      </Typography>
                    )}{' '}
                  </FormControl>{' '}
                </>
              )}

              {f.remarks === 'visitor_role' && (
                <Autocomplete
                  size="small"
                  fullWidth
                  options={
                    invitationData?.visitor_type_data?.visitor_roles?.filter(
                      (role: any) => role.active === true,
                    ) ?? []
                  }
                  getOptionLabel={(option: any) => option.role || ''}
                  value={
                    invitationData?.visitor_type_data?.visitor_roles?.find(
                      (role: any) => role.role === formValues[f.remarks],
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    handleChange(f.remarks, newValue?.role || '');
                  }}
                  isOptionEqualToValue={(option: any, value: any) => option.role === value.role}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Visitor Role"
                      error={!!errors[f.remarks]}
                      helperText={errors[f.remarks]}
                    />
                  )}
                />
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
                        ? t('enterMin3CharsToSearch')
                        : 'Not found'
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
                        placeholder={t('enterMin3CharsToSearch')}
                        fullWidth
                      />
                    )}
                  />

                  {errors[f.remarks] && (
                    <Typography variant="caption" color="error">
                      {errors[f.remarks]}
                    </Typography>
                  )}
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
                    {errors[f.remarks] && (
                      <Typography variant="caption" color="error">
                        {errors[f.remarks]}
                      </Typography>
                    )}
                  </FormControl>
                </>
              )}

              {f.remarks === 'vehicle_type' && formValues['is_driving'] === 'true' && (
                <FormControl component="fieldset">
                  <RadioGroup
                    value={formValues[f.remarks] || ''}
                    sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                  >
                    {[
                      { value: 'car', label: 'Car' },
                      { value: 'bus', label: 'Bus' },
                      { value: 'motor', label: 'Motor' },
                      { value: 'bicycle', label: 'Bicycle' },
                      // { value: 'truck', label: 'Truck' },
                      // { value: 'private_car', label: 'Private Car' },
                      // { value: 'other', label: 'Other' },
                    ].map((opt) => (
                      <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={<Radio onClick={() => handleRadioToggle(f.remarks, opt.value)} />}
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
                'email',
                'is_driving',
                'is_employee',
                'visitor_role',
                'employee',
                'vehicle_type',
              ].includes(f.remarks) &&
                !['selfie_image', 'nda', 'identity_image'].includes(f.remarks) &&
                section.name !== 'Purpose Visit' && (
                  <CustomTextField
                    fullWidth
                    value={displayValue}
                    onChange={(e) => {
                      let value = e.target.value;

                      if ((f.remarks || '').toLowerCase() === 'phone') {
                        value = value.replace(/\D/g, '');
                      }

                      handleChange(f.remarks, value);
                    }}
                    inputProps={
                      (f.remarks || '').toLowerCase() === 'phone'
                        ? {
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                          }
                        : undefined
                    }
                    placeholder={'Enter your ' + (f.long_display_text || f.remarks)}
                    error={!!errors[f.remarks]}
                    helperText={errors[f.remarks]}
                    required={f.mandatory == true}
                  />
                )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const normalizeValue = (val: any) => {
    if (val === undefined || val === null || val === '') return null;
    return val;
  };

  const transformToSubmitPayload = (data: any) => ({
    visitor_type: data.visitor_type,
    type_registered: 0,
    trx_visitor_id: id,
    is_group: false,
    group_name: data.group_name ?? '',
    tz: data.site_place_data?.timezone ?? 'Asia/Jakarta',
    registered_site_id: registeredSite,
    flow: 'SubmitPraregister',
    is_self_registered: isSelfInvitation === true,
    filled_by_relationship: 'Other',
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
            const rawValue = formValues[f.remarks] ?? null;
            const value = normalizeValue(rawValue);

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
            };

            if ([10, 11, 12].includes(f.field_type)) {
              return {
                ...base,
                answer_file: value,
              };
            }

            if (f.field_type === 9) {
              return {
                ...base,
                answer_datetime: value,
              };
            }

            return {
              ...base,
              answer_text: value,
            };
          }),
        })),
      },
    ],
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const currentSection = formSections[activeStep];
    if (!validateStep(currentSection)) {
      return;
    }
    if (!invitationData) return;

    try {
      setSubmitting(true);

      const payload = transformToSubmitPayload(invitationData);
      // console.log('Payload response:', JSON.stringify(payload, null, 2));
      const res = await createSubmitCompletePra(payload);

      const ok =
        res &&
        (res.status === 'success' || res.status_code === 200 || res.title === 'success' || res.msg);

      if (ok) {
        showSwal('success', 'Successfully Submit Pra Register!');
        onSubmitted?.(invitationData.id);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        showSwal('error', res.msg ?? 'Failed Praregister');
      }
    } catch (err) {
      const errMsg =
        (err as any)?.response?.collection?.message ??
        (err as any)?.reponse.data.msg ??
        'Failed Praregister';

      await new Promise((r) => setTimeout(r, 600));
      showSwal('error', errMsg ?? 'Failed Praregister');
    } finally {
      setSubmitting(false);
    }
  };

  if (activeStep === -1) {
    return (
      <Box mt={0}>
        <Box
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 4,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box mb={3}>
            <CustomFormLabel sx={{ mt: 0, fontSize: '18px', fontWeight: 600 }}>
              {t('questionInvitation')}
            </CustomFormLabel>
            <CustomFormLabel sx={{ mt: 0, fontSize: '12px' }}>
              {t('subtitleQuestionInvitation')}
            </CustomFormLabel>
          </Box>

          <RadioGroup
            value={isSelfInvitation === null ? '' : isSelfInvitation ? 'self' : 'other'}
            onChange={(e) => setIsSelfInvitation(e.target.value === 'self')}
          >
            <Grid container spacing={2}>
              {/* SELF */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: '2px solid',
                    transition: 'all 0.25s ease',
                    borderColor: isSelfInvitation === true ? 'primary.main' : 'divider',
                    backgroundColor:
                      isSelfInvitation === true ? 'primary.light' : 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => setIsSelfInvitation(true)}
                >
                  <FormControlLabel
                    value="self"
                    control={<Radio checked={isSelfInvitation === true} />}
                    sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                    label={
                      <Box ml={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography fontWeight={700} fontSize={18}>
                            {t('self')}
                          </Typography>

                          <Tooltip title="This invitation is intended for yourself." arrow>
                            <InfoOutlined
                              fontSize="small"
                              color="action"
                              sx={{ cursor: 'pointer' }}
                            />
                          </Tooltip>
                        </Box>

                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          {t('selfOption')}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>

              {/* OTHER */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: '2px solid',
                    transition: 'all 0.25s ease',
                    borderColor: isSelfInvitation === false ? 'primary.main' : 'divider',
                    backgroundColor:
                      isSelfInvitation === false ? 'primary.light' : 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => setIsSelfInvitation(false)}
                >
                  <FormControlLabel
                    value="other"
                    control={<Radio checked={isSelfInvitation === false} />}
                    sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                    label={
                      <Box ml={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography fontWeight={700} fontSize={18}>
                            {t('others')}
                          </Typography>

                          <Tooltip
                            title="This invitation is intended for another person or guest."
                            arrow
                          >
                            <InfoOutlined
                              fontSize="small"
                              color="action"
                              sx={{ cursor: 'pointer' }}
                            />
                          </Tooltip>
                        </Box>

                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          {t('othersOption')}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </RadioGroup>
        </Box>

        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Button
            onClick={() => {
              setIsSelfInvitation(null);
              setActiveStep(-1);
              onClose?.();
            }}
            disabled={activeStep === -1}
            startIcon={<IconArrowLeft />}
          >
            {t('back')}
          </Button>
          <Button
            variant="contained"
            sx={{ mt: 0 }}
            disabled={isSelfInvitation === null}
            onClick={() => setActiveStep(0)}
            endIcon={<IconArrowRight />}
          >
            {t('next')}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Grid
        container
        justifyContent="center"
        alignItems="stretch"
        sx={{
          width: '100%',
        }}
      >
        <Grid size={{ xs: 12 }}>
          {!isMobile && (
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label: string, i: number) => (
                <Step key={i}>
                  <StepLabel
                    StepIconComponent={CustomStepIcon}
                    onClick={() => setActiveStep(i)}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
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

          <Box mt={2}>
            {formSections.length > 0 ? (
              StepContent(formSections[activeStep])
            ) : (
              <Box textAlign="center" mt={4}>
                <CircularProgress color="primary" />
              </Box>
            )}
          </Box>
          <Divider sx={{ my: 1 }} />

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
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button size="medium" variant="contained" color="primary" onClick={handleNext}>
                      {t('next')}
                      <KeyboardArrowRight />
                    </Button>
                  )
                }
                backButton={
                  <Button size="medium" onClick={handleBack} disabled={activeStep === 0}>
                    <KeyboardArrowLeft />
                    {t('back')}
                  </Button>
                }
              />
            </Box>
          )}

          {!isMobile && (
            <Box display="flex" flexDirection="row" mt={2}>
              <Button
                disabled={activeStep === -1}
                onClick={handleBack}
                startIcon={<IconArrowLeft size={18} />}
              >
                {t('back')}
              </Button>
              <Box flex="1 1 auto" />
              {activeStep !== steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<IconArrowRight size={18} />}
                >
                  {t('next')}
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                  Submit
                </Button>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: 999999 }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              py: 1,
              display: 'flex',
              alignItems: 'center',
            }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
      <GlobalBackdropLoading open={submitting} />
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
      {props.icon}
    </Box>
  );
};

export default FormDialogPraregist;
