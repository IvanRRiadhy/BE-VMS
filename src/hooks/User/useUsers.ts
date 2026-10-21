import { useQuery } from '@tanstack/react-query';
import { getAllUser } from 'src/customs/api/admin';
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
