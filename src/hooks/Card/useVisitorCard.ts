import { useQuery } from '@tanstack/react-query';
import { getAllVisitorCardPagination } from 'src/customs/api/admin';

interface Filters {
  type: number;
  card_status: number;
}

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  search: string;
  filters: Filters;
}

export const useVisitorCardPagination = ({
  page,
  rowsPerPage,
  sortDir,
  search,
  filters,
}: Props) => {
  return useQuery({
    queryKey: ['visitor-card', page, rowsPerPage, sortDir, search, filters],

    queryFn: () =>
      getAllVisitorCardPagination(
        page * rowsPerPage,
        rowsPerPage,
        search,
        sortDir,
        filters.type === -1 ? undefined : filters.type,
        filters.card_status === -1 ? undefined : filters.card_status,
      ),

    placeholderData: (previousData) => previousData,
  });
};
