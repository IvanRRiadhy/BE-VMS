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
      } catch (error) {
        throw error;
      }
    },

    placeholderData: (previousData) => previousData,
  });
};
