import { useQuery } from '@tanstack/react-query';
import { getVisitorProvidersByDt } from 'src/customs/api/Admin/VisitorProviders';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  sort_column?: string;
  search: string;
}

export const useVisitorProviderPagination = ({
  page,
  rowsPerPage,
  sortDir,
  sort_column,
  search,
}: Props) => {
  return useQuery({
    queryKey: [
      'visitor-provider',
      page,
      rowsPerPage,
      sortDir,
      sort_column,
      search,
    ],

    queryFn: () =>
      getVisitorProvidersByDt(
        page * rowsPerPage,
        rowsPerPage,
        sortDir,
        sort_column,
        search,
      ),

    placeholderData: (previousData) => previousData,
  });
};