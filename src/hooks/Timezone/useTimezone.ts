import { useInfiniteQuery } from '@tanstack/react-query';
import { getAllTimezonePagination } from 'src/customs/api/admin';

const PAGE_SIZE = 10;

interface Props {
  search?: string;
}

export const useTimezone = ({ search }: Props) => {
  return useInfiniteQuery({
    queryKey: ['timezone', search],

    queryFn: ({ pageParam = 0 }) =>
      getAllTimezonePagination(
        pageParam,
        PAGE_SIZE,
        search,
      ),

    initialPageParam: 0,

    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce(
        (total, page) => total + page.collection.length,
        0,
      );

      return loaded >= lastPage.RecordsFiltered
        ? undefined
        : loaded;
    },

    placeholderData: (previousData) => previousData,
  });
};