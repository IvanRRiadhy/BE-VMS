import { useQuery } from '@tanstack/react-query';
import { getAllVisitorTypePagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  search: string;
}

export const useVisitorTypePagination = ({ page, rowsPerPage, sortDir, search }: Props) => {
  return useQuery({
    queryKey: ['visitor-type', page, rowsPerPage, sortDir, search],

    queryFn: () => getAllVisitorTypePagination(page * rowsPerPage, rowsPerPage, sortDir, search),

    placeholderData: (previousData) => previousData,
  });
};
