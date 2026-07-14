import { useQuery } from '@tanstack/react-query';
import { getAllAccessControlPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortColumn: string;
  search: string;
}

export const useAccessControlPagination = ({ page, rowsPerPage, sortColumn, search }: Props) => {
  return useQuery({
    queryKey: ['access-control', page, rowsPerPage, sortColumn, search],

    queryFn: () =>
      getAllAccessControlPagination(page * rowsPerPage, rowsPerPage, sortColumn, search),

    placeholderData: (previousData) => previousData,
  });
};
