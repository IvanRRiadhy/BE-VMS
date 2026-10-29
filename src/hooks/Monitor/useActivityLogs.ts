import { useQuery } from '@tanstack/react-query';
import { getMonitorActivities } from 'src/customs/api/Admin/Monitor';
import axiosInstance from 'src/customs/api/interceptor';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

export interface ActivityLog {
  user_id: string;
  actor_type: string;
  action: string;
  entity_name: string;
  entity_id: string;
  description: string;
  action_at: string;
  id: string;
}

interface ActivityLogsResponse {
  RecordsTotal: number;
  RecordsFiltered: number;
  Draw: number;
  status: string;
  status_code: number;
  title: string;
  msg: string;
  collection: ActivityLog[];
}

interface ActivityLogsPayload {
  draw: number;
  start: number;
  length: number;
  sort_column: string;
  sort_dir: 'asc' | 'desc';
  'search[value]': string;
}

interface UseActivityLogsParams {
  page?: number;
  rowsPerPage?: number;
  search?: string;
  sortColumn?: string;
  sortDir?: 'asc' | 'desc';
}

export const useActivityLogs = ({
  page = 0,
  rowsPerPage = 10,
  search = '',
  sortColumn = 'action_at',
  sortDir = 'desc',
}: UseActivityLogsParams = {}) => {
  const payload: ActivityLogsPayload = {
    draw: page + 1,
    start: page * rowsPerPage,
    length: rowsPerPage,
    sort_column: sortColumn,
    sort_dir: sortDir,
    'search[value]': search,
  };

  const query = useQuery({
    queryKey: ['activity-logs', payload],
    queryFn: () => getMonitorActivities(payload),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,

    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const formattedData = (query.data?.collection ?? []).map((item: any) => ({
    id: item.id,
    actor_type: item.actor_type,
    action: item.action,
    entity_name: item.entity_name,
    entity_id: item.entity_id,
    description: item.description,
    action_at: item.action_at ? formatDateTime(item.action_at) : '-',
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
