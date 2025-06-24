import { FC } from 'react';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import Content from './content/content_setting_user/Content';
import PageContainer from 'src/customs/components/container/PageContainer';

const SettingUser: FC = () => {
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Content />
    </PageContainer>
  );
};

export default SettingUser;
