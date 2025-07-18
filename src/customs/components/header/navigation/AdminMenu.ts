import {
  IconHome,
  IconPoint,
  IconSettings,
  IconUserCircle,
  IconSettings2,
  IconCommand,
  IconHelp,
} from '@tabler/icons-react';
import { uniqueId } from 'lodash';
import { ItemDataCustomNavListing } from './CustomNavListing';
import { ItemDataCustomSidebarItems } from './CustomSidebarItems';

export const AdminNavListingData: ItemDataCustomNavListing[] = [
  // DASHBOARD.
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/admin/dashboard',
  },

  //   MANAGE.
  {
    id: uniqueId(),
    title: 'Manages system',
    icon: IconSettings,
    href: '/admin/manage/',
    children: [
      {
        id: uniqueId(),
        title: 'Company & Department',
        icon: IconPoint,
        href: '/admin/manage/companys&deparments',
      },
      {
        id: uniqueId(),
        title: 'Employees',
        icon: IconPoint,
        href: '/admin/manage/employees',
      },
      {
        id: uniqueId(),
        title: 'Site Space',
        icon: IconPoint,
        href: '/admin/manage/site-space',
      },
      {
        id: uniqueId(),
        title: 'Visitor Card',
        icon: IconPoint,
        href: '/admin/manage/visitor-card',
      },
      {
        id: uniqueId(),
        title: 'Visitor Type',
        icon: IconPoint,
        href: '/admin/manage/visitor-type',
      },
      {
        id: uniqueId(),
        title: 'Devices Kiosk',
        icon: IconPoint,
        href: '/admin/manage/device-kiosk',
      },
      {
        id: uniqueId(),
        title: 'Operator',
        icon: IconPoint,
        href: '/admin/manage/operator',
      },
      {
        id: uniqueId(),
        title: 'Document',
        icon: IconPoint,
        href: '/admin/manage/document',
      },
      {
        id: uniqueId(),
        title: 'Brand',
        icon: IconPoint,
        href: '/admin/manage/brand',
      },
      {
        id: uniqueId(),
        title: 'Integration',
        icon: IconPoint,
        href: '/admin/manage/integration',
      },
      {
        id: uniqueId(),
        title: 'Access Control',
        icon: IconPoint,
        href: '/admin/manage/access-control',
      },
      {
        id: uniqueId(),
        title: 'Custom Field',
        icon: IconPoint,
        href: '/admin/manage/custom-field',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Visitor',
    icon: IconUserCircle,
    chipColor: 'secondary',
    href: '/admin/visitor',
  },

  {
    id: uniqueId(),
    title: 'Settings',
    icon: IconSettings2,
    chipColor: 'secondary',
    href: '/admin/setting/',
    children: [
      {
        id: uniqueId(),
        title: 'Form',
        icon: IconPoint,
        href: '/admin/setting/form',
      },
      {
        id: uniqueId(),
        title: 'Users',
        icon: IconPoint,
        href: '/admin/setting/users',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'Helps',
    icon: IconCommand,
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'FAQ',
    icon: IconHelp,
    href: '/',
  },
];

export const AdminCustomSidebarItemsData: ItemDataCustomSidebarItems[] = [
  {
    navlabel: true,
    subheader: 'MENU',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    chip: 'Main View',
    chipColor: 'secondary',
    href: '/admin/dashboard',
  },

  {
    id: uniqueId(),
    title: 'Manages',
    icon: IconSettings,
    href: '/',
    children: [
      {
        id: uniqueId(),
        title: 'Company & Department',
        icon: IconPoint,
        href: '/admin/manage/companys&deparments',
      },
      {
        id: uniqueId(),
        title: 'Employees',
        icon: IconPoint,
        href: '/admin/manage/employees',
      },
      {
        id: uniqueId(),
        title: 'Site Space',
        icon: IconPoint,
        href: '/admin/manage/site-space',
      },
      {
        id: uniqueId(),
        title: 'Visitor Card',
        icon: IconPoint,
        href: '/admin/manage/visitor-card',
      },
      {
        id: uniqueId(),
        title: 'Visitor type',
        icon: IconPoint,
        href: '/admin/manage/visitor-type',
      },
      {
        id: uniqueId(),
        title: 'devices kiosk',
        icon: IconPoint,
        href: '/admin/manage/device-kiosk',
      },
      {
        id: uniqueId(),
        title: 'operator',
        icon: IconPoint,
        href: '/admin/manage/operator',
      },
      {
        id: uniqueId(),
        title: 'document',
        icon: IconPoint,
        href: '/admin/manage/document',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'Visitor',
    icon: IconUserCircle,
    chipColor: 'secondary',
    href: '/admin/visitor',
  },

  {
    id: uniqueId(),
    title: 'Settings',
    icon: IconSettings2,
    chipColor: 'secondary',
    href: '/',
    children: [
      {
        id: uniqueId(),
        title: 'form',
        icon: IconPoint,
        href: '/admin/setting/form',
      },
      {
        id: uniqueId(),
        title: 'users',
        icon: IconPoint,
        href: '/admin/setting/users',
      },
    ],
  },

  {
    navlabel: true,
    subheader: 'ABOUT',
  },

  {
    id: uniqueId(),
    title: 'Helps',
    icon: IconCommand,
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'FAQ',
    icon: IconHelp,
    href: '/',
  },
];
