import React, { forwardRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { IconX } from '@tabler/icons-react';
import QRCode from 'react-qr-code';

interface AccessPassData {
  invitation_code?: string;
  card_number?: string;
  host_name?: string;
  group_code?: string;
  visitor_period_start?: string;
  visitor_period_end?: string;
  site_place_name?: string;
  visitor_number?: string;
  visitor_code?: string;
  parking_area?: string;
  parking_slot?: string;
  vehicle_plate_number?: string;
  vehicle_type?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: AccessPassData;
  isGenerating?: boolean;
  isParkingLoading?: boolean;
  onDownload?: () => void;
  onOpenParking?: () => void;
  formatVisitorPeriodLocal: (start: string, end: string) => string;
}

const AccessPassDialog = forwardRef<HTMLDivElement, Props>(
  (
    {
      open,
      onClose,
      data,
      isGenerating,
      isParkingLoading,
      onDownload,
      onOpenParking,
      formatVisitorPeriodLocal,
    },
    ref,
  ) => {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle textAlign="center" sx={{ p: 2 }}>
          Your Access Pass
        </DialogTitle>

        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <IconX />
        </IconButton>

        <DialogContent dividers ref={ref} sx={{ position: 'relative' }}>
          <Box mt={1}>
            <Grid container spacing={2} justifyContent="center">
              <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                <Typography variant="body2">Invitation Code</Typography>
                <Typography fontWeight="bold">{data.invitation_code}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                <Typography variant="body2">Card</Typography>
                <Typography fontWeight="bold">{data.card_number || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          {!isGenerating && (
            <IconButton
              color="primary"
              onClick={onDownload}
              sx={{
                position: 'absolute',
                right: 20,
                top: 20,
              }}
            >
              <Download />
            </IconButton>
          )}

          <Box mt={3} textAlign="center">
            <Typography variant="h6">{data.site_place_name}</Typography>

            <Box
              sx={{
                display: 'inline-block',
                p: 3,
                borderRadius: 2,
                backgroundColor: 'white',
                mt: 2,
              }}
            >
              <QRCode value={data.visitor_number || data.invitation_code || ''} size={180} />
            </Box>

            <Typography mt={2}>ID : {data.visitor_code}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography fontWeight={700} mb={1}>
              Parking
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                <Typography>Parking Area</Typography>
                <Typography fontWeight="bold">{data.parking_area || '-'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                <Typography>Parking Slot</Typography>
                <Typography fontWeight="bold">{data.parking_slot || '-'}</Typography>
              </Grid>
            </Grid>

            {!isGenerating && (
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                onClick={onOpenParking}
                disabled={isParkingLoading}
              >
                {isParkingLoading ? (
                  <CircularProgress size={22} sx={{ color: 'white' }} />
                ) : (
                  'Open Parking Blocker'
                )}
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    );
  },
);

export default AccessPassDialog;
