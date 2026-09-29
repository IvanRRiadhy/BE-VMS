import { useQuery } from '@tanstack/react-query';
import { getAllVisitorPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  search: string;
  enabled?: boolean;
}

export const useQuickAccessPagination = ({ page, rowsPerPage, search, enabled = true }: Props) => {
  return useQuery({
    queryKey: ['quick-access', page, rowsPerPage, search],

    queryFn: () =>
      getAllVisitorPagination(
        page * rowsPerPage,
        rowsPerPage,
        search || undefined,
        undefined,
        undefined,
        'QuickAccess',
      ),

    enabled,

    placeholderData: (prev) => prev,
  });
};
