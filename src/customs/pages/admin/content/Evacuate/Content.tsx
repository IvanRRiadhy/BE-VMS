import React from 'react';
import PageContainer from 'src/customs/components/container/PageContainer';
import Container from 'src/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import DetailList from './Components/DetailList';
import TimerButton from './Components/TimerButton';
import GraphDisplay from './Components/GraphDisplay';
import { Box } from '@mui/system';
import { Grid2 as Grid } from '@mui/material';

const Content = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Evacuate" description="Manage Timezone">
        {/* <Box
          // minHeight="80vh"
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          // bgcolor="#f5f5f5"
          p={2}
        > */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <DetailList />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <TimerButton />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <GraphDisplay />
          </Grid>
        </Grid>
        {/* </Box> */}
      </Container>
    </PageContainer>
  );
};

export default Content;
