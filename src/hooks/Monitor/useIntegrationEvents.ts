// import { useQuery } from '@tanstack/react-query';
// import { getMonitorActivities, getMonitorIntegrationEvents } from 'src/customs/api/Admin/Monitor';
// import axiosInstance from 'src/customs/api/interceptor';
// import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

// interface UseActivityLogsParams {
//   page?: number;
//   rowsPerPage?: number;
//   search?: string;
//   sortColumn?: string;
//   sortDir?: 'asc' | 'desc';
// }

// export const useIntegrationEvents = ({
//   page = 0,
//   rowsPerPage = 10,
//   search = '',
//   sortColumn = 'action_at',
//   sortDir = 'desc',
// }: UseActivityLogsParams = {}) => {
//   const payload: any = {
//     draw: page + 1,
//     start: page * rowsPerPage,
//     length: rowsPerPage,
//     sort_column: sortColumn,
//     sort_dir: sortDir,
//     'search[value]': search,
//   };

//   const query = useQuery({
//     queryKey: ['integration-events', payload],
//     queryFn: () => getMonitorIntegrationEvents(payload),
//     staleTime: 0,
//     gcTime: 5 * 60 * 1000,

//     refetchOnMount: true,
//     refetchOnWindowFocus: true,
//   });

//   const formattedData = (query.data?.collection ?? []).map((item: any) => ({
//     id: item.id,
//     // external_event_id: item.external_event_id,
//     source_type: item.source_type,
//     message: item.message,
//     location: item.location || '-',
//     // event_type: item.event_type,
//     // event_date: item.event_date ? formatDateTime(item.event_date) : '-',
//     visitor_name: item.visitor_name,
//     host: item.host_name,
//     site: item.site_name,
//     received_at: item.received_at ? formatDateTime(item.received_at) : '-',
//     is_alarm: item.is_alarm,
//   }));

//   return {
//     data: formattedData ?? [],
//     totalRecords: query.data?.RecordsTotal ?? 0,
//     filteredRecords: query.data?.RecordsFiltered ?? 0,
//     isLoading: query.isLoading,
//     isFetching: query.isFetching,
//     error: query.error,
//     refetch: query.refetch,
//   };
// };

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMonitorIntegrationEvents } from 'src/customs/api/Admin/Monitor';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface UseActivityLogsParams {
  rowsPerPage?: number;
  search?: string;
  sortColumn?: string;
  sortDir?: 'asc' | 'desc';
}

export const useIntegrationEvents = ({
  rowsPerPage = 25,
  search = '',
  sortColumn = 'action_at',
  sortDir = 'desc',
}: UseActivityLogsParams = {}) => {
  const query = useInfiniteQuery({
    queryKey: ['integration-events', rowsPerPage, search, sortColumn, sortDir],
    initialPageParam: 0,

    queryFn: ({ pageParam }) => {
      const payload = {
        draw: pageParam + 1,
        start: pageParam * rowsPerPage,
        length: rowsPerPage,
        sort_column: sortColumn,
        sort_dir: sortDir,
        'search[value]': search,
      };

      return getMonitorIntegrationEvents(payload);
    },

    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (total, page) => total + (page?.collection?.length ?? 0),
        0,
      );

      const totalRecords = lastPage?.RecordsFiltered ?? 0;

      return loadedCount < totalRecords ? allPages.length : undefined;
    },

    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const formattedData =
    query.data?.pages.flatMap((page) =>
      (page?.collection ?? [])
        // .filter((item: any) => !item.external_event_id)
        .map((item: any) => ({
          id: item.id,
          source_type: item.source_type,
          message: item.message,
          location: item.location || '-',
          visitor_name: item.visitor_name,
          host: item.host_name,
          site: item.site_name,
          received_at: item.received_at ? formatDateTime(item.received_at) : '-',
          is_alarm: item.is_alarm,
          payload: item.payload,
        })),
    ) ?? [];

  return {
    ...query,
    data: formattedData,
    totalRecords: query.data?.pages[0]?.RecordsTotal ?? 0,
    filteredRecords: query.data?.pages[0]?.RecordsFiltered ?? 0,
  };
};