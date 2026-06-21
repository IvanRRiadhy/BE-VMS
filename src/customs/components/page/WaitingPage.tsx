import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography, Paper, Stack, keyframes } from '@mui/material';
import LoadingImage from '../../../assets/images/backgrounds/loading-img.svg';
import { useNavigate } from 'react-router';
import { AuthVisitor } from 'src/customs/api/users';
import { useSession } from 'src/customs/contexts/SessionContext';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import { showSwal } from '../alerts/alerts';
import { HourglassTopOutlined, InfoOutlined } from '@mui/icons-material';

const WaitingPage = () => {
  const navigate = useNavigate();
  const { saveToken } = useSession();

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const code = localStorage.getItem('visitor_ref_code');
    if (!code) return;

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;

      try {
        const res = await AuthVisitor({ code });
        const token = res?.collection?.token;
        const status = res?.status;

        if (token) {
          await saveToken(token, GroupRoleId.Visitor);
          localStorage.removeItem('visitor_ref_code');
          navigate('/guest/dashboard', { replace: true });
          showSwal('success', 'Welcome to the Visitor Management System');
          return;
        }

        if (status === 'fiil_form') {
          navigate(`/portal/information?code=${code}`, { replace: true });
          return;
        }

        if (status === 'rejected' || status === 'denied' || status === 'declined') {
          localStorage.removeItem('visitor_ref_code');

          showSwal('error', 'Your visit request has been rejected', 3000);
          (async () => {
            await delay(3000);
            navigate('/auth/login', { replace: true });
          })();

          return;
        }

        setTimeout(poll, 5000);
      } catch (e) {
        console.error(e);
        setTimeout(poll, 8000);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

  const dots = keyframes`
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
`;

  const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

  const glow = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.15); }
`;

  const rotateSoft = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 5,
          maxWidth: 600,
          height: '100%',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        {/* top accent bar */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: 6,
            width: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          }}
        />

        {/* icon info */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              backgroundColor: 'primary.main',
              color: 'white',

              boxShadow: '0 5px 10px rgba(59, 130, 246, 0.35)',

              position: 'relative',

              animation: `${float} 2.5s ease-in-out infinite`,

              '& svg': {
                animation: `${rotateSoft} 6s linear infinite`,
              },

              // glow effect
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                filter: 'blur(10px)',
                zIndex: -1,
                animation: `${glow} 2.5s ease-in-out infinite`,
              },
            }}
          >
            <HourglassTopOutlined />
          </Box>
        </Box>

        {/* image */}
        <Box
          component="img"
          src={LoadingImage}
          alt="loading"
          sx={{
            width: 130,
            height: 130,
            mb: 2,
            animation: `${bounce} 1.6s ease-in-out infinite`,
          }}
        />

        <Stack spacing={1} alignItems="center">
          {/* <CircularProgress size={26} thickness={5} /> */}

          <Typography variant="h6" fontWeight={700}>
            Processing Your Visit Request
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', maxWidth: 320, lineHeight: 1.6 }}
          >
            We are verifying your request with the system.
            <br /> Please wait a moment
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                ml: 0.5,
                '&::after': {
                  content: '"."',
                  animation: `${dots} 1.2s infinite`,
                },
              }}
            />
          </Typography>

          {/* status badge */}
          <Box
            sx={{
              mt: 2,
              px: 2,
              py: 0.8,
              borderRadius: 999,
              bgcolor: '#eff6ff',
              color: '#1d4ed8',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {/* System Status: Checking visitor code */}
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default WaitingPage;
