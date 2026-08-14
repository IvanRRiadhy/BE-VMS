import { useQuery } from '@tanstack/react-query';
import { getAllDocumentPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  sort_column: string;
  search: string;
}

export const useDocumentPagination = ({
  page,
  rowsPerPage,
  sortDir,
  sort_column,
  search,
}: Props) => {
  return useQuery({
    queryKey: ['documents', 'pagination', page, rowsPerPage, sortDir, sort_column, search],

    queryFn: () =>
      getAllDocumentPagination(page * rowsPerPage, rowsPerPage, sortDir, sort_column, search),

    placeholderData: (previous) => previous,
  });
};
