import React, { useEffect, useState } from 'react';
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
  IconChevronUp,
  IconX,
  IconMap,
} from '@tabler/icons-react';

import PageContainer from 'src/components/container/PageContainer';
import { useTranslation } from 'react-i18next';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { openParkingBlocker } from 'src/customs/api/visitor';

const Parking = () => {
  const [showInfo, setShowInfo] = useState(true);
  // const publicUrl =
  //   'https://parking-app.app.bio-experience.com/Maps/Public?blockSlotUid=d46a6a89-2c3f-4046-ac65-42af27b7287d';

  const [parkingData, setParkingData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'map' | 'camera'>('map');

  // const iframeUrl = React.useMemo(() => {
  //   const url = new URL(parkingData?.parking_map || publicUrl);

  //   if (viewMode === 'camera') {
  //     url.searchParams.set('mode', 'camera');
  //   } else {
  //     url.searchParams.delete('mode');
  //   }

  //   return url.toString();
  // }, [parkingData?.parking_map, viewMode]);

  const iframeUrl = React.useMemo(() => {
    const parkingMap = parkingData?.parking_map?.trim();

    if (!parkingMap) return null;

    try {
      const url = new URL(parkingMap);

      if (viewMode === 'camera') {
        url.searchParams.set('mode', 'camera');
      } else {
        url.searchParams.delete('mode');
      }

      return url.toString();
    } catch (error) {
      console.error('Invalid parking map URL:', parkingMap, error);
      return null;
    }
  }, [parkingData?.parking_map, viewMode]);

  useEffect(() => {
    const storedData = sessionStorage.getItem('guest_parking_data');

    if (storedData) {
      try {
        setParkingData(JSON.parse(storedData));
      } catch (error) {
        console.error('Failed to parse parking data:', error);
      }
    }
  }, []);



  const { t } = useTranslation();

  const [isParkingLoading, setIsParkingLoading] = useState(false);

  const handleOpenParkingBlocker = async () => {
    if (!parkingData?.trx_visitor_id || isParkingLoading) return;

    // const result = await showSwal(
    //   'confirm',
    //   'Are you sure to open the parking blocker?',
    // );

    // if (!result?.isConfirmed) return;

    setIsParkingLoading(true);

    try {
      await openParkingBlocker({
        trx_visitor_id: parkingData.trx_visitor_id,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      showSwal('success', 'Successfully opened parking blocker.');
    } catch (error: any) {
      showSwal(
        'error',
        error?.response?.data?.msg || 'Failed to open parking blocker.',
      );
    } finally {
      setIsParkingLoading(false);
    }
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

          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              title="Public Parking"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="fullscreen"
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                color: 'text.secondary',
                p: 3,
                textAlign: 'center',
              }}
            >
              <IconCar size={48} />
              <Typography variant="h6" fontWeight={700}>
                Parking Map Unavailable
              </Typography>
              <Typography variant="body2">
                Parking map is not available for this visitor.
              </Typography>
            </Box>
          )}
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
          {/* <Card
            elevation={10}
            sx={{
              borderRadius: { xs: '18px 18px 0 0', md: '20px 20px 0 0' },
              maxWidth: 1100,
              mx: 'auto',
              maxHeight: '35vh',
              overflowY: 'auto',
            }}
          > */}
          <Card
            elevation={10}
            sx={{
              borderRadius: { xs: '18px 18px 0 0', md: '20px 20px 0 0' },
              maxWidth: 1100,
              mx: 'auto',
              height: { xs: '50vh', md: 'auto' },
              maxHeight: { xs: '50vh', md: '35vh' },
              overflowY: 'auto',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              {/* Header */}

              {/* Header */}
              <Stack spacing={0.5}>
                {/* Baris atas: Map & Camera */}
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={0.5}
                >
                  <Button
                    size="small"
                    variant={viewMode === 'map' ? 'contained' : 'outlined'}
                    startIcon={<IconMap size={16} />}
                    onClick={() => setViewMode('map')}
                  >
                    Top View
                  </Button>

                  <Button
                    size="small"
                    variant={viewMode === 'camera' ? 'contained' : 'outlined'}
                    startIcon={<IconCar size={16} />}
                    onClick={() => setViewMode('camera')}
                  >
                    Point Of View
                  </Button>
                </Stack>

                {/* Baris bawah: Title & Close */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
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
                        {t('parking.information')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('parking.registeredParkingDetails')}
                      </Typography>
                    </Box>
                  </Stack>

                  <Tooltip title={t('parking.hideInformation')}>
                    <IconButton onClick={() => setShowInfo(false)}>
                      <IconX size={20} />
                    </IconButton>
                  </Tooltip>
                </Stack>
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
                    {t('parking.vehicleDetails')}
                  </Typography>

                  {/* <Chip label="Registered" color="success" size="small" variant="outlined" /> */}
                </Stack>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('parking.vehicleType')}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {/* Car */}
                      {parkingData?.vehicle_type || '-'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('parking.vehiclePlate')}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {/* B 1512 FG */}
                      {parkingData?.vehicle_plate_number || '-'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('parking.parkingArea')}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {/* Area Parkir */}
                      {parkingData?.parking_area || '-'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('parking.parkingSlot')}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {/* A-3 */}
                      {parkingData?.parking_slot || '-'}
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
                  {t('parking.parkingInstruction')}
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenParkingBlocker}
                  disabled={isParkingLoading || !parkingData?.trx_visitor_id}
                >
                  {isParkingLoading ? 'Opening...' : 'Open Parking Blocker'}
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
              {t('parking.information')}
            </Button>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default Parking;
