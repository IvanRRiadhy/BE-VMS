import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DateTimePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { SimpleTreeView } from '@mui/x-tree-view';
import { IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { FormVisitor } from 'src/customs/api/models/Admin/Visitor';
import dayjs, { Dayjs, tz } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CameraUpload from 'src/customs/components/camera/CameraUpload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useState } from 'react';

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

type RenderFieldGroupProps = {
  field: FormVisitor;
  index: number;
  groupIndex: any;
  onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void;
  opts?: { showLabel?: boolean; uniqueKey?: string };

  // 🔥 semua dependency lama DIKIRIM
  employee: any[];
  allVisitorEmployee: any[];
  sites: any[];
  inputValues: Record<string, string>;
  setInputValues: React.Dispatch<React.SetStateAction<any>>;
  // selectedSiteParentIds: string[];
  selectedSiteParentIds: Record<string, string[]>;
  // siteTree: any[];
  siteTree: Record<string, any[]>;
  setSelectedSiteParentIds: (v: any) => void;
  setSiteTree: (v: any) => void;
  buildSiteTreeWithParent: Function;
  renderTree: Function;
  activeStep: number;

  containerRef: React.RefObject<any>;

  uploadMethods: Record<string, string>;
  handleUploadMethodChange: Function;
  handleFileChangeForField: Function;
  handleRemoveFileForField: Function;
  uploadNames: Record<string, string>;
  removing: Record<string, boolean>;

  setIsEmployeeMode: (v: boolean) => void;
  setOpenVisitorDialog: (v: boolean) => void;
  setActiveGroupIdx: (v: number) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<any>>;
};

const RenderFieldGroup: React.FC<RenderFieldGroupProps> = (props) => {
  const {
    field,
    index,
    groupIndex,
    onChange,
    opts,
    employee,
    allVisitorEmployee,
    sites,
    inputValues,
    setInputValues,
    selectedSiteParentIds,
    siteTree,
    setSelectedSiteParentIds,
    setSiteTree,
    buildSiteTreeWithParent,
    renderTree,
    activeStep,
    containerRef,
    uploadMethods,
    handleUploadMethodChange,
    handleFileChangeForField,
    handleRemoveFileForField,
    uploadNames,
    removing,
    setIsEmployeeMode,
    setOpenVisitorDialog,
    setActiveGroupIdx,
    fieldErrors,
    setFieldErrors,
  } = props;

  // const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const showLabel = opts?.showLabel ?? true;
  const errorKey = opts?.uniqueKey ? opts.uniqueKey : `${activeStep - 1}:${index}`;
  const errorMessage = fieldErrors[errorKey];
  const handleSitePlaceChange = (idx: number, fieldKey: keyof FormVisitor, value: any) => {
    onChange(idx, fieldKey, value);
  };

  const clearFieldError = (key: string) => {
    setFieldErrors((prev: any) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const renderInput = () => {
    switch (field.field_type) {
      case 0: // Text
        return (
          <CustomTextField
            type="text"
            size="small"
            value={field.answer_text}
            onChange={(e) => onChange(index, 'answer_text', e.target.value)}
            placeholder=""
            fullWidth
            sx={{ minWidth: 160, maxWidth: '100%' }}
            error={!!errorMessage}
            helperText={errorMessage}
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
            error={!!errorMessage}
            helperText={errorMessage}
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
            error={!!errorMessage}
            helperText={errorMessage}
          />
        );

      case 3: {
        let options: { value: string; name: string; disabled?: boolean | undefined }[] = [];

        switch (field.remarks) {
          case 'host':
            options = employee.map((emp: any) => ({
              value: emp.id,
              name: emp.name,
            }));
            break;

          case 'employee':
            options = allVisitorEmployee.map((emp: any) => ({
              value: emp.id,
              name: emp.name,
            }));
            break;

          case 'site_place':
            options = sites.map((site: any) => ({
              value: site.id,
              name: site.name,
              disabled: site.can_visited === false,
            }));
            break;

          case 'sp_visitor':
            options = [
              { value: 'A', name: 'Head Visitor' },
              { value: 'B', name: 'Driver' },
              { value: 'C', name: 'Helper' },
              { value: 'C', name: 'Visitor' },
            ];
            break;

          default:
            options = (field.multiple_option_fields || []).map((opt: any) =>
              typeof opt === 'object' ? opt : { value: opt, name: opt },
            );
            break;
        }

        const uniqueKey = opts?.uniqueKey ?? `${activeStep}:${index}`;
        // const siteKey = opts?.uniqueKey ?? `${groupIndex}:${index}`;
        const siteKey = `group-${groupIndex}`;
        const inputVal = inputValues[uniqueKey as any] || '';
        const parents = selectedSiteParentIds[siteKey] || [];

        if (field.remarks === 'site_place') {
          return (
            <>
              <Autocomplete
                key={siteKey}
                multiple
                size="small"
                options={options}
                getOptionLabel={(option) => option.name}
                inputValue={inputValues[siteKey] || ''}
                onInputChange={(_, newInputValue, reason) => {
                  if (reason !== 'input') return;

                  setInputValues((prev: any) => ({
                    ...prev,
                    [siteKey]: newInputValue,
                  }));
                }}
                filterOptions={(opts, state) => {
                  if (state.inputValue.length < 3) return [];
                  return opts.filter((opt) =>
                    opt.name.toLowerCase().includes(state.inputValue.toLowerCase()),
                  );
                }}
                noOptionsText={
                  (inputValues[index] || '').length < 3
                    ? 'Enter at least 3 characters to search'
                    : 'Not found'
                }
                value={options.filter((opt) => parents.includes(opt.value))}
                //   onChange={(_, newValues) => {
                //     const parentIds = newValues.map((v) => v.value);

                //     setSelectedSiteParentIds((prev: any) => ({
                //       ...prev,
                //       [siteKey]: parentIds,
                //     }));

                //     setSiteTree((prev: any) => ({
                //       ...prev,
                //       [siteKey]: parentIds.flatMap((pid) => buildSiteTreeWithParent(sites, pid)),
                //     }));
                //   }}
                //   renderInput={(params) => (
                //     <TextField
                //       {...params}
                //       placeholder="Enter at least 3 characters to search"
                //       fullWidth
                //     />
                //   )}
                // />
                onChange={(_, newValues) => {
                  const parentIds = newValues.map((v) => v.value);

                  setSelectedSiteParentIds((prev: any) => ({
                    ...prev,
                    [siteKey]: parentIds,
                  }));

                  setSiteTree((prev: any) => ({
                    ...prev,
                    [siteKey]: parentIds.flatMap((pid) => buildSiteTreeWithParent(sites, pid)),
                  }));

                  // 🔥 simpan ke FORM (group share)
                  onChange(index, 'answer_text', parentIds.join(','));
                }}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    placeholder="Enter at least 3 characters to search"
                    fullWidth
                    error={!!errorMessage}
                    helperText={errorMessage}
                  />
                )}
              />

              {/* {field.remarks === 'site_place' && siteTree.length > 0 && (
                <SimpleTreeView>
                  {siteTree.map((node) => renderTree(node, index, handleSitePlaceChange))}
                </SimpleTreeView>
              )} */}
              {siteTree[siteKey]?.length > 0 && (
                <SimpleTreeView>
                  {siteTree[siteKey].map((node) => renderTree(node, index, handleSitePlaceChange))}
                </SimpleTreeView>
              )}
            </>
          );
        }

        return (
          <Autocomplete
            size="small"
            freeSolo
            disablePortal={true}
            options={options}
            getOptionDisabled={(option) => option.disabled || false}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            inputValue={inputVal}
            onInputChange={(_, newInputValue) =>
              setInputValues((prev: any) => ({ ...prev, [uniqueKey]: newInputValue }))
            }
            filterOptions={(opts, state) => {
              const term = (state.inputValue || '').toLowerCase();
              if (term.length < 3) return [];
              return opts.filter((opt) => (opt.name || '').toLowerCase().includes(term));
            }}
            noOptionsText={
              inputVal.length < 3 ? 'Enter at least 3 characters to search.' : 'Not found'
            }
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
                placeholder=""
                fullWidth
                sx={{ minWidth: 160 }}
                error={!!errorMessage}
                helperText={errorMessage}
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
            error={!!errorMessage}
            helperText={errorMessage}
          />
        );

      case 5: // Radio
        if (field.remarks === 'gender') {
          return (
            <>
              <Select
                // select
                size="small"
                value={field.answer_text || ''}
                onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                fullWidth
                sx={{ width: 100 }}
                MenuProps={{
                  disablePortal: true,
                  container: containerRef?.current || null,
                }}
              >
                {field.multiple_option_fields?.map((opt: any) => (
                  <MenuItem key={opt.id} value={opt.value}>
                    {opt.name}
                  </MenuItem>
                ))}
              </Select>
            </>
          );
        }

        if (field.remarks === 'vehicle_type') {
          return (
            <Select
              // select
              size="small"
              value={field.answer_text || ''}
              onChange={(e) => onChange(index, 'answer_text', e.target.value)}
              fullWidth
              MenuProps={{
                disablePortal: true,
                container: containerRef?.current || null,
              }}
            >
              {field.multiple_option_fields?.map((opt: any) => (
                <MenuItem key={opt.id} value={opt.value}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          );
        }

        if (field.remarks === 'is_employee') {
          return (
            <>
              <FormControl error={!!errorMessage}>
                <RadioGroup
                  row
                  value={field.answer_text || ''}
                  onChange={(e) => {
                    const value = e.target.value;

                    onChange(index, 'answer_text', value);
                    const isYes = value === 'true';
                    setIsEmployeeMode(isYes);
                    setActiveGroupIdx(groupIndex);
                    setOpenVisitorDialog(true);
                  }}
                  sx={{
                    justifyContent: 'center',
                  }}
                >
                  {field.multiple_option_fields?.map((opt: any) => (
                    <FormControlLabel
                      key={opt.id}
                      value={opt.value}
                      control={<Radio size="small" />}
                      label={opt.name}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <br />
              {errorMessage && (
                <Typography variant="caption" color="error">
                  {errorMessage}
                </Typography>
              )}
            </>
          );
        }

        if (field.remarks === 'is_driving') {
          return (
            <>
              <FormControl error={!!errorMessage}>
                <RadioGroup
                  row
                  value={field.answer_text || ''}
                  onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                  sx={{
                    justifyContent: 'center',
                  }}
                >
                  {field.multiple_option_fields?.map((opt: any) => (
                    <FormControlLabel
                      key={opt.id}
                      value={opt.value}
                      control={<Radio size="small" />}
                      label={opt.name}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <br />
              {errorMessage && (
                <Typography variant="caption" color="error">
                  {errorMessage}
                </Typography>
              )}
            </>
          );
        }
        return (
          <>
            <FormControl error={!!errorMessage}>
              <RadioGroup
                row
                value={field.answer_text || ''}
                onChange={(e) => {
                  onChange(index, 'answer_text', e.target.value);
                  if (e.target.value) clearFieldError(errorKey);
                }}
                sx={{
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
              >
                {field.multiple_option_fields?.map((opt: any) => (
                  <FormControlLabel
                    key={opt.id}
                    value={opt.value}
                    control={<Radio size="small" />}
                    label={opt.name}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <br />
            {errorMessage && (
              <Typography variant="caption" color="error">
                {errorMessage}
              </Typography>
            )}
          </>
        );

      case 6:
        return (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.answer_text)}
                  onChange={(e) => {
                    onChange(index, 'answer_text', e.target.checked);
                    if (e.target.checked) clearFieldError(errorKey);
                  }}
                />
              }
              label=""
            />
            <br />
            {errorMessage && (
              <Typography variant="caption" color="error">
                {errorMessage}
              </Typography>
            )}
          </>
        );

      case 8: // Time
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              value={field.answer_datetime ? dayjs(field.answer_datetime, 'HH:mm') : null}
              onChange={(newValue) => {
                const utcTime = newValue?.utc().format('HH:mm');
                onChange(index, 'answer_datetime', utcTime);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
                popper: {
                  container: containerRef.current,
                },
              }}
            />
          </LocalizationProvider>
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
                  clearFieldError(errorKey);
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
                  error: !!errorMessage,
                  helperText: errorMessage,
                },
                popper: {
                  container: containerRef.current,
                },
              }}
            />
          </LocalizationProvider>
        );

      case 10: // Camera
        return (
          <>
            <CameraUpload
              value={field.answer_file as string | undefined}
              onChange={(url) => {
                onChange(index, 'answer_file', url);
                if (url) clearFieldError(errorKey);
              }}
              containerRef={containerRef.current || undefined}
            />
            {errorMessage && (
              <Typography variant="caption" color="error">
                {errorMessage}
              </Typography>
            )}
          </>
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
              onChange={(e) =>
                handleFileChangeForField(
                  e as React.ChangeEvent<HTMLInputElement>,
                  (url: any) => {
                    (onChange(index, 'answer_file', url), clearFieldError(errorKey));
                  },
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
                      (url: any) => onChange(index, 'answer_file', url),
                      key,
                    )
                  }
                >
                  <IconX size={16} />
                </IconButton>
              </Box>
            )}
            {errorMessage && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errorMessage}
              </Typography>
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
            <CustomTextField
              select
              size="small"
              value={uploadMethods[key]}
              onChange={(e) => handleUploadMethodChange(key, e.target.value)}
              fullWidth
              sx={{
                width: { xs: '100%', md: '200px' },
              }}
            >
              <MenuItem value="file">Choose File</MenuItem>
              <MenuItem value="camera">Take Photo</MenuItem>
            </CustomTextField>
            {(uploadMethods[key] || 'file') === 'camera' ? (
              <CameraUpload
                value={field.answer_file as string | undefined}
                onChange={(url) => {
                  onChange(index, 'answer_file', url);
                  if (url) clearFieldError(errorKey);
                }}
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
                      (url: any) => onChange(index, 'answer_file', url),
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
                      {uploadNames[key] ?? (field.answer_file ? field.answer_file : '')}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={!!removing[key]}
                      onClick={() =>
                        handleRemoveFileForField(
                          (field as any).answer_file,
                          (url: any) => onChange(index, 'answer_file', url),
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
            {errorMessage && (
              <Typography variant="caption" color="error">
                {errorMessage}
              </Typography>
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
            sx={{ minWidth: 160, maxWidth: '100%' }}
            error={!!errorMessage}
            helperText={errorMessage}
          />
        );
    }
  };

  return (
    <Box sx={{ overflow: 'auto', width: '100%' }}>
      {showLabel && (
        <>
          <CustomFormLabel required={field.mandatory === true}>
            {field.long_display_text}
          </CustomFormLabel>
        </>
      )}

      {renderInput()}
    </Box>
  );
};

export default RenderFieldGroup;
