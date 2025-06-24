import PageContainer from 'src/customs/components/container/PageContainer';
import Content from './content/content_manage_company_and_department/Content';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { FC } from 'react';

const ManageCompanyAndDepartment: FC = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Content />
    </PageContainer>
  );
};

export default ManageCompanyAndDepartment;
