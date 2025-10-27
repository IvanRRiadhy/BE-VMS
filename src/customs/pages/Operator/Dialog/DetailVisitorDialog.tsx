// src/customs/components/operator/DetailVisitorDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Divider,
  Grid2 as Grid,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

interface Props {
  open: boolean;
  onClose: () => void;
  visitorData: any[];
}

const DetailVisitorDialog: React.FC<Props> = ({ open, onClose, visitorData }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Detail Visitor</DialogTitle>
      <IconButton sx={{ position: 'absolute', right: '10px', top: '10px' }} onClick={onClose}>
        <IconX />
      </IconButton>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5.8 }}>
            <Typography variant="h5" fontWeight="medium">
              Identity Information
            </Typography>
            <Grid container spacing={2} mt={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                {' '}
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Name</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor_name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {' '}
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Email</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor_name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {' '}
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Address</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor_name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {' '}
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Phone</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor_name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {' '}
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Gender</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor_name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {' '}
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Organization</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor_name || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            sx={{
              display: { xs: 'none', md: 'flex' }, // hanya muncul di layar besar
              alignItems: 'stretch',
              justifyContent: 'center',
            }}
          >
            <Divider orientation="vertical" flexItem />
          </Grid>
          <Grid size={{ xs: 12, md: 5.8 }}>
            <Typography variant="h5" fontWeight="medium" mb={2}>
              History
            </Typography>
            <DynamicTable data={[]} isHaveSearch={true} />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default DetailVisitorDialog;
