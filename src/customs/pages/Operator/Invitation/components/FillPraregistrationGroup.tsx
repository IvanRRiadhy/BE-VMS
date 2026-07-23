import { InfoOutlined } from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TableBody,
  Table,
  TableCell,
  TableContainer,
  TableRow,
  Grid2 as Grid,
  Typography,
  DialogActions,
  Button,
  TableHead,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  Autocomplete,
  MenuItem,
  FormControl,
  Checkbox,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { FormVisitor } from 'src/customs/api/models/Admin/Visitor';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CameraUpload from 'src/customs/components/camera/CameraUpload';
import { useState } from 'react';
import { axiosInstance2 } from 'src/customs/api/interceptor';
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.locale('id');

type Props = {
  open: boolean;
  onClose: () => void;
  containerRef: any;
  fillFormData: any[];
  fillFormActiveStep: number;
  setFillFormActiveStep: React.Dispatch<any>;
  fillFormDataVisitor: any[];
  setFillFormDataVisitor: React.Dispatch<any>;
  loadingAccess: boolean;
  handleSubmitPramultiple: () => void;
  allVisitorEmployee: any;
  // renderFieldInput: any;
  invitationDetail: any;
  getSectionType: any;
  formsOf: any;
  isSelfGroup: boolean | null;
  setIsSelfGroup: React.Dispatch<React.SetStateAction<boolean | null>>;
};

