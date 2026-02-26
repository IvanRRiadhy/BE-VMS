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
import {  getDetailInvitationForm } from 'src/customs/api/visitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getVisitorEmployee } from 'src/customs/api/admin';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { createSubmitCompletePra } from 'src/customs/api/operator';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

dayjs.extend(utc);
dayjs.extend(timezone);

interface FormDialogPraregistProps {
  id: string;
  onClose?: () => void;
  onSubmitted?: (id?: string) => void;
  onSubmitting?: (loading: boolean) => void;
  containerRef?: any;
}

const FormDialogPraregist: React.FC<FormDialogPraregistProps> = ({
  id,
  onClose,
  onSubmitted,
  onSubmitting,
  containerRef,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const { token } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [invitationData, setInvitationData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCamera, setOpenCamera] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const webcamRef = useRef<Webcam>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const formatDateTime = (value: string | null) =>
    !value ? '-' : dayjs(value).tz(dayjs.tz.guess()).format('dddd, DD MMMM YYYY, HH:mm');

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !token) return;
      setLoading(true);
      try {
        const res = await getDetailInvitationForm(token, id);
        const data = res.collection;
        console.log('dat', data);
        setInvitationData(data);

      
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
      
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  const validateStep = (section: any) => {
    const newErrors: Record<string, string> = {};
    section?.form?.forEach((f: any) => {
      if (
        f.mandatory &&
        isEmpty(formValues[f.remarks])
      ) {
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
                startIcon={<IconCamera />}
                onClick={() => handleCaptureForField((url) => handleChange(f.remarks, url), key)}
              >
                Take Foto
              </Button>
              <Button
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
            Supports: PDF, DOCX, JPG, PNG, Up to 100KB
          </Typography>
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
          <Typography variant="h6" sx={{ mt: 1, fontWeight: '500' }}>
            Upload File
          </Typography>

          <Typography variant="caption" color="textSecondary" mt={5}>
            Supports: JPG, JPEG, PNG, Up to <span style={{ fontWeight: '700' }}>100KB</span>
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
        <Dialog
          open={openCamera}
          onClose={() => setOpenCamera(false)}
          maxWidth="md"
          fullWidth
          container={containerRef.current}
          disablePortal
        >
          <Box sx={{ p: 3, position: 'relative' }}>
            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={1}>
              <Typography variant="h6" mb={0}>
                Take Photo From Camera
              </Typography>
              <IconButton onClick={() => setOpenCamera(false)}>
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
                startIcon={<IconTrash />}
                variant="contained"
                color="error"
                sx={{ mr: 1 }}
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

  const [removing, setRemoving] = useState<Record<string, boolean>>({});

  const handleRemoveFileForField = async (
    currentUrl: string,
    setAnswerFile: (url: string) => void,
    inputId: string, // <- pakai key yg sama dengan id input
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

  useEffect(() => {
    const fetchData = async () => {
      const res = await getVisitorEmployee(token as string);
      setAllVisitorEmployee(res?.collection ?? []);
    };
    fetchData();
  }, [token]);

  const handleRadioToggle = (remarks: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [remarks]: prev[remarks] === value ? '' : value,
    }));
  };

  const StepContent = (section: any) => (
    <Box mt={3}>
      <Grid container spacing={2}>
        {section.form?.map((f: any, idx: number) => {
          let displayValue = formValues[f.remarks] ?? '';

          const type = getFieldTypeByRemarks(f.remarks) ?? f.field_type;

          if (f.remarks === 'host') {
            displayValue = invitationData.host_data?.name || displayValue;
          } else if (f.remarks === 'site_place') {
            displayValue = invitationData.site_place_data?.name || displayValue;
          }

          const gridSize = { xs: 12 };

          return (
            <Grid key={idx} size={gridSize}>
              {!['vehicle_type', 'vehicle_plate'].includes(f.remarks) ||
              formValues['is_driving'] === 'true' ? (
                <CustomFormLabel sx={{ mt: 0 }} required={f.mandatory === true}>
                  {f.long_display_text || f.remarks}
                </CustomFormLabel>
              ) : null}

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

              {f.remarks === 'vehicle_plate' && formValues['is_driving'] === 'true' && (
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
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={formValues[f.remarks] || ''}
                      onChange={(e) => {
                        handleChange(f.remarks, e.target.value);
                      }}
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
                        ? 'Enter at least 3 characters to search.'
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
                        placeholder="Enter at least 3 characters to search."
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
                      { value: 'truck', label: 'Truck' },
                      { value: 'private_car', label: 'Private Car' },
                      { value: 'other', label: 'Other' },
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

  const transformToSubmitPayload = (data: any) => ({
    visitor_type: data.visitor_type,
    type_registered: 0,
    trx_visitor_id: id,
    is_group: true, // tergantung kebutuhan
    group_name: data.group_name ?? '',
    tz: data.site_place_data?.timezone ?? 'Asia/Jakarta',
    // registered_site: data.site_place_data?.id ?? '',
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

            if ([10, 11, 12].includes(f.field_type)) {
              base.answer_file = value;
            } else if (f.field_type === 9) {
              base.answer_datetime = value;
            } else {
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
    const currentSection = formSections[activeStep];
    if (!validateStep(currentSection)) {
      return;
    }
    if (!invitationData) return;

    try {
      setSubmitting(true);

      const payload = transformToSubmitPayload(invitationData);
      console.log('Payload response:', JSON.stringify(payload, null, 2));
      const res = await createSubmitCompletePra(token as string, payload);

      const ok =
        res &&
        (res.status === 'success' || res.status_code === 200 || res.title === 'success' || res.msg);

      if (ok) {
        showSwal('success', 'Successfully Pra Register!');
        onSubmitted?.(invitationData.id);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        showSwal('error', res.msg ?? 'Something went wrong');
      }
    } catch (err) {
      // console.error('❌ Submit error:', err);
      const errMsg =
        (err as any)?.response?.collection?.message ??
        (err as any)?.message ??
        'Failed Praregister';

      await new Promise((r) => setTimeout(r, 600));
      showSwal('error', errMsg ?? 'Something went wrong');
    } finally {
      setTimeout(() => {
        setSubmitting(false);
      }, 600);
    }
  };

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

          {!isMobile && (
            <Box display="flex" flexDirection="row" mt={2}>
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
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<IconArrowRight size={18} />}
                >
                  Next
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

      <Backdrop
        sx={{
          color: '#fff',
          zIndex: 99999,
          position: 'fixed',
        }}
        open={submitting}
      >
        <Box textAlign="center">
          <CircularProgress color="primary" />
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
      {props.icon}
    </Box>
  );
};

export default FormDialogPraregist;
