import { useQuery } from '@tanstack/react-query';
import { getAllEmployeePagination } from 'src/customs/api/admin';

export const useEmployeePagination = (
  token: string | null,
  params?: {
    start?: number;
    length?: number;
    sortColumn?: string;
    sortDir?: string;
    'search[value]'?: string;
    gender?: number;
    joinStart?: string;
    exitEnd?: string;
    statusEmployee?: number;
    organization?: string;
    district?: string;
    department?: string;
  },
) => {
  return useQuery({
    queryKey: ['employees-pagi', params],
    queryFn: () =>
      getAllEmployeePagination(
        token as string,
        params?.start,
        params?.length,
        params?.sortColumn,
        params?.sortDir,
        params?.['search[value]'],
        params?.gender,
        params?.joinStart,
        params?.exitEnd,
        params?.statusEmployee,
        params?.organization,
        params?.district,
        params?.department,
      ),
    enabled: !!token,
  });
};
