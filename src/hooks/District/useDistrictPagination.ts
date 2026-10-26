import { useQuery } from '@tanstack/react-query';
import { getAllDistrictsPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  sort_column?: string;
  searchKeyword?: string;
}

export const useDistrictPagination = ({
  page,
  rowsPerPage,
  sortDir,
  sort_column,
  searchKeyword,
}: Props) => {
  return useQuery({
    queryKey: ['districts', 'pagination', page, rowsPerPage, sortDir, sort_column, searchKeyword],
    // enabled: !!token,
    queryFn: () =>
      getAllDistrictsPagination(
        page * rowsPerPage,
        rowsPerPage,
        sortDir,
        sort_column,
        searchKeyword,
      ),
    placeholderData: (previousData) => previousData,
  });
};
