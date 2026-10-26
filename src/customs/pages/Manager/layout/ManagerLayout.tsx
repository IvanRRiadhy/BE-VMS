import {
  ManagerCustomSidebarItemsData,
  ManagerNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import { Outlet } from 'react-router';

const ManagerLayout = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={ManagerNavListingData}
      itemDataCustomSidebarItems={ManagerCustomSidebarItemsData}
    >
      <Outlet />
    </PageContainer>
  );
};

export default ManagerLayout;
