import { Box, Grid2 as Grid, Icon } from '@mui/material';
import { IconWorldCog } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const Content = () => {
  const cards = useMemo(
    () => [
      {
        title: 'Event Logs',
        subTitle: `${0}`,
        icon: IconWorldCog,
        color: 'none',
      },
    ],
    [],
  );
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Integration" description="Integration page">
        <Box>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid container size={{ xs: 12, lg: 12 }}>
              <DynamicTable data={[]} isHaveSearch />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;
