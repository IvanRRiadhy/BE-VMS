import React from 'react';
import { Box, Button, Grid2 as Grid } from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { axiosInstance2 } from 'src/customs/api/interceptor';

type Props = {
  formData: {
    logo: File | null;
    name: string;
    footer_text: string;
    printer_name: string;
    printer_vendor_id: string;
    printer_paper_size: string;
  };
  errors: Record<string, string>;
  printBadgeConfig: any;
  onChange: (field: any, value: any) => void;
  onSubmit: () => void;
};

const FormPrintBadge: React.FC<Props> = React.memo(
  ({ formData, errors, printBadgeConfig, onChange, onSubmit }) => {
    return (
      <>
        <Grid container spacing={1}>
          {/* LOGO */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel sx={{ m: 0 }}>Logo (Max 144 x 144)</CustomFormLabel>

            <CustomTextField
              type="file"
              fullWidth
              inputProps={{ accept: 'image/*' }}
              error={!!errors.logo}
              helperText={errors.logo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange('logo', e.target.files?.[0] || null)
              }
            />

            {printBadgeConfig?.logo && (
              <Box
                mt={1}
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  border: '1px dashed #ddd',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <Box
                  component="img"
                  src={`${axiosInstance2.defaults.baseURL}/cdn${printBadgeConfig.logo}`}
                  alt="Logo Preview"
                  sx={{ maxWidth: 144, maxHeight: 144, objectFit: 'contain' }}
                />
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomFormLabel sx={{ m: 0 }}>Name</CustomFormLabel>
            <CustomTextField
              fullWidth
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          {/* FOOTER */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel sx={{ m: 0 }}>Footer Text</CustomFormLabel>
            <CustomTextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              value={formData.footer_text}
              onChange={(e) => onChange('footer_text', e.target.value)}
              error={!!errors.footer_text}
              helperText={errors.footer_text}
            />
          </Grid>

          {/* PRINTER NAME */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel sx={{ mt: 0 }}>Printer Name</CustomFormLabel>
            <CustomTextField
              fullWidth
              value={formData.printer_name}
              onChange={(e) => onChange('printer_name', e.target.value)}
              error={!!errors.printer_name}
              helperText={errors.printer_name}
            />
          </Grid>

          {/* VENDOR ID */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel sx={{ mt: 0 }}>Printer Vendor Id</CustomFormLabel>
            <CustomTextField
              fullWidth
              value={formData.printer_vendor_id}
              onChange={(e) => onChange('printer_vendor_id', e.target.value)}
              error={!!errors.printer_vendor_id}
              helperText={errors.printer_vendor_id}
            />
          </Grid>

          {/* PAPER SIZE */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel sx={{ mt: 0 }}>Printer Paper Size</CustomFormLabel>
            <CustomTextField
              fullWidth
              value={formData.printer_paper_size}
              onChange={(e) => onChange('printer_paper_size', e.target.value)}
              error={!!errors.printer_paper_size}
              helperText={errors.printer_paper_size}
            />
          </Grid>
        </Grid>

        {/* SUBMIT */}
        <Grid size={{ xs: 12 }} mt={2}>
          <Button variant="contained" color="primary" onClick={onSubmit} sx={{ minWidth: 150 }}>
            Submit
          </Button>
        </Grid>
      </>
    );
  },
);

export default FormPrintBadge;
