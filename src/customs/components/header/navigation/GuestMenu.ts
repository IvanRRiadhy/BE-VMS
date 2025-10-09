import {
  IconHome,
  IconUserCircle,
  IconParkingCircle,
  IconHistory,
  IconKey,
  IconMail,
  IconCheck,
  IconReport,
  IconCar,
  IconUsers,
  IconBell,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { uniqueId } from 'lodash';
import { ItemDataCustomNavListing } from './CustomNavGuestListing';
import { ItemDataCustomSidebarItems } from './CustomSidebarGuestItem';

export const GuestNavListingData: ItemDataCustomNavListing[] = [
  // DASHBOARD.
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/guest/dashboard',
  },

  // {
  //   id: uniqueId(),
  //   title: 'Access Page',
  //   icon: IconKey,
  //   chipColor: 'secondary',
  //   href: '/guest/access-page',
  // },
  {
    id: uniqueId(),
    title: 'Invitation',
    icon: IconMail,
    chipColor: 'secondary',
    href: '/guest/invitation',
  },
  {
    id: uniqueId(),
    title: 'Approval',
    icon: IconCheck,
    chipColor: 'secondary',
    href: '/guest/approval',
  },
  {
    id: uniqueId(),
    title: 'Report',
    icon: IconReport,
    chipColor: 'secondary',
    href: '/guest/report',
  },

  {
    id: uniqueId(),
    title: 'Visitor',
    icon: IconUsers,
    chipColor: 'secondary',
    href: '/guest/visitor',
  },
  {
    id: uniqueId(),
    title: 'Parking',
    icon: IconCar,
    chipColor: 'secondary',
    href: '/guest/parking',
  },
  {
    id: uniqueId(),
    title: 'Alarm',
    icon: IconBell,
    chipColor: 'secondary',
    href: '/guest/alarm',
  },
  {
    id: uniqueId(),
    title: 'Evacuate',
    icon: IconAlertTriangle,
    chipColor: 'secondary',
    href: '/guest/evacuate',
  },

  {
    id: uniqueId(),
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/guest/history',
  },
  {
    id: uniqueId(),
    title: 'Profile',
    icon: IconUserCircle,
    chipColor: 'secondary',
    href: '/guest/profile',
  },
];

export const GuestCustomSidebarItemsData: ItemDataCustomSidebarItems[] = [
  {
    navlabel: true,
    subheader: 'MENU',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/guest/dashboard',
  },

  // {
  //   id: uniqueId(),
  //   title: 'Access Page',
  //   icon: IconParkingCircle,
  //   chipColor: 'secondary',
  //   href: '/guest/access-page',
  // },
  {
    id: uniqueId(),
    title: 'Invitation',
    icon: IconParkingCircle,
    chipColor: 'secondary',
    href: '/guest/invitation',
  },
  {
    id: uniqueId(),
    title: 'Approval',
    icon: IconParkingCircle,
    chipColor: 'secondary',
    href: '/guest/approval',
  },

  {
    id: uniqueId(),
    title: 'Report',
    icon: IconParkingCircle,
    chipColor: 'secondary',
    href: '/guest/report',
  },
  {
    id: uniqueId(),
    title: 'Parking',
    icon: IconParkingCircle,
    chipColor: 'secondary',
    href: '/guest/parking',
  },
  {
    id: uniqueId(),
    title: 'Visitor',
    icon: IconParkingCircle,
    chipColor: 'secondary',
    href: '/guest/visitor',
  },
  {
    id: uniqueId(),
    title: 'Alarm',
    icon: IconParkingCircle,
    chipColor: 'secondary',
    href: '/guest/alarm',
  },
  {
    id: uniqueId(),
    title: 'Evacuate',
    icon: IconParkingCircle,
    chipColor: 'secondary',
    href: '/guest/evacuate',
  },

  {
    id: uniqueId(),
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/guest/history',
  },
  {
    id: uniqueId(),
    title: 'Profile',
    icon: IconUserCircle,
    chipColor: 'secondary',
    href: '/guesst/profile',
  },

  // {
  //   navlabel: true,
  //   subheader: 'ABOUT',
  // },
];
