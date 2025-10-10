import { Grid2 as Grid, Typography } from '@mui/material';
import React from 'react';
import PageContainer from 'src/components/container/PageContainer';

const DashboardManager = () => {
  return (
    <PageContainer title="Dashboard">
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Typography variant="h4">Dashboard Manager</Typography>
      </Grid>
    </PageContainer>
  );
};

export default DashboardManager;
