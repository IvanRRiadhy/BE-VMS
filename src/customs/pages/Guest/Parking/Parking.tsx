import React, { useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack, Divider } from '@mui/material';
import { IconCar, IconMail, IconHistory, IconShield, IconShieldCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';

const Parking = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   const isAuthorized = localStorage.getItem('parking');

  //   if (isAuthorized === 'true') {
  //     window.location.href = 'http://localhost:5000/dashboard';
  //   }
  // }, []);

  const handleAuthorize = () => {
    const isAuthorized = localStorage.getItem('parking');

    if (isAuthorized === 'true') {
      window.location.href = 'http://localhost:5000/dashboard';
      return;
    }
    localStorage.setItem('parking', 'true');
    window.location.href = 'http://localhost:5000/auth/authorize';
  };

  return (
    <PageContainer title="Parking">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          p: 2,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 600,
            minHeight: 420,
            borderRadius: 3,
            boxShadow: 6,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="center" mb={2}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <IconCar size={32} />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight={600} textAlign="center">
              Parking Access Request
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mt={1}>
              This application is requesting permission to access your parking data.
            </Typography>

            <Divider sx={{ my: 3 }} />
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconMail size={20} />
                <Typography variant="body1">View your registered vehicle information</Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <IconHistory size={20} />
                <Typography variant="body1">Access parking history and logs</Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <IconCar size={20} />
                <Typography variant="body1">Create and manage parking access</Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/guest/dashboard')}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconShieldCheck />}
                onClick={handleAuthorize}
              >
                Authorize
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default Parking;
