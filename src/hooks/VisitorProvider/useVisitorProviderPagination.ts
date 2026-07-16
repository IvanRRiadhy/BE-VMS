import { useQuery } from '@tanstack/react-query';
import { getVisitorProvidersByDt } from 'src/customs/api/Admin/VisitorProviders';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  search: string;
}

export const useVisitorProviderPagination = ({
  page,
  rowsPerPage,
  sortDir,
  search,
}: Props) => {
  return useQuery({
    queryKey: [
      'visitor-provider',
      page,
      rowsPerPage,
      sortDir,
      search,
    ],

    queryFn: () =>
      getVisitorProvidersByDt(
        page * rowsPerPage,
        rowsPerPage,
        sortDir,
        search,
      ),

    placeholderData: (previousData) => previousData,
  });
};