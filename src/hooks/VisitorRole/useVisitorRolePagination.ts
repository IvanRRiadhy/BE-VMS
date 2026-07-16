import { useQuery } from '@tanstack/react-query';
import { getVisitorRoleByDt } from 'src/customs/api/Admin/VisitorRole';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  search: string;
}

export const useVisitorRolePagination = ({
  page,
  rowsPerPage,
  sortDir,
  search,
}: Props) => {
  return useQuery({
    queryKey: [
      'visitor-role',
      page,
      rowsPerPage,
      sortDir,
      search,
    ],

    queryFn: () =>
      getVisitorRoleByDt(
        page * rowsPerPage,
        rowsPerPage,
        sortDir,
        search,
      ),

    placeholderData: (previousData) => previousData,
  });
};