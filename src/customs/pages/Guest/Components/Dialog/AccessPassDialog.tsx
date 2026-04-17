import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid2 as Grid,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import QRCode from 'react-qr-code';
import { Download } from '@mui/icons-material';

type Props = {
  open: boolean;
  onClose: () => void;
  data: any;
  isGenerating: boolean;
  isParkingLoading: boolean;
  onDownload: () => void;
  onOpenParking: () => void;
  formatVisitorPeriodLocal: (start: string, end: string) => string;
  printRef?: any;
};

const AccessPassDialog: React.FC<Props> = ({
  open,
  onClose,
  data,
  isGenerating,
  isParkingLoading,
  onDownload,
  onOpenParking,
  formatVisitorPeriodLocal,
  printRef,
}) => {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle textAlign="center" sx={{ p: 2 }}>
        Your Access Pass
      </DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 10,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <IconX />
      </IconButton>

      <DialogContent
        sx={{
          paddingTop: 2,
          position: 'relative',
        }}
        dividers
        ref={printRef}
      >
        {/* Background */}
        <img
          src="src/assets/images/backgrounds/back-test.jpg"
          alt="background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
          }}
        />
        <Box
          display="flex"
          justifyContent="center"
          className="only-print"
          sx={{
            display: 'none',
            '@media print': {
              display: 'flex',
            },
          }}
        >
          <img
            src="/src/assets/images/logos/bio-experience-1x1-logo.png"
            alt="logo"
            width={100}
            height={100}
            style={{
              objectFit: 'contain',
              maxHeight: '100px',
            }}
          />
        </Box>

        {/* Header */}
        <Box mt={1} zIndex={1} position={'relative'}>
          <Grid container spacing={2} justifyContent="center">
            <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
              <Typography>Invitation Code</Typography>
              <Typography fontWeight="bold">{data.invitation_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
              <Typography>Group Name</Typography>
              <Typography fontWeight="bold">{data.group_name || '-'}</Typography>
            </Grid>

            {!isGenerating && (
              <IconButton
                color="primary"
                className="no-print"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  position: 'absolute',
                  right: 5,
                  top: -10,
                  '&:hover': { backgroundColor: 'primary.dark' },
                  '@media print': {
                    display: 'none !important',
                  },
                }}
                onClick={onDownload}
              >
                <Download />
              </IconButton>
            )}

            <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
              <Typography>Host</Typography>
              <Typography fontWeight="bold">{data.host || '-'}</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
              <Typography>Group Code</Typography>
              <Typography fontWeight="bold">{data.group_code || '-'}</Typography>
            </Grid>

            <Grid size={{ xs: 12 }} textAlign="center">
              <Typography>Period Visit</Typography>
              <Typography fontWeight="bold">
                {formatVisitorPeriodLocal(data.visitor_period_start, data.visitor_period_end)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* QR */}
        <Box textAlign="center" mt={2}>
          <Typography variant="h5" fontWeight="bold">
            {data.site_place_name}
          </Typography>

          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: 'white',
              display: 'inline-block',
              mt: 2,
            }}
          >
            <QRCode value={data.visitor_number || data.invitation_code} size={180} />
          </Box>

          <Typography mt={1}>Show this while visiting</Typography>
          <Typography>ID: {data.visitor_code}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Parking */}
        <Typography variant="h6" fontWeight="bold">
          Parking
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }} textAlign="center">
            <Typography>Parking Area</Typography>
            <Typography fontWeight="bold">{data.parking_area || '-'}</Typography>
          </Grid>

          <Grid size={{ xs: 6 }} textAlign="center">
            <Typography>Parking Slot</Typography>
            <Typography fontWeight="bold">{data.parking_slot || '-'}</Typography>
          </Grid>

          <Grid size={{ xs: 6 }} textAlign="center">
            <Typography>Plate</Typography>
            <Typography fontWeight="bold">{data.vehicle_plate_number || '-'}</Typography>
          </Grid>

          <Grid size={{ xs: 6 }} textAlign="center">
            <Typography>Type</Typography>
            <Typography fontWeight="bold">{data.vehicle_type || '-'}</Typography>
          </Grid>
        </Grid>

        {!isGenerating && (
          <Button
            fullWidth
            sx={{ mt: 2 }}
            variant="contained"
            onClick={onOpenParking}
            disabled={isParkingLoading || !data.is_driving}
          >
            {isParkingLoading ? <CircularProgress size={20} /> : 'Open Parking Blocker'}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccessPassDialog;
