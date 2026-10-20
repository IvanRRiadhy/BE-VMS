import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack, CheckCircleOutline } from '@mui/icons-material';
import { IconX } from '@tabler/icons-react';

import dayjs from 'dayjs';
import 'dayjs/locale/id';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import { axiosInstance2 } from 'src/customs/api/interceptor';

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(timezone);

dayjs.locale('id');

interface PreviewInvitationProps {
  open: boolean;
  payload: any;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sites?: any[];
  employee?: any[];
}

const displayValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '—';

  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  if (Array.isArray(value)) {
    return value.map(displayValue).join(', ');
  }

  if (typeof value === 'object') {
    return String(value.label ?? value.name ?? value.title ?? value.value ?? JSON.stringify(value));
  }

  return String(value);
};

const formatDateTime = (value: any): string => {
  if (!value) return '—';

  const date = dayjs.utc(value);

  if (!date.isValid()) return String(value);

  return date.local().format('dddd, DD MMMM YYYY, HH:mm');
};

const getVisitors = (payload: any) => {
  if (Array.isArray(payload?.list_group)) {
    return payload.list_group.flatMap((group: any, groupIndex: number) =>
      (group.data_visitor ?? []).map((visitor: any, visitorIndex: number) => ({
        ...visitor,
        _groupName: group.group_name || `Group ${groupIndex + 1}`,
        _groupCode: group.group_code,
        _visitorNumber: visitorIndex + 1,
      })),
    );
  }

  if (Array.isArray(payload?.data_visitor)) {
    return payload.data_visitor;
  }

  // Add transaction sends the group payload directly.
  if (Array.isArray(payload?.data_visitor)) {
    return payload.data_visitor;
  }

  return [];
};

const getGroups = (payload: any) => {
  if (Array.isArray(payload?.list_group)) {
    return payload.list_group;
  }

  if (Array.isArray(payload?.data_visitor)) {
    return [payload];
  }

  return [];
};

