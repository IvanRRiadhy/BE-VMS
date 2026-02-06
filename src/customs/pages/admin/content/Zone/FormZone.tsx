import React from 'react';
import { Grid2 as Grid, Typography } from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
interface FormZoneProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  edittingId?: string;
  onSuccess?: () => void;
}
const FormZone = ({ formData, setFormData, edittingId, onSuccess }: FormZoneProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSuccess?.();
  };
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 12 }}>
          <CustomFormLabel sx={{ marginY: 1 }} htmlFor="name" required>
            <Typography variant="caption">Name</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="name"
            // value={formData.name || ''}
            // onChange={handleChange}
            fullWidth
            required
            // disabled={isBatchEdit}
            // variant="outlined"
            // error={Boolean(errors.name)}
            // helperText={errors.name}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default FormZone;
