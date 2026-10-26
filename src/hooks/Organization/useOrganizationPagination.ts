import { useQuery } from '@tanstack/react-query';
import { getAllOrganizationPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  sort_column?: string;
  searchKeyword?: string;
}

export const useOrganizationPagination = ({
  page,
  rowsPerPage,
  sortDir,
  sort_column,
  searchKeyword,
}: Props) => {
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
    // enabled: !!token,
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
