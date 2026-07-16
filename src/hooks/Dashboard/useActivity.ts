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

export const useActivities = ({  start, length, start_date, end_date }: ActivitiesParams) => {
  return useQuery({
    queryKey: ['activities', start, length, start_date, end_date],
    queryFn: () => getActivities( start, length, start_date, end_date),
    retry: false,
    select: (data) =>
      data.collection.map((item: any) => ({
        id: item.id,
        entityName: item.entityName,
        description: item.description,
        date: formatDateTime(item.createdAt),
      })),
  });
};
