import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import LoadingImage from '../../../assets/images/backgrounds/loading-img.svg';
import { useNavigate } from 'react-router';
import { AuthVisitor } from 'src/customs/api/users';
import { useSession } from 'src/customs/contexts/SessionContext';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import { showSwal } from '../alerts/alerts';

const WaitingPage = () => {
  const navigate = useNavigate();
  const { saveToken } = useSession();

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
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Box
        component="img"
        src={LoadingImage}
        alt="Loading"
        sx={{
          width: 150,
          height: 150,
          mb: 2,
          animation: 'bounce 1.5s ease-in-out infinite',
        }}
      />
      <style>
        {`
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
  `}
      </style>

      <CircularProgress size={30} thickness={5} sx={{ mb: 2 }} />

      <Typography variant="h5" sx={{ color: 'text.primary' }}>
        Your visit application is currently in process. You will receive an email notification.
      </Typography>

      {/* Animasi spin */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default WaitingPage;
