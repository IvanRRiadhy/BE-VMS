import {
  OperatorCustomSidebarItemsData,
  OperatorNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import { Outlet } from 'react-router';
import { OperatorToolbarProvider } from 'src/customs/contexts/OperatorToolbarContext';

const OperatorLayout = () => {
  return (
    <OperatorToolbarProvider>
      <PageContainer
        itemDataCustomNavListing={OperatorNavListingData}
        itemDataCustomSidebarItems={OperatorCustomSidebarItemsData}
      >
        <Outlet />
      </PageContainer>
    </OperatorToolbarProvider>
  );
};

export default OperatorLayout;
