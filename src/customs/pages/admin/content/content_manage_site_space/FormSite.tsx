import {
  Button,
  Grid2 as Grid,
  Alert,
  Typography,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  DialogActions,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
import { CreateSiteRequest, generateKeyCode } from 'src/customs/api/models/Sites';
import { IconTrash } from '@tabler/icons-react';
import { QRCodeCanvas } from 'qrcode.react';

interface FormSiteProps {
  formData: CreateSiteRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateSiteRequest>>;
  onSuccess?: () => void;
}

const FormSite = ({ formData, setFormData, onSuccess }: FormSiteProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const { token } = useSession();
  const timezoneOptions = [
    { value: 'Asia/Jakarta', label: '(UTC+07:00) WIB (Waktu Indonesia Barat)' },
    { value: 'Asia/Makassar', label: '(UTC+08:00) WITA (Waktu Indonesia Tengah)' },
    { value: 'Asia/Jayapura', label: '(UTC+09:00) WIT (Waktu Indonesia Timur)' },
    // ...add more as needed
  ];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    console.log('Submitting form with data:', formData);
    e.preventDefault();
    setLoading(true);
    setErrors({});
  };
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const handleKeyClick = () => {
    setKeyDialogOpen(true);
  };
  const handleKeyDialogClose = () => setKeyDialogOpen(false);
  const handleRegenerateKey = () => {
    setFormData((prev) => ({ ...prev, code: generateKeyCode() }));
  };

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid>
          {/* Location Details */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Site Access
              </Typography>
              <Button onClick={handleKeyClick}>
                <Typography variant="h6">Key</Typography>
              </Button>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Location Details
              </Typography>
              <CustomFormLabel htmlFor="siteName">Location Name *</CustomFormLabel>
              <CustomTextField
                id="siteName"
                value={formData.siteName}
                onChange={handleChange}
                error={Boolean(errors.siteName)}
                helperText={errors.siteName || ''}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <CustomFormLabel htmlFor="address">Address</CustomFormLabel>
              <CustomTextField
                id="address"
                value={formData.address}
                onChange={handleChange}
                error={Boolean(errors.address)}
                helperText={errors.address || ''}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <CustomFormLabel htmlFor="city">City</CustomFormLabel>
                  <CustomTextField
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <CustomFormLabel htmlFor="province">State</CustomFormLabel>
                  <CustomTextField
                    id="province"
                    value={formData.province}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <CustomFormLabel htmlFor="zipCode">Zip Code</CustomFormLabel>
                  <CustomTextField
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 3 }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          {/* Language and Timezone */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Language and Timezone
              </Typography>
              <CustomFormLabel htmlFor="timeZone">Timezone *</CustomFormLabel>
              <CustomTextField
                id="timeZone"
                select
                value={formData.timeZone}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                SelectProps={{ native: true }}
              >
                <option value="">Select Timezone</option>
                {timezoneOptions.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </CustomTextField>
            </Paper>
            {/* Privacy Policy Configuration */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Privacy Policy Configuration
              </Typography>
              <CustomFormLabel htmlFor="consentType">Consent Type</CustomFormLabel>
              <CustomTextField
                id="consentType"
                select
                value={formData.policyConfig.consentType}
                onChange={(e: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    policyConfig: { ...prev.policyConfig, consentType: e.target.value },
                  }))
                }
                fullWidth
                sx={{ mb: 2 }}
                SelectProps={{ native: true }}
              >
                <option value="explicit">Explicit</option>
                <option value="implicit">Implicit</option>
              </CustomTextField>

              <CustomFormLabel htmlFor="document">Privacy Document</CustomFormLabel>
              <CustomTextField
                id="document"
                value={formData.policyConfig.document}
                onChange={(e: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    policyConfig: { ...prev.policyConfig, document: e.target.value },
                  }))
                }
                fullWidth
                sx={{ mb: 2 }}
              />

              <CustomFormLabel htmlFor="period">Retention Period (In Days)</CustomFormLabel>
              <CustomTextField
                id="period"
                type="number"
                value={formData.policyConfig.period}
                onChange={(e: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    policyConfig: { ...prev.policyConfig, period: Number(e.target.value) },
                  }))
                }
                fullWidth
                sx={{ mb: 10.5 }}
              />
            </Paper>
          </Grid>

          {/* Right-most settings switches */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Settings
              </Typography>
              {[
                { key: 'facialRecog', label: 'Enable Facial Recognition' },
                { key: 'signOutEnable', label: 'Enable Sign Out' },
                { key: 'autoSignOutVisitor', label: 'Auto Sign Out Visitors at Midnight' },
                { key: 'autoSignOutEmployee', label: 'Auto Sign Out Employees at Midnight' },
                { key: 'watchlistCheck', label: 'Enable Watchlist Check' },
                { key: 'contactlessSignin', label: 'Enable Contactless Sign-In' },
                { key: 'employeeSignEnable', label: 'Enable Employee Sign In/Out' },
                { key: 'status', label: 'Status' },
                { key: 'reviewUnregistered', label: 'Review Unregistered Visitors' },
                { key: 'restrictHost', label: 'Restrict Host by Location' },
                { key: 'deliveryDropOff', label: 'Enable Delivery Drop-off on iPad' },
              ].map((setting) => (
                <Box key={setting.key} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ flex: 1, fontSize: 14 }}>{setting.label}</Typography>
                  <Switch
                    checked={formData.settings[setting.key as keyof typeof formData.settings]}
                    onChange={(_, checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, [setting.key]: checked },
                      }))
                    }
                    color="primary"
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
          {/* <Button
            sx={{ mt: 2, width: '25%' }}
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading}
            
            size='large'
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button> */}
        </Grid>
      </form>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          color="primary"
          variant="contained"
          type="submit"
          disabled={loading}
          size="large"
          form="form-site" // optional: if you want to link to a specific form id
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </Box>
      <Dialog open={keyDialogOpen} onClose={handleKeyDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ borderLeft: '4px solid #673ab7', pl: 1, fontWeight: 600 }}>
          Location Key
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
            Location Key Details
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Location Key
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {formData.code}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            QR Code
          </Typography>
          <QRCodeCanvas value={formData.code} size={128} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleKeyDialogClose}>Cancel</Button>
          <Button onClick={handleRegenerateKey} variant="contained" color="primary">
            Re-Generate Key
          </Button>
        </DialogActions>
      </Dialog>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </>
  );
};

export default FormSite;
