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
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
import { CreateVisitorTypeRequest } from 'src/customs/api/models/VisitorType';
import { IconTrash } from '@tabler/icons-react';

interface FormVisitorTypeProps {
  formData: CreateVisitorTypeRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorTypeRequest>>;
  onSuccess?: () => void;
}

const FormVisitorType: React.FC<FormVisitorTypeProps> = ({ formData, setFormData, onSuccess }) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const { token } = useSession();

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

  const renderDetailRows = (
    details: any,
    onChange: (key: string, field: string, value: any) => void,
    onDelete?: (key: string) => void,
    showMandatory = true,
  ) =>
    Object.entries(details || {}).map(([key, value]: any) => (
      <TableRow key={key}>
        <TableCell>
          {key === 'fullName' ? 'Full Name' : key.charAt(0).toUpperCase() + key.slice(1)}
        </TableCell>
        <TableCell>
          <TextField
            size="small"
            value={value.display}
            onChange={(e) => onChange(key, 'display', e.target.value)}
          />
        </TableCell>
        <TableCell align="center">
          <Switch
            checked={!!value.status}
            onChange={(_, checked) => onChange(key, 'status', checked)}
          />
        </TableCell>
        {showMandatory && (
          <TableCell align="center">
            <Switch
              checked={!!value.mandatory}
              onChange={(_, checked) => onChange(key, 'mandatory', checked)}
            />
          </TableCell>
        )}
        {onDelete && (
          <TableCell align="center">
            <IconButton onClick={() => onDelete(key)} size="small">
              <IconTrash fontSize="small" />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    ));

  const handleDetailChange = (
    section: 'signinDetails' | 'signOutDetails' | 'adminFields',
    key: string,
    field: string,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...((prev[section] as Record<string, any>) || {}),
        [key]: {
          ...(prev[section] as Record<string, any>)?.[key],
          [field]: value,
        },
      },
    }));
  };

  const handleAddDetail = (section: 'signinDetails' | 'signOutDetails' | 'adminFields') => {
    const newKey = window.prompt('Enter field key (e.g. department):');
    if (!newKey) return;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [newKey]: {
          display: '',
          status: true,
          mandatory: true,
        },
      },
    }));
  };

  const handleDeleteDetail = (
    section: 'signinDetails' | 'signOutDetails' | 'adminFields',
    key: string,
  ) => {
    setFormData((prev) => {
      const updated = { ...prev[section] } as { [key: string]: any };
      delete updated[key];
      return { ...prev, [section]: updated };
    });
  };
  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid>
          <Grid size={6}>
            <CustomFormLabel htmlFor="visitor-type">Visitor Type :</CustomFormLabel>
            <CustomTextField
              id="visitorType"
              value={formData.visitorType}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name || ''}
              fullWidth
              required
            />
          </Grid>
          <Grid size={6}>
            <CustomFormLabel htmlFor="canSigned">Legal Document(s) to Sign :</CustomFormLabel>
            <CustomTextField
              id="document"
              value={formData.document}
              onChange={handleChange}
              error={Boolean(errors.document)}
              helperText={errors.document || ''}
              fullWidth
              required
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={6} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Photo</FormLabel>
              <RadioGroup
                id="needPhoto"
                row
                defaultValue={0}
                value={formData.needPhoto === false ? 0 : 1}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    needPhoto: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={6} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Print Badge</FormLabel>
              <RadioGroup
                id="printBadge"
                row
                defaultValue={0}
                value={formData.printBadge === false ? 0 : 1}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    printBadge: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={6} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Issue Guest WiFi Credential</FormLabel>
              <RadioGroup
                id="wifiCred"
                row
                defaultValue={0}
                value={formData.wifiCred === false ? 0 : 1}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    wifiCred: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={6} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Capture Visitor ID</FormLabel>
              <RadioGroup
                id="captureVisitorId"
                row
                defaultValue={0}
                value={formData.captureVisitorId === false ? 0 : 1}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    captureVisitorId: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={6} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Show on iPad</FormLabel>
              <RadioGroup
                id="showIpad"
                row
                defaultValue={0}
                value={formData.showIpad === false ? 0 : 1}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    showIpad: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={6} mt={-3}>
            <CustomFormLabel htmlFor="video-url">Video URL</CustomFormLabel>
            <CustomTextField
              id="videoURL"
              value={formData.videoURL}
              onChange={handleChange}
              error={Boolean(errors.videoURL)}
              helperText={errors.videoURL || ''}
              fullWidth
            />
          </Grid>
          <Grid size={12} mt={-2}>
            <CustomFormLabel htmlFor="welcome-message">Welcome Message</CustomFormLabel>
            <CustomTextField
              id="welcomeMessage"
              value={formData.welcomeMessage}
              onChange={handleChange}
              error={Boolean(errors.welcomeMessage)}
              helperText={errors.welcomeMessage || ''}
              fullWidth
            />
            <Grid size={12}>
              <CustomFormLabel htmlFor="watchlist-message">Watchlist Hit Message</CustomFormLabel>
              <CustomTextField
                id="watchlistMessage"
                value={formData.watchlistMessage}
                onChange={handleChange}
                error={Boolean(errors.watchlistMessage)}
                helperText={errors.watchlistMessage || ''}
                fullWidth
              />
            </Grid>
            {/* Sign In Visitors Details */}
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight={600}>
                Sign In Visitors Details
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Field Name</TableCell>
                      <TableCell>Display</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Mandatory</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renderDetailRows(
                      formData.signinDetails || {},
                      (key, field, value) => handleDetailChange('signinDetails', key, field, value),
                      (key) => handleDeleteDetail('signinDetails', key),
                      true,
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <MuiButton size="small" onClick={() => handleAddDetail('signinDetails')}>
                Add New
              </MuiButton>
            </Box>

            {/* Sign Out Visitors Details */}
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight={600}>
                Sign Out Visitors Details
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Field Name</TableCell>
                      <TableCell>Display</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Mandatory</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renderDetailRows(
                      formData.signOutDetails || {},
                      (key, field, value) =>
                        handleDetailChange('signOutDetails', key, field, value),
                      (key) => handleDeleteDetail('signOutDetails', key),
                      true,
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <MuiButton size="small" onClick={() => handleAddDetail('signOutDetails')}>
                Add New
              </MuiButton>
            </Box>

            {/* Admin Fields */}
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight={600}>
                Admin fields
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Field Name</TableCell>
                      <TableCell>Display</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renderDetailRows(
                      formData.adminFields || {},
                      (key, field, value) => handleDetailChange('adminFields', key, field, value),
                      (key) => handleDeleteDetail('adminFields', key),
                      false, // no mandatory for admin fields
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <MuiButton size="small" onClick={() => handleAddDetail('adminFields')}>
                Add New
              </MuiButton>
            </Box>
          </Grid>
          <Grid size={12}>
            <CustomFormLabel>Document Content</CustomFormLabel>
          </Grid>
          <Button
            sx={{ mt: 2 }}
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Grid>
      </form>
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

export default FormVisitorType;
