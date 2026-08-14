import { useQuery } from '@tanstack/react-query';
import { getAllVisitorTypePagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  sort_column: string;
  search: string;
}

export const useVisitorTypePagination = ({
  page,
  rowsPerPage,
  sortDir,
  sort_column,
  search,
}: Props) => {
  return useQuery({
    queryKey: ['visitor-type', page, rowsPerPage, sortDir, sort_column, search],

    queryFn: () =>
      getAllVisitorTypePagination(page * rowsPerPage, rowsPerPage, sortDir, sort_column, search),

    placeholderData: (previousData) => previousData,
  });
};
