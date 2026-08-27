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
  visitorRoles: any[];
}

import React, { useEffect, useRef, useState } from 'react';
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
  Radio,
  RadioGroup,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Box,
  Grid2 as Grid,
  LinearProgress,
  AlertColor,
  Portal,
  Snackbar,
  Alert,
} from '@mui/material';
import { axiosInstance2, BASE_URL } from 'src/customs/api/interceptor';
import dayjs, { Dayjs, tz } from 'dayjs';
import Webcam from 'react-webcam';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers';
import { IconCamera, IconDeviceFloppy, IconRefresh, IconTrash, IconX } from '@tabler/icons-react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { FormVisitor } from 'src/customs/api/models/Admin/Visitor';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import imageCompression from 'browser-image-compression';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
import 'dayjs/locale/id';
import { IconInfoCircle } from '@tabler/icons-react';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useMediaQuery, useTheme } from '@mui/system';
import { useTranslation } from 'react-i18next';
import CameraDialog from 'src/customs/pages/admin/content/Visitor/Trx/components/Dialog/CameraDialog';

const RenderDetailRows = ({
  details,
  activeStep,
  invitation,
  fieldErrors,
  setFieldErrors,
  uploadNames,
  visitorRoles,
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
  const [isDragging, setIsDragging] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [siteTree, setSiteTree] = useState<any[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const theme = useTheme();
  const lg = useMediaQuery(theme.breakpoints.up('lg'));
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const { t } = useTranslation();
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

  const handlePDFUploadFor =
    (idx: number, onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const path = await uploadFileToCDN(file);
      if (path) onChange(idx, 'answer_file', path);

      e.target.value = '';
    };

  const collectAllChildIds = (node: any): string[] => {
    if (!node.children) return [];
    return node.children.flatMap((child: any) => [child.id, ...collectAllChildIds(child)]);
  };

  const toCsv = (ids: string[]) => ids.join(',');

  const handleSiteCheck = (
    node: any,
    isChecked: boolean,
    index: number,
    onChange: (index: number, field: keyof FormVisitor, value: any) => void,
    isSelfOnly = false,
  ) => {
    const isParentNode = !!node.children?.length;

    const setter = setSelectedSiteIds;

    setter((prev: string[]) => {
      let updated = [...prev];

      if (isChecked) {
        // tambah current
        if (!updated.includes(node.id)) {
          updated.push(node.id);
        }

        // child pilih -> parent ikut
        if (!isParentNode && node.parentId && !updated.includes(node.parentId)) {
          updated.push(node.parentId);
        }
      } else {
        // remove current
        updated = updated.filter((id) => id !== node.id);

        // parent dihapus -> semua child ikut hilang
        if (isParentNode) {
          const childIds = collectAllChildIds(node);

          updated = updated.filter((id) => id !== node.id && !childIds.includes(id));
        }

        // child dihapus -> cek sibling
        if (!isParentNode && node.parentId) {
          const parentTree = buildSiteTreeWithParent(sites, node.parentId);

          const collectSiblingIds = (nodes: any[]): string[] =>
            nodes.flatMap((n) => (n.children ? n.children.map((c: any) => c.id) : []));

          const siblingIds = collectSiblingIds(parentTree);

          const stillHasCheckedSibling = siblingIds.some((id: string) => updated.includes(id));

          // kalau tidak ada child aktif -> remove parent
          if (!stillHasCheckedSibling) {
            updated = updated.filter((id) => id !== node.parentId);
          }
        }
      }

      // VALIDASI BERDASARKAN PARENT AKTIF
      const activeParentIds = selectedSiteParentIds;

      updated = updated.filter((id) => {
        return activeParentIds.some((parentId) => {
          if (id === parentId) return true;

          const tree = buildSiteTreeWithParent(sites, parentId);

          const collect = (nodes: any[]): string[] =>
            nodes.flatMap((n) => [n.id, ...(n.children ? collect(n.children) : [])]);

          return collect(tree).includes(id);
        });
      });

      updated = [...new Set(updated)];

      onChange(index, 'answer_text', toCsv(updated));

      return updated;
    });
  };

  const renderTree = (
    node: any,
    index: number,
    onChange: (index: number, field: keyof FormVisitor, value: any) => void,
    isSelfOnly = false,
  ) => {
    const originalSite = sites.find(
      (s: any) => String(s.id).toUpperCase() === String(node.id).toUpperCase(),
    );

    const canVisited = originalSite?.can_visited === undefined ? true : !!originalSite.can_visited;

    const isDisabled = !canVisited;

    const isChecked = selectedSiteIds.includes(node.id);

    return (
      <TreeItem
        key={`${node.parentId ?? 'root'}-${node.id}`}
        itemId={`${node.parentId ?? 'root'}-${node.id}`}
        label={
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            onClick={(e) => {
              e.stopPropagation();

              if (isDisabled) return;

              handleSiteCheck(node, !isChecked, index, onChange, isSelfOnly);
            }}
            sx={{
              cursor: isDisabled ? 'default' : 'pointer',
              width: '100%',
            }}
          >
            <Checkbox
              size="small"
              disabled={isDisabled}
              checked={isChecked}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                handleSiteCheck(node, e.target.checked, index, onChange, isSelfOnly);
              }}
            />

            <Box display="flex" flexDirection="column">
              <Typography variant="body2" color={isDisabled ? 'text.disabled' : 'text.primary'}>
                {node.name}
              </Typography>

              {!canVisited && (
                <Typography variant="caption" color="error" sx={{ fontStyle: 'italic' }}>
                  {t('siteCannotBeVisited')}
                </Typography>
              )}
            </Box>
          </Box>
        }
      >
        {node.children?.map((child: any) => renderTree(child, index, onChange, isSelfOnly))}
      </TreeItem>
    );
  };
  const compressImage = async (file: File | Blob) => {
    const compressedFile = await imageCompression(file as File, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });

    return compressedFile;
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

    const blob = await fetch(imageSrc).then((res) => res.blob());
    const compressedBlob = await compressImage(
      new File([blob], 'camera.jpg', { type: 'image/jpeg' }),
    );
    const path = await uploadFileToCDN(compressedBlob);
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

  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

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
      setScreenshot(null);
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
    const originalIndex = details.findIndex((d) => d.id === item.id);
    const remark = (item.remarks || '').toLowerCase();
    const visible = visibilityMap.hasOwnProperty(remark) ? visibilityMap[remark] : true;

    if (!visible && item.answer_text) {
      onChange(originalIndex, 'answer_text', '');
    }

    return visible;
  });

  return (
    <>
      {filteredDetails.map((item, index) => {
        // const key = `${activeStep - 1}:${item.id}`;
        const originalIndex = details.findIndex((d) => d.id === item.id);
        const fieldKey = item.custom_field_id || item.id || `${item.remarks}-${originalIndex}`;

        const key = `${activeStep - 1}:${fieldKey}`;
        const previewSrc = getPreviewSrc(key, item.answer_file);
        const shownName = uploadNames[key] || fileNameFromAnswer(item.answer_file);
        const errorMessage = fieldErrors[key];
        const remark = (item.remarks || '').toLowerCase();
        if (remark === 'visitor_period_end') {
          return null;
        }

        const isVisitorPeriodPair =
          remark === 'visitor_period_start' &&
          filteredDetails[index + 1] &&
          (filteredDetails[index + 1].remarks || '').toLowerCase() === 'visitor_period_end';

        return (
          <TableRow key={key}>
            <TableCell sx={{ borderBottom: 'none' }}>
              {!isVisitorPeriodPair && (
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {item.long_display_text}
                    {item.mandatory && (
                      <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                        *
                      </Typography>
                    )}
                  </Typography>

                  {item.remarks === 'host' && (
                    <Tooltip title={t('hostInformation')} arrow placement="top">
                      <IconInfoCircle size={20} style={{ color: '#1976d2', cursor: 'pointer' }} />
                    </Tooltip>
                  )}
                  {item.remarks === 'agenda' && (
                    <Tooltip title={t('agendaInformation')} arrow placement="top">
                      <IconInfoCircle size={20} style={{ color: '#1976d2', cursor: 'pointer' }} />
                    </Tooltip>
                  )}
                  {item.remarks === 'site_place' && (
                    <Tooltip title={t('sitePlaceInformation')} arrow placement="top">
                      <IconInfoCircle size={20} style={{ color: '#1976d2', cursor: 'pointer' }} />
                    </Tooltip>
                  )}
                  {item.remarks === 'visitor_period_start' && (
                    <Tooltip title={t('visitorPeriodStart')} arrow placement="top">
                      <IconInfoCircle size={20} style={{ color: '#1976d2', cursor: 'pointer' }} />
                    </Tooltip>
                  )}
                  {item.remarks === 'visitor_period_end' && (
                    <Tooltip title={t('visitorPeriodEnd')} arrow placement="top">
                      <IconInfoCircle size={20} style={{ color: '#1976d2', cursor: 'pointer' }} />
                    </Tooltip>
                  )}
                </Box>
              )}

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
                          let value = e.target.value;

                          if ((item.remarks || '').toLowerCase() === 'phone') {
                            value = value.replace(/\D/g, '');
                          }

                          onChange(originalIndex, 'answer_text', value);

                          if (value) clearFieldError(key);
                        }}
                        placeholder={'Enter your ' + item.long_display_text.toLowerCase()}
                        inputProps={
                          (item.remarks || '').toLowerCase() === 'phone'
                            ? {
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                              }
                            : undefined
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
                          onChange(originalIndex, 'answer_text', e.target.value);
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
                          onChange(originalIndex, 'answer_text', e.target.value);
                          if (e.target.value) clearFieldError(key);
                        }}
                        placeholder={
                          item.remarks?.toLowerCase() === 'email'
                            ? 'Example: name@gmail.com'
                            : 'Enter your ' + item.long_display_text.toLowerCase()
                        }
                        fullWidth
                        error={!!errorMessage}
                        helperText={errorMessage}
                      />
                    );
                  case 3: {
                    let options: { value: string; name: string; disabled?: boolean }[] = [];
                    // console.log('otpions', options);

                    const isLockedByInvitation =
                      (item.remarks === 'host' && !!invitation?.host) ||
                      (item.remarks === 'site_place' && !!invitation?.site);
                    // console.log('islocked', isLockedByInvitation);

                    if (item.remarks === 'host') {
                      options = invitation?.host
                        ? [{ value: invitation.host.id, name: invitation.host.name }]
                        : Array.isArray(employee)
                          ? employee.map((emp: any) => ({
                              value: emp.id,
                              name: emp.name,
                            }))
                          : [];
                    } else if (item.remarks === 'employee') {
                      options = invitation?.host
                        ? [{ value: invitation.host.id, name: invitation.host.name }]
                        : Array.isArray(allVisitorEmployee)
                          ? allVisitorEmployee.map((emp: any) => ({
                              value: emp.id,
                              name: emp.name,
                            }))
                          : [];
                    } else if (item.remarks === 'site_place') {
                      options = invitation?.site
                        ? [
                            {
                              value: invitation.site.id,
                              name: invitation.site.name,
                              // disabled: invitation.site.can_visited === false,
                              disabled: true,
                            },
                          ]
                        : sites.map((site: any) => ({
                            value: site.id,
                            name: site.name,
                            disabled: site.can_visited === false,
                          }));

                      // console.log('invitation', invitation);
                    } else {
                      options = (item.multiple_option_fields || []).map((opt: any) =>
                        typeof opt === 'object' ? opt : { value: opt, name: opt },
                      );
                    }
                    if (item.remarks === 'visitor_role') {
                      const roleOptions = (visitorRoles || []).map((role: any) => ({
                        value: role.role,
                        name: role.role,
                      }));

                      return (
                        <Autocomplete
                          size="small"
                          options={roleOptions}
                          getOptionLabel={(option) => option.name}
                          value={roleOptions.find((opt) => opt.value === item.answer_text) || null}
                          onChange={(_, newValue) => {
                            onChange(originalIndex, 'answer_text', newValue?.value ?? '');

                            if (newValue) {
                              clearFieldError(key);
                            }
                          }}
                          renderInput={(params) => (
                            <CustomTextField
                              {...params}
                              placeholder={t('selectRole')}
                              fullWidth
                              error={!!errorMessage}
                              helperText={errorMessage}
                            />
                          )}
                        />
                      );
                    }
                    if (item.remarks === 'site_place') {
                      return (
                        <>
                          <Autocomplete
                            multiple
                            disabled={isLockedByInvitation}
                            size="small"
                            options={options}
                            getOptionLabel={(option) => option.name}
                            getOptionDisabled={(option) => option.disabled || false}
                            inputValue={inputValues[originalIndex] || ''}
                            onInputChange={(_, newInputValue, reason) => {
                              if (reason !== 'input') return;

                              setInputValues((prev: any) => ({
                                ...prev,
                                [originalIndex]: newInputValue,
                              }));
                            }}
                            noOptionsText={
                              (inputValues[originalIndex] || '').length < 3
                                ? t('enterMin3CharsToSearch')
                                : 'Not found'
                            }
                            value={options.filter((opt) =>
                              selectedSiteParentIds.includes(opt.value),
                            )}
                            onChange={(_, newValues) => {
                              const parentIds = newValues.map((v) => v.value);

                              const trees = parentIds.flatMap((pid) =>
                                buildSiteTreeWithParent(sites, pid),
                              );

                              setSelectedSiteParentIds(parentIds);

                              setInputValues((prev: any) => ({
                                ...prev,
                                [originalIndex]: '',
                              }));

                              setSiteTree(trees);
                              clearFieldError(key);
                            }}
                            renderInput={(params) => (
                              <CustomTextField
                                {...params}
                                placeholder={t('selectSiteMin3Chars')}
                                fullWidth
                                error={!!errorMessage}
                                helperText={errorMessage}
                              />
                            )}
                          />

                          <SimpleTreeView>
                            {siteTree.map((node) =>
                              renderTree(node, originalIndex, handleSitePlaceChange),
                            )}
                          </SimpleTreeView>
                        </>
                      );
                    }
                    return (
                      <Autocomplete
                        size="small"
                        disabled={isLockedByInvitation}
                        options={options}
                        getOptionLabel={(option) => option.name}
                        value={options.find((opt) => opt.value === item.answer_text) || null}
                        getOptionDisabled={(option) => option.disabled || false}
                        // filterOptions={(opts, state) => {
                        //   if (!state.inputValue || state.inputValue.length < 3) return [];
                        //   return opts.filter((opt) =>
                        //     opt.name.toLowerCase().includes(state.inputValue.toLowerCase()),
                        //   );
                        // }}
                        noOptionsText={t('enterMin3CharsToSearch')}
                        onChange={(_, newValue) => {
                          const selectedValue = newValue ? newValue.value : '';
                          onChange(originalIndex, 'answer_text', selectedValue);
                          if (selectedValue) clearFieldError(key);
                        }}
                        renderInput={(params) => (
                          <CustomTextField
                            {...params}
                            placeholder={
                              !item.answer_text
                                ? 'Select  or type at least 3 characters to search'
                                : ''
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
                          format="dddd, DD MMM YYYY, HH:mm"
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
                              onChange(originalIndex, 'answer_text', e.target.value);
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
                                        onChange(originalIndex, 'answer_text', newValue);
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
                        onChange={(e) => onChange(originalIndex, 'answer_datetime', e.target.value)}
                        fullWidth
                        error={!!errorMessage}
                        helperText={errorMessage}
                      />
                    );
                  case 9:
                    const remark = (item.remarks || '').toLowerCase();
                    const isLockedByInvitation =
                      (item.remarks === 'visitor_period_start' &&
                        !!invitation?.visitor_period_start) ||
                      (item.remarks === 'visitor_period_end' && !!invitation?.visitor_period_end);
                    if (
                      remark === 'visitor_period_start' &&
                      filteredDetails[index + 1] &&
                      (filteredDetails[index + 1].remarks || '').toLowerCase() ===
                        'visitor_period_end'
                    ) {
                      const startItem = item;
                      const endItem = filteredDetails[index + 1];

                      const startIndex = details.findIndex((d) => d.id === startItem.id);
                      const endIndex = details.findIndex((d) => d.id === endItem.id);

                      const startFieldId = startItem.custom_field_id || startItem.id;
                      const endFieldId = endItem.custom_field_id || endItem.id;

                      const startKey = `${activeStep - 1}:${startFieldId}`;
                      const endKey = `${activeStep - 1}:${endFieldId}`;

                      const startError = fieldErrors[startKey];
                      const endError = fieldErrors[endKey];

                      const startLocked =
                        startItem.remarks === 'visitor_period_start' &&
                        !!invitation?.visitor_period_start;

                      const endLocked =
                        endItem.remarks === 'visitor_period_end' &&
                        !!invitation?.visitor_period_end;

                      return (
                        <Box sx={{ width: '100%' }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {startItem.long_display_text}
                                  {startItem.mandatory && (
                                    <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                                      *
                                    </Typography>
                                  )}
                                </Typography>

                                <Tooltip title={t('visitorPeriodStart')} arrow placement="top">
                                  <IconInfoCircle
                                    size={20}
                                    style={{ color: '#1976d2', cursor: 'pointer' }}
                                  />
                                </Tooltip>
                              </Box>

                              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                                <DateTimePicker
                                  disabled={startLocked}
                                  value={
                                    startItem.answer_datetime
                                      ? dayjs.utc(startItem.answer_datetime).local()
                                      : null
                                  }
                                  open={openStartPicker}
                                  onOpen={() => setOpenStartPicker(true)}
                                  onClose={() => setOpenStartPicker(false)}
                                  ampm={false}
                                  onChange={(newValue) => {
                                    if (newValue) {
                                      const utc = newValue.utc().format();
                                      onChange(startIndex, 'answer_datetime', utc);
                                      clearFieldError(startKey);

                                      if (
                                        endItem.answer_datetime &&
                                        dayjs(endItem.answer_datetime).isBefore(newValue)
                                      ) {
                                        onChange(endIndex, 'answer_datetime', '');
                                      }
                                    }
                                  }}
                                  format="dddd, DD MMMM YYYY, HH:mm"
                                  viewRenderers={{
                                    hours: renderTimeViewClock,
                                    minutes: renderTimeViewClock,
                                    seconds: renderTimeViewClock,
                                  }}
                                  slotProps={{
                                    actionBar: {
                                      actions: ['clear', 'accept'],
                                    },
                                    textField: {
                                      fullWidth: true,
                                      error: !!startError,
                                      helperText: startError,
                                      onClick: () => {
                                        setOpenStartPicker(true);
                                      },
                                      sx: {
                                        '& .MuiInputBase-root.Mui-disabled': {
                                          backgroundColor: '#f3f4f6',
                                        },
                                        '& .MuiInputBase-input.Mui-disabled': {
                                          WebkitTextFillColor: '#909294ff',
                                        },
                                        '& .MuiFormHelperText-root': {
                                          marginLeft: 0,
                                        },
                                      },
                                    },
                                  }}
                                />
                              </LocalizationProvider>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {endItem.long_display_text}
                                  {endItem.mandatory && (
                                    <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                                      *
                                    </Typography>
                                  )}
                                </Typography>

                                <Tooltip title={t('visitorPeriodEnd')} arrow placement="top">
                                  <IconInfoCircle
                                    size={20}
                                    style={{ color: '#1976d2', cursor: 'pointer' }}
                                  />
                                </Tooltip>
                              </Box>

                              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                                <DateTimePicker
                                  disabled={endLocked}
                                  open={openEndPicker}
                                  onOpen={() => setOpenEndPicker(true)}
                                  onClose={() => setOpenEndPicker(false)}
                                  value={
                                    endItem.answer_datetime
                                      ? dayjs.utc(endItem.answer_datetime).local()
                                      : null
                                  }
                                  ampm={false}
                                  minDateTime={
                                    startItem.answer_datetime
                                      ? dayjs(startItem.answer_datetime)
                                      : undefined
                                  }
                                  onChange={(newValue) => {
                                    if (newValue) {
                                      const utc = newValue.utc().format();
                                      onChange(endIndex, 'answer_datetime', utc);
                                      clearFieldError(endKey);
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
                                      error: !!endError,
                                      helperText: endError,
                                      onClick: () => {
                                        setOpenEndPicker(true);
                                      },
                                      sx: {
                                        '& .MuiInputBase-root.Mui-disabled': {
                                          backgroundColor: '#f3f4f6',
                                        },
                                        '& .MuiInputBase-input.Mui-disabled': {
                                          WebkitTextFillColor: '#909294ff',
                                        },
                                        '& .MuiFormHelperText-root': {
                                          marginLeft: 0,
                                        },
                                      },
                                    },
                                  }}
                                />
                              </LocalizationProvider>
                            </Grid>
                          </Grid>
                        </Box>
                      );
                    }
                    if (remark === 'visitor_period_end') {
                      return null;
                    }
                    return (
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                        <DateTimePicker
                          disabled={isLockedByInvitation}
                          value={
                            item.answer_datetime ? dayjs.utc(item.answer_datetime).local() : null
                          }
                          ampm={false}
                          onChange={(newValue) => {
                            if (newValue) {
                              const utc = newValue.utc().format();
                              onChange(originalIndex, 'answer_datetime', utc);
                              clearFieldError(key);
                            }
                          }}
                          format="dddd, DD MMMM YYYY, HH:mm"
                          viewRenderers={{
                            hours: renderTimeViewClock,
                            minutes: renderTimeViewClock,
                            seconds: renderTimeViewClock,
                          }}
                          slotProps={{
                            actionBar: {
                              actions: ['today', 'clear', 'accept'],
                            },
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
                                '& .MuiFormHelperText-root': {
                                  marginLeft: 0,
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    );

                  case 10: {
                    // TakePicture (Assuming image capture from device camera)
                    const remark = (item.remarks || '').toLowerCase();
                    const isUploading = !!uploadingFiles[key];

                    if (remark == 'selfie_image') {
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
                                fileInputRef.current?.click();
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
                                  onChange(originalIndex, 'answer_file', url);

                                  if (url) {
                                    clearFieldError(key);
                                  }
                                },
                                key,
                              );
                            }}
                          >
                            <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
                            <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
                              Upload File
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ my: 1 }}>
                              Drag and drop or tap to select file.
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="body1" color="textSecondary">
                                Supports: JPG, PNG, JPEG, Up to
                                <span style={{ fontWeight: '700' }}> 5 MB or </span>
                              </Typography>

                              <Typography
                                variant="h6"
                                component="span"
                                color="primary"
                                sx={{
                                  fontWeight: 600,
                                  ml: 1,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenCamera(true);
                                }}
                              >
                                <IconCamera /> Use Camera
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

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    mt: 0.75,
                                  }}
                                >
                                  Uploading file...
                                </Typography>
                              </Box>
                            )}
                            <input
                              id={`file-${key}`}
                              type="file"
                              // accept="*"
                              accept="image/jpeg,image/png,image/jpg"
                              hidden
                              ref={fileInputRef}
                              onChange={(e) => {
                                handleFileChangeForField(
                                  e.target.files?.[0],
                                  (url) => {
                                    onChange(originalIndex, 'answer_file', url);

                                    if (url) {
                                      clearFieldError(key);
                                    }
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
                                        width: lg ? 350 : 220,
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
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        handleRemoveFileForField(
                                          (item as any).answer_file,
                                          (url) => onChange(originalIndex, 'answer_file', url),
                                          key,
                                        );
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

                          {errorMessage && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 1, display: 'block' }}
                            >
                              {errorMessage}
                            </Typography>
                          )}
                          <CameraDialog
                            open={openCamera}
                            onClose={() => setOpenCamera(false)}
                            webcamRef={webcamRef as any}
                            screenshot={screenshot}
                            facingMode={facingMode}
                            isUploading={isUploading}
                            onSwitchCamera={() =>
                              setFacingMode((prev) =>
                                prev === 'environment' ? 'user' : 'environment',
                              )
                            }
                            onCapture={() =>
                              handleCaptureForField(
                                (url) => onChange(originalIndex, 'answer_file', url),
                                key,
                              )
                            }
                            onClear={() =>
                              handleRemoveFileForField(
                                (item as any).answer_file,
                                (url) => onChange(originalIndex, 'answer_file', url),
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
                    }
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
                            hidden
                            ref={fileInputRef}
                            accept="image/jpg,image/jpeg,image/png"
                            disabled={!!uploadingFiles[key]}
                            onChange={(e) => {
                              handleFileChangeForField(
                                e.target.files?.[0],
                                (url) => {
                                  onChange(index, 'answer_file', url);

                                  if (url) {
                                    clearFieldError(key);
                                  }
                                },
                                key,
                              );

                              e.target.value = '';
                            }}
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
                                    width: lg ? 300 : 220,
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
                                      (url) => onChange(originalIndex, 'answer_file', url),
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

                        <CameraDialog
                          open={openCamera}
                          onClose={() => setOpenCamera(false)}
                          webcamRef={webcamRef as any}
                          screenshot={screenshot}
                          facingMode={facingMode}
                          isUploading={isUploading}
                          onSwitchCamera={() =>
                            setFacingMode((prev) =>
                              prev === 'environment' ? 'user' : 'environment',
                            )
                          }
                          onCapture={() =>
                            handleCaptureForField(
                              (url) => onChange(originalIndex, 'answer_file', url),
                              key,
                            )
                          }
                          onClear={() =>
                            handleRemoveFileForField(
                              (item as any).answer_file,
                              (url) => onChange(originalIndex, 'answer_file', url),
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
                  }

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
                            Supports: JPG, JPEG, PNG, Up to
                            <span style={{ fontWeight: 'semibold' }}> 5 MB</span>
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
                                        (url) => onChange(originalIndex, 'answer_file', url),
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
                            transition: 'all 0.2s ease',
                          }}
                          onClick={() => {
                            if (!isUploading) {
                              fileInputRef.current?.click();
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
                                onChange(originalIndex, 'answer_file', url);

                                if (url) {
                                  clearFieldError(key);
                                }
                              },
                              key,
                            );
                          }}
                        >
                          <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
                          <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
                            Upload File
                          </Typography>
                          <Typography variant="body1" color="textSecondary" sx={{ my: 1 }}>
                            {t('dragDropOrTapToSelectFile')}
                          </Typography>
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Typography variant="body1" color="textSecondary">
                              Supports: JPG, PNG, JPEG, Up to
                              <span style={{ fontWeight: '700' }}> 5 MB or </span>
                            </Typography>

                            <Typography
                              variant="h6"
                              component="span"
                              color="primary"
                              sx={{
                                fontWeight: 600,
                                ml: 1,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenCamera(true);
                              }}
                            >
                              <IconCamera /> Use Camera
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

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mt: 0.75 }}
                              >
                                Uploading file...
                              </Typography>
                            </Box>
                          )}

                          <input
                            id={`file-${key}`}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            hidden
                            ref={fileInputRef}
                            onChange={(e) => {
                              handleFileChangeForField(
                                e.target.files?.[0],
                                (url) => {
                                  onChange(originalIndex, 'answer_file', url);

                                  if (url) {
                                    clearFieldError(key);
                                  }
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
                                      // width: 350,
                                      // height: 200,
                                      width: lg ? 350 : 220,
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
                                    onClick={(e: any) => {
                                      e.stopPropagation();
                                      handleRemoveFileForField(
                                        (item as any).answer_file,
                                        (url) => onChange(originalIndex, 'answer_file', url),
                                        key,
                                      );
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

                        {errorMessage && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: 'block' }}
                          >
                            {errorMessage}
                          </Typography>
                        )}

                        <CameraDialog
                          open={openCamera}
                          onClose={() => setOpenCamera(false)}
                          webcamRef={webcamRef as any}
                          screenshot={screenshot}
                          facingMode={facingMode}
                          isUploading={isUploading}
                          onSwitchCamera={() =>
                            setFacingMode((prev) =>
                              prev === 'environment' ? 'user' : 'environment',
                            )
                          }
                          onCapture={() =>
                            handleCaptureForField(
                              (url) => onChange(originalIndex, 'answer_file', url),
                              key,
                            )
                          }
                          onClear={() =>
                            handleRemoveFileForField(
                              (item as any).answer_file,
                              (url) => onChange(originalIndex, 'answer_file', url),
                              key,
                            )
                          }
                          onSubmit={() => setOpenCamera(false)}
                        />
                      </Box>
                    );
                  }
                  default:
                    return (
                      <TextField
                        size="small"
                        value={item.long_display_text}
                        onChange={(e) =>
                          onChange(originalIndex, 'long_display_text', e.target.value)
                        }
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
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: 2000 }}
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
    </>
  );
};

export default RenderDetailRows;
