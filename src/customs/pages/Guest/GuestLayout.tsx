import {
  GuestCustomSidebarItemsData,
  GuestNavListingData,
} from 'src/customs/components/header/navigation/GuestMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import { ReactNode } from 'react';
import { Outlet } from 'react-router';

interface GuestLayoutProps {
  children: ReactNode;
}

const GuestLayout = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={GuestNavListingData}
      itemDataCustomSidebarItems={GuestCustomSidebarItemsData}
    >
      <Outlet />
    </PageContainer>
  );
};

export default GuestLayout;
