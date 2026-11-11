import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Divider,
  IconButton,
  FormControl,
  RadioGroup,
  Paper,
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import { IconX } from '@tabler/icons-react';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(timezone);

dayjs.locale('id');

const PreviewDialog = ({
  open,
  onClose,
  onConfirm,
  invitationData,
  formValues,
  sites,
  employee,
  invitation,
  isGroup = false,
  groupVisitors = [],
  vehicleOptions = [],
}: any) => {
  const sections = invitationData?.question_page ?? [];

  const formatDateTime = (value: string | null) => {
    if (!value) return '-';

    return dayjs.utc(value).local().format('dddd, DD MMMM YYYY, HH:mm');
  };

  // const resolveValue = (f: any) => {
  //   const raw = f.answer_text ?? f.answer_datetime ?? f.answer_file ?? null;
  //   if (!raw) return null;
  //   // HOST
  //   if (f.remarks === 'host') {
  //     const host = invitation?.host || employee?.find((e: any) => e.id === raw);

  //     return host?.name || raw;
  //   }
  //   // SITE
  //   if (f.remarks === 'site_place') {
  //     const site = invitation?.site || sites?.find((s: any) => s.id === raw);
  //     return site?.name || raw;
  //   }
  //   // RADIO / DROPDOWN
  //   if (f.multiple_option_fields?.length) {
  //     const opt = f.multiple_option_fields.find((o: any) => String(o.value) === String(raw));

  //     return opt?.name || raw;
  //   }
  //   return raw;
  // };

  // const resolveValue = (f: any, visitor: any) => {
  //   const raw = f.answer_text ?? f.answer_datetime ?? f.answer_file ?? null;

  //   if (raw == null || raw === '') return null;

  //   if (f.remarks === 'host') {
  //     const host =
  //       visitor?.host_data || invitation?.host || employee?.find((e: any) => e.id === raw);

  //     return host?.name || raw;
  //   }

  //   if (f.remarks === 'site_place') {
  //     const site = visitor?.site || invitation?.site || sites?.find((s: any) => s.id === raw);

  //     return site?.name || raw;
  //   }

  //   if (f.multiple_option_fields?.length) {
  //     const opt = f.multiple_option_fields.find((o: any) => String(o.value) === String(raw));

  //     return opt?.name || raw;
  //   }

  //   return raw;
  // };

  const getVehicleTypeName = (vehicleId: any) => {
    const selected = vehicleOptions.find(
      (opt: any) => String(opt.value ?? opt.id).toLowerCase() === String(vehicleId).toLowerCase(),
    );

    return selected?.name ?? vehicleId;
  };

  const resolveValue = (f: any, visitor: any) => {
    const raw = f.answer_text ?? f.answer_datetime ?? f.answer_file ?? null;

    if (raw == null || raw === '') return null;

    if (f.remarks === 'host') {
      const host =
        visitor?.host_data ||
        invitation?.host ||
        employee?.find((e: any) => String(e.id) === String(raw));

      return host?.name || raw;
    }

    if (f.remarks === 'site_place') {
      const site =
        visitor?.site || invitation?.site || sites?.find((s: any) => String(s.id) === String(raw));

      return site?.name || raw;
    }

    if (f.multiple_option_fields?.length) {
      const opt = f.multiple_option_fields.find(
        (o: any) => String(o.id) === String(raw) || String(o.value) === String(raw),
      );

      return opt?.name ?? raw;
    }

    return raw;
  };

  // const visitors = isGroup ? (invitationData?.data_visitor ?? []) : [invitationData];
  const visitors = isGroup ? groupVisitors : [invitationData];
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {t('previewInvitation')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('reviewVisitorInformationBeforeSubmitting')}
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

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {visitors.map((visitor: any, visitorIdx: number) => {
            const sections = visitor?.question_page ?? [];

            return (
              <Paper key={visitorIdx} variant="outlined">
                {/* Visitor Header */}
                {isGroup && (
                  <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Visitor {visitorIdx + 1}
                    </Typography>
                  </Box>
                )}

                {/* {sections.map((section: any, sIdx: number) => (
                  <Box key={sIdx} mb={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {section.name}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}> */}

                {sections.map((section: any, sIdx: number) => (
                  <Box key={sIdx} mb={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {section.name}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      {section.form.map((f: any, idx: number) => {
                        let value = resolveValue(f, visitor);

                        if (f.remarks === 'host') {
                          value = visitor?.host_data?.name || value;
                        } else if (f.remarks === 'site_place') {
                          value = visitor?.site_place_name || value;
                        } else if (f.remarks === 'vehicle_id') {
                          value = getVehicleTypeName(f.answer_text);
                        }

                        const displayValue =
                          value === null || value === undefined || value === ''
                            ? '—'
                            : String(value);

                        if (['visitor_period_start', 'visitor_period_end'].includes(f.remarks)) {
                          return (
                            <Grid item xs={12} sm={6} key={idx}>
                              <Typography variant="caption" color="text.secondary">
                                {f.long_display_text}
                              </Typography>
                              <Typography>{value ? formatDateTime(value) : '—'}</Typography>
                            </Grid>
                          );
                        }
                        if (f.remarks === 'is_driving') {
                          const answer = f.answer_text;

                          const isDriving = ['true', 'yes', '1'].includes(
                            String(answer).trim().toLowerCase(),
                          );

                          return (
                            <Grid item xs={12} sm={6} key={idx}>
                              <Typography variant="caption" color="text.secondary">
                                {f.long_display_text}
                              </Typography>
                              <Typography>
                                {answer == null || answer === '' ? '—' : isDriving ? 'Yes' : 'No'}
                              </Typography>
                            </Grid>
                          );
                        }

                        return (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Typography variant="caption" color="text.secondary">
                              {f.long_display_text}
                            </Typography>

                            {[10, 11, 12].includes(f.field_type) && value ? (
                              /\.(jpg|jpeg|png)$/i.test(String(value)) ? (
                                <Box mt={1}>
                                  <img
                                    src={`${axiosInstance2.defaults.baseURL}/cdn${value}`}
                                    alt={f.remarks}
                                    style={{
                                      width: '100%',
                                      maxHeight: 200,
                                      objectFit: 'cover',
                                      borderRadius: 8,
                                    }}
                                  />
                                </Box>
                              ) : (
                                <Typography variant="body2" color="primary" mt={0.5}>
                                  <a href={String(value)} target="_blank" rel="noopener noreferrer">
                                    View Document
                                  </a>
                                </Typography>
                              )
                            ) : (
                              <Typography variant="body1">{displayValue}</Typography>
                            )}
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}
                {/* </Grid>
                  </Box>
                ))} */}

                {isGroup && visitorIdx < visitors.length - 1 && (
                  <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
                )}
              </Paper>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Back</Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirm & Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewDialog;