const PreviewInvitation: React.FC<PreviewInvitationProps> = ({
  open,
  payload,
  loading = false,
  onClose,
  onConfirm,
  sites = [],
  employee = [],
}) => {
  const getFieldAnswer = (field: any): any => {
    const fieldType = Number(field?.field_type);
    const answer = field?.answer_text;

    // Destination / Site Place
    if (field?.remarks === 'site_place') {
      const selectedIds = Array.isArray(answer)
        ? answer.map(String)
        : String(answer ?? '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);

      return selectedIds
        .map((id) => {
          const site = sites.find(
            (item: any) => String(item.id).toLowerCase() === id.toLowerCase(),
          );

          return site?.name ?? site?.site_name ?? id;
        })
        .join(', ');
    }

    // PIC Host
    if (field?.remarks === 'host') {
      const host = employee.find(
        (item: any) => String(item.id).toLowerCase() === String(answer ?? '').toLowerCase(),
      );

      return host?.name ?? answer;
    }

    if (fieldType === 9) {
      return field?.answer_datetime;
    }

    if ([10, 11, 12].includes(fieldType)) {
      return field?.answer_file;
    }

    if ([5, 6, 7].includes(fieldType)) {
      const answer = field?.answer_text;
      const options = field?.multiple_option_fields ?? [];

      if (!Array.isArray(options) || options.length === 0) {
        return answer;
      }

      const selectedValues = Array.isArray(answer)
        ? answer.map(String)
        : String(answer ?? '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

      return selectedValues
        .map((value: string) => {
          const option = options.find((item: any) => String(item?.value) === value);

          return option?.label ?? option?.name ?? value;
        })
        .join(', ');
    }

    return field?.answer_text;
  };
  const groups = getGroups(payload);
  const visitors = getVisitors(payload);
  const isGroup = Boolean(payload?.is_group) || Array.isArray(payload?.list_group);

  const flow =
    payload?.flow ?? (Number(payload?.type_registered) === 0 ? 'Pre-registration' : 'Invitation');

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
    >
      <DialogTitle>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Preview Invitation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review the visitor information before submitting.
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent dividers>
        {!payload || visitors.length === 0 ? (
          <Typography color="text.secondary">No visitor information to preview.</Typography>
        ) : (
          <Stack spacing={2.5}>
            {/* <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Submission type
                  </Typography>
                  <Typography fontWeight={600}>{flow}</Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Chip label={isGroup ? 'Group visitor' : 'Single visitor'} variant="outlined" />
                  <Chip
                    label={`${visitors.length} visitor${visitors.length === 1 ? '' : 's'}`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </Stack>

              {groups.map((group: any, index: number) => (
                <Box key={group.group_code ?? index} sx={{ mt: 1.5 }}>
                  {group.group_name && (
                    <Typography variant="body2">
                      <strong>Group:</strong> {group.group_name}
                    </Typography>
                  )}
                  {group.group_code && (
                    <Typography variant="body2">
                      <strong>Group code:</strong> {group.group_code}
                    </Typography>
                  )}
                  {group.registered_site && (
                    <Typography variant="body2">
                      <strong>Registered site:</strong> {displayValue(group.registered_site)}
                    </Typography>
                  )}
                </Box>
              ))}
            </Paper> */}

            {visitors.map((visitor: any, visitorIndex: number) => (
              <Paper
                key={`${visitor._groupCode ?? 'visitor'}-${visitorIndex}`}
                variant="outlined"
                sx={{ overflow: 'hidden' }}
              >
                <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
                  <Typography fontWeight={700}>
                    {visitor._groupName
                      ? `${visitor._groupName} — Visitor ${visitor._visitorNumber}`
                      : `Visitor ${visitorIndex + 1}`}
                  </Typography>
                </Box>

                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack spacing={2.5}>
                    {(visitor.question_page ?? []).map((section: any, sectionIndex: number) => (
                      <Box key={section.id ?? sectionIndex}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                          {section.name || `Section ${sectionIndex + 1}`}
                        </Typography>

                        {(section.form ?? []).length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No fields in this section.
                          </Typography>
                        ) : (
                          <Grid container spacing={2}>
                            {(section.form ?? []).map((field: any, fieldIndex: number) => {
                              const fieldType = Number(field.field_type);

                              const isVisitorPeriod = [
                                'visitor_period_start',
                                'visitor_period_end',
                              ].includes(field.remarks);
                              const answer = getFieldAnswer(field);
                              const isFile = [10, 11, 12].includes(fieldType);
                              const fileValues = Array.isArray(answer)
                                ? answer
                                : answer
                                  ? [answer]
                                  : [];

                              if (field.remarks === 'is_driving') {
                                const isDriving =
                                  field.answer_text === true ||
                                  String(field.answer_text).toLowerCase() === 'true';

                                return (
                                  <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    key={field.custom_field_id ?? fieldIndex}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mb: 0.5 }}
                                    >
                                      {field.long_display_text || field.short_name || field.remarks}
                                    </Typography>

                                    <Typography sx={{ textTransform: 'capitalize' }}>
                                      {field.answer_text == null || field.answer_text === ''
                                        ? '—'
                                        : isDriving
                                          ? 'Yes'
                                          : 'No'}
                                    </Typography>
                                  </Grid>
                                );
                              }

                              return (
                                <Grid item xs={12} sm={6} key={field.custom_field_id ?? fieldIndex}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                  >
                                    {field.long_display_text ||
                                      field.short_name ||
                                      field.remarks ||
                                      `Field ${fieldIndex + 1}`}
                                  </Typography>

                                  {isFile && fileValues.length > 0 ? (
                                    <Stack spacing={1}>
                                      {fileValues.map((file: any, fileIndex: number) => {
                                        const fileText = displayValue(file);

                                        // Ambil path file jika answer berupa object
                                        const filePath =
                                          typeof file === 'object' && file !== null
                                            ? (file.url ??
                                              file.path ??
                                              file.file_path ??
                                              file.value ??
                                              '')
                                            : fileText;

                                        const isImage = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(
                                          String(filePath),
                                        );

                                        const isUrl = /^https?:\/\//i.test(String(filePath));

                                        const imageSrc = isUrl
                                          ? String(filePath)
                                          : `${axiosInstance2.defaults.baseURL}/cdn${
                                              String(filePath).startsWith('/') ? '' : '/'
                                            }${filePath}`;

                                        return (
                                          <Box key={fileIndex}>
                                            {isImage ? (
                                              <Box
                                                component="img"
                                                src={imageSrc}
                                                alt={field.remarks || 'Attachment'}
                                                sx={{
                                                  display: 'block',
                                                  width: '100%',
                                                  maxWidth: 400,
                                                  maxHeight: 250,
                                                  objectFit: 'contain',
                                                  borderRadius: 2,
                                                  border: '1px solid',
                                                  borderColor: 'divider',
                                                  mt: 0.5,
                                                }}
                                                onError={(e) => {
                                                  e.currentTarget.style.display = 'none';
                                                }}
                                              />
                                            ) : (
                                              <Typography
                                                component="a"
                                                href={isUrl ? String(filePath) : imageSrc}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                variant="body2"
                                                sx={{ overflowWrap: 'anywhere' }}
                                              >
                                                View attachment {fileIndex + 1}
                                              </Typography>
                                            )}
                                          </Box>
                                        );
                                      })}
                                    </Stack>
                                  ) : (
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        whiteSpace: 'pre-wrap',
                                        overflowWrap: 'anywhere',
                                      }}
                                    >
                                      {isVisitorPeriod
                                        ? formatDateTime(answer)
                                        : displayValue(answer)}
                                    </Typography>
                                  )}
                                </Grid>
                              );
                            })}
                          </Grid>
                        )}

                        {sectionIndex < visitor.question_page.length - 1 && (
                          <Divider sx={{ mt: 2 }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} color="secondary">
          Cancel
        </Button>

        <Button
          onClick={onConfirm}
          disabled={loading || visitors.length === 0}
          variant="contained"
          startIcon={<CheckCircleOutline />}
        >
          Confirm & Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewInvitation;
