import {
  EmployeeCustomSidebarItemsData,
  SecurityMonitorNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import { Outlet } from 'react-router';

const SecurityMonitorLayout = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={SecurityMonitorNavListingData}
      itemDataCustomSidebarItems={SecurityMonitorNavListingData}
    >
      <Outlet />
    </PageContainer>
  );
};

export default SecurityMonitorLayout;
