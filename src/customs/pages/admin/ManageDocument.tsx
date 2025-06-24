import { FC } from 'react';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import Content from './content/content_manage_document/Content';

const ManageDocument: FC = () => {
    return (
        <PageContainer
        itemDataCustomNavListing={AdminNavListingData}
        itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
        >
          <Content />
        </PageContainer>
    );
};

export default ManageDocument;