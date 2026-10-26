import { useQuery } from '@tanstack/react-query';
import { getBlacklistDt } from 'src/customs/api/admin';

interface Filters {
  start_date: string;
  end_date: string;
  visitor: string;
  status_blacklist: string;
}

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  search: string;
  filters: Filters;
}

export const useBlacklistPagination = ({ page, rowsPerPage, sortDir, search, filters }: Props) => {
  return useQuery({
    queryKey: ['blacklist', page, rowsPerPage, sortDir, search, filters],

    queryFn: () =>
      getBlacklistDt(
        page * rowsPerPage,
        sortDir,
        rowsPerPage,
        search,
        filters.start_date || '',
        filters.end_date || '',
        filters.visitor || '',
        filters.status_blacklist || '',
      ),

    placeholderData: (previousData) => previousData,
  });
};
