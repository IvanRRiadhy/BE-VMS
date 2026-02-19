import {
  IconHome,
  IconSettings,
  IconUserCircle,
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
  IconReport,
  IconSteeringWheel,
  IconCalendarClock,
  IconPackageExport,
  IconMapPin,
  IconUser,
  IconEye,
  IconDeviceCctv,
  IconPrinter,
  IconStars,
  IconRun,
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
        title: 'Enrollment',
        icon: IconPackageExport,
        href: '/admin/manage/enrollment',
        children: [
          {
            id: uniqueId(),
            title: 'navigation.employees',
            icon: IconUsers,
            href: '/admin/manage/employees',
          },
          {
            id: uniqueId(),
            title: 'navigation.staff',
            icon: IconSteeringWheel,
            href: '/admin/manage/delivery/staff',
          },

          {
            id: uniqueId(),
            title: 'VIP',
            icon: IconStars,
            href: '/admin/manage/vip',
          },
          {
            id: uniqueId(),
            title: 'Vendor',
            icon: IconUsers,
            href: '/admin/manage/vendor',
          },
        ],
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
      {
        id: uniqueId(),
        title: 'navigation.timeaccess',
        icon: IconCalendarCheck,
        href: '/admin/manage/time-access',
      },
      {
        id: uniqueId(),
        title: 'navigation.visitor_type',
        icon: IconUsersGroup,
        href: '/admin/manage/visitor-type',
      },
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

      // {
      //   id: uniqueId(),
      //   title: 'navigation.zone',
      //   icon: IconMapPin,
      //   href: '/admin/manage/zone',
      // },

      {
        id: uniqueId(),
        title: 'navigation.settings',
        icon: IconSettingsFilled,
        chipColor: 'secondary',
        href: '/admin/settings',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'navigation.visitor',
    icon: IconUser,
    href: '/admin/visitor',
    children: [
      {
        id: uniqueId(),
        title: 'List Visitor',
        icon: IconUserCircle,
        chipColor: 'secondary',
        href: '/admin/visitor/list-visitor',
      },
      {
        id: uniqueId(),
        title: 'Live Visitor',
        icon: IconUserCircle,
        chipColor: 'secondary',
        href: '/admin/visitor/live-visitor',
      },
      {
        id: uniqueId(),
        title: 'Transaction Visitor',
        icon: IconUserCircle,
        chipColor: 'secondary',
        href: '/admin/visitor/transaction-visitor',
      },
      {
        id: uniqueId(),
        title: 'Blacklist Visitor',
        icon: IconUserCircle,
        chipColor: 'secondary',
        href: '/admin/visitor/blacklist-visitor',
      },
      {
        id: uniqueId(),
        title: 'navigation.scheduler',
        icon: IconCalendarClock,
        href: '/admin/visitor/scheduler',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'User',
    icon: IconUser,
    href: '/admin/user',
    children: [
      {
        id: uniqueId(),
        title: 'User',
        icon: IconUsers,
        chipColor: 'secondary',
        href: '/admin/user',
      },
      {
        id: uniqueId(),
        title: 'User Group',
        icon: IconUsers,
        chipColor: 'secondary',
        href: '/admin/user-group',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'report',
    icon: IconReport,
    chipColor: 'secondary',
    href: '/admin/report',
    children: [
      {
        id: uniqueId(),
        title: 'Transaction Log',
        icon: IconReport,
        chipColor: 'secondary',
        href: '/admin/report/transaction-log',
      },
      // {
      //   id: uniqueId(),
      //   title: 'Approval Workflow',
      //   icon: IconReport,
      //   chipColor: 'secondary',
      //   href: '/admin/report/approval-workflow',
      // },
      // {
      //   id: uniqueId(),
      //   title: 'Operator Activity Log',
      //   icon: IconReport,
      //   chipColor: 'secondary',
      //   href: '/admin/report/operator-activity-log',
      // },
    ],
  },
  {
    id: uniqueId(),
    title: 'Print Badge',
    icon: IconPrinter,
    chipColor: 'secondary',
    href: '/admin/print-badge',
  },
  {
    id: uniqueId(),
    title: 'Evacuate',
    icon: IconRun,
    href: '/admin/evacuate',
  },
  // {
  //   id: uniqueId(),
  //   title: 'navigation.helps',
  //   icon: IconCommand,
  //   href: '/',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'navigation.faq',
  //   icon: IconHelp,
  //   href: '/',
  // },
];

// export const OperatorAdminNavListingData: ItemDataCustomNavListing[] = [
//   // Operator Admin
//   {
//     id: uniqueId(),
//     title: 'Dashboard',
//     icon: IconHome,
//     chip: 'Main View',
//     chipColor: 'secondary',
//     href: '/operator-admin/dashboard',
//   },
//   {
//     id: uniqueId(),
//     title: 'navigation.manage_system',
//     icon: IconSettings,
//     href: '/operator-admin/manage/',
//     children: [
//       {
//         id: uniqueId(),
//         title: 'navigation.company_department',
//         icon: IconBuildingSkyscraper,
//         href: '/operator-admin/manage/companys-deparments',
//       },
//       {
//         id: uniqueId(),
//         title: 'Enrollment',
//         icon: IconPackageExport,
//         href: '/operator-admin/manage/enrollment',
//         children: [
//           {
//             id: uniqueId(),
//             title: 'navigation.employees',
//             icon: IconUsers,
//             href: '/operator-admin/manage/employees',
//           },
//           {
//             id: uniqueId(),
//             title: 'navigation.staff',
//             icon: IconSteeringWheel,
//             href: '/operator-admin/manage/delivery/staff',
//           },
//           {
//             id: uniqueId(),
//             title: 'VIP',
//             icon: IconStars,
//             href: '/operator-admin/manage/vip',
//           },
//           {
//             id: uniqueId(),
//             title: 'Vendor',
//             icon: IconUsers,
//             href: '/operator-admin/manage/vendor',
//           },
//         ],
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.site_space',
//         icon: IconSitemap,
//         href: '/operator-admin/manage/site-space',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.card',
//         icon: IconCards,
//         href: '/operator-admin/manage/card',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.timeaccess',
//         icon: IconCalendarCheck,
//         href: '/operator-admin/manage/time-access',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.visitor_type',
//         icon: IconUsersGroup,
//         href: '/operator-admin/manage/visitor-type',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.document',
//         icon: IconScript,
//         href: '/operator-admin/manage/document',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.brand',
//         icon: IconBrandMedium,
//         href: '/operator-admin/manage/brand',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.integration',
//         icon: IconWorldCog,
//         href: '/operator-admin/manage/integration',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.setting_smtp',
//         icon: IconMailFilled,
//         href: '/operator-admin/manage/setting-smtp',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.access_control',
//         icon: IconAccessible,
//         href: '/operator-admin/manage/access-control',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.custom_field',
//         icon: IconSettings,
//         href: '/operator-admin/manage/custom-field',
//       },
//       // {
//       //   id: uniqueId(),
//       //   title: 'navigation.zone',
//       //   icon: IconMapPin,
//       //   href: '/operator-admin/manage/zone',
//       // },
//       {
//         id: uniqueId(),
//         title: 'navigation.settings',
//         icon: IconSettingsFilled,
//         chipColor: 'secondary',
//         href: '/operator-admin/settings',
//       },
//     ],
//   },
//   {
//     id: uniqueId(),
//     title: 'navigation.visitor',
//     icon: IconUser,
//     href: '/operator-admin/visitor',
//     children: [
//       {
//         id: uniqueId(),
//         title: 'List Visitor',
//         icon: IconUserCircle,
//         chipColor: 'secondary',
//         href: '/operator-admin/visitor/list-visitor',
//       },
//       {
//         id: uniqueId(),
//         title: 'Live Visitor',
//         icon: IconUserCircle,
//         chipColor: 'secondary',
//         href: '/operator-admin/visitor/live-visitor',
//       },
//       {
//         id: uniqueId(),
//         title: 'Transaction Visitor',
//         icon: IconUserCircle,
//         chipColor: 'secondary',
//         href: '/operator-admin/visitor/transaction-visitor',
//       },
//       {
//         id: uniqueId(),
//         title: 'Blacklist Visitor',
//         icon: IconUserCircle,
//         chipColor: 'secondary',
//         href: '/operator-admin/visitor/blacklist-visitor',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.scheduler',
//         icon: IconCalendarClock,
//         href: '/operator-admin/visitor/scheduler',
//       },
//     ],
//   },
//   {
//     id: uniqueId(),
//     title: 'User',
//     icon: IconUsers,
//     chipColor: 'secondary',
//     href: '/operator-admin/user',
//   },
//   {
//     id: uniqueId(),
//     title: 'report',
//     icon: IconReport,
//     chipColor: 'secondary',
//     href: '/operator-admin/report',
//     children: [
//       {
//         id: uniqueId(),
//         title: 'Transaction Log',
//         icon: IconReport,
//         chipColor: 'secondary',
//         href: '/operator-admin/report/transaction-log',
//       },
//       // {
//       //   id: uniqueId(),
//       //   title: 'Approval Workflow',
//       //   icon: IconReport,
//       //   chipColor: 'secondary',
//       //   href: '/admin/report/approval-workflow',
//       // },
//       // {
//       //   id: uniqueId(),
//       //   title: 'Operator Activity Log',
//       //   icon: IconReport,
//       //   chipColor: 'secondary',
//       //   href: '/admin/report/operator-activity-log',
//       // },
//     ],
//   },
//   {
//     id: uniqueId(),
//     title: 'Print Badge',
//     icon: IconPrinter,
//     chipColor: 'secondary',
//     href: '/operator-admin/print-badge',
//   },
//   {
//     id: uniqueId(),
//     title: 'Evacuate',
//     icon: IconRun,
//     href: '/operator-admin/evacuate',
//   },
// ];

// export const OperatorAdminCustomSidebarItemsData: ItemDataCustomSidebarItems[] = [
//   {
//     id: uniqueId(),
//     title: 'Dashboard',
//     icon: IconHome,
//     chip: 'Main View',
//     chipColor: 'secondary',
//     href: '/operator-admin/dashboard',
//   },
//   // Operator Admin
//   {
//     id: uniqueId(),
//     title: 'navigation.manage_system',
//     icon: IconSettings,
//     href: '/operator-admin/manage/',
//     children: [
//       {
//         id: uniqueId(),
//         title: 'navigation.company_department',
//         icon: IconBuildingSkyscraper,
//         href: '/operator-admin/manage/companys-deparments',
//       },
//       {
//         id: uniqueId(),
//         title: 'Enrollment',
//         icon: IconPackageExport,
//         href: '/operator-admin/manage/enrollment',
//         children: [
//           {
//             id: uniqueId(),
//             title: 'navigation.employees',
//             icon: IconUsers,
//             href: '/operator-admin/manage/employees',
//           },
//           {
//             id: uniqueId(),
//             title: 'navigation.staff',
//             icon: IconSteeringWheel,
//             href: '/operator-admin/manage/delivery/staff',
//           },
//           {
//             id: uniqueId(),
//             title: 'VIP',
//             icon: IconStars,
//             href: '/operator-admin/manage/vip',
//           },
//           {
//             id: uniqueId(),
//             title: 'Vendor',
//             icon: IconUsers,
//             href: '/operator-admin/manage/vendor',
//           },
//         ],
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.site_space',
//         icon: IconSitemap,
//         href: '/operator-admin/manage/site-space',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.card',
//         icon: IconCards,
//         href: '/operator-admin/manage/card',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.timeaccess',
//         icon: IconCalendarCheck,
//         href: '/operator-admin/manage/time-access',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.visitor_type',
//         icon: IconUsersGroup,
//         href: '/operator-admin/manage/visitor-type',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.document',
//         icon: IconScript,
//         href: '/operator-admin/manage/document',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.brand',
//         icon: IconBrandMedium,
//         href: '/operator-admin/manage/brand',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.integration',
//         icon: IconWorldCog,
//         href: '/operator-admin/manage/integration',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.setting_smtp',
//         icon: IconMailFilled,
//         href: '/operator-admin/manage/setting-smtp',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.access_control',
//         icon: IconAccessible,
//         href: '/operator-admin/manage/access-control',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.custom_field',
//         icon: IconSettings,
//         href: '/operator-admin/manage/custom-field',
//       },
//       // {
//       //   id: uniqueId(),
//       //   title: 'navigation.zone',
//       //   icon: IconMapPin,
//       //   href: '/operator-admin/manage/zone',
//       // },
//       {
//         id: uniqueId(),
//         title: 'navigation.settings',
//         icon: IconSettingsFilled,
//         chipColor: 'secondary',
//         href: '/operator-admin/settings',
//       },
//     ],
//   },
//   {
//     id: uniqueId(),
//     title: 'navigation.visitor',
//     icon: IconUser,
//     href: '/operator-admin/visitor',
//     children: [
//       {
//         id: uniqueId(),
//         title: 'List Visitor',
//         icon: IconUserCircle,
//         chipColor: 'secondary',
//         href: '/operator-admin/visitor/list-visitor',
//       },
//       {
//         id: uniqueId(),
//         title: 'Live Visitor',
//         icon: IconUserCircle,
//         chipColor: 'secondary',
//         href: '/operator-admin/visitor/live-visitor',
//       },
//       {
//         id: uniqueId(),
//         title: 'Transaction Visitor',
//         icon: IconUserCircle,
//         chipColor: 'secondary',
//         href: '/operator-admin/visitor/transaction-visitor',
//       },
//       {
//         id: uniqueId(),
//         title: 'Blacklist Visitor',
//         icon: IconUserCircle,
//         chipColor: 'secondary',
//         href: '/operator-admin/visitor/blacklist-visitor',
//       },
//       {
//         id: uniqueId(),
//         title: 'navigation.scheduler',
//         icon: IconCalendarClock,
//         href: '/operator-admin/visitor/scheduler',
//       },
//     ],
//   },
//   {
//     id: uniqueId(),
//     title: 'User',
//     icon: IconUsers,
//     chipColor: 'secondary',
//     href: '/operator-admin/user',
//   },
//   {
//     id: uniqueId(),
//     title: 'report',
//     icon: IconReport,
//     chipColor: 'secondary',
//     href: '/operator-admin/report',
//     children: [
//       {
//         id: uniqueId(),
//         title: 'Transaction Log',
//         icon: IconReport,
//         chipColor: 'secondary',
//         href: '/operator-admin/report/transaction-log',
//       },
//       // {
//       //   id: uniqueId(),
//       //   title: 'Approval Workflow',
//       //   icon: IconReport,
//       //   chipColor: 'secondary',
//       //   href: '/admin/report/approval-workflow',
//       // },
//       // {
//       //   id: uniqueId(),
//       //   title: 'Operator Activity Log',
//       //   icon: IconReport,
//       //   chipColor: 'secondary',
//       //   href: '/admin/report/operator-activity-log',
//       // },
//     ],
//   },
//   {
//     id: uniqueId(),
//     title: 'Print Badge',
//     icon: IconPrinter,
//     chipColor: 'secondary',
//     href: '/operator-admin/print-badge',
//   },
//   {
//     id: uniqueId(),
//     title: 'Evacuate',
//     icon: IconRun,
//     href: '/operator-admin/evacuate',
//   },
// ];

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
        title: 'Enrollment',
        icon: IconPackageExport,
        href: '/admin/manage/enrollment',
        children: [
          {
            id: uniqueId(),
            title: 'navigation.employees',
            icon: IconUsers,
            href: '/admin/manage/employees',
          },
          {
            id: uniqueId(),
            title: 'navigation.staff',
            icon: IconSteeringWheel,
            href: '/admin/manage/delivery/staff',
          },

          {
            id: uniqueId(),
            title: 'VIP',
            icon: IconStars,
            href: '/admin/manage/vip',
          },
          {
            id: uniqueId(),
            title: 'Vendor',
            icon: IconUsers,
            href: '/admin/manage/vendor',
          },
        ],
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
      {
        id: uniqueId(),
        title: 'navigation.timeaccess',
        icon: IconCalendarCheck,
        href: '/admin/manage/timeaccess',
      },
      {
        id: uniqueId(),
        title: 'navigation.visitor_type',
        icon: IconUsersGroup,
        href: '/admin/manage/visitor-type',
      },
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
      // {
      //   id: uniqueId(),
      //   title: 'navigation.zone',
      //   icon: IconMapPin,
      //   href: '/admin/manage/zone',
      // },
      {
        id: uniqueId(),
        title: 'navigation.settings',
        icon: IconSettingsFilled,
        chipColor: 'secondary',
        href: '/admin/settings',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'navigation.visitor',
    icon: IconUser,
    href: '/admin/visitor',
    children: [
      {
        id: uniqueId(),
        title: 'List Visitor',
        icon: IconUserCircle,
        chipColor: 'secondary',
        href: '/admin/visitor/list-visitor',
      },
      {
        id: uniqueId(),
        title: 'Invitation Visitor',
        icon: IconUserCircle,
        chipColor: 'secondary',
        href: '/admin/visitor/live-visitor',
      },
      {
        id: uniqueId(),
        title: 'Transaction Visitor',
        icon: IconUserCircle,
        chipColor: 'secondary',
        href: '/admin/visitor/transaction-visitor',
      },
      {
        id: uniqueId(),
        title: 'Blacklist Visitor',
        icon: IconUserCircle,
        chipColor: 'secondary',
        href: '/admin/visitor/blacklist-visitor',
      },
      {
        id: uniqueId(),
        title: 'navigation.scheduler',
        icon: IconCalendarClock,
        href: '/admin/visitor/scheduler',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'User',
    icon: IconUser,
    href: '/admin/user',
    children: [
      {
        id: uniqueId(),
        title: 'User',
        icon: IconUsers,
        chipColor: 'secondary',
        href: '/admin/user',
      },
      {
        id: uniqueId(),
        title: 'User Group',
        icon: IconUsers,
        chipColor: 'secondary',
        href: '/admin/user-group',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'report',
    icon: IconReport,
    chipColor: 'secondary',
    href: '/admin/report',
    children: [
      {
        id: uniqueId(),
        title: 'Transaction Log',
        icon: IconReport,
        chipColor: 'secondary',
        href: '/admin/report/transaction-log',
      },
      // {
      //   id: uniqueId(),
      //   title: 'Approval Workflow',
      //   icon: IconReport,
      //   chipColor: 'secondary',
      //   href: '/admin/report/approval-workflow',
      // },
      // {
      //   id: uniqueId(),
      //   title: 'Operator Activity Log',
      //   icon: IconReport,
      //   chipColor: 'secondary',
      //   href: '/admin/report/operator-activity-log',
      // },
    ],
  },
  {
    id: uniqueId(),
    title: 'Print Badge',
    icon: IconPrinter,
    chipColor: 'secondary',
    href: '/admin/print-badge',
  },
  {
    id: uniqueId(),
    title: 'Evacuate',
    icon: IconRun,
    href: '/admin/evacuate',
  },

  // {
  //   id: uniqueId(),
  //   title: 'navigation.helps',
  //   icon: IconCommand,
  //   href: '/',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'navigation.faq',
  //   icon: IconHelp,
  //   href: '/',
  // },
];

export const EmployeeNavListingData: ItemDataCustomNavListing[] = [
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
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/employee/history',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Parking',
  //   icon: IconCar,
  //   chipColor: 'secondary',
  //   href: '/employee/parking',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Report',
  //   icon: IconReport,
  //   chipColor: 'secondary',
  //   href: '/employee/report',
  // },
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
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/employee/history',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Parking',
  //   icon: IconCar,
  //   chipColor: 'secondary',
  //   href: '/employee/parking',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Report',
  //   icon: IconReport,
  //   chipColor: 'secondary',
  //   href: '/employee/report',
  // },
];

export const StaffNavListingData: ItemDataCustomNavListing[] = [
  // DASHBOARD.
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/delivery-staff/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Invitation',
    icon: IconMail,
    chipColor: 'secondary',
    href: '/delivery-staff/schedule-invitation',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Report',
  //   icon: IconReport,
  //   chipColor: 'secondary',
  //   href: '/delivery-staff/report',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Parking',
  //   icon: IconCar,
  //   chipColor: 'secondary',
  //   href: '/delivery-staff/parking',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'History',
  //   icon: IconHistory,
  //   chipColor: 'secondary',
  //   href: '/delivery-staff/history',
  // },
];

export const StaffCustomSidebarItemsData: ItemDataCustomSidebarItems[] = [
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
    href: '/delivery-staff/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Invitation',
    icon: IconMail,
    chipColor: 'secondary',
    href: '/delivery-staff/schedule-invitation',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Report',
  //   icon: IconReport,
  //   chipColor: 'secondary',
  //   href: '/delivery-staff/report',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Parking',
  //   icon: IconCar,
  //   chipColor: 'secondary',
  //   href: '/delivery-staff/parking',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'History',
  //   icon: IconHistory,
  //   chipColor: 'secondary',
  //   href: '/delivery-staff/history',
  // },
];

export const ManagerNavListingData: ItemDataCustomNavListing[] = [
  // DASHBOARD.
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/manager/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Approval',
    icon: IconCheck,
    chipColor: 'secondary',
    href: '/manager/approval',
  },

  // {
  //   id: uniqueId(),
  //   title: 'Report',
  //   icon: IconReport,
  //   chipColor: 'secondary',
  //   href: '/manager/report',
  // },
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
  {
    id: uniqueId(),
    title: 'Approval',
    icon: IconCheck,
    chipColor: 'secondary',
    href: '/manager/approval',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Report',
  //   icon: IconFile,
  //   chipColor: 'secondary',
  //   href: '/manager/report',
  // },
];

export const OperatorNavListingData: ItemDataCustomNavListing[] = [
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/operator/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Operator View',
    icon: IconEye,
    href: '/operator/view',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Monitoring',
  //   icon: IconDeviceCctv,
  //   href: '/operator/monitoring',
  // },
  {
    id: uniqueId(),
    title: 'Transaction Log',
    icon: IconReport,
    href: '/operator/transaction-log',
  },

  // {
  //   id: uniqueId(),
  //   title: 'Approval Workflow',
  //   icon: IconReport,
  //   href: '/operator/approval-workflow',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Operator Activity Log',
  //   icon: IconReport,
  //   href: '/operator/operator-activity-log',
  // },
];

export const OperatorCustomSidebarItemsData: ItemDataCustomSidebarItems[] = [
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/operator/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Operator View',
    icon: IconEye,
    href: '/operator/view',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Monitoring',
  //   icon: IconDeviceCctv,
  //   href: '/operator/monitoring',
  // },
  {
    id: uniqueId(),
    title: 'Transaction Log',
    icon: IconReport,
    href: '/operator/transaction-log',
  },
  // {
  //   id: uniqueId(),
  //   title: 'Approval Workflow',
  //   icon: IconReport,
  //   href: '/operator/approval-workflow',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Operator Activity Log',
  //   icon: IconReport,
  //   href: '/operator/operator-activity-log',
  // },
];
