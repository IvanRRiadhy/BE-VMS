import { useQuery } from '@tanstack/react-query';
import { getAllDepartmentsPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  searchKeyword: string;
}

export const useDepartmentPagination = ({ page, rowsPerPage, sortDir, searchKeyword }: Props) => {
  return useQuery({
    queryKey: ['departments', 'pagination', page, rowsPerPage, sortDir, searchKeyword],
    queryFn: () =>
      getAllDepartmentsPagination(page * rowsPerPage, rowsPerPage, sortDir, searchKeyword),
    placeholderData: (previousData) => previousData,
  });
};
