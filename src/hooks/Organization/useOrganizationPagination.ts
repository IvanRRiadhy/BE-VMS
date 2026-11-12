import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getAllOrganizationPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  sort_column?: string;
  searchKeyword?: string;
}

interface Options {
  enabled?: boolean;
}

export const useOrganizationPagination = (
  { page, rowsPerPage, sortDir, sort_column, searchKeyword }: Props,
  options?: Options,
) => {
  return useQuery({
    queryKey: [
      'organizations',
      'pagination',
      page,
      rowsPerPage,
      sortDir,
      sort_column,
      searchKeyword,
    ],
    enabled: options?.enabled ?? true,
    queryFn: () =>
      getAllOrganizationPagination(
        page * rowsPerPage,
        rowsPerPage,
        sortDir,
        sort_column,
        searchKeyword,
      ),
    placeholderData: (previousData) => previousData,
  });
};
