import React from 'react';
import { Box, Typography } from '@mui/material';

const TopResidents = () => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Top Residents
      </Typography>
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 3,
          height: 400,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 400, lineHeight: 1.5, textAlign: 'center' }}
        >
          There are no data during this <br /> time period
        </Typography>
      </Box>
    </>
  );
};

export default TopResidents;
