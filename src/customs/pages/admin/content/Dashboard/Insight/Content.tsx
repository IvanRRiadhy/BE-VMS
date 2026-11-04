import { Box } from '@mui/material';
import React from 'react';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import AnalyticsDashboard from './components/AnalyticsDashboard';

const Content = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Insight" description="this is Dashboard page">
        <AnalyticsDashboard />
      </Container>
    </PageContainer>
  );
};

export default Content;
