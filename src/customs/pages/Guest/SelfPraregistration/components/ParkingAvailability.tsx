import { Alert, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { IconParkingCircle } from '@tabler/icons-react';

interface ParkingAvailabilityProps {
  loadingParking: boolean;
  availableVisitorSlot: number | null;
}

const ParkingAvailability = ({
  loadingParking,
  availableVisitorSlot,
}: ParkingAvailabilityProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        my: 0,
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 1, '&:last-child': { pb: 0 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography fontWeight={600}>Parking Availability</Typography>

            <Box flexGrow={1} />

            <Chip
              size="small"
              color={
                loadingParking ? 'default' : (availableVisitorSlot ?? 0) > 0 ? 'primary' : 'error'
              }
              label={
                loadingParking
                  ? 'Checking...'
                  : (availableVisitorSlot ?? 0) > 0
                    ? 'Available'
                    : 'Full'
              }
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconParkingCircle />
            </Box>

            <Box>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {loadingParking ? '...' : (availableVisitorSlot ?? '-')}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Visitor parking slots available
              </Typography>
            </Box>
          </Stack>

          {!loadingParking && (availableVisitorSlot ?? 0) === 0 && (
            <Alert severity="info" sx={{ mb: 0, alignItems: 'center' }}>
              Parking slots are currently full. Please select Drop-off if you do not need a parking
              space.
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ParkingAvailability;
