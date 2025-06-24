import { FC } from 'react';
import Content from './content/content_dashboard/Content';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';

const Dashboard: FC = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Content />
    </PageContainer>
  );
};

export default Dashboard;
