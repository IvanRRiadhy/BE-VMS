import { useQuery } from '@tanstack/react-query';
import { getAllEmployeePaginationFilterMore } from 'src/customs/api/admin';

interface Filters {
  gender: number;
  organization: string;
  department: string;
  district: string;
  joinStart: string;
  exitEnd: string;
  statusEmployee: number;
}

interface Props {
  token: string;
  page: number;
  rowsPerPage: number;
  sortDir: string;
  search: string;
  filters: Filters;
}

export const useEmployeePagination = ({
  token,
  page,
  rowsPerPage,
  sortDir,
  search,
  filters,
}: Props) => {
  return useQuery({
    queryKey: ['employees', page, rowsPerPage, sortDir, search, filters],
    enabled: !!token,

    queryFn: () =>
      getAllEmployeePaginationFilterMore(
        token,
        page * rowsPerPage,
        rowsPerPage,
        sortDir,
        search,
        filters.gender === 0 ? undefined : filters.gender,
        filters.joinStart,
        filters.exitEnd,
        filters.statusEmployee === 0 ? undefined : filters.statusEmployee,
        String(filters.organization),
        String(filters.district),
        String(filters.department),
      ),
    placeholderData: (previousData) => previousData,
  });
};
