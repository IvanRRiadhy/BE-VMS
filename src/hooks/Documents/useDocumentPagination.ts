import { useQuery } from '@tanstack/react-query';
import { getAllDocumentPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  search: string;
}

export const useDocumentPagination = ({ page, rowsPerPage, sortDir, search }: Props) => {
  return useQuery({
    queryKey: ['documents', 'pagination', page, rowsPerPage, sortDir, search],


    queryFn: () =>
      getAllDocumentPagination(page * rowsPerPage, rowsPerPage, sortDir, search),

    placeholderData: (previous) => previous,
  });
};
