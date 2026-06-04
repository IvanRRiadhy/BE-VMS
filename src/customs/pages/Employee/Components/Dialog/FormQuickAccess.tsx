import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid2 as Grid,
  Box,
  Tooltip,
  Select,
  MenuItem,
  Autocomplete,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IconInfoCircle } from '@tabler/icons-react';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface QuickAccessDialogProps {
  open: boolean;
  onClose: () => void;
  form: any;
  handleChange: any;
  visitorProviders: any[];
  allVisitorEmployee: any[];
  dropPoint: any[];
  showVehiclePlate: boolean;
  handleSubmit: () => void;
}

export default function FormQuickAccess({
  open,
  onClose,
  form,
  handleChange,
  visitorProviders,
  allVisitorEmployee,
  dropPoint,
  showVehiclePlate,
  handleSubmit,
}: QuickAccessDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Quick Access
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <CustomFormLabel sx={{ mt: 0 }}>Visitor Provider</CustomFormLabel>

              <Tooltip title="Choose the provider associated with this quick access request." arrow>
                <IconInfoCircle
                  fontSize="small"
                  style={{
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#888',
                  }}
                />
              </Tooltip>
            </Box>

            <Select
              value={form.visitorProviderId}
              onChange={(e) => handleChange('visitorProviderId', e.target.value)}
              fullWidth
            >
              {visitorProviders?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <CustomFormLabel sx={{ mt: 0 }}>Recipient</CustomFormLabel>

              <Tooltip title="Choose who will receive the package." arrow>
                <IconInfoCircle
                  fontSize="small"
                  style={{
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#888',
                  }}
                />
              </Tooltip>
            </Box>

            <Box display="flex" gap={2}>
              <FormControlLabel
                label="Self"
                control={
                  <Switch
                    checked={form.recipientType === 'self'}
                    onChange={() => handleChange('recipientType', 'self')}
                  />
                }
              />

              <FormControlLabel
                label="Others"
                control={
                  <Switch
                    checked={form.recipientType === 'others'}
                    onChange={() => handleChange('recipientType', 'others')}
                  />
                }
              />
            </Box>
          </Grid>

          {form.recipientType === 'others' && (
            <Grid size={12}>
              <CustomFormLabel>Receiver Name</CustomFormLabel>
              <CustomTextField
                fullWidth
                value={form.receiverName}
                onChange={(e) => handleChange('receiverName', e.target.value)}
              />

              <CustomFormLabel>Receiver Email</CustomFormLabel>
              <CustomTextField
                fullWidth
                value={form.receiverEmail}
                onChange={(e) => handleChange('receiverEmail', e.target.value)}
              />

              <CustomFormLabel>Receiver Phone</CustomFormLabel>
              <CustomTextField
                fullWidth
                value={form.receiverPhone}
                onChange={(e) => handleChange('receiverPhone', e.target.value)}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <CustomFormLabel sx={{ mt: 0 }}>Drop Point</CustomFormLabel>
            </Box>

            <Grid container spacing={2}>
              {dropPoint.map((site) => (
                <Grid size={4} key={site.id}>
                  <Paper
                    onClick={() => handleChange('siteId', site.id)}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: form.siteId === site.id ? '2px solid #1976d2' : '1px solid #ddd',
                      bgcolor: form.siteId === site.id ? 'primary.light' : 'background.paper',
                    }}
                  >
                    {site.name}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid size={12}>
            <Typography variant="h6" mb={1}>
              Courier Information
            </Typography>

            <CustomFormLabel>Courier Name</CustomFormLabel>
            <CustomTextField
              fullWidth
              value={form.visitorName}
              onChange={(e) => handleChange('visitorName', e.target.value)}
            />

            <CustomFormLabel>Courier Email</CustomFormLabel>
            <CustomTextField
              fullWidth
              value={form.visitorEmail}
              onChange={(e) => handleChange('visitorEmail', e.target.value)}
            />

            <CustomFormLabel>Courier Phone</CustomFormLabel>
            <CustomTextField
              fullWidth
              value={form.visitorPhone}
              onChange={(e) => handleChange('visitorPhone', e.target.value)}
            />
          </Grid>

          {showVehiclePlate && (
            <Grid size={12}>
              <CustomFormLabel>Vehicle Plate Number</CustomFormLabel>

              <CustomTextField
                fullWidth
                value={form.vehiclePlateNumber}
                onChange={(e) => handleChange('vehiclePlateNumber', e.target.value)}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box display="flex" gap={2} flexWrap="wrap">
              {[10, 15, 30, 60, 120].map((item) => (
                <FormControlLabel
                  key={item}
                  label={`${item} Minutes`}
                  control={
                    <Switch
                      checked={form.duration === item}
                      onChange={() => handleChange('duration', item)}
                    />
                  }
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
