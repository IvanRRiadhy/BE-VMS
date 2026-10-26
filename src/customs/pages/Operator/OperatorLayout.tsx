import {
  OperatorCustomSidebarItemsData,
  OperatorNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import { Outlet } from 'react-router';
import { OperatorToolbarProvider } from 'src/customs/contexts/OperatorToolbarContext';
import Footer from './Components/Footer';

const OperatorLayout = () => {
  return (
    <OperatorToolbarProvider>
      <PageContainer
        itemDataCustomNavListing={OperatorNavListingData}
        itemDataCustomSidebarItems={OperatorCustomSidebarItemsData}
      >
        <Outlet />
      </PageContainer>
      <Footer />
    </OperatorToolbarProvider>
  );
};

export default OperatorLayout;
