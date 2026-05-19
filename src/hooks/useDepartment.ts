import { useQuery } from '@tanstack/react-query';
import { getAllDepartments, getAllOrganizations } from 'src/customs/api/admin';
import axiosInstance from 'src/customs/api/interceptor';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useDepartment = () => {
  const { token } = useSession();
  return useQuery({
    queryKey: ['department'],
    queryFn: async () => {
      const res = await getAllDepartments(token as string);
      return res.collection;
    },
  });
};
