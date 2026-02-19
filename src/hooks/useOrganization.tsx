import { useQuery } from '@tanstack/react-query';
import { getAllOrganizations } from 'src/customs/api/admin';
import axiosInstance from 'src/customs/api/interceptor';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useOrganizations = () => {
  const { token } = useSession();
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await getAllOrganizations(token as string);
      return res.collection;
    },
  });
};
