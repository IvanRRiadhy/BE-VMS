import React from 'react';
import { useLocation } from 'react-router-dom';

import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
  OperatorAdminCustomSidebarItemsData,
  OperatorAdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

interface Props {
  children: React.ReactNode;
}

const AdminPageContainer = ({ children }: Props) => {
  const location = useLocation();

  const isOperatorAdmin = location.pathname.startsWith('/operator-admin');

  const navListing = isOperatorAdmin ? OperatorAdminNavListingData : AdminNavListingData;

  const sidebarItems = isOperatorAdmin
    ? OperatorAdminCustomSidebarItemsData
    : AdminCustomSidebarItemsData;

  return (
    <PageContainer itemDataCustomNavListing={navListing} itemDataCustomSidebarItems={sidebarItems}>
      {children}
    </PageContainer>
  );
};

export default AdminPageContainer;
