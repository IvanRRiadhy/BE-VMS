import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  IconButton,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

export interface VehicleFormData {
  name: string;
  is_enable: boolean;
  mandatory: boolean;
  char_length: number;
  identity_type: string;
  remarks: string;
}

interface FormIdentityTypeProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => void | Promise<void>;
  initialData?: VehicleFormData;
  loading?: boolean;
}

const IDENTITY_OPTIONS = [
  { name: 'NIK', value: 'NIK' },
  { name: 'NIP', value: 'NIP' },
  { name: 'KTA', value: 'KTA' },
  { name: 'NRP', value: 'NRP' },
  //   { name: 'Bus', value: 'bus' },
  //   { name: 'Minibus', value: 'minibus' },
  //   { name: 'Bicycle', value: 'bicycle' },
  //   { name: 'Motorcycle', value: 'motorcycle' },
  //   { name: 'Truck 40 Feet', value: 'truck40feet' },
  //   { name: 'Truck 16 Feet', value: 'truck16feet' },
  //   { name: 'Truck 20 Feet', value: 'truck20feet' },
];

const defaultFormData: VehicleFormData = {
  name: '',
  char_length: 0,
  identity_type: '',
  remarks: '',
  is_enable: false,
  mandatory: false,
};

const FormIdentityType = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: FormIdentityTypeProps) => {
  const [formData, setFormData] = useState<VehicleFormData>(initialData ?? defaultFormData);

  useEffect(() => {
    if (open) {
      setFormData(initialData ?? defaultFormData);
    }
  }, [open, initialData]);

  const handleVehicleChange = (value: string) => {
    const selectedVehicle = IDENTITY_OPTIONS.find((vehicle) => vehicle.value === value);

    setFormData((prev) => ({
      ...prev,
      name: selectedVehicle?.name ?? '',
      value: selectedVehicle?.value ?? '',
    }));
  };

  const handleChange = <K extends keyof VehicleFormData>(field: K, value: VehicleFormData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? 'Edit Identity Type' : 'Add Identity Type'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <CustomFormLabel sx={{ mb: 0 }}>Name</CustomFormLabel>
          <CustomTextField
            fullWidth
            label=""
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            // required
          />
          <CustomFormLabel sx={{ mb: 0 }}>Select Identity Type</CustomFormLabel>
          <CustomTextField
            select
            fullWidth
            label="Identity Type"
            value={formData.identity_type}
            onChange={(e) => handleVehicleChange(e.target.value)}
            // required
          >
            {IDENTITY_OPTIONS.map((vehicle) => (
              <MenuItem key={vehicle.value} value={vehicle.value}>
                {vehicle.name}
              </MenuItem>
            ))}
          </CustomTextField>
          <CustomFormLabel sx={{ mb: 0 }}>Length Character</CustomFormLabel>
          <CustomTextField
            fullWidth
            label=""
            type="number"
            value={formData.char_length}
            onChange={(e) =>
              handleChange('char_length', e.target.value === '' ? 0 : Number(e.target.value))
            }
          />

          <CustomFormLabel sx={{ mb: 0 }}>Remarks</CustomFormLabel>
          <CustomTextField
            fullWidth
            label=""
            value={formData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            // required
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_enable}
                onChange={(e) => handleChange('is_enable', e.target.checked)}
              />
            }
            label="Enable"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.mandatory}
                onChange={(e) => handleChange('mandatory', e.target.checked)}
              />
            }
            label="Mandatory"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormIdentityType;
