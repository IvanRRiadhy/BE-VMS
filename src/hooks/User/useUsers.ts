import { useQuery } from '@tanstack/react-query';
import { getAllUser, getUserPagination } from 'src/customs/api/admin';
import { getUserRoles } from 'src/customs/api/Admin/User';

const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await getAllUser();

      return {
        collection: response.collection,
      };
    },
  });
};

export default useUsers;

export const useUserRole = () => {
  return useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const response = await getUserRoles();

      return {
        collection: response.collection,
      };
    },
  });
};

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  sort_column?: string;
  searchKeyword?: string;
  user_group_id?: string;
}

export const useUserPagination = ({
  page,
  rowsPerPage,
  sortDir,
  searchKeyword,
  user_group_id,
}: Props) => {
  return useQuery({
    queryKey: ['users', 'pagination', page, rowsPerPage, sortDir, searchKeyword, user_group_id],
    // enabled: !!token,
    queryFn: () =>
      getUserPagination(page * rowsPerPage, rowsPerPage, sortDir, searchKeyword, user_group_id),
    placeholderData: (previousData) => previousData,
  });
};
