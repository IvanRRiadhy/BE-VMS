import { useQuery } from '@tanstack/react-query';
import { getAllOrganizationPagination } from 'src/customs/api/admin';

interface Props {
  token: string;
  page: number;
  rowsPerPage: number;
  sortDir: string;
  searchKeyword: string;
}

export const useOrganizationPagination = ({
  token,
  page,
  rowsPerPage,
  sortDir,
  searchKeyword,
}: Props) => {
  return useQuery({
    queryKey: ['organizations', page, rowsPerPage, sortDir, searchKeyword],
    enabled: !!token,
    queryFn: () =>
      getAllOrganizationPagination(token, page * rowsPerPage, rowsPerPage, sortDir, searchKeyword),
    placeholderData: (previousData) => previousData,
  });
};
