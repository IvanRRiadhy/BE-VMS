import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAllSitePagination } from 'src/customs/api/admin';

interface Props {
  token?: string | null;
  page: number;
  rowsPerPage: number;
  sortDir: string;
  searchKeyword: string;
  type?: number;
  parent?: string;
  isChild?: boolean;
}

export const useSitePagination = ({
  page,
  rowsPerPage,
  sortDir,
  searchKeyword,
  type,
  parent,
  isChild,
}: Props) => {
  return useQuery({
    queryKey: ['sites', page, rowsPerPage, sortDir, searchKeyword, type, parent, isChild],
    queryFn: async () => {
      try {
        const result = await getAllSitePagination(
          page * rowsPerPage,
          rowsPerPage,
          sortDir,
          searchKeyword,
          type,
          parent,
          isChild,
        );
        return result;
      } catch (error: any) {
        const status = error?.response?.status;
        const statusCode = error?.response?.data?.status_code;

        // Search tidak menemukan data
        if (status === 404 || statusCode === 404) {
          return {
            collection: [],
            RecordsTotal: 0,
            RecordsFiltered: 0,
            Draw: 0,
          };
        }

        throw error;
      }
    },

    placeholderData: (previousData) => previousData,
  });
};
