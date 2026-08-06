import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface Props {
  open: boolean;
  detail: any;
  onClose: () => void;
  onSave: (payload: any) => void;
}

export default function VisitorEditDialog({ open, detail, onClose, onSave }: Props) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (detail) {
      setForm(detail);
    }
  }, [detail]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Visitor</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={6}>
            <CustomTextField
              fullWidth
              label="Identity ID"
              value={form.identity_id ?? ''}
              onChange={(e) => handleChange('identity_id', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomTextField
              fullWidth
              label="Name"
              value={form.name ?? ''}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomTextField
              fullWidth
              label="Email"
              value={form.email ?? ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomTextField
              fullWidth
              label="Phone"
              value={form.phone ?? ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              multiline
              rows={3}
              label="Address"
              value={form.address ?? ''}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomTextField
              select
              fullWidth
              label="Gender"
              value={form.gender ?? ''}
              onChange={(e) => handleChange('gender', e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </CustomTextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_vip ?? false}
                  onChange={(e) => handleChange('is_vip', e.target.checked)}
                />
              }
              label="VIP Visitor"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="contained" onClick={() => onSave(form)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
