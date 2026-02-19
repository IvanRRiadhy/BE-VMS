import { useQuery } from '@tanstack/react-query';
import { getAllEmployee } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useHost = () => {
  const { token } = useSession();
  return useQuery({
    queryKey: ['host'],
    queryFn: async () => {
      const res = await getAllEmployee(token as string);
      return res.collection;
    },
  });
};
