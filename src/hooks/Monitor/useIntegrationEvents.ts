import { useQuery } from '@tanstack/react-query';
import { getMonitorActivities, getMonitorIntegrationEvents } from 'src/customs/api/Admin/Monitor';
import axiosInstance from 'src/customs/api/interceptor';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface UseActivityLogsParams {
  page?: number;
  rowsPerPage?: number;
  search?: string;
  sortColumn?: string;
  sortDir?: 'asc' | 'desc';
}

export const useIntegrationEvents = ({
  page = 0,
  rowsPerPage = 10,
  search = '',
  sortColumn = 'action_at',
  sortDir = 'desc',
}: UseActivityLogsParams = {}) => {
  const payload: any = {
    draw: page + 1,
    start: page * rowsPerPage,
    length: rowsPerPage,
    sort_column: sortColumn,
    sort_dir: sortDir,
    'search[value]': search,
  };

  const query = useQuery({
    queryKey: ['integration-events', payload],
    queryFn: () => getMonitorIntegrationEvents(payload),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,

    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const formattedData = (query.data?.collection ?? []).map((item: any) => ({
    id: item.id,
    external_event_id: item.external_event_id,
    source_type: item.source_type,
    section: item.section,
    location: item.location || '-',
    event_type: item.event_type,
    event_date: item.event_date ? formatDateTime(item.event_date) : '-',
    received_at: item.received_at ? formatDateTime(item.received_at) : '-',
    is_alarm: item.is_alarm,
    message: item.message,
  }));

  return {
    data: formattedData ?? [],
    totalRecords: query.data?.RecordsTotal ?? 0,
    filteredRecords: query.data?.RecordsFiltered ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
