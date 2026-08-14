import { useQuery } from '@tanstack/react-query';
import { getAllAccessControlPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  search: string;
  sort_dir: string;
  sort_column?: string;
}

export const useAccessControlPagination = ({
  page,
  rowsPerPage,
  search,
  sort_dir,
  sort_column,
}: Props) => {
  return useQuery({
    queryKey: ['access-control', page, rowsPerPage, search, sort_dir, sort_column],

    queryFn: () =>
      getAllAccessControlPagination(page * rowsPerPage, rowsPerPage, search, sort_dir, sort_column),

    placeholderData: (previousData) => previousData,
  });
};
