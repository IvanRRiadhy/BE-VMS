import {
  EmployeeCustomSidebarItemsData,
  EmployeeNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import { Outlet } from 'react-router';

const EmployeeLayout = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={EmployeeNavListingData}
      itemDataCustomSidebarItems={EmployeeCustomSidebarItemsData}
    >
      <Outlet />
    </PageContainer>
  );
};

export default EmployeeLayout;
