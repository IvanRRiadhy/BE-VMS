import { FC } from 'react';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import Content from './content/content_manage_visitor_card/Content';
import PageContainer from 'src/customs/components/container/PageContainer';

const ManageVisitorCard: FC = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Content />
    </PageContainer>
  );
};

export default ManageVisitorCard;
