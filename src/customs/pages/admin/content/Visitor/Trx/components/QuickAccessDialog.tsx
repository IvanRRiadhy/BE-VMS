import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid2 as Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { IconInfoCircle } from '@tabler/icons-react';

interface QuickAccessDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: QuickAccessFormData) => void;
}

export interface QuickAccessFormData {
  provider: string;
  recipientType: string;
  name: string;
  email: string;
  phone: string;
  dropPoint: string;
  duration: number | null;
}

export const QuickAccessDialog = ({ open, onClose, onSubmit }: QuickAccessDialogProps) => {
  const [form, setForm] = useState<QuickAccessFormData>({
    provider: '',
    recipientType: '',
    name: '',
    email: '',
    phone: '',
    dropPoint: '',
    duration: null,
  });

  const handleChange = (field: keyof QuickAccessFormData, value: string | number | null) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit?.(form);
  };

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
              <CustomFormLabel sx={{ mt: 0 }}>Provider</CustomFormLabel>

              <Tooltip
                title="Choose the provider associated with this quick access request."
                arrow
                placement="top"
              >
                <IconInfoCircle
                  fontSize="small"
                  style={{ cursor: 'pointer', fontSize: '1rem', color: '#888' }}
                />
              </Tooltip>
            </Box>
            <CustomTextField
              fullWidth
              value={form.provider}
              onChange={(e) => handleChange('provider', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <CustomFormLabel sx={{ mt: 0 }}>Recepient</CustomFormLabel>

              <Tooltip
                title="Choose who will receive the package. Select 'Self' if you are the recipient, or 'Others' if someone else will receive it."
                arrow
                placement="top"
              >
                <IconInfoCircle
                  fontSize="small"
                  style={{ cursor: 'pointer', fontSize: '1rem', color: '#888' }}
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
            <Grid size={{ xs: 12 }}>
              <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>

              <CustomTextField
                fullWidth
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />

              <CustomFormLabel>Email</CustomFormLabel>

              <CustomTextField
                fullWidth
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />

              <CustomFormLabel>Phone</CustomFormLabel>

              <CustomTextField
                fullWidth
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <CustomFormLabel sx={{ mt: 0 }}>Drop Point</CustomFormLabel>

              <Tooltip
                title="Select the designated drop point where the package will be collected."
                arrow
                placement="top"
              >
                <IconInfoCircle
                  fontSize="small"
                  style={{ cursor: 'pointer', fontSize: '1rem', color: '#888' }}
                />
              </Tooltip>
            </Box>

            <Select
              fullWidth
              value={form.dropPoint}
              onChange={(e) => handleChange('dropPoint', e.target.value)}
            >
              <MenuItem value="SPU">SPU</MenuItem>
            </Select>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <CustomFormLabel sx={{ mt: 0 }}>Duration</CustomFormLabel>

              <Tooltip
                title="Choose the validity period for this quick access. Access will automatically expire after the selected duration."
                arrow
                placement="top"
              >
                <IconInfoCircle
                  fontSize="small"
                  style={{ cursor: 'pointer', fontSize: '1rem', color: '#888' }}
                />
              </Tooltip>
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
              {[10, 15, 30, 60].map((item) => (
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
};
