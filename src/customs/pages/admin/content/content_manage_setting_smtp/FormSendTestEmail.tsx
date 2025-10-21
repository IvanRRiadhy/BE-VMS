import React from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  Divider,
  Button,
  Switch,
  Autocomplete,
} from '@mui/material';
import { IconSend } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { ItemEmail } from 'src/customs/api/models/Admin/SettingSmtp';

type SmtpOption = { id: number; name: string };

interface FormSendTestEmailProps {
  formEmailData: ItemEmail;
  setFormEmailData: React.Dispatch<React.SetStateAction<ItemEmail>>;
  smtpOptions: SmtpOption[];
  onSubmit: (data: ItemEmail) => void;
  onCancel?: () => void;
  loading?: boolean; // opsional: untuk disable tombol saat submit
}

const FormSendTestEmail: React.FC<FormSendTestEmailProps> = ({
  formEmailData,
  setFormEmailData,
  smtpOptions,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormEmailData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormEmailData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formEmailData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2} paddingX={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h4" gutterBottom>
            Send A Test
          </Typography>
          <Typography variant="body2" gutterBottom>
            Verify your SMTP setup by sending a test email
          </Typography>
          <Divider />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="email_sender" sx={{ marginTop: '0px' }}>
            <Typography variant="body1" fontWeight={500}>
              Send To
            </Typography>
          </CustomFormLabel>
          <CustomTextField
            name="email_sender"
            fullWidth
            value={formEmailData.email_sender ?? ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomFormLabel sx={{ marginTop: '0px' }}>
            <Typography variant="body1" fontWeight={500}>
              Send With
            </Typography>
          </CustomFormLabel>
          <Autocomplete
            autoHighlight
            disablePortal
            options={smtpOptions}
            value={smtpOptions.find((o) => o.id === Number(formEmailData.setting_smtp_id)) || null}
            onChange={(_, newValue) => {
              setFormEmailData((prev) => ({
                ...prev,
                setting_smtp_id: newValue ? String(newValue.id) : '',
              }));
            }}
            getOptionLabel={(option) => (option ? `${option.name}` : '')}
            // disableClearable default-nya false, jadi boleh dihapus saja
            renderInput={(params) => (
              <CustomTextField {...params} placeholder="Pilih SMTP" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight={500}>
              HTML
            </Typography>
            <Switch name="is_html" checked={!!formEmailData.is_html} onChange={handleSwitch} />
          </Box>
          <Typography variant="body2" color="gray">
            Send test email as HTML
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            startIcon={<IconSend size={18} />}
            disabled={loading}
          >
            Send Test
          </Button>
          {onCancel && (
            <Button variant="outlined" sx={{ ml: 1 }} onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FormSendTestEmail;
