import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  IconButton,
  Grid2 as Grid,
  MenuItem,
  Typography,
  Autocomplete,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { getInvitationSite, getInvitationVisitorType } from 'src/customs/api/Admin/InvitationData';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import utc from 'dayjs/plugin/utc';
import useInvitationSite from 'src/hooks/useInvitationSite';
import useInvitationVisitorType from 'src/hooks/useInvitationVisitorType';
import { useEmployees } from 'src/hooks/useEmployees';

dayjs.extend(utc);

interface Props {
  open: boolean;
  onClose: () => void;
  onCreateLink: (payload: any) => void;
  onSendEmail: (payload: any) => void;
}

type FieldKey =
  | 'visitorType'
  | 'agenda'
  | 'visitStart'
  | 'visitEnd'
  | 'expiredLink'
  | 'visitorQuota'
  | 'site'
  | 'host';

const CreateLinkDialog = ({ open, onClose, onSendEmail, onCreateLink }: Props) => {
  const { token } = useSession();
  const { employee } = useEmployees(token);
  const { sitesOperator } = useInvitationSite(token);
  const { visitorType } = useInvitationVisitorType(token);

  const initialEnabledState = {
    visitorType: false,
    agenda: false,
    visitStart: false,
    visitEnd: false,
    expiredLink: false,
    visitorQuota: false,
    site: false,
    host: false,
  };

  const initialFormState = {
    host: null,
    site_id: null,
    visitor_type_id: null,
    agenda: '',
    visitor_period_start: null,
    visitor_period_end: null,
    expired_number: 0,
    max_usage: 0,
    is_single_use: false,
  };

  const [form, setForm] = useState({
    host: null as any,
    site_id: null as any,
    visitor_type_id: null as any,
    agenda: '',
    visitor_period_start: null as string | null,
    visitor_period_end: null as string | null,
    expired_number: 0,
    max_usage: 0,
    is_single_use: false,
  });

  const [enabled, setEnabled] = useState(initialEnabledState);

  const resetState = () => {
    setEnabled(initialEnabledState);
    setForm(initialFormState);
  };

  const handleToggle = (key: FieldKey, checked: boolean) => {
    setEnabled((prev) => ({ ...prev, [key]: checked }));
  };

  const buildPayload = () => {
    return {
      host: enabled.host ? (form.host?.id ?? null) : null,
      agenda: enabled.agenda ? form.agenda : null,
      visitor_type_id: enabled.visitorType ? (form.visitor_type_id?.id ?? null) : null,
      site_id: enabled.site ? form.site_id : null,
      visitor_period_start: enabled.visitStart ? form.visitor_period_start : null,
      visitor_period_end: enabled.visitEnd ? form.visitor_period_end : null,
      // link_active_at: new Date().toISOString(),
      expired_number: enabled.expiredLink ? form.expired_number : 0,
      max_usage: enabled.visitorQuota ? form.max_usage : 0,
      is_single_use: form.is_single_use,
      // tz: 'Asia/Jakarta',
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  };

  const handleCreateLink = (sendEmail: boolean) => {
    try {
      const payload = buildPayload();
      // console.log('payload', payload);

      if (sendEmail) {
        onSendEmail(payload);
      } else {
        onCreateLink(payload);
      }

      resetState();
      // onClose();
    } catch (error) {
      showSwal('error', 'Failed to create link');
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        Create Link Invitation
        <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <IconX />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Host</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.host}
                onChange={(e) => handleToggle('host', e.target.checked)}
              />
            </Stack>
            <Autocomplete
              disabled={!enabled.host}
              options={employee}
              getOptionLabel={(option: any) => option.name ?? ''}
              value={form.host}
              onChange={(_, value) => setForm((prev) => ({ ...prev, host: value }))}
              renderInput={(params) => <CustomTextField {...params} placeholder="Select Host" />}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Site</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.site}
                onChange={(e) => handleToggle('site', e.target.checked)}
              />
            </Stack>

            <Autocomplete
              // multiple
              size="small"
              disabled={!enabled.site}
              options={sitesOperator}
              getOptionLabel={(option: any) => option.name ?? ''}
              value={sitesOperator.find((s) => s.id === form.site_id) || null}
              onChange={(_, value) => {
                setForm((prev) => ({ ...prev, site_id: value?.id }));
              }}
              renderInput={(params) => (
                <CustomTextField {...params} placeholder="Select Site" fullWidth />
              )}
            />
          </Grid>

          {/* VISITOR TYPE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Visitor Type</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.visitorType}
                onChange={(e) => handleToggle('visitorType', e.target.checked)}
              />
            </Stack>

            <Autocomplete
              disabled={!enabled.visitorType}
              options={visitorType}
              getOptionLabel={(option: any) => option.name ?? ''}
              value={form.visitor_type_id}
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  visitor_type_id: value,
                }))
              }
              renderInput={(params) => (
                <CustomTextField {...params} placeholder="Select Visitor Type" sx={{ mt: 1 }} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }} required>
                Agenda
              </CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.agenda}
                onChange={(e) => handleToggle('agenda', e.target.checked)}
              />
            </Stack>

            <CustomTextField
              fullWidth
              disabled={!enabled.agenda}
              sx={{ mt: 1 }}
              placeholder="Enter your agenda"
              value={form.agenda}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  agenda: e.target.value,
                }))
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Visit Start</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.visitStart}
                onChange={(e) => handleToggle('visitStart', e.target.checked)}
              />
            </Stack>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
              <DateTimePicker
                disabled={!enabled.visitStart}
                ampm={false}
                format="dddd, DD MMMM YYYY, HH:mm"
                value={form.visitor_period_start ? dayjs(form.visitor_period_start) : null}
                onChange={(newValue) => {
                  setForm((prev) => ({
                    ...prev,
                    visitor_period_start: newValue ? newValue.utc().format() : null,
                  }));
                }}
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
                    sx: {
                      mt: 1,
                      '& .MuiInputBase-root.Mui-disabled': {
                        backgroundColor: '#f0f0f0',
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>

            {/* <CustomTextField
              type="datetime-local"
              fullWidth
              disabled={!enabled.visitStart}
              sx={{ mt: 1 }}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  visitor_period_start: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                }))
              }
            /> */}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Visit End</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.visitEnd}
                onChange={(e) => handleToggle('visitEnd', e.target.checked)}
              />
            </Stack>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
              <DateTimePicker
                disabled={!enabled.visitEnd}
                ampm={false}
                format="dddd, DD MMMM YYYY, HH:mm"
                value={form.visitor_period_end ? dayjs(form.visitor_period_end) : null}
                minDateTime={
                  form.visitor_period_start ? dayjs(form.visitor_period_start) : undefined
                }
                onChange={(newValue) => {
                  setForm((prev) => ({
                    ...prev,
                    visitor_period_end: newValue ? newValue.utc().format() : null,
                  }));
                }}
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
                    sx: {
                      mt: 1,
                      '& .MuiInputBase-root.Mui-disabled': {
                        backgroundColor: '#f0f0f0',
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>

            {/* <CustomTextField
              type="datetime-local"
              fullWidth
              disabled={!enabled.visitEnd}
              sx={{ mt: 1 }}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  visitor_period_end: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                }))
              }
            /> */}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Expired Link</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.expiredLink}
                onChange={(e) => handleToggle('expiredLink', e.target.checked)}
              />
            </Stack>

            <CustomSelect
              fullWidth
              disabled={!enabled.expiredLink}
              sx={{
                mt: 1,
                '&.Mui-disabled': {
                  backgroundColor: '#f0f0f0',
                },
              }}
              value={form.expired_number}
              onChange={(e: any) =>
                setForm((prev) => ({
                  ...prev,
                  expired_number: Number(e.target.value),
                }))
              }
            >
              <MenuItem value={0}>No Expired</MenuItem>
              <MenuItem value={30}>30 Min</MenuItem>
              <MenuItem value={60}>1 Hour</MenuItem>
              <MenuItem value={300}>5 Hour</MenuItem>
              <MenuItem value={1440}>1 Day</MenuItem>
              <MenuItem value={4320}>3 Days</MenuItem>
              <MenuItem value={10080}>7 Days</MenuItem>
              {/*  <MenuItem value={43200}>30 Days</MenuItem>
              <MenuItem value={129600}>3 Month</MenuItem>
              <MenuItem value={259200}>6 Month</MenuItem>
              <MenuItem value={525600}>1 Year</MenuItem> */}
            </CustomSelect>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Visitor Quota Limit</CustomFormLabel>
              <Switch
                size="small"
                checked={enabled.visitorQuota}
                onChange={(e) => handleToggle('visitorQuota', e.target.checked)}
              />
            </Stack>

            <CustomTextField
              type="text"
              fullWidth
              // disabled={!enabled.visitorQuota}
              disabled={!enabled.visitorQuota || form.is_single_use}
              sx={{
                mt: 1,
                '&.Mui-disabled': {
                  backgroundColor: '#f0f0f0',
                },
              }}
              value={form.max_usage}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  max_usage: Number(e.target.value),
                }))
              }
            />

            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Enter the maximum number of visitors allowed. Use 0 for no limit.
            </Typography>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              // <Switch
              //   size="small"
              //   checked={form.is_single_use}
              //   onChange={(e) => setForm((prev) => ({ ...prev, is_single_use: e.target.checked }))}
              // />
              <Switch
                size="small"
                checked={form.is_single_use}
                onChange={(e) => {
                  const checked = e.target.checked;

                  setForm((prev) => ({
                    ...prev,
                    is_single_use: checked,
                    max_usage: checked ? 1 : 0,
                  }));

                  // optional: aktif/nonaktif otomatis toggle quota
                  setEnabled((prev) => ({
                    ...prev,
                    visitorQuota: checked ? true : false,
                  }));
                }}
              />
            }
            label="Single Use Link"
          />
          <br />
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Enable this option to allow the link to be used only once. After the first use, the link
            will become inactive.
          </Typography>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" fullWidth onClick={() => handleCreateLink(false)}>
          Create Link
        </Button>

        <Button variant="outlined" fullWidth onClick={() => handleCreateLink(true)}>
          Create Link And Send Email
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateLinkDialog;
