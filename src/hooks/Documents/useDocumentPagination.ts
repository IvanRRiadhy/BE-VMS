import { useQuery } from '@tanstack/react-query';
import { getAllDocumentPagination } from 'src/customs/api/admin';

interface Props {
  token: string;
  page: number;
  rowsPerPage: number;
  sortDir: string;
  search: string;
}

export const useDocumentPagination = ({ token, page, rowsPerPage, sortDir, search }: Props) => {
  return useQuery({
    queryKey: ['documents', 'pagination', page, rowsPerPage, sortDir, search],

    enabled: !!token,

    queryFn: () =>
      getAllDocumentPagination(token, page * rowsPerPage, rowsPerPage, sortDir, search),

    placeholderData: (previous) => previous,
  });
};
