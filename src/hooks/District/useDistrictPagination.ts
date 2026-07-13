import { useQuery } from '@tanstack/react-query';
import { getAllDistrictsPagination } from 'src/customs/api/admin';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  searchKeyword: string;
}

export const useDistrictPagination = ({ page, rowsPerPage, sortDir, searchKeyword }: Props) => {
  return useQuery({
    queryKey: ['districts', 'pagination', page, rowsPerPage, sortDir, searchKeyword],
    // enabled: !!token,
    queryFn: () =>
      getAllDistrictsPagination(page * rowsPerPage, rowsPerPage, sortDir, searchKeyword),
    placeholderData: (previousData) => previousData,
  });
};
