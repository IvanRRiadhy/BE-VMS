import { Grid2 as Grid, Typography } from '@mui/material';
import React from 'react';
import PageContainer from 'src/components/container/PageContainer';

const Approval = () => {
  return (
    <PageContainer title="Approval">
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Typography variant="h4">Approval Employee</Typography>
      </Grid>
    </PageContainer>
  );
};

export default Approval;
