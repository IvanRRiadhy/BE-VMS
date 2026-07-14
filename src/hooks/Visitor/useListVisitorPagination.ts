import { useQuery } from '@tanstack/react-query';
import { getListVisitorPagination } from 'src/customs/api/admin';

interface VisitorFilters {
  organization_id: string;
  department_id: string;
  district_id: string;
  is_employee: string;
  gender: string;
  is_email_verified: string;
  is_blacklist: boolean | null;
}

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  search: string;
  filters: VisitorFilters;
}

export const useListVisitorPagination = ({
  page,
  rowsPerPage,
  sortDir,
  search,
  filters,
}: Props) => {
  return useQuery({
    queryKey: ['list-visitor', page, rowsPerPage, sortDir, search, filters],
    queryFn: () => getListVisitorPagination(page * rowsPerPage, rowsPerPage, sortDir, search),
    placeholderData: (previousData) => previousData,
  });
};
