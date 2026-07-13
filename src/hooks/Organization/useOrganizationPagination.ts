import { useQuery } from '@tanstack/react-query';
import { getAllOrganizationPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  searchKeyword: string;
}

export const useOrganizationPagination = ({ page, rowsPerPage, sortDir, searchKeyword }: Props) => {
  return useQuery({
    queryKey: ['organizations', 'pagination', page, rowsPerPage, sortDir, searchKeyword],
    // enabled: !!token,
    queryFn: () =>
      getAllOrganizationPagination(page * rowsPerPage, rowsPerPage, sortDir, searchKeyword),
    placeholderData: (previousData) => previousData,
  });
};
