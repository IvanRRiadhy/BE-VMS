import { FC, useEffect } from 'react';
import Content from './content/content_manage_employee/Content';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';

const ManageEmployee: FC = () => {
  // useEffect(() => {
  //   const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  //     // alert('Unloading...');
  //     localStorage.removeItem('unsavedEmployeeData');
  //     // e.preventDefault();
  //     // e.returnValue = ''; // Triggers browser's native dialog
  //   };
  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  // }, []);
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Content />
    </PageContainer>
  );
};

export default ManageEmployee;
