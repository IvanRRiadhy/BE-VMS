import { useInfiniteQuery } from '@tanstack/react-query';

import { getActivities } from 'src/customs/api/Admin/Dashboard';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

type ActivitiesParams = {
  start_date: string;
  end_date: string;
};

const PAGE_SIZE = 7;

export const useActivities = ({ start_date, end_date }: ActivitiesParams) => {
  return useInfiniteQuery({
    queryKey: ['activities', start_date, end_date],

    initialPageParam: 0,

    queryFn: ({ pageParam }) => getActivities(pageParam, PAGE_SIZE, start_date, end_date),

    getNextPageParam: (lastPage, allPages) => {
      const collection = Array.isArray(lastPage?.collection) ? lastPage.collection : [];

      if (collection.length < PAGE_SIZE) {
        return undefined;
      }

      return allPages.length * PAGE_SIZE;
    },

    retry: false,

    refetchInterval: 10000,

    select: (data) => ({
      ...data,

      activities: data.pages.flatMap((page) =>
        page.collection.map((item: any) => ({
          id: item.id,
          action: item.action,
          entityName: item.entityName,
          description: item.description,
          actionAt: formatDateTime(item.actionAt),
          status: item.status,
        })),
      ),
    }),
  });
};
