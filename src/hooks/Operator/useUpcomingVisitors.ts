import { useQuery } from '@tanstack/react-query';
import { getUpComingVisitors } from 'src/customs/api/operator';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

export const useUpcomingVisitors = ({
  page,
  rowsPerPage,
  sortDir,
  search,
  visitorType,
  allVisitorType,
  showCheckout,
  showBlock,
  showExpired,
}: {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  search?: string;
  visitorType?: string;
  allVisitorType?: boolean;
  showCheckout?: boolean;
  showBlock?: boolean;
  showExpired?: boolean;
}) => {
  return useQuery({
    queryKey: [
      'upcoming-visitors',
      page,
      rowsPerPage,
      sortDir,
      search,
      visitorType,
      allVisitorType,
      showCheckout,
      showBlock,
      showExpired,
    ],
    queryFn: async () => {
      const res = await getUpComingVisitors({
        today: 'true',
        visitor_type: visitorType,
        all_visitor_type: allVisitorType ? 'true' : undefined,
        start: page * rowsPerPage,
        length: rowsPerPage,
        sortDir,
        search,
        showCheckout,
        showBlock,
        showExpired,
      });

      return {
        recordsTotal: res.RecordsTotal,
        recordsFiltered: res.RecordsFiltered,
        collection: res.collection.map((items: any) => ({
          id: items.id,
          name: items.visitor_name,
          host: items.host_name,
          invitation_code: items.invitation_code,
          organization: items.visitor_organization_name,
          agenda: items.agenda,
          visitor_period_start: formatDateTime(items.visitor_period_start),
          visitor_period_end: formatDateTime(items.visitor_period_end, items.extend_visitor_period),
          visitor_status: items.visitor_status,
          vehicle_type: items.vehicle_type,
          vehicle_plate_number: items.vehicle_plate_number,
          selfie_image: items.selfie_image,
        })),
      };
    },
    placeholderData: (previousData) => previousData,
  });
};
