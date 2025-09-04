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
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import { Item } from 'src/customs/api/models/SettingSmtp';
import { IconSend } from '@tabler/icons-react';

interface FormSettingSmtpProps {
  formData: Item;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  editingId: string;
  onSuccess?: () => void;
}

const FormSettingSmtp: React.FC<FormSettingSmtpProps> = ({
  formData,
  setFormData,
  editingId,
  onSuccess,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

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
    console.log('Form submitted:', formData);
    if (onSuccess) onSuccess();
  };

  return (
    <Paper sx={{ display: 'flex', minHeight: 400, marginTop: 2 }}>
      {/* Vertical Tabs */}
      <Tabs
        orientation="vertical"
        value={tabIndex}
        onChange={(_, newValue) => setTabIndex(newValue)}
        sx={{ borderRight: 1, borderColor: 'divider', minWidth: 180 }}
      >
        <Tab label="SMTP Provider" />
        <Tab label="Send A Test" />
        <Tab label="Sender Report" />
      </Tabs>

      {/* Form Content */}
      <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, p: 2 }}>
        {tabIndex === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="From Address"
                name="from_address"
                fullWidth
                value={formData.from_address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Title Email"
                name="title_email"
                fullWidth
                value={formData.title_email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Host"
                name="host"
                fullWidth
                value={formData.host}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Port"
                name="port"
                type="number"
                fullWidth
                value={formData.port}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch checked={formData.secure} onChange={handleSwitchChange} name="secure" />
                }
                label="Secure (SSL/TLS)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="User"
                name="user"
                fullWidth
                value={formData.user}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.selected_email}
                    onChange={handleSwitchChange}
                    name="selected_email"
                  />
                }
                label="Set as Selected Email"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit" startIcon={<IconSend />}>
                {editingId ? 'Edit' : 'Submit'}
              </Button>
            </Grid>
          </Grid>
        )}

        {tabIndex === 1 && (
          <Grid container spacing={2} paddingX={2}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                Send A Test
              </Typography>
              <Typography variant="body2" gutterBottom>
                Verify your SMTP setup to send a test email
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="User"
                name="user"
                fullWidth
                value={formData.user}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit" startIcon={<IconSend />}>
                {editingId ? 'Update SMTP' : 'Send Test'}
              </Button>
            </Grid>
          </Grid>
        )}

        {tabIndex === 2 && (
          // <Grid container spacing={2}>
          //   <Grid item xs={12}>
          //     <TextField
          //       label="Testing Email"
          //       name="testing"
          //       fullWidth
          //       value={formData.testing}
          //       onChange={handleChange}
          //     />
          //   </Grid>
          //   <Grid item xs={12}>
          //     <TextField
          //       label="Testing Message"
          //       name="testing_msg"
          //       multiline
          //       rows={3}
          //       fullWidth
          //       value={formData.testing_msg}
          //       onChange={handleChange}
          //     />
          //   </Grid>
          // </Grid>
          null
        )}
      </Box>
    </Paper>
  );
};

export default FormSettingSmtp;
