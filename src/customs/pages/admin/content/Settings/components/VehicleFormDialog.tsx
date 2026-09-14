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
  value: string;
  can_parking: boolean;
  require_parking_slot: boolean;
}

interface VehicleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => void | Promise<void>;
  initialData?: VehicleFormData;
  loading?: boolean;
}

const VEHICLE_OPTIONS = [
  { name: 'Car', value: 'car' },
  { name: 'Motor', value: 'motor' },
  { name: 'Bus', value: 'bus' },
  { name: 'Minibus', value: 'minibus' },
  { name: 'Bicycle', value: 'bicycle' },
  { name: 'Motorcycle', value: 'motorcycle' },
  { name: 'Truck 40 Feet', value: 'truck40feet' },
  { name: 'Truck 16 Feet', value: 'truck16feet' },
  { name: 'Truck 20 Feet', value: 'truck20feet' },
];

const defaultFormData: VehicleFormData = {
  name: '',
  value: '',
  can_parking: false,
  require_parking_slot: false,
};

const VehicleFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: VehicleFormDialogProps) => {
  const [formData, setFormData] = useState<VehicleFormData>(initialData ?? defaultFormData);

  useEffect(() => {
    if (open) {
      setFormData(initialData ?? defaultFormData);
    }
  }, [open, initialData]);

  const handleVehicleChange = (value: string) => {
    const selectedVehicle = VEHICLE_OPTIONS.find((vehicle) => vehicle.value === value);

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
        {initialData ? 'Edit Vehicle' : 'Add Vehicle'}
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
          <CustomFormLabel sx={{ mb: 0 }}>Select Vehicle</CustomFormLabel>
          <CustomTextField
            select
            fullWidth
            label="Vehicle Type"
            value={formData.value}
            onChange={(e) => handleVehicleChange(e.target.value)}
            required
          >
            {VEHICLE_OPTIONS.map((vehicle) => (
              <MenuItem key={vehicle.value} value={vehicle.value}>
                {vehicle.name}
              </MenuItem>
            ))}
          </CustomTextField>

          <FormControlLabel
            control={
              <Switch
                checked={formData.can_parking}
                onChange={(e) => handleChange('can_parking', e.target.checked)}
              />
            }
            label="Can Parking"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.require_parking_slot}
                onChange={(e) => handleChange('require_parking_slot', e.target.checked)}
              />
            }
            label="Require Parking Slot"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleSubmit} disabled={!formData.value || loading}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleFormDialog;
