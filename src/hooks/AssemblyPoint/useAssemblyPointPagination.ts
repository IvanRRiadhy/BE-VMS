import { useQuery } from '@tanstack/react-query';
import { getAssemblyPoint, getAssemblyPointDt } from 'src/customs/api/Admin/Evacuate';

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  searchKeyword?: string;
}

export const useAssemblyPointPagination = ({
  page,
  rowsPerPage,
  sortDir,
  searchKeyword,
}: Props) => {
  return useQuery({
    queryKey: ['assembly-points', 'pagination', page, rowsPerPage, sortDir, searchKeyword],
    queryFn: () => getAssemblyPointDt(page * rowsPerPage, rowsPerPage, sortDir, searchKeyword),
    placeholderData: (previousData) => previousData,
  });
};

// get assembly point
export const useAssemblyPoint = () => {
  return useQuery({
    queryKey: ['assembly-points'],
    queryFn: getAssemblyPoint,
  });
};
