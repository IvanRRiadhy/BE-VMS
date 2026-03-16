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
}: any) => {
  const sections = invitationData?.question_page ?? [];

  const formatDateTime = (value: string | null) => {
    if (!value) return '-';

    return dayjs.utc(value).local().format('dddd, DD MMMM YYYY, HH:mm');
  };

  const resolveValue = (f: any) => {
    const raw = f.answer_text ?? f.answer_datetime ?? f.answer_file ?? null;

    if (!raw) return null;

    // HOST
    if (f.remarks === 'host') {
      const host = invitation?.host || employee?.find((e: any) => e.id === raw);

      return host?.name || raw;
    }

    // SITE
    if (f.remarks === 'site_place') {
      const site = invitation?.site || sites?.find((s: any) => s.id === raw);

      return site?.name || raw;
    }

    // RADIO / DROPDOWN
    if (f.multiple_option_fields?.length) {
      const opt = f.multiple_option_fields.find((o: any) => String(o.value) === String(raw));

      return opt?.name || raw;
    }

    return raw;
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Preview Invitation
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
        {sections.map((section: any, sIdx: number) => (
          <Box key={sIdx} mb={3}>
            <Typography variant="h6" gutterBottom>
              {section.name}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {section.form.map((f: any, idx: number) => {
                // let value = formValues[f.remarks];

                // if (!value) return null;
                // let value = f.answer_text ?? f.answer_datetime ?? f.answer_file ?? null;
                let value = resolveValue(f);

                if (!value) return null;

                if (f.remarks === 'host') {
                  value = invitationData?.host_data?.name || value;
                } else if (f.remarks === 'site_place') {
                  value = invitationData?.site_place_name || value;
                }
                if (['visitor_period_start', 'visitor_period_end'].includes(f.remarks)) {
                  const utcValue = value ? value + 'Z' : value;
                  return (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Typography variant="caption" color="text.secondary">
                        {f.long_display_text}
                      </Typography>
                      <Typography>{formatDateTime(value)}</Typography>
                    </Grid>
                  );
                }
                if (f.remarks === 'is_driving') {
                  return (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Typography variant="caption" color="text.secondary">
                        {f.long_display_text}
                      </Typography>
                      <Typography>{formValues[f.remarks] == 'true' ? 'Yes' : 'No'}</Typography>
                    </Grid>
                  );
                }

                return (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Typography variant="caption" color="text.secondary">
                      {f.long_display_text}
                    </Typography>

                    {/* FILE / IMAGE */}
                    {[10, 11, 12].includes(f.field_type) ? (
                      value.match(/\.(jpg|jpeg|png)$/i) ? (
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
                        <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                          <a href={value} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Typography>
                      )
                    ) : (
                      <Typography variant="body1">{String(value)}</Typography>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}
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