function FillPraregistrationGroup({
  open,
  onClose,
  containerRef,
  fillFormData,
  fillFormActiveStep,
  setFillFormActiveStep,
  fillFormDataVisitor,
  setFillFormDataVisitor,
  loadingAccess,
  handleSubmitPramultiple,
  // renderFieldInput,
  allVisitorEmployee,
  invitationDetail,
  getSectionType,
  formsOf,
  isSelfGroup,
  setIsSelfGroup,
}: Props) {
  const { t } = useTranslation();
  const [uploadMethods, setUploadMethods] = useState<Record<string, 'file' | 'camera'>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
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
      // setPreviews((prev) => ({ ...prev, [trackKey]: URL.createObjectURL(file) }));
    }

    const path = await uploadFileToCDN(file);
    if (path) setAnswerFile(path);

    e.target.value = '';
  };

  const handleUploadMethodChange = (ukey: string, v: string) => {
    setUploadMethods((prev) => ({ ...prev, [ukey]: v as 'file' | 'camera' }));
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
      // setPreviews((p) => ({ ...p, [inputId]: null }));
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

  const renderFieldInput = (
    field: FormVisitor,
    index: number,
    onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void,
    onDelete?: (index: number) => void,
    opts?: { showLabel?: boolean; uniqueKey?: string },
  ) => {
    const renderInput = () => {
      switch (field.field_type) {
        case 0: // Text
          return (
            <CustomTextField
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
            <CustomTextField
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
            <CustomTextField
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

          const hostName = invitationDetail?.collection?.host_name ?? '';
          const hostId = invitationDetail?.collection?.host ?? '';
          const sitePlaceName = invitationDetail?.collection?.site_place_name ?? '';
          const sitePlaceId = invitationDetail?.collection?.site_place ?? '';

          switch (field.remarks) {
            case 'host':
              options = [{ value: hostId, name: hostName }];
              break;

            case 'employee':
              options = allVisitorEmployee.map((emp: any) => ({
                value: emp.id,
                name: emp.name,
              }));
              break;

            case 'site_place':
              options = sitePlaceName
                ? [
                  {
                    value: field.answer_text || sitePlaceId,
                    name: sitePlaceName,
                  },
                ]
                : [];
              break;

            default:
              options = (field.multiple_option_fields || []).map((opt: any) =>
                typeof opt === 'object' ? opt : { value: opt, name: opt },
              );
              break;
          }
          const uniqueKey = opts?.uniqueKey ?? `${activeStep}:${index}`;
          const inputVal = inputValues[uniqueKey as any] || '';

          return (
            <Autocomplete
              size="small"
              freeSolo
              options={options}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
              inputValue={inputVal}
              onInputChange={(_, newInputValue) =>
                setInputValues((prev) => ({ ...prev, [uniqueKey]: newInputValue }))
              }
              filterOptions={(opts, state) => {
                const term = (state.inputValue || '').toLowerCase();
                if (term.length < 3) return [];
                return opts.filter((opt) => (opt.name || '').toLowerCase().includes(term));
              }}
              noOptionsText={
                inputVal.length < 3 ? 'Enter at least 3 characters to search.' : 'Not found'
              }
              // value={
              //   options.find(
              //     (opt: { value: string; name: string }) =>
              //       opt.value?.toLowerCase?.() === field.answer_text?.toLowerCase?.(),
              //   ) || null
              // }
              value={
                options.find(
                  (opt: { value: string; name: string }) => opt.value === field.answer_text,
                ) || null
              }
              onChange={(_, newValue) =>
                onChange(index, 'answer_text', newValue instanceof Object ? newValue.value : '')
              }
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  placeholder="Enter at least 3 characters to search"
                  fullWidth
                  sx={{ minWidth: 160 }}
                />
              )}
            />
          );
        }

        case 4: // Date
          return (
            <CustomTextField
              type="date"
              size="small"
              value={field.answer_datetime}
              onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
              fullWidth
            />
          );

        case 5: // Radio
          if (field.remarks === 'gender') {
            const options = [
              { value: '0', name: 'Female' },
              { value: '1', name: 'Male' },
              { value: '2', name: 'Prefer not to say' },
            ];

            const value = field.answer_text != null ? String(field.answer_text) : '';

            return (
              <CustomTextField
                select
                size="small"
                fullWidth
                sx={{ width: 160 }}
                value={value}
                onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                SelectProps={{
                  MenuProps: {
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        zIndex: 20000,
                      },
                    },
                  },
                }}
              >
                {options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            );
          }
          if (field.remarks === 'vehicle_type') {
            const options = [
              { value: 'car', label: 'Car' },
              { value: 'bus', label: 'Bus' },
              { value: 'motor', label: 'Motor' },
              { value: 'bicycle', label: 'Bicycle' },
              { value: 'truck', label: 'Truck' },
              { value: 'private_car', label: 'Private Car' },
              { value: 'other', label: 'Other' },
            ];

            const currentValue = field.answer_text ?? '';

            return (
              <CustomTextField
                select
                size="small"
                fullWidth
                value={currentValue}
                onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="" disabled>
                  Select Vehicle Type
                </MenuItem>
                {options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </CustomTextField>
            );
          }

          if (field.remarks === 'is_driving' || field.remarks === 'is_employee') {
            const options = [
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ];
            const currentValue = field.answer_text ?? '';

            return (
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={currentValue}
                  row
                  sx={{ minWidth: 130 }}
                  onChange={(e) => {
                    onChange(index, 'answer_text', e.target.value);

                    setFillFormDataVisitor((prev: any) => {
                      return [...prev];
                    });
                  }}
                >
                  {options.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={opt.value}
                      control={<Radio size="small" />}
                      label={opt.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            );
          }

          return (
            <CustomTextField
              select
              size="small"
              value={field.answer_text || ''}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              fullWidth
            >
              {field.multiple_option_fields?.map((opt: any) => (
                <MenuItem key={opt.id} value={opt.value}>
                  {opt.name}
                </MenuItem>
              ))}
            </CustomTextField>
          );

        case 6:
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
            <CustomTextField
              type="time"
              size="small"
              value={field.answer_datetime}
              onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
              fullWidth
            />
          );

        case 9: //Datetimepicker
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
          if (field.remarks === 'selfie_image') {
            const key = opts?.uniqueKey ?? String(index);

            return (
              <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                gap={1.5}
                width="100%"
                sx={{ maxWidth: 400 }}
              >
                <TextField
                  select
                  size="small"
                  value={uploadMethods[key] || 'camera'}
                  onChange={(e) => handleUploadMethodChange(key, e.target.value)}
                  sx={{ width: { xs: '100%', md: 180 } }}
                >
                  <MenuItem value="camera">Take Photo</MenuItem>
                  <MenuItem value="file">Choose File</MenuItem>
                </TextField>

                {(uploadMethods[key] || 'camera') === 'camera' ? (
                  <CameraUpload
                    value={field.answer_file as string | undefined}
                    onChange={(url) => onChange(index, 'answer_file', url)}
                  />
                ) : (
                  <Box sx={{ width: { xs: '100%', md: 220 } }}>
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
                          cursor: 'pointer',
                          bgcolor: '#f5faff',
                        }}
                      >
                        <CloudUploadIcon color="primary" />
                        <Typography>Upload Selfie</Typography>
                      </Box>
                    </label>

                    <input
                      id={key}
                      hidden
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) =>
                        handleFileChangeForField(
                          e,
                          (url) => onChange(index, 'answer_file', url),
                          key,
                        )
                      }
                    />

                    {(field.answer_file || uploadNames[key]) && (
                      <Box
                        mt={0.5}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography variant="caption" noWrap>
                          {uploadNames[key] ?? field.answer_file?.split('/').pop()}
                        </Typography>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleRemoveFileForField(
                              field.answer_file as string,
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
          return (
            <CameraUpload
              value={field.answer_file as string | undefined}
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
                    minWidth: 160,
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
                    {uploadNames[key] ?? ''}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
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
                  value={field.answer_file as string | undefined}
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

                  {(field.answer_file || uploadNames[key]) && (
                    <Box mt={0.5} display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {uploadNames[key] ?? field.answer_file?.split('/').pop() ?? ''}
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
            <CustomTextField
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
      <Box
        sx={{
          overflow: 'auto',
          width: '100%',
        }}
      >
        {renderInput()}
      </Box>
    );
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{ sx: { width: '100vw' } }}
      container={containerRef.current}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>Fill Pra Registration Group Form</DialogTitle>

      <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
        <IconX />
      </IconButton>

      <DialogContent dividers>
        {/* {fillFormData.length > 0 && ( */}
        <>
          {fillFormActiveStep !== -1 && (
            <Stepper activeStep={fillFormActiveStep} alternativeLabel sx={{ mb: 3 }}>
              {fillFormData.map((s, i) => (
                <Step key={i} completed={false}>
                  <StepLabel
                    onClick={() => setFillFormActiveStep(i)}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: '0.9rem !important',
                        fontWeight: 600,
                        cursor: 'pointer',
                      },
                    }}
                  >
                    {s.name}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          <Box>
            {fillFormActiveStep === -1 ? (
              <Box>
                <CustomFormLabel sx={{ mt: 0, fontSize: '16px' }}>
                  Are you filling this invitation for yourself or someone else?
                </CustomFormLabel>
                <RadioGroup
                  value={isSelfGroup === null ? '' : isSelfGroup ? 'self' : 'other'}
                  onChange={(e) => setIsSelfGroup(e.target.value === 'self')}
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
                          borderColor: isSelfGroup === true ? 'primary.main' : 'divider',
                          backgroundColor:
                            isSelfGroup === true ? 'primary.light' : 'background.paper',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: 4,
                          },
                        }}
                        onClick={() => setIsSelfGroup(true)}
                      >
                        <FormControlLabel
                          value="self"
                          control={<Radio checked={isSelfGroup === true} />}
                          sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                          label={
                            <Box ml={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography fontWeight={700} fontSize={18}>
                                  Self
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
                                Use this option if you are registering yourself.
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
                          borderColor: isSelfGroup === false ? 'primary.main' : 'divider',
                          backgroundColor:
                            isSelfGroup === false ? 'primary.light' : 'background.paper',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: 4,
                          },
                        }}
                        onClick={() => setIsSelfGroup(false)}
                      >
                        <FormControlLabel
                          value="other"
                          control={<Radio checked={isSelfGroup === false} />}
                          sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                          label={
                            <Box ml={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography fontWeight={700} fontSize={18}>
                                  Other
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
                                Use this option if you are creating an invitation for someone else.
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </RadioGroup>
              </Box>
            ) : (
              (() => {
                const section = fillFormData[fillFormActiveStep];
                if (!section) return null;

                const sectionType = getSectionType(section);

                if (sectionType === 'visitor_information_group') {
                  return (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {(
                              fillFormDataVisitor[0]?.question_page?.[fillFormActiveStep]
                                ?.visit_form ||
                              formsOf(section) ||
                              []
                            )
                              .filter(
                                (f: any) =>
                                  fillFormDataVisitor[0]?.question_page?.[fillFormActiveStep],
                              )

                              //       ?.form?.find(
                              //         (x: any) =>
                              //           x.remarks === 'is_driving' && x.answer_text === 'true',
                              //       ) || !['vehicle_type', 'vehicle_plate'].includes(f.remarks),
                              //   )
                              .map((f: any, i: any) => (
                                <TableCell key={i}>
                                  <CustomFormLabel required={f.mandatory == true}>
                                    {f.long_display_text}
                                  </CustomFormLabel>
                                </TableCell>
                              ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fillFormDataVisitor.map((group, gIdx) => {
                            // const page = group.question_page?.[fillFormActiveStep] ?? section;
                            const page = group?.question_page?.[fillFormActiveStep];

                            if (!page?.form) return null;

                            return (
                              <TableRow key={gIdx}>
                                {page.form?.map((field: any) => {
                                  const formIdx = page.form.findIndex(
                                    (x: any) => x.remarks === field.remarks,
                                  );

                                  return (
                                    <TableCell key={field.remarks}>
                                      {renderFieldInput(
                                        field,
                                        formIdx,
                                        (idx: any, fieldKey: any, value: any) => {
                                          setFillFormDataVisitor((prev: any) => {
                                            const next = structuredClone(prev);
                                            const s = fillFormActiveStep;

                                            const targetIdx = next[gIdx].question_page[
                                              s
                                            ].form.findIndex(
                                              (x: any) => x.remarks === field.remarks,
                                            );

                                            if (targetIdx === -1) return prev;

                                            next[gIdx].question_page[s].form[targetIdx] = {
                                              ...next[gIdx].question_page[s].form[targetIdx],
                                              [fieldKey]: value,
                                            };

                                            return next;
                                          });
                                        },
                                        undefined,
                                        {
                                          uniqueKey: `${fillFormActiveStep}:${gIdx}:${field.remarks}`,
                                        },
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  );
                }

                if (sectionType === 'purpose_visit') {
                  const mergedVisitForm = formsOf(section);

                  return (
                    <Grid container spacing={2}>
                      {mergedVisitForm.map((f: any, idx: number) => (
                        <Grid size={{ xs: 12 }} key={idx}>
                          <Typography fontWeight={600}>{f.long_display_text}</Typography>

                          <Box sx={{ pointerEvents: 'none', opacity: 0.6 }}>
                            {renderFieldInput(f, idx, () => { })}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  );
                }

                return null;
              })()
            )}
          </Box>
        </>
        {/* )} */}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Button
          onClick={() => setFillFormActiveStep((p: number) => p - 1)}
          disabled={fillFormActiveStep === -1}
          startIcon={<IconArrowLeft width={18} />}
        >
          {t("back")}
        </Button>

        {fillFormActiveStep < fillFormData.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setFillFormActiveStep((p: number) => p + 1)}
            endIcon={<IconArrowRight width={18} />}
          >
            {t("next")}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmitPramultiple} disabled={loadingAccess}>
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default FillPraregistrationGroup;
