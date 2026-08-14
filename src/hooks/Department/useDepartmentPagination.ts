import { useQuery } from '@tanstack/react-query';
import { getAllDepartmentsPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  sort_column?: string;
  searchKeyword?: string;
}

export const useDepartmentPagination = ({ page, rowsPerPage, sortDir, sort_column, searchKeyword }: Props) => {
  return useQuery({
    queryKey: ['departments', 'pagination', page, rowsPerPage, sortDir, sort_column, searchKeyword],
    queryFn: () =>
      getAllDepartmentsPagination(page * rowsPerPage, rowsPerPage, sortDir, sort_column, searchKeyword),
    placeholderData: (previousData) => previousData,
  });
};
