import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  IconButton,
  Collapse,
  Tooltip,
  Chip,
  Grid2 as Grid,
} from '@mui/material';

import {
  IconCar,
  IconHistory,
  IconShieldCheck,
  IconChevronDown,
  IconChevronUp,
  IconX,
} from '@tabler/icons-react';

import PageContainer from 'src/components/container/PageContainer';

const Parking = () => {
  const [showInfo, setShowInfo] = useState(true);

  const publicUrl =
    'https://parking-app.app.bio-experience.com/Maps/Public?blockSlotUid=d46a6a89-2c3f-4046-ac65-42af27b7287d';

  const handleAuthorize = () => {
    const isAuthorized = localStorage.getItem('parking');

    if (isAuthorized === 'true') {
      window.location.href = 'http://localhost:5000/dashboard';
      return;
    }

    localStorage.setItem('parking', 'true');
    window.location.href = 'http://localhost:5000/auth/authorize';
  };

  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 1));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <PageContainer title="Parking">
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: '#f5f7fa',
          overflow: 'hidden',
        }}
      >
        {/* Public iFrame */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bottom: showInfo ? { xs: 250, sm: 0 } : 0,
            transition: 'bottom 0.3s ease',
          }}
        >
          <iframe
            src={publicUrl}
            title="Public Parking"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="fullscreen"
          />
        </Box>

        {/* Information Panel */}
        <Collapse
          in={showInfo}
          timeout={300}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <Card
            elevation={10}
            sx={{
              borderRadius: { xs: '18px 18px 0 0', md: '20px 20px 0 0' },
              maxWidth: 1100,
              mx: 'auto',
              maxHeight: '35vh',
              overflowY: 'auto',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              {/* Header */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconCar size={24} />
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Parking Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your registered parking details
                    </Typography>
                  </Box>
                </Stack>

                <Tooltip title="Hide information">
                  <IconButton onClick={() => setShowInfo(false)}>
                    <IconX size={20} />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Vehicle Information */}
              <Box
                sx={{
                  mt: 2.5,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.default',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Vehicle Details
                  </Typography>

                  {/* <Chip label="Registered" color="success" size="small" variant="outlined" /> */}
                </Stack>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Vehicle Type
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      Car
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Vehicle Plate
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      B 1234 ABC
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Parking Area
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      Area A
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Parking Slot
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      A-3
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Footer */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={2}
                mt={2}
              >
                <Typography variant="caption" color="text.secondary">
                  Please ensure your vehicle is parked in the assigned parking slot.
                </Typography>

                <Button variant="contained" color="primary" onClick={() => setShowInfo(false)}>
                  Open Parking Blocker
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Collapse>

        {/* Show Panel Button */}
        {!showInfo && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
            }}
          >
            <Button
              variant="contained"
              startIcon={<IconChevronUp size={18} />}
              onClick={() => setShowInfo(true)}
              sx={{
                borderRadius: 5,
                px: 3,
                boxShadow: 4,
              }}
            >
              Parking Information
            </Button>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default Parking;
