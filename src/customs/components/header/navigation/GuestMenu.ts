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
  {
    id: uniqueId(),
    title: 'Invitation',
    icon: IconMail,
    chipColor: 'secondary',
    href: '/guest/invitation',
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
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/guest/history',
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

  {
    id: uniqueId(),
    title: 'Invitation',
    icon: IconParkingCircle,
    chipColor: 'secondary',
    href: '/guest/invitation',
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
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/guest/history',
  },
];
