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
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/guest/history',
  },
  {
    id: uniqueId(),
    title: 'Parking',
    icon: IconCar,
    chipColor: 'secondary',
    href: '/parking',
    target: '_blank',
  },
  {
    id: uniqueId(),
    title: 'Report',
    icon: IconReport,
    chipColor: 'secondary',
    href: '/guest/report',
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
    title: 'History',
    icon: IconHistory,
    chipColor: 'secondary',
    href: '/guest/history',
  },
  {
    id: uniqueId(),
    title: 'Parking',
    icon: IconCar,
    chipColor: 'secondary',
    href: '/parking',
    target: '_blank',
  },
  {
    id: uniqueId(),
    title: 'Report',
    icon: IconReport,
    chipColor: 'secondary',
    href: '/guest/report',
  },
];
