import { useQuery } from '@tanstack/react-query';
import { getAllDepartmentsPagination } from 'src/customs/api/admin';

interface Props {
  token: string;
  page: number;
  rowsPerPage: number;
  sortDir: string;
  searchKeyword: string;
}

export const useDepartmentPagination = ({
  token,
  page,
  rowsPerPage,
  sortDir,
  searchKeyword,
}: Props) => {
  return useQuery({
    queryKey: ['departments', page, rowsPerPage, sortDir, searchKeyword],
    enabled: !!token,
    queryFn: () =>
      getAllDepartmentsPagination(token, page * rowsPerPage, rowsPerPage, sortDir, searchKeyword),
    placeholderData: (previousData) => previousData,
  });
};
