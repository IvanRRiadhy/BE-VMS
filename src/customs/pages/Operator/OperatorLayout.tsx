import {
  OperatorCustomSidebarItemsData,
  OperatorNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import { Outlet } from 'react-router';

const OperatorLayout = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={OperatorNavListingData}
      itemDataCustomSidebarItems={OperatorCustomSidebarItemsData}
    >
      <Outlet />
    </PageContainer>
  );
};

export default OperatorLayout;
