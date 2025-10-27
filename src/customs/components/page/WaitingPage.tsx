import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import LoadingImage from '../../../assets/images/backgrounds/loading-img.svg';

const WaitingPage = () => {
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
      {/* Gambar loading */}
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

      {/* Spinner MUI */}
      <CircularProgress size={30} thickness={5} sx={{ mb: 2 }} />

      {/* Teks */}
      <Typography variant="h5" sx={{ color: 'text.primary' }}>
        Please waiting for a moment...
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
