import { FC, useEffect } from 'react';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import Content from './content/content_manage_integration/Content';

const ManageIntegration: FC = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      alert('Unloading...');
      localStorage.removeItem('unsavedDocumentData');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Content />
    </PageContainer>
  );
};

export default ManageIntegration;
