interface Props {
  details: any[];
  activeStep: number;
  invitation: any;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  uploadNames: Record<string, string>;
  setUploadNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onChange: (index: number, field: any, value: any) => void;
  sites: any[];
  employee: any[];
  allVisitorEmployee: any[];
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  Button,
  Card,
  Checkbox,
  Dialog,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  MobileStepper,
  Paper,
  Radio,
  RadioGroup,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Box,
  Grid2 as Grid,
} from '@mui/material';
import { axiosInstance2, BASE_URL } from 'src/customs/api/interceptor';
import dayjs, { Dayjs, tz } from 'dayjs';
import Webcam from 'react-webcam';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers';
import { IconCamera, IconDeviceFloppy, IconTrash, IconX } from '@tabler/icons-react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { FormVisitor } from 'src/customs/api/models/Admin/Visitor';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
import 'dayjs/locale/id';

const RenderDetailRows = ({
  details,
  activeStep,
  invitation,
  fieldErrors,
  setFieldErrors,
  uploadNames,
  setUploadNames,
  onChange,
  allVisitorEmployee,
  employee,
  sites,
}: Props) => {
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [selectedSiteParentIds, setSelectedSiteParentIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs());
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [uploadMethods, setUploadMethods] = useState<Record<string, 'file' | 'camera'>>({});
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [siteTree, setSiteTree] = useState<any[]>([]);

  useEffect(() => {
    if (invitation?.site?.id && selectedSiteParentIds.length === 0) {
      setSelectedSiteParentIds([invitation.site.id]);

      const trees = buildSiteTreeWithParent(sites, invitation.site.id);
      setSiteTree(trees);
    }
  }, [invitation?.site?.id, sites]);

  if (!Array.isArray(details)) {
    console.error('Expected array for details, but got:', details);
    return (
      <TableRow>
        <TableCell colSpan={5}>Invalid data format</TableCell>
      </TableRow>
    );
  }

  const getVisibilityMap = (details: any[]) => {
    const getFlag = (key: string) => {
      const field = details.find((f: any) => f.remarks?.toLowerCase() === key);

      if (!field) return false;

      const val = field.answer_text;

      if (Array.isArray(val)) {
        return val.some((v) => ['true', '1', 'yes'].includes(String(v).toLowerCase()));
      }

      return ['true', '1', 'yes', 'true'].includes(String(val).toLowerCase());
    };

    const isDriving = getFlag('is_driving');
    const isEmployee = getFlag('is_employee');

    return {
      vehicle_type: isDriving,
      vehicle_plate: isDriving,
      employee: isEmployee,
    };
  };
  const makeCdnUrl = (rel?: string | null) => {
    if (!rel) return null;
    if (/^(data:|blob:|https?:\/\/)/i.test(rel)) return rel;
    const r = rel.startsWith('/') ? rel : `/${rel}`;
    return r.startsWith('/cdn/') ? `${BASE_URL}${r}` : `${BASE_URL}/cdn${r}`;
  };

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
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
      // console.log('CDN Response File URL:', fileUrl);

      if (!fileUrl) return null;

      return fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const buildSiteTree = (
    sites: any[],
    parentId: string | null,
  ): {
    id: string;
    name: string;
    children?: {
      id: string;
      name: string;
      children?: { id: string; name: string; children?: any[] }[];
    }[];
  }[] => {
    return sites
      .filter((s) => {
        const siteParent = s.parent ? s.parent.toLowerCase() : null;
        const target = parentId ? parentId.toLowerCase() : null;
        return siteParent === target;
      })
      .map((s) => ({
        id: s.id,
        name: s.name,
        children: buildSiteTree(sites, s.id),
      }));
  };

  const buildSiteTreeWithParent = (sites: any[], parentId: string) => {
    const parent = sites.find((s) => s.id === parentId);
    if (!parent) return [];

    return [{ id: parent.id, name: parent.name, children: buildSiteTree(sites, parentId) }];
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

  const handlePDFUploadFor =
    (idx: number, onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const path = await uploadFileToCDN(file);
      if (path) onChange(idx, 'answer_file', path);

      e.target.value = '';
    };

  const handleUploadMethodChange = (ukey: string, v: string) => {
    setUploadMethods((prev) => ({ ...prev, [ukey]: v as 'file' | 'camera' }));
  };

  const collectAllChildIds = (node: any): string[] => {
    if (!node.children) return [];
    return node.children.flatMap((child: any) => [child.id, ...collectAllChildIds(child)]);
  };

  const toCsv = (ids: string[]) => ids.join(',');

  const renderTree = (
    node: any,
    index: number,
    onChange: (index: number, field: keyof FormVisitor, value: any) => void,
  ) => {
    const checked = selectedSiteIds.includes(node.id);

    return (
      <TreeItem
        key={`${node.parentId ?? 'root'}-${node.id}`}
        itemId={`${node.parentId ?? 'root'}-${node.id}`}
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <Checkbox
              size="small"
              checked={checked}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const isChecked = e.target.checked;
                const isParentNode = !!node.children?.length;
                setSelectedSiteIds((prev) => {
                  let updated = [...prev];

                  if (isChecked) {
                    if (!updated.includes(node.id)) {
                      updated.push(node.id);
                    }
                    // if (isParentNode) {
                    //   const childIds = collectAllChildIds(node);
                    //   childIds.forEach((cid) => {
                    //     if (!updated.includes(cid)) {
                    //       updated.push(cid);
                    //     }
                    //   });
                    // }
                    if (!isParentNode && node.parentId && !updated.includes(node.parentId)) {
                      updated.push(node.parentId);
                    }
                  } else {
                    updated = updated.filter((id) => id !== node.id);
                    if (isParentNode) {
                      const childIds = collectAllChildIds(node);
                      updated = updated.filter((id) => !childIds.includes(id));
                    }
                  }

                  onChange(index, 'answer_text', toCsv(updated));
                  console.log('[TREE CHECK]', {
                    clicked: node.id,
                    isChecked,
                    result: updated,
                  });

                  return updated;
                });
              }}
            />
            <Typography variant="body2">{node.name}</Typography>
          </Box>
        }
      >
        {node.children?.map((child: any) => renderTree(child, index, onChange))}
      </TreeItem>
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

  const fileNameFromAnswer = (answerFile?: string) => {
    if (!answerFile) return '';
    try {
      const url = new URL(makeCdnUrl(answerFile)!);
      return url.pathname.split('/').pop() || '';
    } catch {
      return String(answerFile).split('/').pop() || '';
    }
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

  const getPreviewSrc = (key: string, answerFile?: string) => {
    if (previews[key]) return previews[key];
    if (!answerFile) return null;

    const lower = answerFile.toLowerCase();
    const isImg =
      /\.(jpg|jpeg|png|webp|gif|bmp)$/.test(lower) ||
      /^data:image\//.test(lower) ||
      /^blob:/.test(lower);

    return isImg ? makeCdnUrl(answerFile) : null;
  };

  const handleSitePlaceChange = (idx: number, field: any, value: any) => {
    onChange(idx, field, value);
  };

  const visibilityMap: any = getVisibilityMap(details);

  const filteredDetails = details.filter((item, i) => {
    const remark = (item.remarks || '').toLowerCase();
    const visible = visibilityMap.hasOwnProperty(remark) ? visibilityMap[remark] : true;

    if (!visible && item.answer_text) {
      onChange(i, 'answer_text', '');
    }

    return visible;
  });

  return (
    <>
      {filteredDetails.map((item, index) => {
        const key = `${activeStep - 1}:${item.id}`;
        const previewSrc = getPreviewSrc(key, item.answer_file);
        const shownName = uploadNames[key] || fileNameFromAnswer(item.answer_file);
        const errorMessage = fieldErrors[key];

        return (
          <TableRow key={key}>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                {item.long_display_text}
                {item.mandatory && (
                  <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                    *
                  </Typography>
                )}
              </Typography>

              {(() => {
                switch (item.field_type) {
                  case 0: // Text
                    if (item.remarks === 'agenda') {
                      const isLockedAgenda = !!invitation?.agenda;

                      if (isLockedAgenda) {
                        return (
                          <CustomTextField
                            size="small"
                            value={item.answer_text || ''}
                            fullWidth
                            disabled
                          />
                        );
                      }

                      return (
                        <Autocomplete
                          size="small"
                          freeSolo
                          options={['Meeting', 'Presentation', 'Visit', 'Training', 'Report']}
                          value={item.answer_text || null}
                          onChange={(event, newValue) => {
                            onChange(index, 'answer_text', newValue || '');
                            if (newValue) clearFieldError(key);
                          }}
                          renderInput={(params) => (
                            <CustomTextField
                              {...params}
                              placeholder="Choose or write manually agenda"
                              fullWidth
                              error={!!errorMessage}
                              helperText={errorMessage}
                            />
                          )}
                        />
                      );
                    }
                    return (
                      <CustomTextField
                        size="small"
                        value={item.answer_text || ''}
                        onChange={(e) => {
                          onChange(index, 'answer_text', e.target.value);
                          if (e.target.value) clearFieldError(key);
                        }}
                        placeholder={
                          item.remarks === 'name'
                            ? ''
                            : item.remarks === 'phone'
                              ? ''
                              : item.remarks === 'organization'
                                ? ''
                                : item.remarks === 'indentity_id'
                                  ? ''
                                  : ''
                        }
                        fullWidth
                        error={!!errorMessage}
                        helperText={errorMessage}
                      />
                    );
                  case 1: // Number
                    return (
                      <CustomTextField
                        type="number"
                        size="small"
                        value={item.answer_text}
                        onChange={(e) => {
                          onChange(index, 'answer_text', e.target.value);
                          if (e.target.value) clearFieldError(key);
                        }}
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
                        value={item.answer_text}
                        onChange={(e) => {
                          onChange(index, 'answer_text', e.target.value);
                          if (e.target.value) clearFieldError(key);
                        }}
                        placeholder={item.remarks === 'email' ? '' : ''}
                        fullWidth
                        error={!!errorMessage}
                        helperText={errorMessage}
                      />
                    );
                  case 3: {
                    let options: { value: string; name: string; disabled?: boolean }[] = [];

                    const isLockedByInvitation =
                      (item.remarks === 'host' && !!invitation?.host) ||
                      (item.remarks === 'employee' && !!invitation?.host) ||
                      (item.remarks === 'site_place' && !!invitation?.site);

                    if (item.remarks === 'host') {
                      options = invitation?.host
                        ? [{ value: invitation.host.id, name: invitation.host.name }]
                        : employee.map((emp: any) => ({
                            value: emp.id,
                            name: emp.name,
                          }));
                    } else if (item.remarks === 'employee') {
                      options = invitation?.host
                        ? [{ value: invitation.host.id, name: invitation.host.name }]
                        : allVisitorEmployee.map((emp: any) => ({
                            value: emp.id,
                            name: emp.name,
                          }));
                    } else if (item.remarks === 'site_place') {
                      options = invitation?.site
                        ? [{ value: invitation.site.id, name: invitation.site.name }]
                        : sites.map((site: any) => ({
                            value: site.id,
                            name: site.name,
                            disabled: site.can_visited === false,
                          }));
                    } else {
                      options = (item.multiple_option_fields || []).map((opt: any) =>
                        typeof opt === 'object' ? opt : { value: opt, name: opt },
                      );
                    }
                    // if (item.remarks === 'site_place') {
                    //   return (
                    //     <>
                    //       <Autocomplete
                    //         multiple
                    //         size="small"
                    //         disabled={isLockedByInvitation}
                    //         options={options}
                    //         getOptionLabel={(option) => option.name}
                    //         value={options.filter((opt) =>
                    //           selectedSiteParentIds.includes(opt.value),
                    //         )}
                    //         filterOptions={(opts, state) => {
                    //           if (!state.inputValue || state.inputValue.length < 3) return [];
                    //           return opts.filter((opt) =>
                    //             opt.name.toLowerCase().includes(state.inputValue.toLowerCase()),
                    //           );
                    //         }}
                    //         noOptionsText="Enter at least 3 characters to search"
                    //         onChange={(_, newValues) => {
                    //           const parentIds = newValues.map((v) => v.value);
                    //           setSelectedSiteParentIds(parentIds);

                    //           const trees = parentIds.flatMap((pid) =>
                    //             buildSiteTreeWithParent(sites, pid),
                    //           );

                    //           setSiteTree(trees);
                    //         }}
                    //         renderInput={(params) => (
                    //           <CustomTextField
                    //             {...params}
                    //             placeholder={
                    //               selectedSiteParentIds.length === 0
                    //                 ? 'Enter at least 3 characters to search'
                    //                 : ''
                    //             }
                    //             fullWidth
                    //             error={!!errorMessage}
                    //             helperText={errorMessage}
                    //           />
                    //         )}
                    //       />

                    //       {siteTree.length > 0 && (
                    //         <SimpleTreeView>
                    //           {siteTree.map((node) =>
                    //             renderTree(node, index, handleSitePlaceChange),
                    //           )}
                    //         </SimpleTreeView>
                    //       )}
                    //     </>
                    //   );
                    // }

                    return (
                      <Autocomplete
                        size="small"
                        disabled={isLockedByInvitation}
                        options={options}
                        getOptionLabel={(option) => option.name}
                        value={options.find((opt) => opt.value === item.answer_text) || null}
                        getOptionDisabled={(option) => option.disabled || false}
                        filterOptions={(opts, state) => {
                          if (!state.inputValue || state.inputValue.length < 3) return [];
                          return opts.filter((opt) =>
                            opt.name.toLowerCase().includes(state.inputValue.toLowerCase()),
                          );
                        }}
                        noOptionsText="Enter at least 3 characters to search"
                        onChange={(_, newValue) => {
                          const selectedValue = newValue ? newValue.value : '';
                          onChange(index, 'answer_text', selectedValue);
                          if (selectedValue) clearFieldError(key);
                        }}
                        renderInput={(params) => (
                          <CustomTextField
                            {...params}
                            placeholder={
                              !item.answer_text ? 'Enter at least 3 characters to search' : ''
                            }
                            fullWidth
                            error={!!errorMessage}
                            helperText={errorMessage}
                          />
                        )}
                      />
                    );
                  }
                  case 4: // Datepicker
                    return (
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                        <DateTimePicker
                          value={startTime}
                          ampm={false}
                          onChange={setStartTime}
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
                  case 5: // Radio
                    return (
                      <>
                        <FormControl component="fieldset" error={!!errorMessage}>
                          <RadioGroup
                            value={String(item.answer_text)}
                            onChange={(e) => {
                              onChange(index, 'answer_text', e.target.value);
                              if (e.target.value) clearFieldError(key);
                            }}
                            sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
                          >
                            {(item.multiple_option_fields || [])
                              .sort((a: any, b: any) => {
                                if (item.remarks === 'is_driving') {
                                  const order: Record<string, number> = { true: 0, false: 1 };
                                  return order[a.value] - order[b.value];
                                }
                                return 0;
                              })
                              .map((opt: any, idx: number) => (
                                <FormControlLabel
                                  key={idx}
                                  value={String(opt.value)}
                                  control={<Radio />}
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

                  case 6: // Checkbox
                    return (
                      <>
                        <FormControl error={!!errorMessage}>
                          <FormGroup>
                            {(item.multiple_option_fields || []).map((opt: any, idx: number) => {
                              const val = typeof opt === 'object' ? opt.value : opt;
                              const label = typeof opt === 'object' ? opt.name : opt;
                              const answerArray = Array.isArray(item.answer_text)
                                ? item.answer_text
                                : item.answer_text
                                  ? [String(item.answer_text)]
                                  : [];

                              return (
                                <FormControlLabel
                                  key={idx}
                                  control={
                                    <Checkbox
                                      checked={answerArray.includes(val)}
                                      onChange={(e) => {
                                        const newValue = e.target.checked
                                          ? [...answerArray, val]
                                          : answerArray.filter((v: string) => v !== val);
                                        onChange(index, 'answer_text', newValue);
                                        if (newValue.length > 0) {
                                          clearFieldError(key);
                                        }
                                      }}
                                    />
                                  }
                                  label={label}
                                />
                              );
                            })}
                          </FormGroup>
                        </FormControl>
                        <br />
                        {errorMessage && (
                          <Typography variant="caption" color="error">
                            {errorMessage}
                          </Typography>
                        )}
                      </>
                    );

                  case 8: // TimePicker
                    return (
                      <TextField
                        type="time"
                        size="small"
                        value={item.answer_datetime}
                        onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
                        fullWidth
                        error={!!errorMessage}
                        helperText={errorMessage}
                      />
                    );
                  case 9:
                    const hasValue = !!item.answer_datetime;
                    return (
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                        <DateTimePicker
                          disabled={hasValue}
                          value={
                            item.answer_datetime ? dayjs.utc(item.answer_datetime).local() : null
                          }
                          ampm={false}
                          onChange={(newValue) => {
                            if (newValue) {
                              const utc = newValue.utc().format();
                              onChange(index, 'answer_datetime', utc);
                              clearFieldError(key);
                            }
                          }}
                          format="dddd, DD   MMMM  YYYY, HH:mm"
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
                              sx: {
                                '& .MuiInputBase-root.Mui-disabled': {
                                  backgroundColor: '#f3f4f6', 
                                },
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#909294ff',
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    );

                  case 10: // TakePicture (Assuming image capture from device camera)
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
                          // onClick={() => !isBatchEdit && fileInputRef.current?.click()}
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
                            onClick={() => setOpenCamera(true)}
                          >
                            <PhotoCameraIcon sx={{ fontSize: 48, color: '#42a5f5', mr: 0.5 }} />
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mt: 1,
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="span"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                              >
                                Use Camera
                              </Typography>
                            </Box>
                          </Box>
                          <input
                            id={`file-${key}`}
                            type="file"
                            accept="*"
                            hidden
                            ref={fileInputRef}
                            onChange={(e) =>
                              handleFileChangeForField(
                                e as React.ChangeEvent<HTMLInputElement>,
                                (url) => {
                                  onChange(index, 'answer_file', url);
                                  if (url) clearFieldError(key);
                                },
                                key,
                              )
                            }
                          />
                          <br />
                        </Box>

                        {/* PREVIEW / INFO */}
                        {(previewSrc || shownName) && (
                          <Box
                            mt={1}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            justifyContent={'center'}
                          >
                            {previewSrc ? (
                              <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                                <img
                                  src={previewSrc}
                                  alt="preview"
                                  style={{
                                    width: 350,
                                    height: 200,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                  }}
                                />
                                <Button
                                  color="error"
                                  size="small"
                                  variant="outlined"
                                  sx={{ mt: 2, minWidth: 120 }}
                                  onClick={() =>
                                    handleRemoveFileForField(
                                      (item as any).answer_file,
                                      (url) => onChange(index, 'answer_file', url),
                                      key,
                                    )
                                  }
                                  startIcon={<IconTrash />}
                                >
                                  Remove
                                </Button>
                              </Box>
                            ) : (
                              <></>
                            )}
                          </Box>
                        )}

                        {errorMessage && (
                          <Typography color="error" variant="caption" display="block" mt={1}>
                            {errorMessage}
                          </Typography>
                        )}

                        <Dialog
                          open={openCamera}
                          onClose={() => setOpenCamera(false)}
                          maxWidth="md"
                          fullWidth
                        >
                          <Box sx={{ p: 3 }}>
                            <Box>
                              <Typography variant="h6" mb={2}>
                                Take Photo From Camera
                              </Typography>
                              {/* close button */}
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
                                {previews[key] ? (
                                  <img
                                    src={previews[key] as string}
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
                                    <Typography color="text.secondary">
                                      No Photos Have Been Taken Yet
                                    </Typography>
                                  </Box>
                                )}
                              </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ textAlign: 'right' }}>
                              <Button
                                onClick={() =>
                                  handleRemoveFileForField(
                                    (item as any).answer_file,
                                    (url) => onChange(index, 'answer_file', url),
                                    key,
                                  )
                                }
                                color="error"
                                startIcon={<IconTrash />}
                                sx={{ mr: 1 }}
                              >
                                Clear Foto
                              </Button>
                              <Button
                                variant="contained"
                                onClick={() =>
                                  handleCaptureForField((url) => {
                                    onChange(index, 'answer_file', url);
                                    if (url) clearFieldError(key);
                                  }, key)
                                }
                                startIcon={<IconCamera />}
                              >
                                Take Foto
                              </Button>
                              <Button
                                startIcon={<IconDeviceFloppy />}
                                onClick={() => setOpenCamera(false)}
                                sx={{ ml: 1 }}
                              >
                                Submit
                              </Button>
                            </Box>
                          </Box>
                        </Dialog>
                      </Box>
                    );

                  case 11: {
                    // FileUpload
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
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
                          <Typography variant="subtitle1" sx={{ mt: 1 }}>
                            Upload File
                          </Typography>

                          <Typography variant="body2" color="textSecondary" mt={1}>
                            Supports: JPG, JPEG, PNG, up to
                            <span style={{ fontWeight: 'semibold' }}> 100KB</span>
                          </Typography>
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
                                    sx={{ mt: 2, minWidth: 120 }}
                                    onClick={() =>
                                      handleRemoveFileForField(
                                        (item as any).answer_file,
                                        (url) => onChange(index, 'answer_file', url),
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

                          <input
                            id={`file-${key}`}
                            type="file"
                            accept="*"
                            hidden
                            ref={fileInputRef}
                            // onChange={handlePDFUploadFor(index, onChange)}
                            onChange={(e) =>
                              handlePDFUploadFor(index, (idx, field, url) => {
                                onChange(idx, field, url);
                                if (url) clearFieldError(key);
                              })(e)
                            }
                          />
                        </Box>
                        {errorMessage && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: 'block' }}
                          >
                            {errorMessage}
                          </Typography>
                        )}
                      </Box>
                    );
                  }

                  case 12: {
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
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
                          <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
                            Upload File
                          </Typography>

                          <Box
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Typography variant="body1" color="textSecondary">
                              Supports: PDF, JPG, PNG, JPEG Up to
                              <span style={{ fontWeight: '700' }}> 100KB</span>
                            </Typography>

                            <Typography
                              variant="h6"
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
                          </Box>

                          <input
                            id={`file-${key}`}
                            type="file"
                            accept="*"
                            hidden
                            ref={fileInputRef}
                            onChange={(e) =>
                              handleFileChangeForField(
                                e as React.ChangeEvent<HTMLInputElement>,
                                (url) => {
                                  onChange(index, 'answer_file', url);
                                  if (url) clearFieldError(key);
                                },
                                key,
                              )
                            }
                          />

                          {/*preview  */}
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
                                    sx={{ mt: 2, minWidth: 120 }}
                                    onClick={() =>
                                      handleRemoveFileForField(
                                        (item as any).answer_file,
                                        (url) => onChange(index, 'answer_file', url),
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

                        {errorMessage && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: 'block' }}
                          >
                            {errorMessage}
                          </Typography>
                        )}

                        <Dialog
                          open={openCamera}
                          onClose={() => setOpenCamera(false)}
                          maxWidth="md"
                          fullWidth
                        >
                          <Box sx={{ p: 2 }}>
                            <Box
                              display={'flex'}
                              justifyContent={'space-between'}
                              alignItems={'center'}
                              mb={1}
                            >
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
                                {screenshot ? (
                                  <img
                                    src={screenshot}
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
                                    <Typography color="text.secondary">
                                      No Photos Have Been Taken Yet
                                    </Typography>
                                  </Box>
                                )}
                              </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ textAlign: 'right' }}>
                              <Button
                                onClick={() =>
                                  handleRemoveFileForField(
                                    (item as any).answer_file,
                                    (url) => onChange(index, 'answer_file', url),
                                    key,
                                  )
                                }
                                color="error"
                                sx={{ mr: 1 }}
                                startIcon={<IconTrash />}
                              >
                                Clear Foto
                              </Button>
                              <Button
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCaptureForField((url) =>
                                    onChange(index, 'answer_file', url),
                                  );
                                }}
                                startIcon={<IconCamera />}
                              >
                                Take Foto
                              </Button>
                              <Button
                                startIcon={<IconDeviceFloppy />}
                                onClick={() => setOpenCamera(false)}
                                sx={{ ml: 1 }}
                              >
                                Submit
                              </Button>
                            </Box>
                          </Box>
                        </Dialog>
                      </Box>
                    );
                  }
                  default:
                    return (
                      <TextField
                        size="small"
                        value={item.long_display_text}
                        onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
                        placeholder="Enter value"
                        fullWidth
                      />
                    );
                }
              })()}
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

export default RenderDetailRows;
