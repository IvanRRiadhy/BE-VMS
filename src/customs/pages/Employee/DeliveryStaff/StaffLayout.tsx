import {
  StaffCustomSidebarItemsData,
  StaffNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import { Outlet } from 'react-router';

const StaffLayout = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={StaffNavListingData}
      itemDataCustomSidebarItems={StaffCustomSidebarItemsData}
    >
      <Outlet />
    </PageContainer>
  );
};

export default StaffLayout;
