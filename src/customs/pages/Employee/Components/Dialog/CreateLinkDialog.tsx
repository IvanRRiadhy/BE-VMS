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
  Select,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface Props {
  open: boolean;
  onClose: () => void;
  onSendEmail: () => void;
}
type FieldKey =
  | 'visitorType'
  | 'visitorQty'
  | 'destination'
  | 'agenda'
  | 'visitStart'
  | 'visitEnd'
  | 'expiredLink'
  | 'visitorQuota';

const CreateLinkDialog = ({ open, onClose, onSendEmail }: Props) => {
  const [enabled, setEnabled] = useState<Record<FieldKey, boolean>>({
    visitorType: false,
    visitorQty: false,
    destination: false,
    agenda: false,
    visitStart: false,
    visitEnd: false,
    expiredLink: false,
    visitorQuota: false,
  });

  const handleToggle = (key: FieldKey, checked: boolean) => {
    setEnabled((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const renderField = (key: FieldKey, label: string, type: string = 'text') => (
    <Grid size={{ xs: 12, md: 6 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <CustomFormLabel sx={{ marginTop: 0 }}>{label}</CustomFormLabel>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={enabled[key]}
              onChange={(e) => handleToggle(key, e.target.checked)}
            />
          }
          label=""
          labelPlacement="start"
        />
      </Stack>

      <CustomTextField type={type} fullWidth disabled={!enabled[key]} sx={{ mt: 1 }} />
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create Link Invitation</DialogTitle>

      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {renderField('visitorType', 'Visitor Type')}
          {renderField('visitorQty', 'Visitor Quantity')}
          {renderField('destination', 'Destination')}
          {renderField('agenda', 'Agenda')}
          {renderField('visitStart', 'Visit Start', 'date')}
          {renderField('visitEnd', 'Visit End', 'date')}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Expired Link</CustomFormLabel>

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={enabled.expiredLink}
                    onChange={(e) => handleToggle('expiredLink', e.target.checked)}
                  />
                }
                label=""
                labelPlacement="start"
              />
            </Stack>

            <CustomSelect fullWidth sx={{ mt: 1 }} disabled={!enabled.expiredLink}>
              <MenuItem value={0}>No Expired</MenuItem>
              <MenuItem value={30}>30 Min</MenuItem>
              <MenuItem value={60}>1 Hour</MenuItem>
              <MenuItem value={300}>5 Hour</MenuItem>
              <MenuItem value={1440}>1 Day</MenuItem>
              <MenuItem value={10080}>7 Days</MenuItem>
              <MenuItem value={43200}>30 Days</MenuItem>
              <MenuItem value={129600}>3 Month</MenuItem>
              <MenuItem value={259200}>6 Month</MenuItem>
              <MenuItem value={525600}>1 Year</MenuItem>
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <CustomFormLabel sx={{ marginTop: 0 }}>Visitor Quota Limit</CustomFormLabel>

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={enabled.visitorQuota}
                    onChange={(e) => handleToggle('visitorQuota', e.target.checked)}
                  />
                }
                label=""
                labelPlacement="start"
              />
            </Stack>

            <CustomTextField
              fullWidth
              type="number"
              disabled={!enabled.visitorQuota}
              sx={{ mt: 1 }}
              inputProps={{
                min: 0,
                step: 1,
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />

            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Enter the maximum number of visitors allowed. Use 0 for no limit.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" fullWidth>
          Create Link
        </Button>

        <Button variant="outlined" fullWidth onClick={onSendEmail}>
          Create Link And Send Email
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateLinkDialog;
