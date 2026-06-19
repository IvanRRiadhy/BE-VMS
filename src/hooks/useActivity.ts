import { useQuery } from '@tanstack/react-query';
import { getActivities } from 'src/customs/api/Admin/Dashboard';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

type ActivitiesParams = {
  token?: string | null;
  start: number;
  length: number;
  start_date: string;
  end_date: string;
};

export const useActivities = ({ token, start, length, start_date, end_date }: ActivitiesParams) => {
  return useQuery({
    queryKey: ['activities', start, length, start_date, end_date],
    queryFn: () => getActivities(token as string, start, length, start_date, end_date),
    enabled: !!token,
    select: (data) =>
      data.collection.map((item: any) => ({
        id: item.id,
        entityName: item.entityName,
        description: item.description,
        date: formatDateTime(item.createdAt),
      })),
  });
};
