import {
  IconHome,
  IconPoint,
  IconSettings,
  IconUserCircle,
  IconSettings2,
  IconCommand,
  IconHelp,
  IconBuildingSkyscraper,
  IconUsers,
  IconSitemap,
  IconCards,
  IconUsersGroup,
  IconScript,
  IconWorldCog,
  IconAccessible,
  IconBrandMedium,
  IconMailFilled,
  IconCalendarCheck,
  IconSettingsFilled,
  IconCheck,
  IconMail,
  IconCar,
  IconHistory,
  IconFile,
  IconAlarm,
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
    title: 'navigation.manage_system',
    icon: IconSettings,
    href: '/admin/manage/',
    children: [
      {
        id: uniqueId(),
        title: 'navigation.company_department',
        icon: IconBuildingSkyscraper,
        href: '/admin/manage/companys-deparments',
      },
      {
        id: uniqueId(),
        title: 'navigation.employees',
        icon: IconUsers,
        href: '/admin/manage/employees',
      },
      {
        id: uniqueId(),
        title: 'navigation.site_space',
        icon: IconSitemap,
        href: '/admin/manage/site-space',
      },
      {
        id: uniqueId(),
        title: 'navigation.card',
        icon: IconCards,
        href: '/admin/manage/card',
      },
      // {
      //   id: uniqueId(),
      //   title: 'Group Card Access',
      //   icon: IconIdBadge2,
      //   href: '/admin/manage/group-card-access',
      // },
      {
        id: uniqueId(),
        title: 'Scheduler',
        icon: IconCalendarCheck,
        href: '/admin/manage/scheduler',
      },
      {
        id: uniqueId(),
        title: 'navigation.timezone',
        icon: IconCalendarCheck,
        href: '/admin/manage/timezone',
      },
      {
        id: uniqueId(),
        title: 'navigation.visitor_type',
        icon: IconUsersGroup,
        href: '/admin/manage/visitor-type',
      },
      // {
      //   id: uniqueId(),
      //   title: 'Devices Kiosk',
      //   icon: IconDevices,
      //   href: '/admin/manage/device-kiosk',
      // },
      // {
      //   id: uniqueId(),
      //   title: 'Operator',
      //   icon: IconUser,
      //   href: '/admin/manage/operator',
      // },
      {
        id: uniqueId(),
        title: 'navigation.document',
        icon: IconScript,
        href: '/admin/manage/document',
      },
      {
        id: uniqueId(),
        title: 'navigation.brand',
        icon: IconBrandMedium,
        href: '/admin/manage/brand',
      },
      {
        id: uniqueId(),
        title: 'navigation.integration',
        icon: IconWorldCog,
        href: '/admin/manage/integration',
      },
      {
        id: uniqueId(),
        title: 'navigation.setting_smtp',
        icon: IconMailFilled,
        href: '/admin/manage/setting-smtp',
      },
      {
        id: uniqueId(),
        title: 'navigation.access_control',
        icon: IconAccessible,
        href: '/admin/manage/access-control',
      },
      {
        id: uniqueId(),
        title: 'navigation.custom_field',
        icon: IconSettings,
        href: '/admin/manage/custom-field',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'navigation.visitor',
    icon: IconUserCircle,
    chipColor: 'secondary',
    href: '/admin/visitor',
  },
  {
    id: uniqueId(),
    title: 'navigation.settings',
    icon: IconSettingsFilled,
    chipColor: 'secondary',
    href: '/admin/settings',
  },
  {
    id: uniqueId(),
    title: 'User',
    icon: IconUsers,
    chipColor: 'secondary',
    href: '/admin/user',
  },
  {
    id: uniqueId(),
    title: 'Report',
    icon: IconUsers,
    chipColor: 'secondary',
    href: '/admin/report',
  },

  // {
  //   id: uniqueId(),
  //   title: 'Settings',
  //   icon: IconSettings2,
  //   chipColor: 'secondary',
  //   href: '/admin/setting/',
  //   children: [
  //     {
  //       id: uniqueId(),
  //       title: 'Form',
  //       icon: IconPoint,
  //       href: '/admin/setting/form',
  //     },
  //     {
  //       id: uniqueId(),
  //       title: 'Users',
  //       icon: IconPoint,
  //       href: '/admin/setting/users',
  //     },
  //   ],
  // },

  {
    id: uniqueId(),
    title: 'navigation.helps',
    icon: IconCommand,
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'navigation.faq',
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

  //   MANAGE.
  {
    id: uniqueId(),
    title: 'Manages system',
    icon: IconSettings,
    href: '/admin/manage/',
    children: [
      {
        id: uniqueId(),
        title: 'navigation.company_department',
        icon: IconBuildingSkyscraper,
        href: '/admin/manage/companys-deparments',
      },
      {
        id: uniqueId(),
        title: 'navigation.employees',
        icon: IconUsers,
        href: '/admin/manage/employees',
      },
      {
        id: uniqueId(),
        title: 'navigation.site_space',
        icon: IconSitemap,
        href: '/admin/manage/site-space',
      },
      {
        id: uniqueId(),
        title: 'navigation.card',
        icon: IconCards,
        href: '/admin/manage/card',
      },
      // {
      //   id: uniqueId(),
      //   title: 'Group Card Access',
      //   icon: IconIdBadge2,
      //   href: '/admin/manage/group-card-access',
      // },
      {
        id: uniqueId(),
        title: 'Scheduler',
        icon: IconCalendarCheck,
        href: '/admin/manage/scheduler',
      },
      {
        id: uniqueId(),
        title: 'navigation.timezone',
        icon: IconCalendarCheck,
        href: '/admin/manage/timezone',
      },
      {
        id: uniqueId(),
        title: 'navigation.visitor_type',
        icon: IconUsersGroup,
        href: '/admin/manage/visitor-type',
      },
      // {
      //   id: uniqueId(),
      //   title: 'Devices Kiosk',
      //   icon: IconDevices,
      //   href: '/admin/manage/device-kiosk',
      // },
      // {
      //   id: uniqueId(),
      //   title: 'Operator',
      //   icon: IconUser,
      //   href: '/admin/manage/operator',
      // },
      {
        id: uniqueId(),
        title: 'navigation.document',
        icon: IconScript,
        href: '/admin/manage/document',
      },
      {
        id: uniqueId(),
        title: 'navigation.brand',
        icon: IconBrandMedium,
        href: '/admin/manage/brand',
      },
      {
        id: uniqueId(),
        title: 'navigation.integration',
        icon: IconWorldCog,
        href: '/admin/manage/integration',
      },
      {
        id: uniqueId(),
        title: 'navigation.setting_smtp',
        icon: IconMailFilled,
        href: '/admin/manage/setting-smtp',
      },
      {
        id: uniqueId(),
        title: 'navigation.access_control',
        icon: IconAccessible,
        href: '/admin/manage/access-control',
      },
      {
        id: uniqueId(),
        title: 'navigation.custom_field',
        icon: IconSettings,
        href: '/admin/manage/custom-field',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'navigation.visitor',
    icon: IconUserCircle,
    chipColor: 'secondary',
    href: '/admin/visitor',
  },
  {
    id: uniqueId(),
    title: 'navigation.settings',
    icon: IconSettingsFilled,
    chipColor: 'secondary',
    href: '/admin/settings',
  },
  {
    id: uniqueId(),
    title: 'User',
    icon: IconUsers,
    chipColor: 'secondary',
    href: '/admin/user',
  },
  {
    id: uniqueId(),
    title: 'Report',
    icon: IconFile,
    chipColor: 'secondary',
    href: '/admin/report',
  },

  // {
  //   id: uniqueId(),
  //   title: 'Settings',
  //   icon: IconSettings2,
  //   chipColor: 'secondary',
  //   href: '/',
  //   children: [
  //     {
  //       id: uniqueId(),
  //       title: 'form',
  //       icon: IconPoint,
  //       href: '/admin/setting/form',
  //     },
  //     {
  //       id: uniqueId(),
  //       title: 'users',
  //       icon: IconPoint,
  //       href: '/admin/setting/users',
  //     },
  //   ],
  // },

  // {
  //   navlabel: true,
  //   subheader: 'ABOUT',
  // },

  {
    id: uniqueId(),
    title: 'navigation.helps',
    icon: IconCommand,
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'navigation.faq',
    icon: IconHelp,
    href: '/',
  },
];

export const EmployeeNavListingData: ItemDataCustomNavListing[] = [
  // DASHBOARD.
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/employee/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Invitation',
    icon: IconMail,
    chipColor: 'secondary',
    href: '/employee/invitation',
  },
  {
    id: uniqueId(),
    title: 'Approval',
    icon: IconCheck,
    chipColor: 'secondary',
    href: '/employee/approval',
  },
  {
    id: uniqueId(),
    title: 'Visitor',
    icon: IconUsers,
    chipColor: 'secondary',
    href: '/employee/visitor',
  },
  {
    id: uniqueId(),
    title: 'Report',
    icon: IconFile,
    chipColor: 'secondary',
    href: '/employee/report',
  },
  {
    id: uniqueId(),
    title: 'Parking',
    icon: IconCar,
    chipColor: 'secondary',
    href: '/employee/parking',
  },
  {
    id: uniqueId(),
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/employee/history',
  },
];

export const EmployeeCustomSidebarItemsData: ItemDataCustomSidebarItems[] = [
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
    href: '/employee/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Invitation',
    icon: IconMail,
    chipColor: 'secondary',
    href: '/employee/invitation',
  },
  {
    id: uniqueId(),
    title: 'Approval',
    icon: IconCheck,
    chipColor: 'secondary',
    href: '/employee/approval',
  },
  {
    id: uniqueId(),
    title: 'Visitor',
    icon: IconUsers,
    chipColor: 'secondary',
    href: '/employee/visitor',
  },
  {
    id: uniqueId(),
    title: 'Report',
    icon: IconFile,
    chipColor: 'secondary',
    href: '/employee/report',
  },
  {
    id: uniqueId(),
    title: 'Parking',
    icon: IconCar,
    chipColor: 'secondary',
    href: '/employee/parking',
  },
  {
    id: uniqueId(),
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/employee/history',
  },
];

export const ManagerNavListingData: ItemDataCustomNavListing[] = [
  // DASHBOARD.
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/manager/dashboard',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Invitation',
  //   icon: IconMail,
  //   chipColor: 'secondary',
  //   href: '/manager/invitation',
  // },
  {
    id: uniqueId(),
    title: 'Approval',
    icon: IconCheck,
    chipColor: 'secondary',
    href: '/manager/approval',
  },
  {
    id: uniqueId(),
    title: 'Visitor',
    icon: IconUsers,
    chipColor: 'secondary',
    href: '/manager/visitor',
  },

  {
    id: uniqueId(),
    title: 'Report',
    icon: IconFile,
    chipColor: 'secondary',
    href: '/manager/report',
  },
  {
    id: uniqueId(),
    title: 'Parking',
    icon: IconCar,
    chipColor: 'secondary',
    href: '/manager/parking',
  },
  {
    id: uniqueId(),
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/manager/history',
  },
];

export const ManagerCustomSidebarItemsData: ItemDataCustomSidebarItems[] = [
  {
    navlabel: true,
    subheader: 'MENU',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/manager/dashboard',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Invitation',
  //   icon: IconMail,
  //   chipColor: 'secondary',
  //   href: '/manager/invitation',
  // },
  {
    id: uniqueId(),
    title: 'Approval',
    icon: IconCheck,
    chipColor: 'secondary',
    href: '/manager/approval',
  },
  {
    id: uniqueId(),
    title: 'Visitor',
    icon: IconUsers,
    chipColor: 'secondary',
    href: '/manager/visitor',
  },
  {
    id: uniqueId(),
    title: 'Report',
    icon: IconFile,
    chipColor: 'secondary',
    href: '/manager/report',
  },
  {
    id: uniqueId(),
    title: 'Parking',
    icon: IconCar,
    chipColor: 'secondary',
    href: '/manager/parking',
  },
  {
    id: uniqueId(),
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/manager/history',
  },
];

export const OperatorNavListingData: ItemDataCustomNavListing[] = [
  // DASHBOARD.
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/operator/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Alarm',
    icon: IconAlarm,
    href: '/operator/alarm',
  },
  {
    id: uniqueId(),
    title: 'Operator View',
    icon: IconAlarm,
    href: '/operator/view',
  },
];

export const OperatorCustomSidebarItemsData: ItemDataCustomSidebarItems[] = [
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
    href: '/manager/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Alarm',
    icon: IconAlarm,
    href: '/operator/alarm',
  },
  {
    id: uniqueId(),
    title: 'Operator View',
    icon: IconAlarm,
    href: '/operator/view',
  },
];
