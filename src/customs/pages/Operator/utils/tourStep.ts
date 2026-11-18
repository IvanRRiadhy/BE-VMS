import type { TFunction } from 'i18next';

export const getTourSteps = (t: TFunction) => [
  //   {
  //     target: '#tour-search',
  //     content: t('tour.search'),
  //   },
  {
    target: '#tour-visitor-info',
    content: t('tour.visitorInfo'),
  },
//   {
//     target: '#tour-visitor-detail',
//     content: t('tour.visitorDetail'),
//   },
  {
    target: '#tour-action-panel',
    content: t('tour.actionPanel'),
  },
  {
    target: '#visitor-detail-card',
    content: t('tour.visitorDetailCard'),
  },
  {
    target: '#tour-visitor-list',
    content: t('tour.visitorList'),
  },
  //   {
  //     target: '#tour-select-multiple',
  //     content: t('tour.selectMultiple'),
  //   },
  {
    target: '#tour-host-info',
    content: t('tour.hostInfo'),
  },
  {
    target: '#tour-occupancy',
    content: t('tour.occupancy'),
  },
  //   {
  //     target: '#tour-identity-image',
  //     content: t('tour.identityImage'),
  //   },
  {
    target: '#tour-vehicle-image',
    content: t('tour.vehicleCapture'),
  },
  //   {
  //     target: '#tour-alert',
  //     content: t('tour.alert'),
  //   },
];
