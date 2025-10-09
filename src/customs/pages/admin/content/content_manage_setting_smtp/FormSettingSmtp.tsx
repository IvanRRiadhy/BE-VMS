import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Button,
  Grid2 as Grid,
  Paper,
  Divider,
} from '@mui/material';
import { Item } from 'src/customs/api/models/SettingSmtp';
import { IconSend } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { IconButton, InputAdornment } from '@mui/material';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
interface FormSettingSmtpProps {
  formData: Item;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  editingId: string;
  onSubmit: (data: Item) => void;
  onCancel?: () => void;
}

const FormSettingSmtp: React.FC<FormSettingSmtpProps> = ({
  formData,
  setFormData,
  editingId,
  onSubmit,
  onCancel,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Item) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: Item) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); // biar parent yang urus API/alert/close
  };

  return (
    <Paper sx={{ display: 'flex', minHeight: 400, marginTop: 2 }}>

      {/* Form Content */}
      <form
        onSubmit={handleSubmit}
        style={{ padding: 16 }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="name" sx={{ marginTop: '0px' }}>
              <Typography variant="body1" fontWeight={500}>
                Name
              </Typography>
            </CustomFormLabel>
            <CustomTextField
              id="name"
              name="name"
              value={formData.name ?? ''}
              onChange={handleChange}
              onKeyDown={(e) => e.stopPropagation()}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="from_address" sx={{ marginTop: '0px' }}>
              <Typography variant="body1" fontWeight={500}>
                From Address
              </Typography>
            </CustomFormLabel>
            <CustomTextField
              id="from_address"
              name="from_address"
              value={formData.from_address ?? ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="title_email" sx={{ marginTop: '0px' }}>
              <Typography variant="body1" fontWeight={500}>
                Title Email
              </Typography>
            </CustomFormLabel>
            <CustomTextField
              id="title_email"
              name="title_email"
              value={formData.title_email || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="host" sx={{ marginTop: '0px' }}>
              <Typography variant="body1" fontWeight={500}>
                Host
              </Typography>
            </CustomFormLabel>
            <CustomTextField
              id="host"
              name="host"
              value={formData.host || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="port" sx={{ marginTop: '0px' }}>
              <Typography variant="body1" fontWeight={500}>
                Port
              </Typography>
            </CustomFormLabel>
            <CustomTextField
              id="port"
              name="port"
              value={formData.port || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="user" sx={{ marginTop: '0px' }}>
              <Typography variant="body1" fontWeight={500}>
                User
              </Typography>
            </CustomFormLabel>
            <CustomTextField
              id="user"
              name="user"
              value={formData.user ?? ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="password" sx={{ marginTop: '0px' }}>
              <Typography variant="body1" fontWeight={500}>
                Password
              </Typography>
            </CustomFormLabel>

            <CustomTextField
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password ?? ''}
              onChange={handleChange}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.secure || false}
                  onChange={handleSwitchChange}
                  name="secure"
                />
              }
              label="Secure (SSL/TLS)"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.selected_email || false}
                  onChange={handleSwitchChange}
                  name="selected_email"
                />
              }
              label="Set as Selected Email"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={<IconSend size={18} />}
              sx={{ ml: 1 }}
            >
              {editingId ? 'Edit' : 'Submit'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default FormSettingSmtp;
